"use client";

import { useEffect, useState } from "react";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal, appointments as appointmentsApi } from "@/lib/api";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
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

  async function changeStatus(id: string, status: string) {
    setUpdating(id);
    setError("");
    try {
      await appointmentsApi.updateStatus(id, status);
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
      <h1 className="font-display text-2xl font-semibold mb-6">Mes rendez-vous</h1>
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
                  <AppointmentCard key={a.id} appointment={a} updating={updating === a.id} onChangeStatus={changeStatus} />
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
                  <AppointmentCard key={a.id} appointment={a} updating={updating === a.id} onChangeStatus={changeStatus} />
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
  onChangeStatus,
}: {
  appointment: Appointment;
  updating: boolean;
  onChangeStatus: (id: string, status: string) => void;
}) {
  const date = new Date(appointment.appointmentDate);
  const dateStr = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const patientName = `${appointment.patient.user.firstName ?? ""} ${appointment.patient.user.lastName ?? ""}`.trim();

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

      {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
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
            onClick={() => onChangeStatus(appointment.id, "CANCELLED")}
            disabled={updating}
            className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
