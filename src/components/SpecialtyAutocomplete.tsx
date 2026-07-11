"use client";

import { useEffect, useRef, useState } from "react";
import { specialties } from "@/lib/api";

// Normalise accents et casse pour un filtrage tolérant
// ("cardio" retrouve "Cardiologie", "pediatre" retrouve "Pédiatrie", etc.)
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SpecialtyAutocomplete({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [all, setAll] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    specialties
      .getAll()
      .then((list) => setAll(list.map((s) => s.name)))
      .catch(() => setAll([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matches =
    value.length >= 1
      ? all.filter((name) => normalize(name).includes(normalize(value)))
      : all;

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(name); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-teal-light transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
