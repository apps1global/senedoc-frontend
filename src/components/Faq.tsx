"use client";

import { useState } from "react";
import { StethoscopeMark } from "@/components/StethoscopeMark";

const QUESTIONS = [
  {
    q: "Comment prendre rendez-vous sur senedoc ?",
    a: "Cherchez un médecin par spécialité et par région, choisissez un créneau qui vous convient, et confirmez. Vous recevez la confirmation par SMS. C'est tout.",
  },
  {
    q: "Est-ce que c'est gratuit ?",
    a: "Oui, la prise de rendez-vous sur senedoc est gratuite pour les patients. Vous ne payez que la consultation, directement auprès du médecin.",
  },
  {
    q: "Comment se passe la confirmation du rendez-vous ?",
    a: "Dès que votre rendez-vous est réservé, vous recevez un SMS de confirmation avec la date, l'heure et l'adresse du cabinet. Un rappel peut aussi vous être envoyé avant la consultation.",
  },
  {
    q: "Que faire si je dois annuler ?",
    a: "Vous pouvez annuler ou modifier votre rendez-vous depuis votre espace patient. Prévenez le plus tôt possible pour laisser le créneau à quelqu'un d'autre.",
  },
  {
    q: "Comment un médecin s'inscrit-il ?",
    a: "Un médecin s'inscrit lui-même depuis l'espace médecin, avec son numéro à l'Ordre. Son inscription est ensuite vérifiée avant qu'il apparaisse aux patients — une garantie de confiance.",
  },
  {
    q: "Mes informations sont-elles protégées ?",
    a: "Oui. senedoc ne partage pas vos données. Votre position, si vous la partagez pour calculer une distance, reste sur votre appareil et n'est jamais enregistrée.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-6xl mx-auto px-6 my-10">
    <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-lg">
      <div className="bg-white p-12 py-16 order-2 md:order-1">
      <div className="divide-y divide-gray-100">
        {QUESTIONS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between text-left py-5 gap-4"
              aria-expanded={open === i}
            >
              <span className={`font-medium ${open === i ? "text-coral" : "text-teal-deep"}`}>{item.q}</span>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                className="shrink-0 transition-transform"
                style={{ transform: open === i ? "rotate(180deg)" : "none" }}
              >
                <path d="M6 9l6 6 6-6" stroke={open === i ? "#D85A30" : "#1D9E75"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open === i && (
              <p className="text-gray-600 leading-relaxed pb-5 -mt-1 border-l-2 border-coral-soft pl-4">{item.a}</p>
            )}
          </div>
        ))}
      </div>
      </div>
      <div
        className="relative overflow-hidden flex flex-col justify-center p-12 py-16 order-1 md:order-2"
        style={{ background: "linear-gradient(160deg, #04342C 0%, #0F6E56 100%)" }}
      >
        <div className="absolute -right-10 -bottom-10 opacity-[0.08] pointer-events-none hidden md:block">
          <StethoscopeMark size={200} />
        </div>
        <h2 className="relative font-display text-3xl font-semibold text-white leading-tight">
          Besoin d'aide ?
        </h2>
        <p className="relative text-white/70 mt-3 max-w-xs">
          Les questions les plus fréquentes sur senedoc.
        </p>
      </div>
    </div>
    </section>
  );
}
