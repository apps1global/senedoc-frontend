"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { auth } from "@/lib/api";

export default function Parametres() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function EyeToggle({ shown, onClick }: { shown: boolean; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {shown ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.86 21.86 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.86 21.86 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await auth.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Paramètres</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-md">
        <h2 className="font-medium mb-4">Changer mon mot de passe</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-teal"
            />
            <EyeToggle shown={showCurrent} onClick={() => setShowCurrent((v) => !v)} />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-teal"
            />
            <EyeToggle shown={showNew} onClick={() => setShowNew((v) => !v)} />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-600 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-teal"
            />
            <EyeToggle shown={showConfirm} onClick={() => setShowConfirm((v) => !v)} />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}
          {success && <p className="text-sm text-teal-dark">Mot de passe modifié avec succès.</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-teal text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-teal-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Modification…" : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
