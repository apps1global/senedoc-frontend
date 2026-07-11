"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/api";
import { REGIONS, citiesForRegion } from "@/lib/senegal";
import { SPECIALTIES } from "@/lib/specialties";

export default function InscriptionMedecin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [specialiteAutre, setSpecialiteAutre] = useState("");
  const [numeroOrdre, setNumeroOrdre] = useState("");
  const [region, setRegion] = useState("");
  const [ville, setVille] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");

  const cities = region ? citiesForRegion(region) : [];
  const finalSpecialite = specialite === "Autre" ? specialiteAutre.trim() : specialite;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !phone || !finalSpecialite || !numeroOrdre || !password) {
      setError("Merci de remplir les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/register-doctor", {
        method: "POST",
        auth: false,
        body: {
          firstName, lastName, phone, email, password,
          specialite: finalSpecialite, numeroOrdre,
          pays: "Sénégal", ville,
          referralCode: referralCode || undefined,
        },
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
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
            <Link href="/" className="inline-block mt-6 text-teal font-medium">Retour à l'accueil</Link>
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
              <label className="block text-sm font-medium mb-1">Région</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" value={region} onChange={(e) => { setRegion(e.target.value); setVille(""); }}>
                <option value="">Choisir une région</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal disabled:bg-gray-50" value={ville} onChange={(e) => setVille(e.target.value)} disabled={!region}>
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
