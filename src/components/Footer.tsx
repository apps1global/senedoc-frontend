import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Logo size={18} />
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            La prise de rendez-vous médicale au Sénégal.
          </p>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">Patients</p>
          <Link href="/#recherche" className="block hover:text-teal transition-colors">Trouver un médecin</Link>
          <Link href="/espace-patient" className="block hover:text-teal transition-colors">Mes rendez-vous</Link>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">Médecins</p>
          <Link href="/inscription/medecin" className="block hover:text-teal transition-colors">Inscription</Link>
          <Link href="/inscription/medecin" className="block hover:text-teal transition-colors">Espace médecin</Link>
        </div>
      </div>
    </footer>
  );
}
