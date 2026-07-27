"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { PatientLayout } from "@/components/PatientLayout";
import { Footer } from "@/components/Footer";
import { SpecialtySelect } from "@/components/SpecialtySelect";
import { DoctorNameSearch } from "@/components/DoctorNameSearch";
import { doctors, auth } from "@/lib/api";
import { isInSenegal, HORS_SENEGAL_MESSAGE } from "@/lib/geo";

type Facility = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Doctor = {
  id: string;
  bio: string | null;
  consultationFee: number | null;
  teleconsultationFee: number | null;
  teleconsultation: boolean;
  yearsExperience: number | null;
  photoUrl: string | null;
  city: string | null;
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

function RechercheContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isPatient, setIsPatient] = useState<boolean | null>(null);
  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  // Un patient connecté garde son espace (menu patient) ; un visiteur voit
  // l'en-tete public. Meme page de recherche, habillage adapte.
  useEffect(() => {
    auth.me()
      .then((u: any) => setIsPatient(u?.role === "PATIENT"))
      .catch(() => setIsPatient(false));
  }, []);

  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [results, setResults] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [horsSenegal, setHorsSenegal] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Hors du Sénégal, la distance (et le tri par proximité) n'ont plus de
        // sens : on ignore la position et on l'explique. Rien n'est bloqué.
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isInSenegal(lat, lng)) setUserPos({ lat, lng });
        else setHorsSenegal(true);
      },
      () => setGeoDenied(true),
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!specialty) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    doctors
      .citiesForSpecialty(specialty)
      .then((list) => {
        setCities(list);
        setCity((prev) => (list.includes(prev) ? prev : ""));
      })
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [specialty]);

  async function runSearch(nextCity?: string) {
    const cityToUse = nextCity !== undefined ? nextCity : city;
    setLoading(true);
    setHasSearched(true);
    setError("");
    try {
      const data = await doctors.search({ specialty, city: cityToUse });
      setResults(data as Doctor[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("specialty") || searchParams.get("city")) {
      runSearch(searchParams.get("city") || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectCity(c: string) {
    setCity(c);
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (c) params.set("city", c);
    router.replace(`/recherche${params.toString() ? `?${params.toString()}` : ""}`);
    runSearch(c);
  }

  const sorted = [...results].sort((a, b) => {
    if (!userPos) return 0;
    const da = nearestFacilityDistance(a, userPos);
    const db = nearestFacilityDistance(b, userPos);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  const body = (
    <>
      <div className="bg-teal-light border-b border-teal-mid/30">
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <h1 className="font-display text-3xl font-semibold text-teal-dark mb-2">Trouvez le bon professionnel</h1>
          <p className="text-teal text-sm">Prenez rendez-vous près de chez vous, en présentiel ou en téléconsultation.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-4">
          <DoctorNameSearch />
        </div>
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100"></div>
          <p className="text-xs text-gray-400">ou parcourez par spécialité</p>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
          <label className="block text-sm font-medium mb-2">Spécialité</label>
          <SpecialtySelect
            value={specialty}
            onChange={(v) => { setSpecialty(v); setCity(""); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-[15px]"
          />

          {specialty && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Ville</p>
              {citiesLoading ? (
                <p className="text-sm text-gray-400">Recherche des villes…</p>
              ) : cities.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun professionnel disponible en {specialty} pour le moment.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => selectCity("")}
                    className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                      city === "" ? "bg-teal text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-teal"
                    }`}
                  >
                    Toutes les villes
                  </button>
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                        city === c ? "bg-teal text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-teal"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {geoDenied && (
          <p className="text-xs text-gray-400 mb-6">
            Localisation non disponible — les distances ne sont pas affichées, mais la recherche fonctionne normalement.
          </p>
        )}

        {horsSenegal && hasSearched && (
          <p className="text-xs text-gray-500 mb-4 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
            {HORS_SENEGAL_MESSAGE}
          </p>
        )}

        {!hasSearched ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-teal-light flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
              </svg>
            </div>
            <p className="font-display text-lg font-semibold text-gray-700">Choisissez une spécialité pour commencer</p>
            <p className="text-sm text-gray-500 mt-1">Nous vous montrerons les professionnels disponibles près de chez vous.</p>
          </div>
        ) : loading ? (
          <p className="text-gray-400 text-center py-16">Recherche en cours…</p>
        ) : error ? (
          <p className="text-coral text-center py-16">{error}</p>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
              </svg>
            </div>
            <p className="font-medium text-gray-600">Aucun professionnel ne correspond</p>
            <p className="text-sm text-gray-500 mt-1">Essayez une autre spécialité ou une autre ville.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} userPos={userPos} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isPatient) return <PatientLayout>{body}</PatientLayout>;
  return (
    <>
      <Header />
      {body}
      <Footer />
    </>
  );
}

function nearestFacilityDistance(doctor: Doctor, userPos: { lat: number; lng: number }): number | null {
  const distances = doctor.facilityMemberships
    .map((m) => m.facility)
    .filter((f) => f.latitude != null && f.longitude != null)
    .map((f) => distanceKm(userPos.lat, userPos.lng, f.latitude as number, f.longitude as number));
  if (distances.length === 0) return null;
  return Math.min(...distances);
}

function DoctorCard({ doctor, userPos }: { doctor: Doctor; userPos: { lat: number; lng: number } | null }) {
  const facility = doctor.facilityMemberships[0]?.facility;
  const allFacilities = doctor.facilityMemberships
    .map((m) => m.facility?.name)
    .filter((n): n is string => !!n);
  const distance = userPos && facility ? nearestFacilityDistance(doctor, userPos) : null;
  const name = (doctor.specialty.name === "Sage-femme" ? "" : "Dr ") + `${doctor.user.firstName ?? ""} ${doctor.user.lastName ?? ""}`.trim();
  const location = facility?.city || doctor.city;
  const initials = `${doctor.user.firstName?.[0] ?? ""}${doctor.user.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <Link
      href={`/medecin/${doctor.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-teal hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {doctor.photoUrl ? (
          <img src={doctor.photoUrl} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-teal-light flex items-center justify-center shrink-0">
            <span className="text-teal-dark font-semibold">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-teal-dark">{doctor.specialty.name}</p>
          {allFacilities.length > 0 ? (
            <div className="text-sm text-gray-500 mt-1">
              {allFacilities.map((fname, i) => (
                <p key={i}>{fname}</p>
              ))}
            </div>
          ) : location ? (
            <p className="text-sm text-gray-500 mt-1">{location}</p>
          ) : null}
          {distance !== null && (
            <p className="text-xs text-gray-400 mt-1">À {distance.toFixed(1).replace(".", ",")} km de vous</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {doctor.consultationFee != null && (
            <span className="text-sm font-medium">
              {doctor.consultationFee.toLocaleString("fr-FR")} FCFA
              <span className="text-gray-400 font-normal"> · présentiel</span>
            </span>
          )}
          {doctor.teleconsultationFee != null && (
            <span className="text-sm font-medium">
              {doctor.teleconsultationFee.toLocaleString("fr-FR")} FCFA
              <span className="text-gray-400 font-normal"> · téléconsultation</span>
            </span>
          )}
        </div>
        <span className="text-sm text-teal font-medium whitespace-nowrap">Prendre rendez-vous →</span>
      </div>
    </Link>
  );
}

export default function Recherche() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Chargement…</div>}>
      <RechercheContent />
    </Suspense>
  );
}
