"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { articles } from "@/lib/api";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  updatedAt: string;
  author: {
    firstName: string | null;
    lastName: string | null;
    doctorProfile: { specialty: { name: string } } | null;
  };
};

export default function RelectureArticles() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const data = await articles.getPendingReview();
      setList(data as Article[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function publish(id: string) {
    setBusy(id);
    setError("");
    try {
      await articles.publish(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    setBusy(id);
    setError("");
    try {
      await articles.reject(id, rejectReason || undefined);
      setRejectingId(null);
      setRejectReason("");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Relecture des articles</h1>
      <p className="text-sm text-gray-500 mb-6">Articles soumis par des médecins, en attente de validation avant publication.</p>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun article en attente de relecture.</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const authorName = `Dr ${a.author.firstName ?? ""} ${a.author.lastName ?? ""}`.trim();
            const specialty = a.author.doctorProfile?.specialty.name;
            const isExpanded = expandedId === a.id;
            const isRejecting = rejectingId === a.id;

            return (
              <div key={a.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-teal-dark">{authorName}{specialty ? ` — ${specialty}` : ""}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Soumis le {new Date(a.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="text-sm text-teal font-medium"
                  >
                    {isExpanded ? "Réduire" : "Lire l'article"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {a.coverImageUrl && (
                      <div className="h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {a.excerpt && <p className="text-sm text-gray-500 italic mb-3">{a.excerpt}</p>}
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{a.content}</p>
                  </div>
                )}

                {!isRejecting ? (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => publish(a.id)}
                      disabled={busy === a.id}
                      className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
                    >
                      {busy === a.id ? "…" : "Publier"}
                    </button>
                    <button
                      onClick={() => setRejectingId(a.id)}
                      disabled={busy === a.id}
                      className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <label className="block text-xs text-gray-500">Motif du rejet (facultatif, visible par le médecin)</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => reject(a.id)}
                        disabled={busy === a.id}
                        className="text-sm bg-coral text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {busy === a.id ? "…" : "Confirmer le rejet"}
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(""); }}
                        className="text-sm text-gray-500"
                      >
                        Retour
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
