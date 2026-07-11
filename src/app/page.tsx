"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Faq } from "@/components/Faq";

export default function Home() {
  const router = useRouter();
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    router.push(`/recherche${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <Header />

      {/* HÉRO */}
      <section className="bg-teal-light">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-teal-dark mb-3">
              PRENEZ RENDEZ-VOUS AU SÉNÉGAL
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-teal-deep leading-tight mb-4">
              Trouvez votre médecin, réservez en un instant
            </h1>
            <p className="text-lg text-teal-dark mb-8">
              Des spécialistes près de chez vous, partout au Sénégal.
            </p>

            {/* Recherche */}
            <form id="recherche" onSubmit={submitSearch} className="bg-white p-2 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
                <SearchIcon />
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="flex-1 outline-none text-[15px] placeholder-gray-400"
                  placeholder="Spécialité (cardiologue…)"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-3 flex-1">
                  <PinIcon />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 outline-none text-[15px] placeholder-gray-400"
                    placeholder="Ville"
                  />
                </div>
                <button type="submit" className="bg-coral text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Rechercher
                </button>
              </div>
            </form>
          </div>

          {/* Photo héro */}
          <div className="h-64 md:h-96 rounded-xl overflow-hidden">
            <img src="/images/hero.jpg" alt="Médecin souriante" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold mb-10">Comment ça marche</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Step icon={<SearchIcon big />} bg="bg-teal-light" title="1. Cherchez" text="Par spécialité, trouvez le bon médecin" />
          <Step icon={<PinIcon big coral />} bg="bg-coral-light" title="2. Choisissez" text="Voyez la distance jusqu'au cabinet" />
          <Step icon={<CalendarIcon />} bg="bg-teal-light" title="3. Réservez" text="Confirmation par SMS, c'est fait" />
        </div>
      </section>

      {/* MÉDECINS VÉRIFIÉS */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="h-72 md:h-80 rounded-xl overflow-hidden order-2 md:order-1 bg-gray-100">
            <img src="/images/consultation.jpg" alt="Consultation médicale" className="w-full h-full object-contain" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-display text-2xl font-semibold mb-3">Des médecins vérifiés, près de vous</h2>
            <p className="text-gray-600 mb-5 leading-relaxed">
              Chaque médecin est validé avant d'apparaître. Vous voyez sa spécialité,
              ses lieux de consultation et la distance depuis votre position.
            </p>
            <ul className="space-y-3">
              <Check text="Inscription à l'Ordre vérifiée" />
              <Check text="Plusieurs lieux d'exercice possibles" />
              <Check text="Distance calculée depuis chez vous" />
            </ul>
          </div>
        </div>
      </section>

      {/* SPÉCIALITÉS */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold mb-2">Spécialités populaires</h2>
        <p className="text-gray-500 mb-8">Prenez rendez-vous dans la spécialité qu'il vous faut</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Cardiologie", "Pédiatrie", "Ophtalmologie", "Dentaire"].map((s) => (
            <button
              key={s}
              onClick={() => router.push(`/recherche?specialty=${encodeURIComponent(s)}`)}
              className="p-5 border border-gray-100 rounded-xl hover:border-teal hover:shadow-sm transition-all cursor-pointer text-left"
            >
              <p className="text-sm font-medium">{s}</p>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ / BESOIN D'AIDE */}
      <Faq />

      {/* BLOC MÉDECIN */}
      <section className="bg-teal-deep">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white mb-3">Vous êtes médecin ?</h2>
            <p className="text-teal-mid mb-6 leading-relaxed">
              Rejoignez senedoc, gérez vos disponibilités et recevez vos rendez-vous.
              Inscription simple avec votre numéro à l'Ordre.
            </p>
            <Link href="/inscription/medecin" className="inline-block bg-coral text-white px-7 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Inscrire mon cabinet
            </Link>
          </div>
          <div className="h-56 rounded-xl overflow-hidden">
            <img src="/images/medecin.jpg" alt="Médecin" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Step({ icon, bg, title, text }: { icon: React.ReactNode; bg: string; title: string; text: string }) {
  return (
    <div>
      <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center mx-auto mb-4`}>{icon}</div>
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

function Check({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#1D9E75"/><path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {text}
    </li>
  );
}

function SearchIcon({ big }: { big?: boolean }) {
  const s = big ? 24 : 18;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={big ? "#1D9E75" : "#9CA3AF"} strokeWidth="2"/><path d="M21 21l-4-4" stroke={big ? "#1D9E75" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round"/></svg>;
}
function PinIcon({ big, coral }: { big?: boolean; coral?: boolean }) {
  const s = big ? 24 : 18;
  const c = coral ? "#D85A30" : big ? "#1D9E75" : "#9CA3AF";
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" stroke={c} strokeWidth="2"/><circle cx="12" cy="10" r="2.5" stroke={c} strokeWidth="2"/></svg>;
}
function CalendarIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#1D9E75" strokeWidth="2"/><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function PhotoIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/><path d="M21 16l-5-5-8 8" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
