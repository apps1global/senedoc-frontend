"use client";

import { useEffect, useState } from "react";
import { PatientLayout } from "@/components/PatientLayout";
import { relatives, type Relative } from "@/lib/api";

const CHAMPS_VIDES = {
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  relationship: "",
};

export default function MesProches() {
  const [list, setList] = useState<Relative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(CHAMPS_VIDES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setList(await relatives.getMine());
    } catch (e: any) {
      setError(e?.message || "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSaving(true);
    setError("");
    const body = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      relationship: form.relationship.trim() || undefined,
    };
    try {
      if (editingId) await relatives.update(editingId, body);
      else await relatives.create(body);
      setForm(CHAMPS_VIDES);
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Retirer ce proche de votre carnet ? Ses rendez-vous passés sont conservés.")) return;
    try {
      await relatives.remove(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Suppression impossible.");
    }
  }

  function edit(r: Relative) {
    setEditingId(r.id);
    setForm({
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone ?? "",
      dateOfBirth: r.dateOfBirth ? r.dateOfBirth.slice(0, 10) : "",
      relationship: r.relationship ?? "",
    });
  }

  const champ = "w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm";

  return (
    <PatientLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Mes proches</h1>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Enregistrez les personnes pour qui vous réservez — un enfant, un parent,
        un conjoint. Elles n&apos;ont pas besoin de compte SeneDoc. Si vous
        indiquez leur téléphone, elles reçoivent aussi les confirmations par SMS.
      </p>

      {error && <p className="text-coral text-sm mb-4">{error}</p>}

      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
        <p className="text-sm font-medium mb-4">
          {editingId ? "Modifier ce proche" : "Ajouter un proche"}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Prénom *</label>
            <input className={champ} value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nom *</label>
            <input className={champ} value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Téléphone</label>
            <input className={champ} placeholder="+221 77 123 45 67" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">
              Nécessaire pour la téléconsultation : le lien de connexion lui est envoyé par SMS.
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Lien de parenté</label>
            <input className={champ} placeholder="mère, fils, épouse…" value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Date de naissance</label>
            <input type="date" className={champ} value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={save} disabled={saving}
            className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-50">
            {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm(CHAMPS_VIDES); }}
              className="text-sm text-gray-500 hover:text-gray-700">
              Annuler
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun proche enregistré pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {r.firstName} {r.lastName}
                  {r.relationship && <span className="text-gray-400 font-normal"> — {r.relationship}</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {r.phone || <span className="text-amber-600">Pas de téléphone — téléconsultation impossible</span>}
                </p>
              </div>
              <div className="flex gap-3 shrink-0 text-sm">
                <button onClick={() => edit(r)} className="text-teal-dark hover:underline">Modifier</button>
                <button onClick={() => remove(r.id)} className="text-coral hover:underline">Retirer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PatientLayout>
  );
}
