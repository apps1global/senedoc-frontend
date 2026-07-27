"use client";

import { useEffect, useState } from "react";

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PatientLayout } from "@/components/PatientLayout";
import { ToastStack } from "@/components/ToastStack";
import { useToasts } from "@/lib/useToasts";
import { getSocket } from "@/lib/socket";
import { patients, appointments as appointmentsApi, auth } from "@/lib/api";
import { isInSenegal } from "@/lib/geo";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  cancellationReason: string | null;
  type?: "PRESENTIEL" | "TELECONSULTATION";
  videoLink?: string | null;
  facility?: { name: string; address: string | null; city: string | null; latitude: number | null; longitude: number | null } | null;
  doctor: {
    id: string;
    user: { firstName: string | null; lastName: string | null };
  };
};

type PatientProfile = {
  id: string;
  region: string | null;
  city: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
};

const STATUS_LABELS: Record<Appointment["status"], string> = {
  PENDING: "En attente de confirmation",
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

export default function EspacePatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [rdvs, setRdvs] = useState<Appointment[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const { toasts, push } = useToasts();


  async function load() {
    try {
      // Garde de rôle : cette page ne concerne que les patients. Un
      // médecin/admin qui clique sur "Mon espace" ou tape l'URL directement
      // doit être redirigé vers son propre espace, pas voir/modifier des
      // données patient.
      const me: any = await auth.me();
      if (me?.role === "DOCTOR") {
        router.push("/espace-medecin");
        return;
      }
      if (me?.role === "ADMIN" || me?.role === "SUPERADMIN") {
        router.push("/admin/tableau-de-bord");
        return;
      }

      const [profileRes, rdvsRes] = await Promise.all([
        patients.getMe(),
        appointmentsApi.getMine(),
      ]);
      setProfile(profileRes as PatientProfile);
      setRdvs(rdvsRes as Appointment[]);
    } catch (err: any) {
      // Session invalide ou expirée → retour à la connexion
      router.push("/connexion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Distance masquée hors du Sénégal : elle n'aurait pas de sens.
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isInSenegal(lat, lng)) setUserPos({ lat, lng });
      },
      () => {},
      { timeout: 8000 },
    );
  }, []);

  // Temps réel : dès que le médecin confirme/annule/termine un rendez-vous,
  // le patient le voit sans recharger la page.
  useEffect(() => {
    const socket = getSocket();
    const onUpdated = (data: { id: string; status: Appointment["status"] }) => {
      setRdvs((prev) => prev.map((r) => (r.id === data.id ? { ...r, status: data.status } : r)));
      push(`Votre rendez-vous est maintenant : ${STATUS_LABELS[data.status]}`);
    };
    socket.on("appointment:updated", onUpdated);
    return () => {
      socket.off("appointment:updated", onUpdated);
    };
  }, [push]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  async function cancelAppointment(id: string, reason: string) {
    setCancelling(id);
    setError("");
    try {
      await appointmentsApi.updateStatus(id, "CANCELLED", reason || undefined);
      setCancellingId(null);
      setCancelReason("");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(null);
    }
  }



  if (loading) {
    return (
      <PatientLayout>
        <div className="py-16 text-center text-gray-400">Chargement…</div>
      </PatientLayout>
    );
  }

  const now = new Date();
  const upcoming = rdvs
    .filter((r) => new Date(r.appointmentDate) >= now && r.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.appointmentDate) - +new Date(b.appointmentDate));
  const past = rdvs
    .filter((r) => new Date(r.appointmentDate) < now || r.status === "CANCELLED")
    .sort((a, b) => +new Date(b.appointmentDate) - +new Date(a.appointmentDate));

  return (
    <PatientLayout>
        <h1 className="font-display text-3xl font-semibold text-teal-deep mb-8">
          Bonjour{profile?.user.firstName ? `, ${profile.user.firstName}` : ""}
        </h1>

        {/* Prendre un nouveau RDV — vers la page de recherche/reservation. */}
        <Link
          href="/recherche"
          className="block bg-teal text-white rounded-xl px-6 py-4 mb-10 font-medium hover:bg-teal-dark transition-colors text-center"
        >
          Prendre un nouveau rendez-vous
        </Link>

        {/* RDV à venir */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Mes rendez-vous à venir</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun rendez-vous à venir.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((r) => (
                <AppointmentCard
                  key={r.id}
                  appointment={r}
                  cancelling={cancelling === r.id}
                  cancellingId={cancellingId}
                  setCancellingId={setCancellingId}
                  cancelReason={cancelReason}
                  setCancelReason={setCancelReason}
                  onCancel={cancelAppointment}
                  userPos={userPos}
                />
              ))}
            </div>
          )}
        </section>

        {/* Historique */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Historique</h2>
          {past.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun rendez-vous passé.</p>
          ) : (
            <div className="space-y-3">
              {past.map((r) => (
                <AppointmentCard
                  key={r.id}
                  appointment={r}
                  cancelling={false}
                  cancellingId={cancellingId}
                  setCancellingId={setCancellingId}
                  userPos={userPos}
                  cancelReason={cancelReason}
                  setCancelReason={setCancelReason}
                  onCancel={cancelAppointment}
                  readOnly
                />
              ))}
            </div>
          )}
        </section>

        {error && <p className="text-sm text-coral mt-6">{error}</p>}
      <ToastStack toasts={toasts} />
    </PatientLayout>
  );
}

function AppointmentCard({
  appointment,
  cancelling,
  cancellingId,
  setCancellingId,
  cancelReason,
  setCancelReason,
  onCancel,
  readOnly,
  userPos,
}: {
  appointment: Appointment;
  cancelling: boolean;
  cancellingId: string | null;
  setCancellingId: (id: string | null) => void;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  onCancel: (id: string, reason: string) => void;
  readOnly?: boolean;
  userPos?: { lat: number; lng: number } | null;
}) {
  const date = new Date(appointment.appointmentDate);
  const dateStr = date.toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { timeZone: "Africa/Dakar", hour: "2-digit", minute: "2-digit" });
  const doctorName = `Dr ${appointment.doctor.user.firstName ?? ""} ${appointment.doctor.user.lastName ?? ""}`.trim();
  // Ne dépend que du statut, plus de readOnly (section historique) : un
  // patient doit pouvoir annuler un RDV encore en attente ou confirmé,
  // même si sa date est déjà passée sans réponse du médecin.
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED";
  const canRebook = appointment.status === "CANCELLED";
  const isCancellingThis = cancellingId === appointment.id;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium">{doctorName}</p>
          <p className="text-sm text-gray-500 capitalize">{dateStr} à {timeStr}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[appointment.status]}`}>
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>

      {appointment.type === "PRESENTIEL" && appointment.facility && (
        <p className="text-sm text-gray-500 mt-2">
          {appointment.facility.name}
          {appointment.facility.address ? ` — ${appointment.facility.address}` : ""}
          {appointment.facility.city ? `, ${appointment.facility.city}` : ""}
          {userPos && appointment.facility.latitude != null && appointment.facility.longitude != null && (
            <span className="text-teal-dark font-medium">
              {" · "}
              {distanceKm(userPos.lat, userPos.lng, appointment.facility.latitude, appointment.facility.longitude).toFixed(1)} km
            </span>
          )}
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

      {canCancel && !isCancellingThis && (
        <button
          onClick={() => setCancellingId(appointment.id)}
          className="text-sm text-gray-500 hover:text-coral transition-colors mt-3"
        >
          Annuler ce rendez-vous
        </button>
      )}

      {canCancel && isCancellingThis && (
        <div className="mt-3 space-y-2">
          <label className="block text-xs text-gray-500">Motif de l'annulation <span className="text-coral">*</span></label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={2}
            placeholder="Ex : empêchement, changement de date souhaité…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onCancel(appointment.id, cancelReason)}
              disabled={cancelling || !cancelReason.trim()}
              className="text-sm bg-coral text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {cancelling ? "Annulation…" : "Confirmer l'annulation"}
            </button>
            <button
              onClick={() => { setCancellingId(null); setCancelReason(""); }}
              disabled={cancelling}
              className="text-sm text-gray-500"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {canRebook && (
        <Link
          href={`/medecin/${appointment.doctor.id}`}
          className="text-sm text-teal font-medium mt-3 inline-block"
        >
          Reprendre un rendez-vous avec ce médecin
        </Link>
      )}
    </div>
  );
}
