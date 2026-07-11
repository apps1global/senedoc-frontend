// Régions et villes du Sénégal — listes fermées (sécurité + cohérence).
// Le patient choisit sa région, puis sa ville se filtre en cascade.
// Cette même liste doit être validée CÔTÉ SERVEUR (ne jamais faire
// confiance au frontend). Les 14 régions administratives du Sénégal.
//
// ⚠️ Liste élargie (~180 localités) mais toujours PAS exhaustive : le
// Sénégal compte officiellement 557 communes. Celle-ci couvre les
// chefs-lieux de région/département/arrondissement et les communes les
// plus connues de chaque zone — largement suffisant pour un usage
// courant, mais une commune rurale très locale peut encore manquer.
// Si un patient ne trouve pas sa ville, prévoir à terme un champ
// "Autre (préciser)" en complément de cette liste.

export const SENEGAL: Record<string, string[]> = {
  Dakar: [
    'Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Keur Massar', 'Bargny',
    'Diamniadio', 'Sébikotane', 'Bambilor', 'Sangalkam', 'Yène',
    'Tivaouane Peulh-Niaga', 'Jaxaay-Parcelles-Niakoul Rap',
  ],
  Thiès: [
    'Thiès', 'Khombole', 'Notto', 'Thiénaba', 'Ngoundiane', 'Fandène',
    'Keur Moussa', 'Mbour', 'Joal-Fadiouth', 'Ngaparou', 'Nguékhokh',
    'Popenguine-Ndayane', 'Saly Portudal', 'Somone', 'Thiadiaye', 'Sindia',
    'Malicounda', 'Diass', 'Fissel', 'Ndiaganiao', 'Nguéniène', 'Sandiara',
    'Tivaouane', 'Mboro', 'Meckhé', 'Pambal', 'Mérina Dakhar', 'Niakhène',
    'Notto Diobass', 'Pékesse', 'Chérif Lô',
  ],
  'Saint-Louis': [
    'Saint-Louis', 'Gandon', 'Rao', 'Dagana', 'Richard-Toll',
    'Rosso-Sénégal', 'Ross Béthio', 'Ndiaye', 'Mbane', 'Podor', 'Ndioum',
    'Golléré', 'Dodel', 'Pété', 'Guédé Village', 'Aéré Lao', 'Fanaye',
    'Cas-Cas', 'Mboumba', 'Démette', 'Mery',
  ],
  Diourbel: [
    'Diourbel', 'Ndoulo', 'Ndindy', 'Touba', 'Mbacké', 'Kaël', 'Taïf',
    'Bambey', 'Baba Garage', 'Lambaye', 'Ngoye', 'Refane', 'Ndame',
  ],
  Louga: [
    'Louga', 'Coki', 'Léona', 'Sakal', 'Kébémer', 'Darou Mousty', 'Ndande',
    'Sagatta Djoloff', 'Linguère', 'Dahra', 'Barkédji', 'Yang-Yang',
    'Thiamène Cayor', 'Gueoul',
  ],
  Fatick: [
    'Fatick', 'Diakhao', 'Diouroup', 'Fimela', 'Niakhar', 'Tattaguine',
    'Foundiougne', 'Sokone', 'Passy', 'Karang Poste', 'Djilor',
    'Gossas', 'Colobane', 'Ouadiour',
  ],
  Kaolack: [
    'Kaolack', 'Kahone', 'Ndiaffate', 'Sibassor', 'Guinguinéo', 'Fass',
    'Mboss', 'Nioro du Rip', 'Médina Sabakh', 'Paoskoto', 'Porokhane',
    'Wack Ngouna', 'Keur Madiabel', 'Latmingué',
  ],
  Kaffrine: [
    'Kaffrine', 'Diamagadio', 'Katakel', 'Nganda', 'Birkelane', 'Mabo',
    'Keur Mboucki', 'Koungheul', 'Ida Mouride', 'Missirah Wadène',
    'Malem-Hodar', 'Sagna',
  ],
  Tambacounda: [
    'Tambacounda', 'Missirah', 'Nétéboulou', 'Dialacoto', 'Bakel',
    'Diawara', 'Kéniéba', 'Moudéry', 'Sinthiou Fissa', 'Goudiry',
    'Bala', 'Boutoupa Camaracounda', 'Koulor', 'Koumpentoum',
    'Kouthiaba Wolof', 'Kahène', 'Malem Niani',
  ],
  Kédougou: [
    'Kédougou', 'Bandafassi', 'Dindéfélo', 'Fongolimbi', 'Salémata',
    'Ethiolo', 'Saraya', 'Khossanto', 'Missira Sirimana', 'Bembou',
  ],
  Kolda: [
    'Kolda', 'Dioulacolon', 'Mampatim', 'Salikégné', 'Médina Yoro Foulah',
    'Bignarabé', 'Dabo', 'Fafacourou', 'Vélingara', 'Bonconto',
    'Kounkané', 'Linkéring', 'Ouassadou', 'Pata', 'Sare Bidji',
    'Sare Coly Salle', 'Diaobé-Kabendou',
  ],
  Sédhiou: [
    'Sédhiou', 'Diannah Ba', 'Diendé', 'Marsassoum', 'Bounkiling',
    'Bogal', 'Diaroumé', 'Diattacounda', 'Ndiamacouta', 'Goudomp',
    'Diattacounda', 'Karantaba', 'Samine', 'Simbandi Balante', 'Tanaff',
  ],
  Ziguinchor: [
    'Ziguinchor', 'Niaguis', 'Nyassia', 'Adéane', 'Bignona', 'Thionck-Essyl',
    'Diouloulou', 'Kataba 1', 'Sindian', 'Tendouck', 'Oussouye',
    'Cabrousse', 'Diembéring', 'Kabrousse', 'Mlomp', 'Santhiaba Manjacque',
  ],
  Matam: [
    'Matam', 'Nguidjilone', 'Ogo', 'Thilogne', 'Kanel', 'Wouro Sidy',
    'Sinthiou Bamambé', 'Bokidiawé', 'Orkadiéré', 'Ranérou', 'Vélingara Ferlo',
    'Oudalaye', 'Ourossogui', 'Agnam Civol', 'Bokiladji', 'Dabia',
  ],
};

export const REGIONS = Object.keys(SENEGAL);

export function citiesForRegion(region: string): string[] {
  return SENEGAL[region] ?? [];
}
