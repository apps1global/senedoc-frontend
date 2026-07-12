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
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="border-b border-gray-100 relative">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)}><Logo /></Link>

        {/* Nav desktop */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal">Trouver un médecin</Link>
          <Link href="/blog" className="hover:text-teal">Blog</Link>
          {!checking && !loggedIn && (
            <Link href="/inscription/medecin" className="hover:text-teal">Espace médecin</Link>
          )}
          {!checking && loggedIn && (
            <Link href="/espace-patient" className="hover:text-teal">Mon espace</Link>
          )}
          {checking ? null : loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors whitespace-nowrap"
            >
              Se déconnecter
            </button>
          ) : (
            <Link
              href="/connexion"
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors whitespace-nowrap"
            >
              Se connecter
            </Link>
          )}
        </nav>

        {/* Bouton hamburger mobile */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden p-2 -mr-2 text-gray-600"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm text-gray-600 absolute top-16 left-0 right-0 z-20 shadow-sm">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-teal">Trouver un médecin</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="hover:text-teal">Blog</Link>
          {!checking && !loggedIn && (
            <Link href="/inscription/medecin" onClick={() => setMenuOpen(false)} className="hover:text-teal">Espace médecin</Link>
          )}
          {!checking && loggedIn && (
            <Link href="/espace-patient" onClick={() => setMenuOpen(false)} className="hover:text-teal">Mon espace</Link>
          )}
          {checking ? null : loggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors text-center"
            >
              Se déconnecter
            </button>
          ) : (
            <Link
              href="/connexion"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors text-center"
            >
              Se connecter
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
