"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ToastStack } from "./ToastStack";
import { useToasts } from "@/lib/useToasts";
import { getSocket } from "@/lib/socket";
import { doctorPortal, auth } from "@/lib/api";

type DoctorInfo = {
  id: string;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  subscriptionStatus: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
};

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const { toasts, push } = useToasts();
  const [pendingAppointments, setPendingAppointments] = useState(0);

  useEffect(() => {
    doctorPortal
      .getMe()
      .then((d) => {
        const doc = d as DoctorInfo;
        setDoctor(doc);
        // Espace médecin verrouillé tant que l'abonnement n'est pas actif —
        // sauf sur la page d'abonnement elle-même, sinon impossible d'y payer.
        if (doc.subscriptionStatus !== "ACTIVE" && pathname !== "/espace-medecin/abonnement") {
          router.replace("/espace-medecin/abonnement");
        }
      })
      .catch(() => router.push("/espace-medecin/connexion"))
      .finally(() => setLoading(false));
  }, [router, pathname]);

  // Compteur de RDV en attente — chargement initial à chaque navigation,
  // puis incrémenté en temps réel via WebSocket ci-dessous.
  useEffect(() => {
    if (!doctor || doctor.validationStatus !== "VALIDATED") return;
    doctorPortal
      .getAppointments()
      .then((list: any) => setPendingAppointments(list.filter((a: any) => a.status === "PENDING").length))
      .catch(() => {});
  }, [doctor, pathname]);

  // Temps réel : nouvelles demandes de RDV, et retour de relecture sur les
  // articles soumis (publié / rejeté).
  useEffect(() => {
    if (!doctor || doctor.validationStatus !== "VALIDATED") return;
    const socket = getSocket();

    const onNewAppointment = (data: any) => {
      setPendingAppointments((n) => n + 1);
      push(`Nouvelle demande de rendez-vous de ${data.patientName}`);
    };
    const onArticlePublished = (data: any) => {
      push(`Votre article « ${data.title} » a été publié !`);
    };
    const onArticleRejected = (data: any) => {
      push(`Votre article « ${data.title} » a été rejeté${data.reason ? ` : ${data.reason}` : ""}`);
    };

    socket.on("appointment:new", onNewAppointment);
    socket.on("article:published", onArticlePublished);
    socket.on("article:rejected", onArticleRejected);

    return () => {
      socket.off("appointment:new", onNewAppointment);
      socket.off("article:published", onArticlePublished);
      socket.off("article:rejected", onArticleRejected);
    };
  }, [doctor, push]);

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

  // PENDING n'est plus un blocage total : le médecin accède à son espace
  // complet dès l'inscription (voir isActive: true côté backend), avec une
  // bannière persistante ci-dessous lui rappelant que son compte est en
  // cours de vérification. Seul REJECTED reste un blocage complet.
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

  const NAV = [
    { href: "/espace-medecin", label: "Tableau de bord" },
    { href: "/espace-medecin/rendez-vous", label: "Rendez-vous", badge: pendingAppointments },
    { href: "/espace-medecin/disponibilites", label: "Disponibilités" },
    { href: "/espace-medecin/etablissements", label: "Établissements" },
    { href: "/espace-medecin/articles", label: "Blog" },
    { href: "/espace-medecin/support", label: "Support" },
    { href: "/espace-medecin/profil", label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {doctor.validationStatus === "PENDING" && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-center">
          <p className="text-sm text-amber-800">
            Votre compte est en cours de vérification par un administrateur.
            Vous serez visible aux patients une fois validé — en attendant,
            vous pouvez déjà compléter votre profil et vos disponibilités.
          </p>
        </div>
      )}
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
              className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                pathname === item.href
                  ? "border-teal text-teal-dark font-medium"
                  : "border-transparent text-gray-500 hover:text-teal-dark"
              }`}
            >
              {item.label}
              {!!item.badge && (
                <span className="bg-coral text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
