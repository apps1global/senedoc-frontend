"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  teleconsultation: boolean;
  yearsExperience: number | null;
  photoUrl: string | null;
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
  facilityMemberships: { facility: Facility }[];
};

// Distance à vol d'oiseau (formule de Haversine), calculée entièrement
// côté navigateur — aucune coordonnée patient n'est envoyée au serveur.
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
  const [results, setResults] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);

  // Position du patient : demandée une fois, jamais envoyée au serveur —
  // sert uniquement à calculer la distance affichée dans le navigateur.
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

  async function runSearch() {
    setLoading(true);
    setError("");
    try {
      const data = await doctors.search({ specialty, city });
      setResults(data as Doctor[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    router.replace(`/recherche${params.toString() ? `?${params.toString()}` : ""}`);
    runSearch();
  }

  // Trie par distance quand la position est connue, sinon garde l'ordre du serveur.
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
        <h1 className="font-display text-2xl font-semibold mb-6">Trouver un médecin</h1>

        <form onSubmit={submitFilters} className="bg-white border border-gray-100 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <input
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Spécialité (cardiologue…)"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-[15px]"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-[15px]"
          />
          <button type="submit" className="bg-coral text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Rechercher
          </button>
        </form>

        {geoDenied && (
          <p className="text-xs text-gray-400 mb-6">
            Localisation non disponible — les distances ne sont pas affichées, mais la recherche fonctionne normalement.
          </p>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-16">Recherche en cours…</p>
        ) : error ? (
          <p className="text-coral text-center py-16">{error}</p>
        ) : sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-16">Aucun médecin ne correspond à cette recherche.</p>
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
  const name = `Dr ${doctor.user.firstName ?? ""} ${doctor.user.lastName ?? ""}`.trim();

  return (
    <Link
      href={`/medecin/${doctor.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-teal hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-teal-dark">{doctor.specialty.name}</p>
          {facility && (
            <p className="text-sm text-gray-500 mt-1">
              {facility.name}{facility.city ? ` — ${facility.city}` : ""}
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
        {doctor.consultationFee != null && (
          <p className="text-sm font-medium whitespace-nowrap">{doctor.consultationFee.toLocaleString("fr-FR")} FCFA</p>
        )}
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
