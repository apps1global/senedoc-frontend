"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { doctorPortal, auth } from "@/lib/api";

type DoctorInfo = {
  id: string;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
};

const NAV = [
  { href: "/espace-medecin", label: "Tableau de bord" },
  { href: "/espace-medecin/rendez-vous", label: "Rendez-vous" },
  { href: "/espace-medecin/disponibilites", label: "Disponibilités" },
  { href: "/espace-medecin/profil", label: "Profil" },
];

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  useEffect(() => {
    doctorPortal
      .getMe()
      .then((d) => setDoctor(d as DoctorInfo))
      .catch(() => router.push("/espace-medecin/connexion"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // on nettoie côté client même en cas d'erreur réseau
    }
    window.localStorage.removeItem("senedoc_medecin_phone");
    router.push("/");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>;
  }

  if (!doctor) return null; // redirection déjà lancée

  if (doctor.validationStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">En attente de validation</h1>
            <p className="text-gray-600 leading-relaxed">
              Votre inscription est en cours de vérification par un administrateur.
              Vous serez visible aux patients et pourrez accéder à votre espace complet
              une fois validé.
            </p>
            <button onClick={handleLogout} className="inline-block mt-6 text-teal font-medium">Se déconnecter</button>
          </div>
        </div>
      </div>
    );
  }

  if (doctor.validationStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Inscription non validée</h1>
            <p className="text-gray-600 leading-relaxed">
              Votre demande n'a pas été validée. Contactez l'équipe senedoc pour plus d'informations.
            </p>
            <button onClick={handleLogout} className="inline-block mt-6 text-teal font-medium">Se déconnecter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/espace-medecin"><Logo /></Link>
          <p className="text-sm text-gray-500 hidden sm:block">
            Dr {doctor.user.firstName} {doctor.user.lastName} — {doctor.specialty.name}
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
      <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
