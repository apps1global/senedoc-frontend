"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";
import { REGIONS, citiesForRegion } from "@/lib/senegal";

type Step = "form" | "otp" | "pin";

const REMEMBERED_PHONE_KEY = "senedoc_phone";

function InscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/espace-patient";

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Données du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [residesAbroad, setResidesAbroad] = useState(false);
  const [country, setCountry] = useState("");
  const [abroadCity, setAbroadCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // État du flux
  const [userId, setUserId] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Compte a rebours de renvoi : empeche de redemander un SMS en boucle
  // (evite les tentatives paniques -> comptes en double -> couts Twilio).
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleResendOtp() {
    setResending(true);
    setError("");
    try {
      await auth.resendOtp({ userId });
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);

  const cities = region ? citiesForRegion(region) : [];

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !phone || (!residesAbroad && (!region || !city))) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res: any = await auth.register({
        firstName,
        lastName,
        phone,
        region: residesAbroad ? "" : region,
        city: residesAbroad ? (abroadCity.trim() || "") : city,
        country: residesAbroad ? (country.trim() || undefined) : undefined,
        email: email.trim() || undefined,
        password: password || undefined,
      });
      setUserId(res.id);
      setStep("otp");
      setResendCooldown(60);
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
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm overflow-hidden">

          {step === "form" && (
            <>
              <div className="bg-[#E1F5EE] px-8 pt-7 pb-6 text-center">
                <Link href="/" className="inline-block mb-3"><Logo size={26} /></Link>
                <h1 className="font-display text-xl font-semibold text-teal-dark">Créer mon compte</h1>
                <p className="text-sm text-teal mt-1">Prenez rendez-vous avec un professionnel de santé.</p>
              </div>
              <form onSubmit={submitForm} className="space-y-4 p-8 pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" value={firstName} onChange={setFirstName} />
                  <Field label="Nom" value={lastName} onChange={setLastName} />
                </div>
                <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={residesAbroad}
                    onChange={(e) => { setResidesAbroad(e.target.checked); setRegion(""); setCity(""); setCountry(""); setAbroadCity(""); }}
                    className="h-4 w-4 shrink-0 accent-teal cursor-pointer"
                  />
                  <span>Je réside hors du Sénégal</span>
                </label>

                {residesAbroad ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Pays de résidence (facultatif)" value={country} onChange={setCountry} placeholder="Ex : France, Italie…" />
                    <Field label="Ville (facultatif)" value={abroadCity} onChange={setAbroadCity} placeholder="Ex : Paris, Milan…" />
                  </div>
                ) : (
                  <>
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
                  </>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Facultatif — utile si votre téléphone est temporairement injoignable, ou pour recevoir des informations importantes.
                  </p>
                  <div className="space-y-3">
                    <Field label="Email (facultatif)" value={email} onChange={setEmail} placeholder="vous@exemple.com" type="email" />
                    <Field label="Mot de passe (facultatif)" value={password} onChange={setPassword} placeholder="Au moins 8 caractères" type="password" />
                  </div>
                </div>

                {error && <p className="text-sm text-coral">{error}</p>}
                <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptCGU}
                    onChange={(e) => setAcceptCGU(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-teal cursor-pointer"
                  />
                  <span>
                    J&apos;accepte les{" "}
                    <Link href="/cgu" target="_blank" className="text-teal font-medium underline">conditions d&apos;utilisation</Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" target="_blank" className="text-teal font-medium underline">politique de confidentialité</Link>.
                  </span>
                </label>
                <Submit loading={loading} disabled={!acceptCGU}>Continuer</Submit>
              </form>
              <p className="text-sm text-gray-500 text-center mt-4">
                Déjà un compte ? <Link href={`/connexion${redirect !== "/espace-patient" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-teal font-medium">Se connecter</Link>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="bg-[#E1F5EE] px-8 pt-7 pb-6 text-center">
                <Logo size={26} />
                <h1 className="font-display text-xl font-semibold text-teal-dark mt-3">Vérifiez votre téléphone</h1>
                <p className="text-sm text-teal mt-1">Un code à 6 chiffres a été envoyé au {phone}.</p>
              </div>
              <form onSubmit={submitOtp} className="space-y-4 p-8 pt-6">
                <CodeInput value={otp} onChange={setOtp} length={6} />
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Vérifier</Submit>
              </form>
              <div className="text-center mt-4">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-400">Renvoyer le code dans {resendCooldown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-sm text-teal font-medium disabled:opacity-50"
                  >
                    {resending ? "Envoi…" : "Renvoyer le code"}
                  </button>
                )}
              </div>
            </>
          )}

          {step === "pin" && (
            <>
              <div className="bg-[#E1F5EE] px-8 pt-7 pb-6 text-center">
                <Logo size={26} />
                <h1 className="font-display text-xl font-semibold text-teal-dark mt-3">Créez votre code PIN</h1>
                <p className="text-sm text-teal mt-1">4 chiffres pour vous reconnecter, sans SMS.</p>
              </div>
              <form onSubmit={submitPin} className="space-y-4 p-8 pt-6">
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

export default function Inscription() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Chargement…</div>}>
      <InscriptionContent />
    </Suspense>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
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

function Submit({ loading, children, disabled }: { loading: boolean; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
    >
      {loading ? "Un instant…" : children}
    </button>
  );
}
