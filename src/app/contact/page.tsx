"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { contact } from "@/lib/api";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await contact.send({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#E1F5EE] px-8 pt-7 pb-6 text-center">
            <Link href="/" className="inline-block mb-3">
              <Logo size={26} />
            </Link>
            <h1 className="font-display text-xl font-semibold text-teal-dark">Nous contacter</h1>
            <p className="text-sm text-teal mt-1">
              Une question, une suggestion ? Écrivez-nous, nous vous répondrons rapidement.
            </p>
          </div>

          {sent ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-teal-light flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="font-display text-lg font-semibold text-gray-800">Message envoyé</p>
              <p className="text-sm text-gray-500 mt-1">
                Merci, nous avons bien reçu votre message et vous répondrons dès que possible.
              </p>
              <Link href="/" className="inline-block mt-6 text-sm text-teal font-medium">
                ← Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 p-8 pt-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal resize-none"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message..."
                />
              </div>
              {error && <p className="text-sm text-coral">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal text-white py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Envoi…" : "Envoyer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
