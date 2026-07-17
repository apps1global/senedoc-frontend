"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { apiFetch, auth } from "@/lib/api";
import { REGIONS, citiesForRegion } from "@/lib/senegal";
import { SPECIALTIES } from "@/lib/specialties";

type Step = "form" | "otp" | "pin" | "done";

export default function InscriptionMedecin() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [specialiteAutre, setSpecialiteAutre] = useState("");
  const [numeroOrdre, setNumeroOrdre] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");

  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  const cities = region ? citiesForRegion(region) : [];
  const finalSpecialite = specialite === "Autre" ? specialiteAutre.trim() : specialite;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !finalSpecialite ||
      !numeroOrdre ||
      !region ||
      !city ||
      !password
    ) {
      setError("Merci de remplir les champs obligatoires, y compris région et ville.");
      return;
    }
    setLoading(true);
    try {
      const res: any = await apiFetch("/auth/register-doctor", {
        method: "POST",
        auth: false,
        body: {
          firstName, lastName, phone, email, password,
          specialite: finalSpecialite, numeroOrdre,
          region, city,
          referralCode: referralCode || undefined,
        },
      });
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
      window.localStorage.setItem("senedoc_medecin_phone", phone);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Inscription reçue</h1>
            <p className="text-gray-600 leading-relaxed">
              Votre demande est en cours de validation. Un administrateur vérifie
              votre inscription à l'Ordre. Vous serez visible aux patients une fois validé.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Vous pouvez dès maintenant accéder à votre espace médecin — avec votre email et
              mot de passe, ou votre téléphone et le code PIN que vous venez de définir.
            </p>
            <Link href="/espace-medecin/connexion" className="inline-block mt-6 text-teal font-medium">Accéder à mon espace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="p-6"><Link href="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

          {step === "form" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Inscrire mon cabinet</h1>
              <p className="text-sm text-gray-500 mb-6">Rejoignez senedoc en tant que médecin.</p>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <F label="Prénom *" value={firstName} onChange={setFirstName} />
                  <F label="Nom *" value={lastName} onChange={setLastName} />
                </div>
                <F label="Téléphone *" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                <F label="Email" value={email} onChange={setEmail} />
                <div>
                  <label className="block text-sm font-medium mb-1">Spécialité *</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                  >
                    <option value="">Choisir une spécialité</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {specialite === "Autre" && (
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal mt-2"
                      value={specialiteAutre}
                      onChange={(e) => setSpecialiteAutre(e.target.value)}
                      placeholder="Précisez votre spécialité"
                    />
                  )}
                </div>
                <F label="Numéro à l'Ordre *" value={numeroOrdre} onChange={setNumeroOrdre} />
                <div>
                  <label className="block text-sm font-medium mb-1">Région *</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={region} onChange={(e) => { setRegion(e.target.value); setCity(""); }}>
                    <option value="">Choisir une région</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ville *</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal disabled:bg-gray-50" value={city} onChange={(e) => setCity(e.target.value)} disabled={!region}>
                    <option value="">{region ? "Choisir une ville" : "Choisissez d'abord une région"}</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <F label="Mot de passe *" value={password} onChange={setPassword} type="password" />
                <F label="Code de parrainage (facultatif)" value={referralCode} onChange={setReferralCode} placeholder="Si un administrateur vous en a donné un" />
                {error && <p className="text-sm text-coral">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {loading ? "Un instant…" : "M'inscrire"}
                </button>
              </form>
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
              <p className="text-sm text-gray-500 mb-6">4 chiffres pour vous reconnecter facilement à votre espace médecin, sans ressaisir votre mot de passe.</p>
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

function F({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type || "text"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
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
    <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
      {loading ? "Un instant…" : children}
    </button>
  );
}
