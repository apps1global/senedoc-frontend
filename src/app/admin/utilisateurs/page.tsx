"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { superadmin } from "@/lib/api";

type UserRow = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN" | "SUPERADMIN";
  isActive: boolean;
  createdAt: string;
};

const ROLES: UserRow["role"][] = ["PATIENT", "DOCTOR", "ADMIN", "SUPERADMIN"];

export default function Utilisateurs() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    try {
      const data = await superadmin.getUsers();
      setUsers(data as UserRow[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(u: UserRow) {
    setUpdating(u.id);
    setError("");
    try {
      if (u.isActive) await superadmin.deactivateUser(u.id);
      else await superadmin.activateUser(u.id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function changeRole(u: UserRow, newRole: string) {
    if (newRole === u.role) return;
    if (
      (newRole === "ADMIN" || newRole === "SUPERADMIN") &&
      !u.email
    ) {
      setError(
        `Impossible : ${u.firstName ?? "cet utilisateur"} n'a pas d'email/mot de passe — un compte admin sans identifiants de connexion serait inutilisable.`,
      );
      return;
    }
    setUpdating(u.id);
    setError("");
    try {
      await superadmin.updateUserRole(u.id, newRole);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Utilisateurs</h1>
      <p className="text-sm text-gray-500 mb-6">
        Il n'existe pas encore de suppression de compte administrateur — seuls la désactivation
        et le changement de rôle sont possibles.
      </p>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value)}
                      disabled={updating === u.id}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-teal disabled:opacity-50"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? "text-teal-dark bg-teal-light" : "text-gray-400 bg-gray-100"}`}>
                      {u.isActive ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={updating === u.id}
                      className="text-sm text-teal font-medium disabled:opacity-50"
                    >
                      {u.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
