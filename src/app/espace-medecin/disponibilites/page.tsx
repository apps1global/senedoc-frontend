"use client";

import { useEffect, useState } from "react";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal } from "@/lib/api";

type AvailType = "PRESENTIEL" | "TELECONSULTATION";
type Availability = { id: string; dayOfWeek: number; startTime: string; endTime: string; type: AvailType };
type ExceptionDate = { id: string; exceptionDate: string; reason: string | null };

const DAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function DisponibilitesMedecin() {
  const [tab, setTab] = useState<AvailType>("PRESENTIEL");
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [adding, setAdding] = useState(false);

  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionReason, setExceptionReason] = useState("");
  const [addingException, setAddingException] = useState(false);

  async function loadAll() {
    try {
      const [avail, exc] = await Promise.all([
        doctorPortal.getAvailability(),
        doctorPortal.getExceptions(),
      ]);
      setAvailabilities(
        (avail as Availability[]).sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        )
      );
      setExceptions(exc as ExceptionDate[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredAvailabilities = availabilities.filter((a) => a.type === tab);

  async function addAvailability(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (startTime >= endTime) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setAdding(true);
    try {
      await doctorPortal.createAvailability({ dayOfWeek, startTime, endTime, type: tab });
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function removeAvailability(id: string) {
    setError("");
    try {
      await doctorPortal.deleteAvailability(id);
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addException(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!exceptionDate) return;
    setAddingException(true);
    try {
      await doctorPortal.createException({ exceptionDate, reason: exceptionReason || undefined });
      setExceptionDate("");
      setExceptionReason("");
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingException(false);
    }
  }

  async function removeException(id: string) {
    setError("");
    try {
      await doctorPortal.deleteException(id);
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <DoctorLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Mes disponibilités</h1>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <>
          <section className="mb-10">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab("PRESENTIEL")}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                  tab === "PRESENTIEL" ? "bg-teal text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                Présentiel
              </button>
              <button
                onClick={() => setTab("TELECONSULTATION")}
                className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                  tab === "TELECONSULTATION" ? "bg-teal text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                Téléconsultation
              </button>
            </div>

            <h2 className="font-medium text-lg mb-4">
              Créneaux hebdomadaires — {tab === "PRESENTIEL" ? "présentiel" : "téléconsultation"}
            </h2>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
              {filteredAvailabilities.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun créneau défini — ajoutez-en un ci-dessous.</p>
              ) : (
                <div className="space-y-2">
                  {filteredAvailabilities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <span>{DAYS[a.dayOfWeek]} — {a.startTime} à {a.endTime}</span>
                      <button onClick={() => removeAvailability(a.id)} className="text-gray-400 hover:text-coral transition-colors">Retirer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={addAvailability} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Jour</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal text-sm"
                >
                  {DAYS.slice(1).map((d, i) => (
                    <option key={d} value={i + 1}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Début</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Fin</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal text-sm" />
              </div>
              <button type="submit" disabled={adding} className="bg-teal text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-50">
                {adding ? "…" : "Ajouter"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-medium text-lg mb-4">Indisponibilités ponctuelles</h2>
            <p className="text-xs text-gray-400 mb-3">S'applique aux deux modes (présentiel et téléconsultation).</p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
              {exceptions.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune indisponibilité prévue.</p>
              ) : (
                <div className="space-y-2">
                  {exceptions.map((exc) => (
                    <div key={exc.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                      <span>
                        {new Date(exc.exceptionDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {exc.reason ? ` — ${exc.reason}` : ""}
                      </span>
                      <button onClick={() => removeException(exc.id)} className="text-gray-400 hover:text-coral transition-colors">Retirer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={addException} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Date</label>
                <input type="date" value={exceptionDate} onChange={(e) => setExceptionDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal text-sm" />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium mb-1">Raison (facultatif)</label>
                <input value={exceptionReason} onChange={(e) => setExceptionReason(e.target.value)} placeholder="Congé, formation…" className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal text-sm" />
              </div>
              <button type="submit" disabled={addingException || !exceptionDate} className="bg-teal text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-50">
                {addingException ? "…" : "Ajouter"}
              </button>
            </form>
          </section>
        </>
      )}
    </DoctorLayout>
  );
}
