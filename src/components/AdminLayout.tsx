"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { auth } from "@/lib/api";

type Me = { sub: string; email: string; role: string };

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    auth
      .me()
      .then((res: any) => {
        if (res.role !== "ADMIN" && res.role !== "SUPERADMIN") {
          router.push("/admin");
          return;
        }
        setMe(res);
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // on nettoie même en cas d'erreur réseau
    }
    router.push("/");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>;
  }
  if (!me) return null; // redirection déjà lancée

  const isSuperAdmin = me.role === "SUPERADMIN";

  const nav = [
    { href: "/admin/tableau-de-bord", label: "Tableau de bord" },
    { href: "/admin/medecins", label: "Médecins" },
    { href: "/admin/articles", label: "Blog" },
    { href: "/admin/articles/relecture", label: "Relecture" },
    ...(isSuperAdmin ? [{ href: "/admin/utilisateurs", label: "Utilisateurs" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-deep">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin/tableau-de-bord"><Logo /></Link>
          <p className="text-sm text-teal-mid hidden sm:block">
            {me.email} — {isSuperAdmin ? "Superadmin" : "Admin"}
          </p>
          <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white transition-colors">
            Se déconnecter
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 flex gap-6 text-sm overflow-x-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "border-coral text-white font-medium"
                  : "border-transparent text-teal-mid hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
