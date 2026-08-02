"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { payments } from "@/lib/api";

const PLANS = [
  { id: "MONTHLY" as const, label: "Mensuel", price: "23 €", period: "/ mois", detail: "Sans engagement" },
  { id: "SEMIANNUAL" as const, label: "Semestriel", price: "69 €", period: "/ 6 mois", detail: "Soit 11,50 €/mois" },
  { id: "ANNUAL" as const, label: "Annuel", price: "92 €", period: "/ an", detail: "Soit 7,67 €/mois — la formule la plus avantageuse" },
];

export default function AbonnementMedecin() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function choosePlan(plan: "MONTHLY" | "SEMIANNUAL" | "ANNUAL") {
    setError("");
    setLoadingPlan(plan);
    try {
      const res: any = await payments.createSubscriptionCheckout(plan);
      if (res.url) window.location.href = res.url;
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-teal-light flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#E1F5EE] px-8 pt-7 pb-6 text-center">
            <Logo size={26} />
            <h1 className="font-display text-xl font-semibold text-teal-dark mt-3">Activer votre espace médecin</h1>
            <p className="text-sm text-teal mt-1">
              Choisissez une formule d&apos;abonnement pour accéder à vos disponibilités, vos établissements et vos rendez-vous.
            </p>
          </div>

          <div className="p-8 grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div key={plan.id} className="border border-gray-100 rounded-xl p-5 flex flex-col">
                <p className="text-sm font-medium text-gray-500">{plan.label}</p>
                <p className="font-display text-2xl font-semibold text-teal-dark mt-1">
                  {plan.price} <span className="text-sm font-normal text-gray-400">{plan.period}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2 flex-1">{plan.detail}</p>
                <button
                  onClick={() => choosePlan(plan.id)}
                  disabled={loadingPlan !== null}
                  className="mt-4 w-full bg-teal text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
                >
                  {loadingPlan === plan.id ? "Redirection…" : "Choisir"}
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-coral text-center pb-6">{error}</p>}

          <div className="mx-8 mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">Phase de test — carte fictive</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Numéro de carte : 4242 4242 4242 4242<br />
              Date d&apos;expiration : n&apos;importe quelle date future (ex : 12/34)<br />
              CVC : n&apos;importe quel code à 3 chiffres<br />
              Les autres champs : n&apos;importe quelle valeur
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center pb-8 px-8">
            Paiement sécurisé par Stripe. Vous serez redirigé vers une page de paiement, puis renvoyé automatiquement vers votre espace une fois l&apos;abonnement activé.
          </p>
        </div>
      </div>
    </div>
  );
}
