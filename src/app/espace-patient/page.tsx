"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { patients, appointments as appointmentsApi, auth } from "@/lib/api";

type Appointment = {
  id: string;
  appointmentDate: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  doctor: {
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

  // Changement de PIN
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
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
    load();
  }, [router]);

  async function submitNewPin(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    setPinMessage("");
    if (newPin.length !== 4) {
      setPinError("Le PIN contient 4 chiffres.");
      return;
    }
    if (newPin !== newPinConfirm) {
      setPinError("Les deux PIN ne correspondent pas.");
      return;
    }
    setPinLoading(true);
    try {
      await auth.setPin({ pin: newPin });
      setPinMessage("PIN mis à jour avec succès.");
      setNewPin("");
      setNewPinConfirm("");
      setShowPinForm(false);
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setPinLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-400">
          Chargement…
        </div>
      </>
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
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-teal-deep mb-8">
          Bonjour{profile?.user.firstName ? `, ${profile.user.firstName}` : ""}
        </h1>

        {/* Prendre un nouveau RDV — pointe vers la barre de recherche de
            l'accueil en attendant la vraie page de recherche/réservation
            (prochain chantier du backlog). */}
        <Link
          href="/#recherche"
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
                <AppointmentCard key={r.id} appointment={r} />
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
                <AppointmentCard key={r.id} appointment={r} />
              ))}
            </div>
          )}
        </section>

        {/* Informations personnelles */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">Mes informations</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-2 text-sm">
            <InfoRow label="Nom" value={`${profile?.user.firstName ?? ""} ${profile?.user.lastName ?? ""}`.trim() || "—"} />
            <InfoRow label="Téléphone" value={profile?.user.phone || "—"} />
            <InfoRow label="Région" value={profile?.region || "—"} />
            <InfoRow label="Ville" value={profile?.city || "—"} />
          </div>
        </section>

        {/* Changer le PIN */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">Sécurité</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            {!showPinForm ? (
              <button
                onClick={() => { setShowPinForm(true); setPinMessage(""); setPinError(""); }}
                className="text-sm text-teal font-medium"
              >
                Changer mon code PIN
              </button>
            ) : (
              <form onSubmit={submitNewPin} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium mb-2">Nouveau PIN</label>
                  <Code value={newPin} onChange={setNewPin} length={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmez le nouveau PIN</label>
                  <Code value={newPinConfirm} onChange={setNewPinConfirm} length={4} />
                </div>
                {pinError && <p className="text-sm text-coral">{pinError}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={pinLoading}
                    className="bg-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
                  >
                    {pinLoading ? "Un instant…" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPinForm(false); setNewPin(""); setNewPinConfirm(""); setPinError(""); }}
                    className="text-sm text-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
            {pinMessage && <p className="text-sm text-teal-dark mt-3">{pinMessage}</p>}
          </div>
        </section>

        {error && <p className="text-sm text-coral mt-6">{error}</p>}
      </div>
    </>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.appointmentDate);
  const dateStr = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const doctorName = `Dr ${appointment.doctor.user.firstName ?? ""} ${appointment.doctor.user.lastName ?? ""}`.trim();

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="font-medium">{doctorName}</p>
        <p className="text-sm text-gray-500 capitalize">{dateStr} à {timeStr}</p>
      </div>
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[appointment.status]}`}>
        {STATUS_LABELS[appointment.status]}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-50 last:border-0 py-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Code({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
  return (
    <input
      inputMode="numeric"
      maxLength={length}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal"
      placeholder={"•".repeat(length)}
    />
  );
}
