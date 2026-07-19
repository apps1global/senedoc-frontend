"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doctors } from "@/lib/api";

type Facility = { name: string; city: string | null };

type DoctorResult = {
  id: string;
  user: { firstName: string | null; lastName: string | null };
  specialty: { name: string };
  facilityMemberships: { facility: Facility }[];
};

export function DoctorNameSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      doctors
        .searchByName(query.trim())
        .then((list) => setResults(list as DoctorResult[]))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function nameFor(d: DoctorResult): string {
    const prefix = d.specialty.name === "Sage-femme" ? "" : "Dr ";
    return `${prefix}${d.user.firstName ?? ""} ${d.user.lastName ?? ""}`.trim();
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher par nom (médecin, sage-femme, établissement)…"
        autoComplete="off"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-teal text-[15px]"
      />

      {open && query.trim().length >= 3 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-3 text-sm text-gray-400">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour "{query}".</p>
          ) : (
            results.map((d) => {
              const facility = d.facilityMemberships[0]?.facility;
              return (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/medecin/${d.id}`);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-teal-light transition-colors border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium">{nameFor(d)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {d.specialty.name}
                    {facility ? ` — ${facility.name}${facility.city ? `, ${facility.city}` : ""}` : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
