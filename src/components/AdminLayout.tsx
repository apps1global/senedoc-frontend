"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ToastStack } from "./ToastStack";
import { useToasts } from "@/lib/useToasts";
import { getSocket } from "@/lib/socket";
import { auth, adminPortal, articles, comments, adminSupport, adminContact } from "@/lib/api";

type Me = { sub: string; email: string; role: string };

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const { toasts, push } = useToasts();

  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [pendingArticles, setPendingArticles] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [pendingSupport, setPendingSupport] = useState(0);
  const [pendingContact, setPendingContact] = useState(0);

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

  // Compteurs "à traiter" — chargement initial à chaque navigation entre
  // pages admin, puis mise à jour EN TEMPS RÉEL via WebSocket ci-dessous
  // (plus besoin de changer de page pour voir un nouveau badge apparaître).
  useEffect(() => {
    if (!me) return;
    adminPortal.dashboard().then((d: any) => setPendingDoctors(d?.doctors?.pending ?? 0)).catch(() => {});
    articles.getPendingReview().then((list: any) => setPendingArticles(list.length)).catch(() => {});
    comments.getPending().then((list: any) => setPendingComments(list.length)).catch(() => {});
    adminSupport.listTickets("OPEN").then((list: any) => setPendingSupport(list.length)).catch(() => {});
    adminContact.listMessages("OPEN").then((list: any) => setPendingContact(list.length)).catch(() => {});
  }, [me, pathname]);

  // Temps réel : connexion WebSocket authentifiée via le même cookie de
  // session. Les événements incrémentent les badges instantanément et
  // affichent une notification, sans recharger ni changer de page.
  useEffect(() => {
    if (!me) return;
    const socket = getSocket();

    const onDoctorPending = (data: any) => {
      setPendingDoctors((n) => n + 1);
      push(`Nouveau médecin en attente : ${data.name}`);
    };
    const onArticlePending = (data: any) => {
      setPendingArticles((n) => n + 1);
      push(`Nouvel article à relire : « ${data.title} »`);
    };
    const onCommentPending = (data: any) => {
      setPendingComments((n) => n + 1);
      push(`Nouveau commentaire à modérer sur « ${data.articleTitle} »`);
    };
    const onSupportPending = (data: any) => {
      setPendingSupport((n) => n + 1);
      push(`Nouveau message support : « ${data.subject} »`);
    };

    socket.on("doctor:pending", onDoctorPending);
    socket.on("article:pending", onArticlePending);
    socket.on("comment:pending", onCommentPending);
    const onContactPending = (data: any) => {
      setPendingContact((n) => n + 1);
      push(`Nouveau message de contact de ${data.name}`);
    };

    socket.on("support:pending", onSupportPending);
    socket.on("contact:pending", onContactPending);

    return () => {
      socket.off("doctor:pending", onDoctorPending);
      socket.off("article:pending", onArticlePending);
      socket.off("comment:pending", onCommentPending);
      socket.off("support:pending", onSupportPending);
      socket.off("contact:pending", onContactPending);
    };
  }, [me, push]);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // on nettoie même en cas d'erreur réseau
    }
    router.push("/admin");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>;
  }
  if (!me) return null; // redirection déjà lancée

  const isSuperAdmin = me.role === "SUPERADMIN";

  const nav = [
    { href: "/admin/tableau-de-bord", label: "Tableau de bord" },
    { href: "/admin/medecins", label: "Médecins", badge: pendingDoctors },
    { href: "/admin/articles", label: "Blog" },
    { href: "/admin/articles/relecture", label: "Relecture", badge: pendingArticles },
    { href: "/admin/commentaires", label: "Commentaires", badge: pendingComments },
    { href: "/admin/support", label: "Support", badge: pendingSupport },
    { href: "/admin/contact", label: "Contact", badge: pendingContact },
    ...(isSuperAdmin ? [{ href: "/admin/utilisateurs", label: "Utilisateurs" }] : []),
    { href: "/admin/parametres", label: "Paramètres" },
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
              className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                pathname === item.href
                  ? "border-coral text-white font-medium"
                  : "border-transparent text-teal-mid hover:text-white"
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
