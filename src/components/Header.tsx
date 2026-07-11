"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { auth } from "@/lib/api";

export function Header() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    auth
      .me()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // même en cas d'erreur réseau, on nettoie côté client et on repart
    }
    window.localStorage.removeItem("senedoc_phone");
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <header className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal">Trouver un médecin</Link>
          {!checking && !loggedIn && (
            <Link href="/inscription/medecin" className="hover:text-teal">Espace médecin</Link>
          )}
          {!checking && loggedIn && (
            <Link href="/espace-patient" className="hover:text-teal">Mon espace</Link>
          )}
          {checking ? null : loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors"
            >
              Se déconnecter
            </button>
          ) : (
            <Link
              href="/connexion"
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors"
            >
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
