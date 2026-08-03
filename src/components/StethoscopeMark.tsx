// Motif signature de la marque : silhouette de stéthoscope, en écho au
// logo (dont le "n" et l'un des "o" sont dessinés comme un stéthoscope).
// Taille modulable pour être réutilisée à différentes échelles.
export function StethoscopeMark({ size = 180 }: { size?: number }) {
  const height = size * (260 / 200);
  return (
    <svg width={size} height={height} viewBox="0 0 200 260" fill="none" aria-hidden="true">
      <rect x="28" y="8" width="16" height="26" rx="8" fill="#F2A488" />
      <rect x="156" y="8" width="16" height="26" rx="8" fill="#F2A488" />
      <path
        d="M36,32 C36,70 55,85 92,118 C100,125 100,135 100,148"
        stroke="#F2A488" strokeWidth="7" fill="none" strokeLinecap="round"
      />
      <path
        d="M164,32 C164,70 145,85 108,118 C100,125 100,135 100,148"
        stroke="#F2A488" strokeWidth="7" fill="none" strokeLinecap="round"
      />
      <path d="M100,148 L100,178" stroke="#F2A488" strokeWidth="7" strokeLinecap="round" />
      <circle cx="100" cy="216" r="34" fill="none" stroke="#F2A488" strokeWidth="7" />
      <circle cx="100" cy="216" r="16" fill="#5EEAD4" opacity="0.85" />
    </svg>
  );
}
