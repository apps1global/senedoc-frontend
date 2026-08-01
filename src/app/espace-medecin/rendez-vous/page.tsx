"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal, appointments as appointmentsApi } from "@/lib/api";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  cancellationReason: string | null;
  type?: "PRESENTIEL" | "TELECONSULTATION";
  videoLink?: string | null;
  facility?: { name: string; address: string | null; city: string | null } | null;
  patient: {
    user: { firstName: string | null; lastName: string | null; phone: string | null };
  };
};

const STATUS_LABELS: Record<Appointment["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absence",
};

const STATUS_COLORS: Record<Appointment["status"], string> = {
  PENDING: "text-coral bg-coral-light",
  CONFIRMED: "text-teal-dark bg-teal-light",
  COMPLETED: "text-gray-500 bg-gray-100",
  CANCELLED: "text-gray-400 bg-gray-100",
  NO_SHOW: "text-gray-400 bg-gray-100",
};

export default function RendezVousMedecin() {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  async function load() {
    try {
      const data = await doctorPortal.getAppointments();
      setList(data as Appointment[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, status: string, reason?: string) {
    setUpdating(id);
    setError("");
    try {
      await appointmentsApi.updateStatus(id, status, reason);
      setCancellingId(null);
      setCancelReason("");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const now = new Date();
  const upcoming = [...list]
    .filter((a) => new Date(a.appointmentDate) >= now && a.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.appointmentDate) - +new Date(b.appointmentDate));
  const past = [...list]
    .filter((a) => new Date(a.appointmentDate) < now || a.status === "CANCELLED")
    .sort((a, b) => +new Date(b.appointmentDate) - +new Date(a.appointmentDate));

  return (
    <DoctorLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Mes rendez-vous</h1>
      <p className="text-xs text-gray-400 mb-6">
        Certaines demandes sont pré-payées par le patient. Sans réponse de votre part sous 24h, elles sont
        automatiquement annulées et le patient est remboursé.
      </p>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="font-medium text-lg mb-4">À venir</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun rendez-vous à venir.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    updating={updating === a.id}
                    cancellingId={cancellingId}
                    setCancellingId={setCancellingId}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onChangeStatus={changeStatus}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-medium text-lg mb-4">Historique</h2>
            {past.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun rendez-vous passé.</p>
            ) : (
              <div className="space-y-3">
                {past.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    updating={updating === a.id}
                    cancellingId={cancellingId}
                    setCancellingId={setCancellingId}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onChangeStatus={changeStatus}
                    readOnly
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </DoctorLayout>
  );
}

function AppointmentCard({
  appointment,
  updating,
  cancellingId,
  setCancellingId,
  cancelReason,
  setCancelReason,
  onChangeStatus,
  readOnly,
}: {
  appointment: Appointment;
  updating: boolean;
  cancellingId: string | null;
  setCancellingId: (id: string | null) => void;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  onChangeStatus: (id: string, status: string, reason?: string) => void;
  readOnly?: boolean;
}) {
  const date = new Date(appointment.appointmentDate);
  const dateStr = date.toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { timeZone: "Africa/Dakar", hour: "2-digit", minute: "2-digit" });
  const patientName = `${appointment.patient.user.firstName ?? ""} ${appointment.patient.user.lastName ?? ""}`.trim();
  const isCancellingThis = cancellingId === appointment.id;
  // L'action ne dépend que du statut, plus de la section (à venir / historique) :
  // un RDV resté "En attente" ne doit jamais être définitivement bloqué
  // simplement parce que sa date est passée sans que le médecin ait agi à temps.
  const canAct = appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium">{patientName || "Patient"}</p>
          <p className="text-sm text-gray-500 capitalize">{dateStr} à {timeStr}</p>
          {appointment.patient.user.phone && (
            <p className="text-sm text-gray-400">{appointment.patient.user.phone}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[appointment.status]}`}>
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>

      {appointment.type === "PRESENTIEL" && appointment.facility && (
        <p className="text-sm text-gray-500 mt-2">
          {appointment.facility.name}
          {appointment.facility.city ? `, ${appointment.facility.city}` : ""}
        </p>
      )}

      {appointment.type === "TELECONSULTATION" && (
        <div className="mt-2">
          <span className="text-xs font-medium text-teal-dark bg-teal-light px-2 py-1 rounded-full">
            Téléconsultation
          </span>
          {appointment.status === "CONFIRMED" && appointment.videoLink && (
            <Link
              href={`/teleconsultation/${appointment.id}`}
              className="block text-sm text-teal font-medium underline mt-2"
            >
              Rejoindre la téléconsultation
            </Link>
          )}
        </div>
      )}

      {appointment.status === "CANCELLED" && appointment.cancellationReason && (
        <p className="text-sm text-gray-500 mt-2">Motif : {appointment.cancellationReason}</p>
      )}

      {canAct && !isCancellingThis && (
        <div className="flex gap-2 mt-4">
          {appointment.status === "PENDING" && (
            <button
              onClick={() => onChangeStatus(appointment.id, "CONFIRMED")}
              disabled={updating}
              className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
            >
              Confirmer
            </button>
          )}
          {appointment.status === "CONFIRMED" && (
            <>
              <button
                onClick={() => onChangeStatus(appointment.id, "COMPLETED")}
                disabled={updating}
                className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                Marquer terminé
              </button>
              <button
                onClick={() => onChangeStatus(appointment.id, "NO_SHOW")}
                disabled={updating}
                className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
              >
                Marquer absence
              </button>
            </>
          )}
          <button
            onClick={() => setCancellingId(appointment.id)}
            disabled={updating}
            className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      )}

      {canAct && isCancellingThis && (
        <div className="mt-4 space-y-2">
          <label className="block text-xs text-gray-500">Motif de l'annulation (facultatif)</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={2}
            placeholder="Ex : imprévu, réorganisation du planning…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onChangeStatus(appointment.id, "CANCELLED", cancelReason)}
              disabled={updating}
              className="text-sm bg-coral text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updating ? "Annulation…" : "Confirmer l'annulation"}
            </button>
            <button
              onClick={() => { setCancellingId(null); setCancelReason(""); }}
              disabled={updating}
              className="text-sm text-gray-500"
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
