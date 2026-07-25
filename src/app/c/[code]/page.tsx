"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LienCourtProche() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "https://api.senedoc.net";

    fetch(`${base}/appointments/guest/${encodeURIComponent(code)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.message || "Lien de consultation invalide.");
        if (!d.appointmentId || !d.token) throw new Error("Lien de consultation invalide.");
        router.replace(`/teleconsultation/${d.appointmentId}#jwt=${encodeURIComponent(d.token)}`);
      })
      .catch((e: any) => setError(e?.message || "Lien de consultation invalide."));
  }, [code, router]);

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="p-6"><Link href="/"><Logo /></Link></div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
          {error ? (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Consultation indisponible</h1>
              <p className="text-gray-600 leading-relaxed">{error}</p>
              <p className="text-gray-500 text-sm mt-3">
                Le lien n&apos;est valable que pendant le créneau du rendez-vous.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Connexion…</h1>
              <p className="text-gray-600">Ouverture de votre téléconsultation.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
