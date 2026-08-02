"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal } from "@/lib/api";

type Dashboard = {
  doctor: { firstName: string | null; lastName: string | null; specialty: string };
  todayAppointments: number;
  upcomingAppointments: number;
  profileViews: number;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  isVisibleToPatients: boolean;
  missingForBooking: string[];
};

const MISSING_LABELS: Record<string, string> = {
  TARIF: "votre tarif de consultation",
  DISPONIBILITES: "au moins un créneau de disponibilité",
};

export default function EspaceMedecin() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorPortal
      .getDashboard()
      .then((d) => setDashboard(d as Dashboard))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DoctorLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">
        Bonjour{dashboard?.doctor.firstName ? `, Dr ${dashboard.doctor.firstName}` : ""}
      </h1>

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <>
          {dashboard && dashboard.validationStatus === "PENDING" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                Votre compte est en attente de validation par un administrateur.
                Vous ne serez visible aux patients qu'une fois validé.
              </p>
            </div>
          )}

          {dashboard &&
            dashboard.validationStatus === "VALIDATED" &&
            !dashboard.isVisibleToPatients && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Votre profil est validé mais pas encore visible aux patients
                </p>
                <p className="text-sm text-amber-700">
                  Il manque{" "}
                  {dashboard.missingForBooking
                    .map((code) => MISSING_LABELS[code] ?? code)
                    .join(" et ")}
                  . Complétez ces informations pour apparaître dans les recherches.
                </p>
                <div className="flex gap-3 mt-3">
                  {dashboard.missingForBooking.includes("TARIF") && (
                    <Link href="/espace-medecin/profil" className="text-sm text-amber-800 font-medium underline">
                      Renseigner mon tarif
                    </Link>
                  )}
                  {dashboard.missingForBooking.includes("DISPONIBILITES") && (
                    <Link href="/espace-medecin/disponibilites" className="text-sm text-amber-800 font-medium underline">
                      Ajouter mes disponibilités
                    </Link>
                  )}
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Rendez-vous aujourd'hui" value={dashboard?.todayAppointments ?? 0} />
            <StatCard label="Rendez-vous à venir" value={dashboard?.upcomingAppointments ?? 0} />
            <StatCard label="Vues de mon profil" value={dashboard?.profileViews ?? 0} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/espace-medecin/rendez-vous" className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal hover:shadow-sm transition-all">
              <p className="font-medium mb-1">Mes rendez-vous</p>
              <p className="text-sm text-gray-500">Confirmer, annuler ou consulter vos rendez-vous</p>
            </Link>
            <Link href="/espace-medecin/disponibilites" className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal hover:shadow-sm transition-all">
              <p className="font-medium mb-1">Mes disponibilités</p>
              <p className="text-sm text-gray-500">Gérer vos créneaux hebdomadaires et indisponibilités</p>
            </Link>
          </div>
        </>
      )}
    </DoctorLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-3xl font-display font-semibold text-teal-dark">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
