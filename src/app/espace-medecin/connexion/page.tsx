"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";

type Mode = "password" | "pin";

const REMEMBERED_PHONE_KEY = "senedoc_phone";

export default function ConnexionMedecin() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [rememberedPhone, setRememberedPhone] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBERED_PHONE_KEY);
    if (saved) {
      setRememberedPhone(saved);
      setPhone(saved);
      setMode("pin");
    }
  }, []);

  function forgetDevice() {
    window.localStorage.removeItem(REMEMBERED_PHONE_KEY);
    setRememberedPhone(null);
    setPhone("");
    setPin("");
    setError("");
    setMode("password");
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.loginAdmin({ email, password });
      router.push("/espace-medecin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.loginPin({ phone, pin });
      window.localStorage.setItem(REMEMBERED_PHONE_KEY, phone);
      router.push("/espace-medecin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-deep flex flex-col">
      <div className="p-6"><Link href="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Espace médecin</h1>
          <p className="text-sm text-gray-500 mb-6">Connectez-vous pour gérer vos rendez-vous.</p>

          {mode === "password" ? (
            <>
              <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mot de passe</label>
                  <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {loading ? "Un instant…" : "Se connecter"}
                </button>
              </form>
              <button onClick={() => { setMode("pin"); setError(""); }} className="text-sm text-teal font-medium mt-4 block mx-auto">
                Se connecter avec mon PIN
              </button>
            </>
          ) : (
            <>
              {rememberedPhone ? (
                <p className="text-sm text-gray-500 mb-4">
                  {rememberedPhone} — <button type="button" onClick={forgetDevice} className="text-teal font-medium">changer</button>
                </p>
              ) : null}
              <form onSubmit={submitPin} className="space-y-4">
                {!rememberedPhone && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 123 45 67" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Code PIN</label>
                  <input
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-teal"
                    placeholder="••••"
                  />
                </div>
                {error && <p className="text-sm text-coral">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
                  {loading ? "Un instant…" : "Se connecter"}
                </button>
              </form>
              <button onClick={() => { setMode("password"); setError(""); }} className="text-sm text-teal font-medium mt-4 block mx-auto">
                Se connecter avec email + mot de passe
              </button>
            </>
          )}

          <p className="text-sm text-gray-500 text-center mt-6">
            Pas encore inscrit ? <Link href="/inscription/medecin" className="text-teal font-medium">Inscrire mon cabinet</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
