"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";

function Content() {
  const params = useSearchParams();
  const doctorName = params.get("doctor") || "";
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  const type = params.get("type") || "PRESENTIEL";

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#E1F5EE] px-8 pt-8 pb-7 text-center">
            <Link href="/" className="inline-block mb-4">
              <Logo size={26} />
            </Link>
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-semibold text-teal-dark">Demande envoyée</h1>
            <p className="text-sm text-teal mt-1">
              {type === "TELECONSULTATION"
                ? "Le lien de téléconsultation vous sera envoyé par SMS à la confirmation."
                : "Vous recevrez une confirmation par SMS."}
            </p>
          </div>

          <div className="p-8">
            {(doctorName || date || time) && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1">
                {doctorName && <p className="text-sm font-medium text-gray-800">{doctorName}</p>}
                {(date || time) && (
                  <p className="text-sm text-gray-500">
                    {date}
                    {date && time ? " à " : ""}
                    {time}
                  </p>
                )}
              </div>
            )}

            <Link
              href="/espace-patient"
              className="block w-full bg-teal text-white text-center py-3 rounded-lg font-medium hover:bg-teal-dark transition-colors"
            >
              Retour à mon espace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RendezVousEnvoye() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>}>
      <Content />
    </Suspense>
  );
}
