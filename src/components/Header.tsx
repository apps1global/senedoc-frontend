import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal">Trouver un médecin</Link>
          <Link href="/inscription/medecin" className="hover:text-teal">Espace médecin</Link>
          <Link
            href="/connexion"
            className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors"
          >
            Se connecter
          </Link>
        </nav>
      </div>
    </header>
  );
}
