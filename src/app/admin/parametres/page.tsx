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
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
            />
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
