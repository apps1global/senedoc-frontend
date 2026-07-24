"use client";

import { useEffect, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { patients, auth } from "@/lib/api";

type PatientProfile = {
  user: { firstName: string | null; lastName: string | null; phone: string | null };
  region: string | null;
  city: string | null;
};

export default function ProfilPatient() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    patients
      .getMe()
      .then((p) => setProfile(p as PatientProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <PatientLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Mon profil</h1>

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="font-display text-lg font-semibold mb-4">Mes informations</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-2 text-sm">
              <InfoRow label="Nom" value={`${profile?.user.firstName ?? ""} ${profile?.user.lastName ?? ""}`.trim() || "—"} />
              <InfoRow label="Téléphone" value={profile?.user.phone || "—"} />
              <InfoRow label="Région" value={profile?.region || "—"} />
              <InfoRow label="Ville" value={profile?.city || "—"} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-4">Sécurité</h2>
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
        </>
      )}
    </PatientLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
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
      className="w-32 tracking-[0.5em] text-center border border-gray-200 rounded-lg px-3 py-2.5 text-lg outline-none focus:border-teal"
    />
  );
}
