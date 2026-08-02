"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PatientLayout } from "@/components/PatientLayout";
import { favorites } from "@/lib/api";

type FavoriteDoctor = {
  id: string;
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
};

export default function MesFavoris() {
  const [list, setList] = useState<FavoriteDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setList(await favorites.getMine());
    } catch (e: any) {
      setError(e?.message || "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(doctorId: string) {
    try {
      await favorites.remove(doctorId);
      await load();
    } catch (e: any) {
      setError(e?.message || "Suppression impossible.");
    }
  }

  return (
    <PatientLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Mes favoris</h1>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Retrouvez rapidement les médecins que vous avez ajoutés en favori depuis leur fiche.
      </p>

      {error && <p className="text-coral text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Aucun médecin en favori pour le moment. Ajoutez-en depuis la fiche d&apos;un médecin (icône cœur).
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <Link href={`/medecin/${d.id}`} className="min-w-0">
                <p className="font-medium hover:text-teal-dark transition-colors">
                  Dr {d.user.firstName} {d.user.lastName}
                </p>
                <p className="text-sm text-teal-dark">{d.specialty.name}</p>
              </Link>
              <button onClick={() => remove(d.id)} className="text-coral hover:underline text-sm shrink-0">
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </PatientLayout>
  );
}
