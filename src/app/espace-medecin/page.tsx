"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DoctorLayout } from "@/components/DoctorLayout";
import { doctorPortal } from "@/lib/api";

type Dashboard = {
  doctor: { firstName: string | null; lastName: string | null; specialty: string };
  todayAppointments: number;
  upcomingAppointments: number;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard label="Rendez-vous aujourd'hui" value={dashboard?.todayAppointments ?? 0} />
            <StatCard label="Rendez-vous à venir" value={dashboard?.upcomingAppointments ?? 0} />
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
