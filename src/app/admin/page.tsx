"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.loginAdmin({ email, password });
      router.push("/admin/tableau-de-bord"); // à construire ensuite
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
          <h1 className="font-display text-2xl font-semibold mb-1">Espace administrateur</h1>
          <p className="text-sm text-gray-500 mb-6">Connexion réservée aux administrateurs.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" autoComplete="username" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input type="password" name="password" autoComplete="current-password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-coral">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
              {loading ? "Un instant…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
