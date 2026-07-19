"use client";

import { SPECIALTIES } from "@/lib/specialties";

// Liste déroulante fermée des spécialités, pour la recherche publique.
// Contrairement au formulaire d'inscription, pas d'option "Autre" ici :
// le patient doit choisir une spécialité réelle pour que la recherche
// villes/médecins ait un sens.
const SEARCH_SPECIALTIES = SPECIALTIES.filter((s) => s !== "Autre");

export function SpecialtySelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">Choisir une spécialité</option>
      {SEARCH_SPECIALTIES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
