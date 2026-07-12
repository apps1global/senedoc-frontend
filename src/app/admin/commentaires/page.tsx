"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { comments } from "@/lib/api";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { firstName: string | null; lastName: string | null; role: string };
  article: { title: string; slug: string };
};

export default function ModerationCommentaires() {
  const [list, setList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const data = await comments.getPending();
      setList(data as Comment[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setBusy(id);
    setError("");
    try {
      await comments.approve(id);
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
      await comments.reject(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-2">Modération des commentaires</h1>
      <p className="text-sm text-gray-500 mb-6">Commentaires en attente de validation avant publication.</p>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun commentaire en attente.</p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const name = `${c.author.firstName ?? ""} ${c.author.lastName ?? ""}`.trim();
            const label = c.author.role === "DOCTOR" ? `Dr ${name}` : name;
            return (
              <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-400 mb-2">
                  sur{" "}
                  <Link href={`/blog/${c.article.slug}`} target="_blank" className="text-teal font-medium">
                    {c.article.title}
                  </Link>
                  {" · "}
                  {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{c.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(c.id)}
                    disabled={busy === c.id}
                    className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
                  >
                    {busy === c.id ? "…" : "Approuver"}
                  </button>
                  <button
                    onClick={() => reject(c.id)}
                    disabled={busy === c.id}
                    className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
