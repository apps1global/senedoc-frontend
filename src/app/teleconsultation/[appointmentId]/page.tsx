"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { auth, appointments } from "@/lib/api";

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
  const [accessError, setAccessError] = useState<string | null>(null);

  // Détermine où renvoyer la personne une fois l'appel terminé, selon son rôle.
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

    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    // Le jeton provient soit du fragment d'URL (WebView mobile : l'app native
    // l'a déjà obtenu via son Bearer token), soit de l'API via le cookie de
    // session (navigateur). Le fragment n'est jamais transmis au serveur.
    const fromHash =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.hash.slice(1)).get("jwt")
        : null;

    // Trois provenances possibles du jeton :
    //  1. fragment #jwt= → WebView mobile (l'app native l'a déjà obtenu)
    //  2. ?acces=       → lien SMS d'un proche sans compte
    //  3. cookie        → titulaire connecté sur le web
    const acces =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("acces")
        : null;

    const getJwt: Promise<string> = fromHash
      ? Promise.resolve(fromHash)
      : acces
        ? fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://api.senedoc.net"}/appointments/${appointmentId}/guest-video-token?acces=${encodeURIComponent(acces)}`,
          ).then(async (r) => {
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d?.message || "Lien de consultation invalide.");
            return d.token as string;
          })
        : appointments.getVideoToken(appointmentId).then((r) => r.token);

    getJwt
      .then((jwt) => {
        if (cancelled || !containerRef.current) return;

        script = document.createElement("script");
        script.src = "https://meet.senedoc.net/external_api.js";
        script.async = true;
        script.onload = () => {
          if (cancelled || !window.JitsiMeetExternalAPI || !containerRef.current) return;

          const api = new window.JitsiMeetExternalAPI("meet.senedoc.net", {
            roomName: `senedoc-${appointmentId}`,
            jwt,
            parentNode: containerRef.current,
            width: "100%",
            height: "100%",
            configOverwrite: {
              prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              DEFAULT_BACKGROUND: "#1D9E75",
            },
          });
          apiRef.current = api;
          setLoadingApi(false);

          api.addEventListener("readyToClose", () => setCallEnded(true));
          api.addEventListener("videoConferenceLeft", () => setCallEnded(true));
        };
        document.body.appendChild(script);
      })
      .catch((e: any) => {
        if (!cancelled) {
          setAccessError(e?.message || "Accès à cette consultation refusé.");
          setLoadingApi(false);
        }
      });

    return () => {
      cancelled = true;
      apiRef.current?.dispose?.();
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [appointmentId]);

  if (accessError) {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Consultation indisponible</h1>
            <p className="text-gray-600 leading-relaxed">{accessError}</p>
            <p className="text-gray-500 text-sm mt-3">
              Le salon n&apos;est accessible qu&apos;aux participants du rendez-vous, pendant le créneau réservé.
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

  if (callEnded) {
    return (
      <div className="min-h-screen bg-teal-light flex flex-col">
        <div className="p-6"><Link href="/"><Logo /></Link></div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl font-semibold mb-3">Consultation terminée</h1>
            <p className="text-gray-600 leading-relaxed">
              Merci d&apos;avoir utilisé la téléconsultation SeneDoc.
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
