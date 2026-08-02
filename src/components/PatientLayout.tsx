"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { auth } from "@/lib/api";

type PatientInfo = {
  id: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
};

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<PatientInfo | null>(null);

  useEffect(() => {
    auth
      .me()
      .then((u: any) => {
        // Un médecin ou un admin arrivé ici est renvoyé vers son propre espace.
        if (u?.role === "DOCTOR") router.push("/espace-medecin");
        else if (u?.role === "ADMIN" || u?.role === "SUPERADMIN") router.push("/admin/tableau-de-bord");
        else setMe(u as PatientInfo);
      })
      .catch(() => router.push("/connexion"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // on nettoie côté client même en cas d'erreur réseau
    }
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Chargement…</p>
      </div>
    );
  }

  if (!me) return null;

  const NAV = [
    { href: "/espace-patient", label: "Mes rendez-vous" },
    { href: "/espace-patient/proches", label: "Mes proches" },
    { href: "/espace-patient/favoris", label: "Mes favoris" },
    { href: "/espace-patient/support", label: "Support" },
    { href: "/espace-patient/profil", label: "Mon profil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/espace-patient"><Logo /></Link>
          <p className="text-sm text-gray-500 hidden sm:block">
            {me.firstName} {me.lastName}
          </p>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-coral transition-colors">
            Se déconnecter
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 flex gap-6 text-sm overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "border-teal text-teal-dark font-medium"
                  : "border-transparent text-gray-500 hover:text-teal-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
