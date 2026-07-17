"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { adminPortal } from "@/lib/api";

type Doctor = {
  id: string;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  validatedAt: string | null;
  registrationNumber: string | null;
  createdAt: string;
  user: { firstName: string | null; lastName: string | null; phone: string | null; email: string | null };
  specialty: { name: string };
};

const STATUS_LABELS: Record<Doctor["validationStatus"], string> = {
  PENDING: "En attente",
  VALIDATED: "Validé",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<Doctor["validationStatus"], string> = {
  PENDING: "text-coral bg-coral-light",
  VALIDATED: "text-teal-dark bg-teal-light",
  REJECTED: "text-gray-400 bg-gray-100",
};

export default function Medecins() {
  const [list, setList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | Doctor["validationStatus"]>("PENDING");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await adminPortal.myDoctors();
      setList(data as Doctor[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function validate(id: string) {
    setUpdating(id);
    setError("");
    try {
      await adminPortal.validateDoctor(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function reject(id: string) {
    setUpdating(id);
    setError("");
    try {
      await adminPortal.rejectDoctor(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function confirmDelete(id: string) {
    setUpdating(id);
    setError("");
    try {
      await adminPortal.deleteDoctor(id);
      setConfirmDeleteId(null);
      await load();
    } catch (err: any) {
      setError(err.message);
      setConfirmDeleteId(null);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "ALL" ? list : list.filter((d) => d.validationStatus === filter);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Médecins</h1>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      <div className="flex gap-2 mb-6">
        {(["PENDING", "VALIDATED", "REJECTED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === f ? "bg-teal text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f === "ALL" ? "Tous" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun médecin dans cette catégorie.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">Dr {d.user.firstName} {d.user.lastName}</p>
                  <p className="text-sm text-teal-dark">{d.specialty.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{d.user.email} · {d.user.phone}</p>
                  <p className="text-sm text-gray-400">N° Ordre : {d.registrationNumber || "—"}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[d.validationStatus]}`}>
                  {STATUS_LABELS[d.validationStatus]}
                </span>
              </div>

              <div className="flex gap-2 mt-4 items-center flex-wrap">
                {d.validationStatus === "PENDING" && (
                  <>
                    <button
                      onClick={() => validate(d.id)}
                      disabled={updating === d.id}
                      className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => reject(d.id)}
                      disabled={updating === d.id}
                      className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                  </>
                )}

                {confirmDeleteId === d.id ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">Confirmer la suppression ?</span>
                    <button
                      onClick={() => confirmDelete(d.id)}
                      disabled={updating === d.id}
                      className="text-sm bg-coral text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {updating === d.id ? "…" : "Oui, supprimer"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-sm text-gray-500 px-3 py-1.5"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(d.id)}
                    className="text-sm text-gray-400 px-4 py-2 rounded-lg font-medium hover:text-coral transition-colors ml-auto"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
