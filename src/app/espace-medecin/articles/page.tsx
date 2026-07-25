"use client";

import { useEffect, useState } from "react";
import { DoctorLayout } from "@/components/DoctorLayout";
import { articles, uploadArticleCover } from "@/lib/api";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  rejectionReason: string | null;
  updatedAt: string;
};

const STATUS_LABELS: Record<Article["status"], string> = {
  DRAFT: "Brouillon",
  PENDING_REVIEW: "En attente de relecture",
  PUBLISHED: "Publié",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<Article["status"], string> = {
  DRAFT: "text-gray-500 bg-gray-100",
  PENDING_REVIEW: "text-coral bg-coral-light",
  PUBLISHED: "text-teal-dark bg-teal-light",
  REJECTED: "text-gray-400 bg-gray-100",
};

export default function ArticlesMedecin() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await articles.getMine();
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

  const editingArticle = list.find((a) => a.id === editingId) || null;

  return (
    <DoctorLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-semibold">Mes articles</h1>
        {!creating && !editingId && (
          <button
            onClick={() => setCreating(true)}
            className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors"
          >
            Nouvel article
          </button>
        )}
      </div>
      {error && <p className="text-sm text-coral mb-4">{error}</p>}

      {creating && (
        <ArticleForm
          onCancel={() => setCreating(false)}
          onSaved={async () => { setCreating(false); await load(); }}
        />
      )}

      {editingArticle && (
        <ArticleForm
          article={editingArticle}
          onCancel={() => setEditingId(null)}
          onSaved={async () => { setEditingId(null); await load(); }}
        />
      )}

      {!creating && !editingId && (
        loading ? (
          <p className="text-gray-400">Chargement…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun article pour l'instant.</p>
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <ArticleRow key={a.id} article={a} onEdit={() => setEditingId(a.id)} onChanged={load} />
            ))}
          </div>
        )
      )}
    </DoctorLayout>
  );
}

function ArticleRow({ article, onEdit, onChanged }: { article: Article; onEdit: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await articles.submit(article.id);
      await onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setBusy(true);
    setError("");
    try {
      await articles.remove(article.id);
      await onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium">{article.title}</p>
          <p className="text-xs text-gray-400 mt-1">
            Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[article.status]}`}>
          {STATUS_LABELS[article.status]}
        </span>
      </div>

      {article.status === "REJECTED" && article.rejectionReason && (
        <p className="text-sm text-gray-500 mt-2">Motif du rejet : {article.rejectionReason}</p>
      )}

      {error && <p className="text-sm text-coral mt-2">{error}</p>}

      {(article.status === "DRAFT" || article.status === "REJECTED") && (
        <div className="flex gap-3 mt-4">
          <button onClick={onEdit} disabled={busy} className="text-sm text-teal font-medium disabled:opacity-50">
            Modifier
          </button>
          <button onClick={submit} disabled={busy} className="text-sm bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50">
            {busy ? "…" : "Soumettre à la relecture"}
          </button>
          <button onClick={remove} disabled={busy} className="text-sm text-gray-500 hover:text-coral transition-colors disabled:opacity-50">
            Supprimer
          </button>
        </div>
      )}
      {article.status === "PENDING_REVIEW" && (
        <p className="text-sm text-gray-500 mt-3">En attente de relecture par un administrateur.</p>
      )}
      {article.status === "PUBLISHED" && (
        <button onClick={remove} disabled={busy} className="text-sm text-gray-500 hover:text-coral transition-colors mt-3 disabled:opacity-50">
          Supprimer
        </button>
      )}
    </div>
  );
}

function ArticleForm({
  article,
  onCancel,
  onSaved,
}: {
  article?: Article;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadArticleCover(file);
      setCoverImageUrl(res.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) { setError("Le titre est trop court."); return; }
    if (content.trim().length < 20) { setError("Le contenu est trop court."); return; }
    setSaving(true);
    try {
      const body = { title, excerpt: excerpt || undefined, content, coverImageUrl: coverImageUrl || undefined };
      if (article) await articles.update(article.id, body);
      else await articles.create(body);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="bg-white border border-gray-100 rounded-xl p-6 mb-8 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Résumé (facultatif, affiché dans la liste des articles)</label>
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image de couverture</label>
        {coverImageUrl && (
          <div className="h-40 w-full max-w-sm rounded-lg overflow-hidden mb-2 bg-gray-100">
            <img src={coverImageUrl} alt="Couverture" className="w-full h-full object-cover" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleCover} disabled={uploading} className="text-sm" />
        {uploading && <p className="text-xs text-gray-400 mt-1">Envoi en cours…</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contenu</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm leading-relaxed"
          placeholder="Rédigez votre article ici. Sautez une ligne pour créer un nouveau paragraphe."
        />
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="bg-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60">
          {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500">Annuler</button>
      </div>
    </form>
  );
}
