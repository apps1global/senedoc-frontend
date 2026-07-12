"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articles } from "@/lib/api";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  author: {
    firstName: string | null;
    lastName: string | null;
    role: string;
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

export default function Blog() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articles
      .getPublished()
      .then((data) => setList(data as Article[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-teal-deep mb-2">Le blog senedoc</h1>
        <p className="text-gray-500 mb-10">Conseils santé et actualités, écrits par notre équipe et nos médecins partenaires.</p>

        {loading ? (
          <p className="text-gray-400">Chargement…</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500">Aucun article publié pour l'instant.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.slug}`}
                className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-teal hover:shadow-sm transition-all min-w-0"
              >
                <div className="h-40 bg-gray-100">
                  {a.coverImageUrl && (
                    <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-5">
                  <p className="font-medium mb-1 line-clamp-2">{a.title}</p>
                  {a.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.excerpt}</p>}
                  <p className="text-xs text-teal-dark">{authorLabel(a.author)}</p>
                  {a.publishedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
