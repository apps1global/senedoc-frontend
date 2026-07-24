// Boîte englobante du Sénégal (marge incluse).
// Détecte qu'un utilisateur consulte depuis l'étranger : la distance à un
// cabinet de Dakar n'a alors plus de sens. On masque la distance sans rien
// bloquer — il peut réserver en présentiel pour un voyage, ou pour un proche.
const SENEGAL_BOUNDS = {
  latMin: 12.0,
  latMax: 17.0,
  lngMin: -17.8,
  lngMax: -11.2,
};

export function isInSenegal(lat: number, lng: number): boolean {
  return (
    lat >= SENEGAL_BOUNDS.latMin &&
    lat <= SENEGAL_BOUNDS.latMax &&
    lng >= SENEGAL_BOUNDS.lngMin &&
    lng <= SENEGAL_BOUNDS.lngMax
  );
}

export const HORS_SENEGAL_MESSAGE =
  "Vous semblez vous trouver hors du Sénégal — les distances ne sont pas affichées. Vous pouvez réserver une consultation en présentiel ou une téléconsultation.";
