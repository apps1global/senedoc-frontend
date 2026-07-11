"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { adminPortal, superadmin, auth } from "@/lib/api";

type ScopedDashboard = {
  scope: "ALL" | "MINE";
  doctors: { total: number; pending: number; validated: number; rejected: number };
  appointments: { total: number };
};

type PlatformDashboard = {
  users: number;
  doctors: number;
  patients: number;
  facilities: number;
  specialties: number;
  appointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
};

export default function TableauDeBord() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [scoped, setScoped] = useState<ScopedDashboard | null>(null);
  const [platform, setPlatform] = useState<PlatformDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me: any = await auth.me();
        const superAdmin = me.role === "SUPERADMIN";
        setIsSuperAdmin(superAdmin);

        const scopedData = await adminPortal.dashboard();
        setScoped(scopedData as ScopedDashboard);

        if (superAdmin) {
          const platformData = await superadmin.dashboard();
          setPlatform(platformData as PlatformDashboard);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold mb-6">Tableau de bord</h1>

      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="font-medium text-lg mb-4">
              {scoped?.scope === "ALL" ? "Tous les médecins" : "Vos médecins parrainés"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total" value={scoped?.doctors.total ?? 0} />
              <StatCard label="En attente" value={scoped?.doctors.pending ?? 0} highlight />
              <StatCard label="Validés" value={scoped?.doctors.validated ?? 0} />
              <StatCard label="Rejetés" value={scoped?.doctors.rejected ?? 0} />
            </div>
            {(scoped?.doctors.pending ?? 0) > 0 && (
              <Link href="/admin/medecins" className="inline-block mt-4 text-sm text-teal font-medium">
                Voir les médecins en attente de validation →
              </Link>
            )}
          </section>

          {isSuperAdmin && platform && (
            <section>
              <h2 className="font-medium text-lg mb-4">Vue plateforme</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Utilisateurs" value={platform.users} />
                <StatCard label="Médecins" value={platform.doctors} />
                <StatCard label="Patients" value={platform.patients} />
                <StatCard label="Cabinets" value={platform.facilities} />
                <StatCard label="Spécialités" value={platform.specialties} />
                <StatCard label="RDV total" value={platform.appointments} />
                <StatCard label="RDV en attente" value={platform.pendingAppointments} highlight />
                <StatCard label="RDV confirmés" value={platform.confirmedAppointments} />
              </div>
              <Link href="/admin/utilisateurs" className="inline-block mt-4 text-sm text-teal font-medium">
                Gérer les utilisateurs →
              </Link>
            </section>
          )}
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white border rounded-xl p-4 ${highlight && value > 0 ? "border-coral" : "border-gray-100"}`}>
      <p className={`text-2xl font-display font-semibold ${highlight && value > 0 ? "text-coral" : "text-teal-dark"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
