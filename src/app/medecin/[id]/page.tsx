"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { doctors, slots as slotsApi, appointments, auth, type AppointmentType } from "@/lib/api";

type Facility = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Doctor = {
  id: string;
  bio: string | null;
  consultationFee: number | null;
  teleconsultationFee: number | null;
  consultationDuration: number | null;
  teleconsultation: boolean;
  yearsExperience: number | null;
  languages: string[] | null;
  photoUrl: string | null;
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
  facilityMemberships: { facility: Facility }[];
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function FicheMedecin() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const [consultType, setConsultType] = useState<AppointmentType>("PRESENTIEL");

  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [availableDays, setAvailableDays] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [booking, setBooking] = useState<string | null>(null); // slot being booked
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    doctors
      .getOne(doctorId)
      .then((d) => {
        const doc = d as Doctor;
        setDoctor(doc);
        // Si le présentiel n'est pas proposé mais la téléconsultation oui, on bascule par défaut
        if (doc.consultationFee == null && doc.teleconsultation) {
          setConsultType("TELECONSULTATION");
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));

    auth
      .me()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 8000 },
      );
    }
  }, [doctorId]);

  useEffect(() => {
    // Le type sélectionné change les jours/créneaux disponibles : on réinitialise la sélection en cours
    setSelectedDate(null);
    setDaySlots([]);
    setBookingError("");
    setBookingSuccess("");
    slotsApi
      .getCalendar(doctorId, monthKey(visibleMonth), consultType)
      .then((res: any) => setAvailableDays(res.days || {}))
      .catch(() => setAvailableDays({}));
  }, [doctorId, visibleMonth, consultType]);

  async function pickDate(date: string) {
    setSelectedDate(date);
    setDaySlots([]);
    setBookingError("");
    setBookingSuccess("");
    setSlotsLoading(true);
    try {
      const res: any = await slotsApi.getForDate(doctorId, date, consultType);
      setDaySlots(res.slots || []);
    } catch {
      setDaySlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function bookSlot(slot: string) {
    if (!selectedDate) return;
    setBooking(slot);
    setBookingError("");
    setBookingSuccess("");
    try {
      await appointments.create({
        doctorId,
        appointmentDate: `${selectedDate}T${slot}:00.000Z`,
        type: consultType,
      });
      setBookingSuccess(
        consultType === "TELECONSULTATION"
          ? "Rendez-vous demandé ! Le lien de téléconsultation vous sera envoyé par SMS à la confirmation."
          : "Rendez-vous demandé ! Vous recevrez une confirmation par SMS.",
      );
      setDaySlots((prev) => prev.filter((s) => s !== slot));
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBooking(null);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">Chargement…</div>
        <Footer />
      </>
    );
  }

  if (error || !doctor) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
          {error || "Médecin introuvable."}
        </div>
        <Footer />
      </>
    );
  }

  const facility = doctor.facilityMemberships[0]?.facility;
  const distance =
    userPos && facility?.latitude != null && facility?.longitude != null
      ? distanceKm(userPos.lat, userPos.lng, facility.latitude, facility.longitude)
      : null;
  const name = (doctor.specialty.name === "Sage-femme" ? "" : "Dr ") + `${doctor.user.firstName ?? ""} ${doctor.user.lastName ?? ""}`.trim();

  // Jours du mois visible, pour la grille calendrier
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
  const today = todayISO();

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* En-tête profil */}
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {doctor.photoUrl ? (
              <img src={doctor.photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                {doctor.user.firstName?.[0] ?? "D"}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">{name}</h1>
            <p className="text-teal-dark">{doctor.specialty.name}</p>
            {doctor.yearsExperience != null && (
              <p className="text-sm text-gray-500">{doctor.yearsExperience} ans d'expérience</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {doctor.teleconsultation && (
                <span className="bg-teal-light text-teal-dark text-xs font-medium px-2 py-1 rounded-full">Téléconsultation</span>
              )}
              {doctor.consultationFee != null && (
                <span className="text-sm font-medium">
                  {doctor.consultationFee.toLocaleString("fr-FR")} FCFA
                  {doctor.teleconsultationFee != null && " (présentiel)"}
                </span>
              )}
              {doctor.teleconsultationFee != null && (
                <span className="text-sm font-medium">
                  {doctor.teleconsultationFee.toLocaleString("fr-FR")} FCFA
                  {doctor.consultationFee != null && " (téléconsultation)"}
                </span>
              )}
            </div>
          </div>
        </div>

        {doctor.bio && <p className="text-gray-600 mb-6 leading-relaxed">{doctor.bio}</p>}

        {facility && (
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="font-medium text-sm">{facility.name}</p>
            <p className="text-sm text-gray-500">
              {facility.address}{facility.city ? `, ${facility.city}` : ""}
            </p>
            {distance !== null && (
              <p className="text-sm text-teal-dark mt-1">{distance.toFixed(1)} km de chez vous</p>
            )}
            {facility.phone && <p className="text-sm text-gray-500 mt-1">{facility.phone}</p>}
          </div>
        )}

        {/* Réservation */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Prendre rendez-vous</h2>

          {loggedIn === false ? (
            <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-4">Connectez-vous pour réserver un créneau.</p>
              <Link
                href={`/connexion?redirect=/medecin/${doctorId}`}
                className="inline-block bg-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors"
              >
                Se connecter
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                Pas encore de compte ? <Link href={`/inscription?redirect=/medecin/${doctorId}`} className="text-teal font-medium">S'inscrire</Link>
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              {/* Sélecteur du mode de consultation, uniquement si le médecin propose les deux */}
              {doctor.teleconsultation && doctor.consultationFee != null && (
                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setConsultType("PRESENTIEL")}
                    className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
                      consultType === "PRESENTIEL"
                        ? "bg-teal text-white"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-teal"
                    }`}
                  >
                    Présentiel
                  </button>
                  <button
                    onClick={() => setConsultType("TELECONSULTATION")}
                    className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors ${
                      consultType === "TELECONSULTATION"
                        ? "bg-teal text-white"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-teal"
                    }`}
                  >
                    Téléconsultation
                  </button>
                </div>
              )}

              {/* Calendrier mensuel */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
                  className="text-gray-400 hover:text-teal px-2"
                >
                  ←
                </button>
                <p className="font-medium capitalize">
                  {visibleMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </p>
                <button
                  onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
                  className="text-gray-400 hover:text-teal px-2"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPast = dateStr < today;
                  const hasSlots = availableDays[dateStr];
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      disabled={isPast || !hasSlots}
                      onClick={() => pickDate(dateStr)}
                      className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors
                        ${isPast || !hasSlots ? "text-gray-300 cursor-not-allowed" : "hover:bg-teal-light cursor-pointer"}
                        ${isSelected ? "bg-teal text-white hover:bg-teal" : ""}
                        ${hasSlots && !isPast && !isSelected ? "font-medium text-teal-dark" : ""}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Créneaux du jour sélectionné */}
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium mb-3">
                    Créneaux du {new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {slotsLoading ? (
                    <p className="text-sm text-gray-400">Chargement des créneaux…</p>
                  ) : daySlots.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun créneau disponible ce jour-là.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => bookSlot(slot)}
                          disabled={booking === slot}
                          className="px-4 py-2 border border-teal text-teal-dark rounded-lg text-sm font-medium hover:bg-teal-light transition-colors disabled:opacity-50"
                        >
                          {booking === slot ? "…" : slot}
                        </button>
                      ))}
                    </div>
                  )}
                  {bookingError && <p className="text-sm text-coral mt-3">{bookingError}</p>}
                  {bookingSuccess && (
                    <div className="mt-3">
                      <p className="text-sm text-teal-dark">{bookingSuccess}</p>
                      <Link href="/espace-patient" className="text-sm text-teal font-medium underline">
                        Voir mes rendez-vous
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
