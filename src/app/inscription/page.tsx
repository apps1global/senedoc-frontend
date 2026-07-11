"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";
import { REGIONS, citiesForRegion } from "@/lib/senegal";

type Step = "form" | "otp" | "pin";

const REMEMBERED_PHONE_KEY = "senedoc_phone";

export default function Inscription() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Données du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  // État du flux
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const cities = region ? citiesForRegion(region) : [];

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !phone || !region || !city) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res: any = await auth.register({ firstName, lastName, phone, region, city });
      setUserId(res.id);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Le code contient 6 chiffres.");
      return;
    }
    setLoading(true);
    try {
      await auth.verifyOtp({ userId, otp });
      setStep("pin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pin.length !== 4) {
      setError("Le PIN contient 4 chiffres.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("Les deux PIN ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await auth.setPin({ pin });
      // Numéro mémorisé sur cet appareil : à la prochaine connexion, seul
      // le PIN sera demandé (voir page /connexion).
      window.localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
      router.push("/espace-patient");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="p-6"><Link href="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

          {step === "form" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Créer mon compte</h1>
              <p className="text-sm text-gray-500 mb-6">Prenez rendez-vous en quelques instants.</p>
              <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" value={firstName} onChange={setFirstName} />
                  <Field label="Nom" value={lastName} onChange={setLastName} />
                </div>
                <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                <div>
                  <label className="block text-sm font-medium mb-1">Région</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
                    value={region}
                    onChange={(e) => { setRegion(e.target.value); setCity(""); }}
                  >
                    <option value="">Choisir une région</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal disabled:bg-gray-50"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!region}
                  >
                    <option value="">{region ? "Choisir une ville" : "Choisissez d'abord une région"}</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Continuer</Submit>
              </form>
              <p className="text-sm text-gray-500 text-center mt-4">
                Déjà un compte ? <Link href="/connexion" className="text-teal font-medium">Se connecter</Link>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Vérifiez votre téléphone</h1>
              <p className="text-sm text-gray-500 mb-6">Nous avons envoyé un code à 6 chiffres au {phone}.</p>
              <form onSubmit={submitOtp} className="space-y-4">
                <CodeInput value={otp} onChange={setOtp} length={6} />
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Vérifier</Submit>
              </form>
            </>
          )}

          {step === "pin" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Créez votre code PIN</h1>
              <p className="text-sm text-gray-500 mb-6">4 chiffres pour vous reconnecter facilement, sans SMS.</p>
              <form onSubmit={submitPin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Votre PIN</label>
                  <CodeInput value={pin} onChange={setPin} length={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmez le PIN</label>
                  <CodeInput value={pinConfirm} onChange={setPinConfirm} length={4} />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Terminer</Submit>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CodeInput({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
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

function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
    >
      {loading ? "Un instant…" : children}
    </button>
  );
}
