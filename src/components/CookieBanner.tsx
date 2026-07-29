"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "senedoc_cookie_consent";

type Consent = { necessary: true; analytics: boolean };

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  function save(consent: Consent) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
    // Point d'extension : si des cookies analytiques sont ajoutés un jour
    // (ex. Google Analytics), c'est ici qu'on les chargerait, uniquement
    // si consent.analytics === true.
  }

  function acceptAll() {
    save({ necessary: true, analytics: true });
  }

  function rejectAll() {
    save({ necessary: true, analytics: false });
  }

  function saveCustom() {
    save({ necessary: true, analytics });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-5xl mx-auto px-6 py-5">
        {!customizing ? (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-gray-600 flex-1">
              Nous utilisons des cookies nécessaires au bon fonctionnement de SeneDoc (connexion, sécurité).
              Avec votre accord, nous pourrions aussi utiliser des cookies de mesure d&apos;audience.{" "}
              <Link href="/confidentialite" className="text-teal font-medium underline">
                En savoir plus
              </Link>
              .
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setCustomizing(true)}
                className="text-sm px-4 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-200 hover:border-teal transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={rejectAll}
                className="text-sm px-4 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-200 hover:border-teal transition-colors"
              >
                Tout refuser
              </button>
              <button
                onClick={acceptAll}
                className="text-sm px-4 py-2.5 rounded-lg font-medium bg-teal text-white hover:bg-teal-dark transition-colors"
              >
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-800">Personnaliser les cookies</p>

            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Cookies nécessaires</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Indispensables au fonctionnement (connexion, sécurité). Toujours actifs.
                </p>
              </div>
              <div className="w-11 h-6 rounded-full bg-teal flex items-center px-0.5 shrink-0 ml-4">
                <div className="w-5 h-5 rounded-full bg-white ml-auto" />
              </div>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-sm font-medium text-gray-800">Cookies de mesure d&apos;audience</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nous aident à comprendre l&apos;usage du site pour l&apos;améliorer. Facultatifs.
                </p>
              </div>
              <button
                onClick={() => setAnalytics((v) => !v)}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 ml-4 transition-colors ${
                  analytics ? "bg-teal" : "bg-gray-200"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${analytics ? "ml-auto" : ""}`} />
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCustomizing(false)}
                className="text-sm px-4 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-200 hover:border-teal transition-colors"
              >
                Retour
              </button>
              <button
                onClick={saveCustom}
                className="text-sm px-4 py-2.5 rounded-lg font-medium bg-teal text-white hover:bg-teal-dark transition-colors"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
