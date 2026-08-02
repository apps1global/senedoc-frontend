"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";

type Mode = "pin" | "email" | "reset-request" | "reset-confirm";

const REMEMBERED_PHONE_KEY = "senedoc_phone";

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/espace-patient";

  const [mode, setMode] = useState<Mode>("pin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Numéro déjà connu sur cet appareil : on ne le redemande plus, seul le
  // PIN est saisi. Le téléphone reste envoyé au backend (obligatoire côté
  // API), simplement il n'est plus tapé à chaque connexion.
  const [rememberedPhone, setRememberedPhone] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBERED_PHONE_KEY);
    if (saved) {
      setRememberedPhone(saved);
      setPhone(saved);
    }
  }, []);

  function forgetDevice() {
    window.localStorage.removeItem(REMEMBERED_PHONE_KEY);
    setRememberedPhone(null);
    setPhone("");
    setPin("");
    setError("");
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.loginPin({ phone, pin });
      // Connexion réussie : on mémorise le numéro sur cet appareil pour
      // les prochaines fois (plus jamais redemandé, seul le PIN le sera).
      window.localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login({ email, password });
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      await auth.requestPinReset({ phone });
      setInfo("Si ce numéro existe, un code a été envoyé par SMS.");
      setMode("reset-confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPin.length !== 4) { setError("Le PIN contient 4 chiffres."); return; }
    setLoading(true);
    try {
      await auth.resetPin({ phone, otp, newPin });
      window.localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
      setInfo("PIN réinitialisé. Vous pouvez vous connecter.");
      setMode("pin");
      setPin("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau signature — masqué sur mobile, motif de pulsation cardiaque en écho au logo */}
      <div
        className="hidden md:flex md:w-[42%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #0B4A3B 0%, #0F6E56 100%)" }}
      >
        <PulseTexture />
        <Link href="/" className="relative z-10">
          <span className="font-display text-2xl font-bold text-white">
            Se<span className="text-teal-200">●</span>edoc
          </span>
        </Link>
        <div className="relative z-10">
          <PulseHero />
          <h2 className="font-display text-3xl font-semibold text-white mt-8 leading-tight">
            Votre santé,<br />à portée de clic.
          </h2>
          <p className="text-white/70 mt-3 text-sm leading-relaxed max-w-xs">
            Patients et médecins déjà connectés à travers le Sénégal.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/40">© SeneDoc</p>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <div
          className="md:hidden px-6 pt-8 pb-10 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0B4A3B 0%, #0F6E56 100%)" }}
        >
          <PulseTexture />
          <Link href="/" className="relative z-10 block">
            <span className="font-display text-xl font-bold text-white">
              Se<span className="text-teal-200">●</span>edoc
            </span>
          </Link>
          <div className="relative z-10 mt-4">
            <PulseHero />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {mode === "pin" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Se connecter</h1>
              {rememberedPhone ? (
                <p className="text-sm text-gray-500 mb-6">
                  {rememberedPhone} — <button type="button" onClick={forgetDevice} className="text-teal font-medium">changer de numéro</button>
                </p>
              ) : (
                <p className="text-sm text-gray-500 mb-6">Avec votre téléphone et votre PIN.</p>
              )}
              {info && <p className="text-sm text-teal-dark mb-4">{info}</p>}
              <form onSubmit={submitPin} className="space-y-4">
                {!rememberedPhone && (
                  <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Code PIN</label>
                  <Code value={pin} onChange={setPin} length={4} />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Se connecter</Submit>
              </form>
              <button onClick={() => { setMode("reset-request"); setError(""); }} className="text-sm text-teal font-medium mt-4 block mx-auto">
                PIN oublié ?
              </button>
              <button onClick={() => { setMode("email"); setError(""); }} className="text-sm text-gray-400 mt-2 block mx-auto">
                Se connecter avec email et mot de passe
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Pas encore de compte ? <Link href={`/inscription${redirect !== "/espace-patient" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-teal font-medium">S'inscrire</Link>
              </p>
              <div className="border-t border-gray-100 mt-6 pt-4 text-center">
                <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">Accès administrateur</Link>
              </div>
            </>
          )}

          {mode === "email" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Se connecter</h1>
              <p className="text-sm text-gray-500 mb-6">Avec votre email et votre mot de passe.</p>
              <form onSubmit={submitEmail} className="space-y-4">
                <Field label="Email" value={email} onChange={setEmail} placeholder="vous@exemple.com" type="email" />
                <Field label="Mot de passe" value={password} onChange={setPassword} placeholder="Votre mot de passe" type="password" />
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Se connecter</Submit>
              </form>
              <button onClick={() => { setMode("pin"); setError(""); }} className="text-sm text-teal font-medium mt-4 block mx-auto">
                Se connecter avec téléphone et PIN
              </button>
            </>
          )}

          {mode === "reset-request" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">PIN oublié</h1>
              <p className="text-sm text-gray-500 mb-6">Entrez votre téléphone, nous enverrons un code par SMS.</p>
              <form onSubmit={requestReset} className="space-y-4">
                <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="+221 77 123 45 67" />
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Envoyer le code</Submit>
              </form>
              <button onClick={() => setMode("pin")} className="text-sm text-teal font-medium mt-4 block mx-auto">Retour</button>
            </>
          )}

          {mode === "reset-confirm" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Nouveau PIN</h1>
              <p className="text-sm text-gray-500 mb-6">{info || "Entrez le code reçu et votre nouveau PIN."}</p>
              <form onSubmit={confirmReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code reçu par SMS</label>
                  <Code value={otp} onChange={setOtp} length={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nouveau PIN</label>
                  <Code value={newPin} onChange={setNewPin} length={4} />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <Submit loading={loading}>Réinitialiser</Submit>
              </form>
              <button onClick={() => setMode("pin")} className="text-sm text-teal font-medium mt-4 block mx-auto">Retour</button>
            </>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Connexion() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Chargement…</div>}>
      <ConnexionContent />
    </Suspense>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function Code({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
  return (
    <input inputMode="numeric" maxLength={length} value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal"
      placeholder={"•".repeat(length)} />
  );
}
function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">{loading ? "Un instant…" : children}</button>;
}

// Motif de fond en filigrane : plusieurs lignes de pulsation cardiaque
// dupliquées à faible opacité, en écho au point de pulsation du logo.
function PulseTexture() {
  const spike = "L20,0 L28,-20 L36,20 L44,-12 L52,0 L120,0";
  const path = `M0,0 ${spike} ${spike.replace(/(-?\d+),(-?\d+)/g, (_, x, y) => `${Number(x) + 120},${y}`)} ${spike.replace(/(-?\d+),(-?\d+)/g, (_, x, y) => `${Number(x) + 240},${y}`)} L400,0`;
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[60, 140, 220, 300].map((y, i) => (
        <path
          key={y}
          d={path}
          transform={`translate(-40, ${y})`}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          opacity={0.06 + (i % 2) * 0.03}
        />
      ))}
    </svg>
  );
}

// Élément signature : une ligne de pulsation cardiaque plus marquée,
// tracée au chargement de la page (respecte prefers-reduced-motion).
function PulseHero() {
  return (
    <>
      <style>{`
        @keyframes senedoc-pulse-draw {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        .senedoc-pulse-line {
          stroke-dasharray: 300;
          animation: senedoc-pulse-draw 1.8s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .senedoc-pulse-line { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <svg width="140" height="40" viewBox="0 0 140 40" fill="none" aria-hidden="true">
        <path
          className="senedoc-pulse-line"
          d="M0,20 L35,20 L44,4 L53,36 L62,10 L71,20 L140,20"
          stroke="#5EEAD4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
