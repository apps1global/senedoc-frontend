// Régions et villes du Sénégal — listes fermées (sécurité + cohérence).
// Le patient choisit sa région, puis sa ville se filtre en cascade.
// Cette même liste doit être validée CÔTÉ SERVEUR (ne jamais faire
// confiance au frontend). Les 14 régions administratives du Sénégal.

export const SENEGAL: Record<string, string[]> = {
  Dakar: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Bargny', 'Diamniadio'],
  Thiès: ['Thiès', 'Mbour', 'Tivaouane', 'Joal-Fadiouth', 'Kayar', 'Pout'],
  'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor', 'Richard-Toll', 'Rosso'],
  Diourbel: ['Diourbel', 'Touba', 'Mbacké', 'Bambey'],
  Louga: ['Louga', 'Kébémer', 'Linguère', 'Dahra'],
  Fatick: ['Fatick', 'Foundiougne', 'Gossas', 'Sokone', 'Passy'],
  Kaolack: ['Kaolack', 'Guinguinéo', 'Nioro du Rip', 'Kahone'],
  Kaffrine: ['Kaffrine', 'Birkelane', 'Koungheul', 'Malem-Hodar'],
  Tambacounda: ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
  Kédougou: ['Kédougou', 'Salémata', 'Saraya'],
  Kolda: ['Kolda', 'Vélingara', 'Médina Yoro Foulah'],
  Sédhiou: ['Sédhiou', 'Bounkiling', 'Goudomp'],
  Ziguinchor: ['Ziguinchor', 'Bignona', 'Oussouye'],
  Matam: ['Matam', 'Kanel', 'Ranérou', 'Ourossogui'],
};

export const REGIONS = Object.keys(SENEGAL);

export function citiesForRegion(region: string): string[] {
  return SENEGAL[region] ?? [];
}
