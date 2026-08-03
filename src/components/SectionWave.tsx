// Transition en vague entre deux sections de couleurs différentes,
// pour éviter l'effet "blocs de texte empilés" — reprend l'esprit
// organique du motif du stéthoscope plutôt que des lignes droites sèches.
export function SectionWave({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <div className={flip ? "rotate-180" : ""} style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 80" width="100%" height="60" preserveAspectRatio="none">
        <path
          d="M0,32 C240,70 480,0 720,28 C960,56 1200,10 1440,32 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
