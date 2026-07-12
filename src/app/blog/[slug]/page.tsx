"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articles } from "@/lib/api";

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

function authorLabel(author: Article["author"]): string {
  const name = `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim();
  if (author.role === "DOCTOR") {
    const specialty = author.doctorProfile?.specialty.name;
    return `Dr ${name}${specialty ? ` — ${specialty}` : ""}`;
  }
  return `${name || "senedoc"} — Équipe senedoc`;
}

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    articles
      .getBySlug(slug)
      .then((data) => setArticle(data as Article))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

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
      </div>
      <Footer />
    </>
  );
}
