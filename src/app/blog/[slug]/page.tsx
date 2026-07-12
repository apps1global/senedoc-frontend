"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articles, comments, auth } from "@/lib/api";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  author: {
    firstName: string | null;
    lastName: string | null;
    role: string;
    photoUrl: string | null;
    doctorProfile: { specialty: { name: string } } | null;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { firstName: string | null; lastName: string | null; role: string };
};

function authorLabel(author: Article["author"]): string {
  const name = `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
  if (author.role === "DOCTOR") {
    const specialty = author.doctorProfile?.specialty.name;
    return `Dr ${name}${specialty ? ` — ${specialty}` : ""}`;
  }
  return `${name || "senedoc"} — Équipe senedoc`;
}

function commentAuthorLabel(author: Comment["author"]): string {
  const name = `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
  return author.role === "DOCTOR" ? `Dr ${name}` : name;
}

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [canComment, setCanComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    articles
      .getBySlug(slug)
      .then((data) => setArticle(data as Article))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));

    comments
      .getForArticle(slug)
      .then((data) => setCommentList(data as Comment[]))
      .catch(() => setCommentList([]));

    auth
      .me()
      .then((me: any) => setCanComment(me.role === "PATIENT" || me.role === "DOCTOR"))
      .catch(() => setCanComment(false));
  }, [slug]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setCommentError("");
    if (newComment.trim().length < 2) {
      setCommentError("Le commentaire est trop court.");
      return;
    }
    setPosting(true);
    try {
      await comments.create(slug, newComment.trim());
      setNewComment("");
      setPosted(true);
    } catch (err: any) {
      setCommentError(err.message);
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">Chargement…</div>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
          Article introuvable.{" "}
          <Link href="/blog" className="text-teal font-medium">Retour au blog</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/blog" className="text-sm text-teal font-medium mb-6 inline-block">← Retour au blog</Link>

        {article.coverImageUrl && (
          <div className="h-64 sm:h-80 rounded-xl overflow-hidden mb-8">
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="font-display text-3xl font-semibold text-teal-deep mb-3">{article.title}</h1>
        <div className="flex items-center gap-3 mb-8 text-sm text-gray-500">
          <span className="text-teal-dark font-medium">{authorLabel(article.author)}</span>
          {article.publishedAt && (
            <>
              <span>·</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
            </>
          )}
        </div>

        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>

        {/* COMMENTAIRES */}
        <section className="mt-14 pt-8 border-t border-gray-100">
          <h2 className="font-display text-xl font-semibold mb-6">
            Commentaires {commentList.length > 0 && `(${commentList.length})`}
          </h2>

          {commentList.length === 0 ? (
            <p className="text-sm text-gray-500 mb-6">Aucun commentaire pour l'instant.</p>
          ) : (
            <div className="space-y-4 mb-8">
              {commentList.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-teal-dark">{commentAuthorLabel(c.author)}</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{c.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {canComment ? (
            posted ? (
              <p className="text-sm text-teal-dark">
                Merci, votre commentaire a été envoyé et sera visible après validation par un administrateur.
              </p>
            ) : (
              <form onSubmit={submitComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Laisser un commentaire…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-sm"
                />
                {commentError && <p className="text-sm text-coral">{commentError}</p>}
                <button
                  type="submit"
                  disabled={posting}
                  className="bg-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-60 text-sm"
                >
                  {posting ? "Envoi…" : "Publier le commentaire"}
                </button>
              </form>
            )
          ) : (
            <p className="text-sm text-gray-500">
              <Link href={`/connexion?redirect=/blog/${slug}`} className="text-teal font-medium">Connectez-vous</Link> pour laisser un commentaire.
            </p>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
