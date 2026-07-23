"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/api";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

export default function TeleconsultationRoom() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [callEnded, setCallEnded] = useState(false);
  const [returnHref, setReturnHref] = useState("/");
  const [loadingApi, setLoadingApi] = useState(true);

  // Détermine où renvoyer la personne une fois l'appel terminé, selon son rôle —
  // même logique que le routage de "Mon espace" dans le Header.
  useEffect(() => {
    auth
      .me()
      .then((me: any) => {
        if (me?.role === "DOCTOR") setReturnHref("/espace-medecin/rendez-vous");
        else if (me?.role === "ADMIN" || me?.role === "SUPERADMIN") setReturnHref("/admin/tableau-de-bord");
        else setReturnHref("/espace-patient");
      })
      .catch(() => setReturnHref("/"));
  }, []);

  useEffect(() => {
    if (!appointmentId || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://meet.senedoc.net/external_api.js";
    script.async = true;
    script.onload = () => {
      if (!window.JitsiMeetExternalAPI || !containerRef.current) return;

      const api = new window.JitsiMeetExternalAPI("meet.senedoc.net", {
        roomName: `senedoc-${appointmentId}`,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: "#0EA5A4",
        },
      });
      apiRef.current = api;
      setLoadingApi(false);

      // Reprend la main dès que l'appel se termine, avant que Jitsi
      // n'affiche sa propre page de sortie (promotionnelle, hors de notre contrôle).
      api.addEventListener("readyToClose", () => setCallEnded(true));
      api.addEventListener("videoConferenceLeft", () => setCallEnded(true));
    };
    document.body.appendChild(script);

    return () => {
      apiRef.current?.dispose?.();
      document.body.removeChild(script);
    };
  }, [appointmentId]);

  if (callEnded) {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Consultation terminée</h1>
            <p className="text-gray-600 leading-relaxed">
              Merci d'avoir utilisé la téléconsultation SeneDoc.
            </p>
            <Link
              href={returnHref}
              className="inline-block mt-6 bg-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors"
            >
              Retour à mon espace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="p-3 bg-white flex items-center justify-between border-b border-gray-100">
        <Logo />
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Quitter
        </button>
      </div>
      {loadingApi && (
        <div className="flex-1 flex items-center justify-center text-white">
          Chargement de la consultation…
        </div>
      )}
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
