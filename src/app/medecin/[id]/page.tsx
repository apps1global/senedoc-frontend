"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PatientLayout } from "@/components/PatientLayout";
import { Footer } from "@/components/Footer";
import { doctors, slots as slotsApi, appointments, auth, patients, payments, relatives as relativesApi, type Relative, type AppointmentType } from "@/lib/api";
import { isInSenegal, HORS_SENEGAL_MESSAGE } from "@/lib/geo";

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

  // Un patient connecté garde son espace (menu patient) ; un visiteur voit
  // l'en-tete public.
  useEffect(() => {
    auth.me()
      .then((u: any) => {
        setIsPatient(u?.role === "PATIENT");
        if (u?.role === "PATIENT") {
          patients.getMe().then((p: any) => setResidesAbroad(!!p?.country)).catch(() => {});
        }
      })
      .catch(() => setIsPatient(false));
  }, []);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isPatient, setIsPatient] = useState<boolean | null>(null);
  const [residesAbroad, setResidesAbroad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const Wrap = ({ children }: { children: React.ReactNode }) =>
    isPatient
      ? <PatientLayout>{children}</PatientLayout>
      : <><Header />{children}<Footer /></>;
  const [horsSenegal, setHorsSenegal] = useState(false);

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const [consultType, setConsultType] = useState<AppointmentType>("PRESENTIEL");
  const [myRelatives, setMyRelatives] = useState<Relative[]>([]);
  const [selectedRelativeId, setSelectedRelativeId] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [availableDays, setAvailableDays] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<{ time: string; facilityId: string | null; facilityName: string | null }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
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
        // Un seul établissement : pas besoin de demander au patient de choisir.
        if (doc.facilityMemberships.length === 1) {
          setSelectedFacilityId(doc.facilityMemberships[0].facility.id);
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
        (pos) => {
        // Hors du Sénégal, la distance (et le tri par proximité) n'ont plus de
        // sens : on ignore la position et on l'explique. Rien n'est bloqué.
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isInSenegal(lat, lng)) setUserPos({ lat, lng });
        else setHorsSenegal(true);
      },
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
    setSelectedSlot(null);
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

  useEffect(() => {
    relativesApi.getMine().then(setMyRelatives).catch(() => setMyRelatives([]));
  }, []);

  async function confirmBooking() {
    if (!selectedDate || !selectedSlot) return;
    if (consultType === "PRESENTIEL" && (doctor?.facilityMemberships.length ?? 0) > 1 && !selectedFacilityId) {
      setBookingError("Ce créneau n'a pas d'établissement associé. Contactez le support.");
      return;
    }
    setBooking(selectedSlot);
    setBookingError("");
    setBookingSuccess("");
    try {
      const created: any = await appointments.create({
        doctorId,
        appointmentDate: `${selectedDate}T${selectedSlot}:00.000Z`,
        type: consultType,
        relativeId: selectedRelativeId ?? undefined,
        facilityId: consultType === "PRESENTIEL" ? selectedFacilityId ?? undefined : undefined,
      });

      // Patient résidant à l'étranger : la demande n'est envoyée qu'après
      // paiement du frais de 5€, via une session Stripe Checkout.
      if (residesAbroad && created?.id) {
        const checkout: any = await payments.createAppointmentFeeCheckout(created.id);
        if (checkout.url) {
          window.location.href = checkout.url;
          return;
        }
      }

      const dateLabel = new Date(`${selectedDate}T${selectedSlot}:00.000Z`).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const params = new URLSearchParams({
        doctor: name,
        date: dateLabel,
        time: selectedSlot,
        type: consultType,
      });
      router.push(`/rendez-vous-envoye?${params.toString()}`);
      return;
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBooking(null);
    }
  }

  if (loading) {
    return (
      <Wrap>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">Chargement…</div>
      </Wrap>
    );
  }

  if (error || !doctor) {
    return (
      <Wrap>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
          {error || "Médecin introuvable."}
        </div>
      </Wrap>
    );
  }

  // Suit l'établissement effectivement sélectionné par le patient (pas
  // toujours le premier de la liste) — sinon la distance affichée peut
  // correspondre à un lieu différent de celui réservé.
  // Un seul établissement en haut de fiche seulement si le patient l'a
  // choisi, OU si le médecin n'en a qu'un seul (aucune ambiguïté possible).
  // Avec plusieurs établissements et aucun choix fait, on n'affiche rien —
  // jamais "le premier" comme s'il était l'établissement du médecin.
  const facility = selectedFacilityId
    ? doctor.facilityMemberships.find((m) => m.facility.id === selectedFacilityId)?.facility
    : doctor.facilityMemberships.length === 1
    ? doctor.facilityMemberships[0]?.facility
    : undefined;
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
    <Wrap>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* En-tête profil */}
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-light flex-shrink-0">
            {doctor.photoUrl ? (
              <img src={doctor.photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-dark font-semibold text-xl">
                {`${doctor.user.firstName?.[0] ?? ""}${doctor.user.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">{name}</h1>
            <p className="text-teal-dark">{doctor.specialty.name}</p>
            {doctor.yearsExperience != null && (
              <p className="text-sm text-gray-500 mt-0.5">{doctor.yearsExperience} ans d'expérience</p>
            )}
            {doctor.teleconsultation && (
              <span className="inline-block bg-teal-light text-teal-dark text-xs font-medium px-2.5 py-1 rounded-full mt-2">Téléconsultation possible</span>
            )}
          </div>
        </div>

        {/* Tarifs */}
        {(doctor.consultationFee != null || doctor.teleconsultationFee != null) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-6 pb-6 border-b border-gray-100">
            {doctor.consultationFee != null && (
              <div>
                <p className="text-xs text-gray-400">Présentiel</p>
                <p className="text-lg font-semibold text-teal-dark">{doctor.consultationFee.toLocaleString("fr-FR")} FCFA</p>
              </div>
            )}
            {doctor.teleconsultationFee != null && (
              <div>
                <p className="text-xs text-gray-400">Téléconsultation</p>
                <p className="text-lg font-semibold text-teal-dark">{doctor.teleconsultationFee.toLocaleString("fr-FR")} FCFA</p>
              </div>
            )}
          </div>
        )}

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
            {horsSenegal && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{HORS_SENEGAL_MESSAGE}</p>
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

              {myRelatives.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium mb-2">Pour qui est ce rendez-vous ?</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRelativeId(null)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                        selectedRelativeId === null
                          ? "border-teal bg-teal-light text-teal-dark font-medium"
                          : "border-gray-200 text-gray-600 hover:border-teal"
                      }`}
                    >
                      Pour moi
                    </button>
                    {myRelatives.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRelativeId(r.id)}
                        className={`text-left px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                          selectedRelativeId === r.id
                            ? "border-teal bg-teal-light text-teal-dark font-medium"
                            : "border-gray-200 text-gray-600 hover:border-teal"
                        }`}
                      >
                        {r.firstName} {r.lastName}
                        {r.relationship ? ` — ${r.relationship}` : ""}
                      </button>
                    ))}
                  </div>
                  {consultType === "TELECONSULTATION" &&
                    selectedRelativeId &&
                    !myRelatives.find((r) => r.id === selectedRelativeId)?.phone && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                        Ce proche n&apos;a pas de numéro de téléphone : il ne pourra pas
                        recevoir le lien de connexion à la téléconsultation. Ajoutez-le
                        depuis « Mes proches ».
                      </p>
                    )}
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
                          key={slot.time}
                          onClick={() => {
                            setSelectedSlot(slot.time);
                            if (slot.facilityId) setSelectedFacilityId(slot.facilityId);
                          }}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors flex flex-col items-center ${
                            selectedSlot === slot.time
                              ? "bg-teal text-white border-teal"
                              : "border-teal text-teal-dark hover:bg-teal-light"
                          }`}
                        >
                          <span>{slot.time}</span>
                          {slot.facilityName && doctor.facilityMemberships.length > 1 && (
                            <span className={`text-[11px] font-normal mt-0.5 ${selectedSlot === slot.time ? "text-white/80" : "text-gray-500"}`}>
                              {slot.facilityName}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSlot && !bookingSuccess && (
                    <button
                      onClick={confirmBooking}
                      disabled={booking === selectedSlot}
                      className="w-full mt-4 bg-coral text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {booking === selectedSlot
                        ? "Redirection…"
                        : residesAbroad
                        ? `Cette demande vous coûtera 5 €. Payer maintenant →`
                        : `Envoyer la demande pour ${selectedSlot}`}
                    </button>
                  )}

                  {selectedSlot && !bookingSuccess && residesAbroad && (
                    <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">
                      Si le professionnel ne répond pas sous 24h, la demande est automatiquement annulée et vous êtes remboursé automatiquement.
                    </p>
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
    </Wrap>
  );
}
