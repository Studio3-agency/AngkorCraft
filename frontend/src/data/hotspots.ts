// Curated Cambodian tourist hotspots. Used to auto-surface the landmarks
// nearest to a shop's pinned location so tourists can find their way there.
// These are fixed reference points — merchants cannot edit them.

export type HotspotCategory =
  | 'temple'
  | 'market'
  | 'nature'
  | 'beach'
  | 'landmark'
  | 'museum'
  | 'nightlife';

export interface Hotspot {
  id: string;
  name: string;
  nameKh: string;
  lat: number;
  lng: number;
  region: string;
  category: HotspotCategory;
}

export const HOTSPOTS: Hotspot[] = [
  // ---- Siem Reap (Angkor) ----
  { id: 'angkor-wat', name: 'Angkor Wat', nameKh: 'អង្គរវត្ត', lat: 13.4125, lng: 103.867, region: 'Siem Reap', category: 'temple' },
  { id: 'bayon', name: 'Bayon Temple', nameKh: 'ប្រាសាទបាយ័ន', lat: 13.4413, lng: 103.859, region: 'Siem Reap', category: 'temple' },
  { id: 'angkor-thom', name: 'Angkor Thom', nameKh: 'អង្គរធំ', lat: 13.4467, lng: 103.8586, region: 'Siem Reap', category: 'temple' },
  { id: 'ta-prohm', name: 'Ta Prohm', nameKh: 'ប្រាសាទតាព្រហ្ម', lat: 13.4348, lng: 103.8891, region: 'Siem Reap', category: 'temple' },
  { id: 'banteay-srei', name: 'Banteay Srei', nameKh: 'បន្ទាយស្រី', lat: 13.5988, lng: 103.9633, region: 'Siem Reap', category: 'temple' },
  { id: 'phnom-bakheng', name: 'Phnom Bakheng', nameKh: 'ភ្នំបាខែង', lat: 13.4243, lng: 103.8583, region: 'Siem Reap', category: 'temple' },
  { id: 'pub-street', name: 'Pub Street', nameKh: 'ផ្លូវ Pub Street', lat: 13.3546, lng: 103.855, region: 'Siem Reap', category: 'nightlife' },
  { id: 'angkor-museum', name: 'Angkor National Museum', nameKh: 'សារមន្ទីរជាតិអង្គរ', lat: 13.362, lng: 103.856, region: 'Siem Reap', category: 'museum' },
  { id: 'kampong-phluk', name: 'Kampong Phluk Floating Village', nameKh: 'ភូមិបណ្តែតទឹកកំពង់ភ្លុក', lat: 13.2, lng: 103.95, region: 'Siem Reap', category: 'nature' },

  // ---- Phnom Penh ----
  { id: 'royal-palace', name: 'Royal Palace', nameKh: 'ព្រះបរមរាជវាំង', lat: 11.5637, lng: 104.9315, region: 'Phnom Penh', category: 'landmark' },
  { id: 'wat-phnom', name: 'Wat Phnom', nameKh: 'វត្តភ្នំ', lat: 11.5766, lng: 104.9231, region: 'Phnom Penh', category: 'temple' },
  { id: 'tuol-sleng', name: 'Tuol Sleng (S-21)', nameKh: 'សារមន្ទីរទួលស្លែង', lat: 11.5493, lng: 104.9177, region: 'Phnom Penh', category: 'museum' },
  { id: 'central-market', name: 'Central Market', nameKh: 'ផ្សារធំថ្មី', lat: 11.5694, lng: 104.921, region: 'Phnom Penh', category: 'market' },
  { id: 'russian-market', name: 'Russian Market', nameKh: 'ផ្សារទួលទំពូង', lat: 11.543, lng: 104.92, region: 'Phnom Penh', category: 'market' },
  { id: 'independence-monument', name: 'Independence Monument', nameKh: 'វិមានឯករាជ្យ', lat: 11.5564, lng: 104.9282, region: 'Phnom Penh', category: 'landmark' },
  { id: 'choeung-ek', name: 'Choeung Ek Killing Fields', nameKh: 'វាលពិឃាតជើងឯក', lat: 11.4844, lng: 104.9019, region: 'Phnom Penh', category: 'landmark' },
  { id: 'national-museum-pp', name: 'National Museum of Cambodia', nameKh: 'សារមន្ទីរជាតិកម្ពុជា', lat: 11.5651, lng: 104.9289, region: 'Phnom Penh', category: 'museum' },

  // ---- Kampot / Kep ----
  { id: 'bokor', name: 'Bokor Hill Station', nameKh: 'ភ្នំបូកគោ', lat: 10.63, lng: 104.03, region: 'Kampot', category: 'nature' },
  { id: 'kampot-old-market', name: 'Kampot Old Market', nameKh: 'ផ្សារចាស់កំពត', lat: 10.5947, lng: 104.181, region: 'Kampot', category: 'market' },
  { id: 'la-plantation', name: 'La Plantation Pepper Farm', nameKh: 'ចម្ការម្រេចកំពត', lat: 10.612, lng: 104.254, region: 'Kampot', category: 'nature' },
  { id: 'kampot-salt-fields', name: 'Kampot Salt Fields', nameKh: 'វាលអំបិលកំពត', lat: 10.6, lng: 104.2, region: 'Kampot', category: 'nature' },
  { id: 'kep-crab-market', name: 'Kep Crab Market', nameKh: 'ផ្សារក្តាមកែប', lat: 10.483, lng: 104.316, region: 'Kampot', category: 'market' },
  { id: 'kep-beach', name: 'Kep Beach', nameKh: 'ឆ្នេរកែប', lat: 10.482, lng: 104.314, region: 'Kampot', category: 'beach' },
  { id: 'rabbit-island', name: 'Rabbit Island (Koh Tonsay)', nameKh: 'កោះទន្សាយ', lat: 10.446, lng: 104.356, region: 'Kampot', category: 'beach' },

  // ---- Battambang ----
  { id: 'bamboo-train', name: 'Bamboo Train', nameKh: 'រថភ្លើងឫស្សី', lat: 13.074, lng: 103.168, region: 'Battambang', category: 'landmark' },
  { id: 'phnom-sampeau', name: 'Phnom Sampeau', nameKh: 'ភ្នំសំពៅ', lat: 13.043, lng: 103.09, region: 'Battambang', category: 'nature' },
  { id: 'battambang-oldtown', name: 'Battambang Old Town', nameKh: 'ទីក្រុងចាស់បាត់ដំបង', lat: 13.0957, lng: 103.2022, region: 'Battambang', category: 'landmark' },
  { id: 'wat-banan', name: 'Wat Banan Temple', nameKh: 'ប្រាសាទបាណន់', lat: 12.98, lng: 103.18, region: 'Battambang', category: 'temple' },

  // ---- Kampong Chhnang ----
  { id: 'kc-pottery', name: 'Ondong Rossey Pottery Village', nameKh: 'ភូមិចម្នេរ អណ្តូងឫស្សី', lat: 12.25, lng: 104.67, region: 'Kampong Chhnang', category: 'landmark' },
  { id: 'kc-floating', name: 'Kampong Chhnang Floating Village', nameKh: 'ភូមិបណ្តែតទឹកកំពង់ឆ្នាំង', lat: 12.26, lng: 104.66, region: 'Kampong Chhnang', category: 'nature' },

  // ---- Mondulkiri ----
  { id: 'bou-sra', name: 'Bou Sra Waterfall', nameKh: 'ទឹកធ្លាក់ប៊ូស្រា', lat: 12.53, lng: 107.31, region: 'Mondulkiri', category: 'nature' },
  { id: 'sen-monorom', name: 'Sen Monorom', nameKh: 'សែនមនោរម្យ', lat: 12.45, lng: 107.19, region: 'Mondulkiri', category: 'landmark' },

  // ---- Takeo ----
  { id: 'phnom-chisor', name: 'Phnom Chisor Temple', nameKh: 'ប្រាសាទភ្នំជីសូរ', lat: 11.32, lng: 104.73, region: 'Takeo', category: 'temple' },
  { id: 'tonle-bati', name: 'Tonlé Bati (Ta Prohm)', nameKh: 'ទន្លេបាទី', lat: 11.39, lng: 104.83, region: 'Takeo', category: 'temple' },
  { id: 'angkor-borei', name: 'Angkor Borei & Phnom Da', nameKh: 'អង្គរបុរី និងភ្នំដា', lat: 11.02, lng: 104.97, region: 'Takeo', category: 'temple' },
];
