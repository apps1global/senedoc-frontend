import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo size={18} />
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            La prise de rendez-vous médicale au Sénégal.
          </p>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">Patients</p>
          <Link href="/#recherche" className="block hover:text-teal transition-colors">Trouver un praticien</Link>
          <Link href="/espace-patient" className="block hover:text-teal transition-colors">Mes rendez-vous</Link>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">Professionnels de santé</p>
          <Link href="/inscription/medecin" className="block hover:text-teal transition-colors">Inscription</Link>
          <Link href="/inscription/medecin" className="block hover:text-teal transition-colors">Espace professionnel</Link>
        </div>
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">Légal</p>
          <Link href="/confidentialite" className="block hover:text-teal transition-colors">Politique de confidentialité</Link>
          <Link href="/cgu" className="block hover:text-teal transition-colors">Conditions d'utilisation</Link>
          <Link href="/suppression-compte" className="block hover:text-teal transition-colors">Supprimer mon compte</Link>
          <a href="mailto:doctafrik@gmail.com" className="block hover:text-teal transition-colors">Nous contacter</a>
        </div>
      </div>
    </footer>
  );
}
