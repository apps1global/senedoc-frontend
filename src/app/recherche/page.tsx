"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpecialtySelect } from "@/components/SpecialtySelect";
import { DoctorNameSearch } from "@/components/DoctorNameSearch";
import { doctors } from "@/lib/api";

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

  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [results, setResults] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold mb-6">Trouver un professionnel de santé</h1>

        <div className="mb-4">
          <DoctorNameSearch />
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Ou parcourez par spécialité et ville ci-dessous :
        </p>

        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8">
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

        {!hasSearched ? (
          <p className="text-gray-500 text-center py-16">
            Choisissez une spécialité pour voir les villes disponibles.
          </p>
        ) : loading ? (
          <p className="text-gray-400 text-center py-16">Recherche en cours…</p>
        ) : error ? (
          <p className="text-coral text-center py-16">{error}</p>
        ) : sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-16">Aucun professionnel ne correspond à cette recherche.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} userPos={userPos} />
            ))}
          </div>
        )}
      </div>
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
  const distance = userPos && facility ? nearestFacilityDistance(doctor, userPos) : null;
  const name = (doctor.specialty.name === "Sage-femme" ? "" : "Dr ") + `${doctor.user.firstName ?? ""} ${doctor.user.lastName ?? ""}`.trim();
  const location = facility?.city || doctor.city;

  return (
    <Link
      href={`/medecin/${doctor.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-teal hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-teal-dark">{doctor.specialty.name}</p>
          {location && (
            <p className="text-sm text-gray-500 mt-1">
              {facility ? `${facility.name} — ${location}` : location}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {doctor.teleconsultation && (
              <span className="bg-teal-light text-teal-dark px-2 py-1 rounded-full font-medium">Téléconsultation</span>
            )}
            {distance !== null && (
              <span className="text-gray-400">{distance.toFixed(1)} km</span>
            )}
          </div>
        </div>
        <div className="text-right whitespace-nowrap">
          {doctor.consultationFee != null && (
            <p className="text-sm font-medium">
              {doctor.consultationFee.toLocaleString("fr-FR")} FCFA
              {doctor.teleconsultationFee != null && (
                <span className="text-gray-400 font-normal"> (présentiel)</span>
              )}
            </p>
          )}
          {doctor.teleconsultationFee != null && (
            <p className="text-sm font-medium">
              {doctor.teleconsultationFee.toLocaleString("fr-FR")} FCFA
              {doctor.consultationFee != null && (
                <span className="text-gray-400 font-normal"> (télécons.)</span>
              )}
            </p>
          )}
        </div>
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
