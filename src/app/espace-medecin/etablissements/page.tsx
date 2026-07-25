"use client";

import { useEffect, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal } from "@/lib/api";
import { FacilityPlaceSearch, type SelectedPlace } from "@/components/FacilityPlaceSearch";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Facility = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
};

const STATUS_LABELS: Record<Facility["status"], string> = {
  PENDING: "En attente de vérification",
  VERIFIED: "Vérifié",
  REJECTED: "Rejeté",
  SUSPENDED: "Suspendu",
};

const STATUS_COLORS: Record<Facility["status"], string> = {
  PENDING: "text-coral bg-coral-light",
  VERIFIED: "text-teal-dark bg-teal-light",
  REJECTED: "text-gray-400 bg-gray-100",
  SUSPENDED: "text-gray-400 bg-gray-100",
};

export default function EtablissementsMedecin() {
  const [list, setList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newPlace, setNewPlace] = useState<SelectedPlace | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await doctorPortal.getFacilities();
      setList(data as Facility[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmAdd() {
    if (!newPlace) return;
    setSaving(true);
    setError("");
    try {
      await doctorPortal.addFacility({
        name: newPlace.name,
        address: newPlace.address || undefined,
        city: newPlace.city || undefined,
        country: "Sénégal",
        latitude: newPlace.latitude,
        longitude: newPlace.longitude,
        googlePlaceId: newPlace.googlePlaceId,
      });
      setNewPlace(null);
      setAdding(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(facilityId: string, name: string) {
    if (!window.confirm(`Retirer "${name}" de vos établissements ?`)) return;
    try {
      await doctorPortal.removeFacility(facilityId);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <DoctorLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold">Mes établissements</h1>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors"
          >
            + Ajouter un établissement
          </button>
        )}
      </div>

      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {adding && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          {API_KEY ? (
            <APIProvider apiKey={API_KEY} libraries={["places"]}>
              <FacilityPlaceSearch
                selected={newPlace}
                onSelect={setNewPlace}
                onClear={() => setNewPlace(null)}
              />
            </APIProvider>
          ) : (
            <p className="text-sm text-coral">Clé Google Maps manquante.</p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={confirmAdd}
              disabled={!newPlace || saving}
              className="bg-teal text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
            >
              {saving ? "Ajout…" : "Confirmer l'ajout"}
            </button>
            <button
              onClick={() => { setAdding(false); setNewPlace(null); }}
              className="text-sm text-gray-500"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun établissement pour l'instant.</p>
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <div key={f.id} className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{f.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {f.address}{f.city ? `, ${f.city}` : ""}
                </p>
                <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mt-2 ${STATUS_COLORS[f.status]}`}>
                  {STATUS_LABELS[f.status]}
                </span>
              </div>
              <button
                onClick={() => remove(f.id, f.name)}
                className="text-sm text-gray-500 hover:text-coral transition-colors whitespace-nowrap"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </DoctorLayout>
  );
}
