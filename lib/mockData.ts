export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export interface Listing {
  id: string;
  title: string;
  categorySlug: string;
  categoryNameDe: string;
  categoryNameEn: string;
  subcategory?: string;
  price: number;
  previousPrice?: number;
  priceType: 'fixed' | 'negotiable' | 'free';
  locationCity: string;
  locationPlz: string;
  distanceKm: number;
  postedDate: string;
  condition: 'Neu' | 'Wie neu' | 'Gebraucht';
  descriptionDe: string;
  descriptionEn: string;
  images: string[];
  hasVideo: boolean;
  videoUrl?: string;
  isDemo?: boolean;
  slug?: string;
  deliveryOptions?: string;
  shippingAvailable?: boolean;
  views?: number;
  favoriteCount?: number;
  seller: {
    id: string;
    name: string;
    trustScore: number;
    memberSince: string;
    verified: boolean;
    phone?: string;
    sellerType?: 'Privat' | 'Gewerblich';
    emailVerified?: boolean;
    phoneVerified?: boolean;
    identityVerified?: boolean;
  };
}


export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Apple iPhone 15 Pro Max 256GB Titan Natur - Sehr guter Zustand',
    categorySlug: 'elektronik',
    categoryNameDe: 'Tech & Elektronik',
    categoryNameEn: 'Tech & Electronics',
    price: 980,
    priceType: 'negotiable',
    locationCity: 'Berlin',
    locationPlz: '10115',
    distanceKm: 2,
    postedDate: 'Heute, 14:20',
    condition: 'Wie neu',
    descriptionDe: 'Verkaufe mein iPhone 15 Pro Max in Titan Natur. Das Handy wurde von Tag 1 an mit Schutzfolie und Hülle genutzt. Akkukapazität liegt bei 96%. Mit OVP und Ladekabel. Abholung in Berlin-Mitte oder versicherter Versand via DHL.',
    descriptionEn: 'Selling my iPhone 15 Pro Max in Natural Titanium. Used with protective foil and case since day 1. Battery capacity 96%. Comes with original box and charging cable. Pickup in Berlin-Mitte or insured DHL shipping.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-green-screen-41544-large.mp4',
    seller: {
      id: 's1',
      name: 'Maximilian K.',
      trustScore: 99,
      memberSince: 'März 2021',
      verified: true,
      phone: '+49 176 9876543',
    },
  },
  {
    id: 'l2',
    title: 'Volkswagen Golf VII 2.0 TDI GTD - Top gepflegt, Scheckheft',
    categorySlug: 'fahrzeugwelt',
    categoryNameDe: 'Fahrzeugwelt & Mobilität',
    categoryNameEn: 'Vehicles & Mobility',
    price: 14500,
    priceType: 'negotiable',
    locationCity: 'München',
    locationPlz: '80331',
    distanceKm: 8,
    postedDate: 'Gestern, 18:45',
    condition: 'Gebraucht',
    descriptionDe: 'Verkaufe meinen geliebten Golf 7 GTD wegen Umstieg auf E-Auto. Baujahr 2017, 135.000 km. Lückenlos bei VW scheckheftgepflegt. Panorama-Dach, Dynaudio Soundsystem, LED-Scheinwerfer. Motor läuft einwandfrei!',
    descriptionEn: 'Selling my Golf 7 GTD due to switching to an EV. Year 2017, 135,000 km. Full VW service history. Panoramic roof, Dynaudio sound system, LED headlights. Engine runs perfectly!',
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-road-in-the-countryside-41551-large.mp4',
    seller: {
      id: 's2',
      name: 'Stefan B.',
      trustScore: 97,
      memberSince: 'Januar 2019',
      verified: true,
      phone: '+49 151 1234567',
    },
  },
  {
    id: 'l3',
    title: 'Moderne 2-Zimmer-Wohnung mit Balkon in Hamburg-Altona',
    categorySlug: 'immobilien',
    categoryNameDe: 'Immobilien & Wohnen',
    categoryNameEn: 'Real Estate & Housing',
    price: 950,
    priceType: 'fixed',
    locationCity: 'Hamburg',
    locationPlz: '22765',
    distanceKm: 4,
    postedDate: 'Heute, 09:15',
    condition: 'Wie neu',
    descriptionDe: 'Schöne 62 m² Altbauwohnung mit Südbalkon, Einbauküche und Dielenboden im Herzen von Altona. Kaltmiete 950 € zzgl. Nebenkosten. Frei ab 1. November. Besichtigung nach Absprache.',
    descriptionEn: 'Beautiful 62 m² historic apartment with south-facing balcony, fitted kitchen, and hardwood floors in the heart of Altona. Rent €950 + utilities. Available Nov 1st.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-view-of-the-city-41552-large.mp4',
    seller: {
      id: 's3',
      name: 'Immobilien Hamburg GmbH',
      trustScore: 100,
      memberSince: 'Juni 2018',
      verified: true,
    },
  },
  {
    id: 'l4',
    title: 'Eichenholz Esstisch skandinavischer Stil + 4 Stühle',
    categorySlug: 'haus-garten',
    categoryNameDe: 'Haus, Garten & Wohnen',
    categoryNameEn: 'Home, Garden & Living',
    price: 320,
    priceType: 'negotiable',
    locationCity: 'Köln',
    locationPlz: '50667',
    distanceKm: 6,
    postedDate: 'Vor 3 Stunden',
    condition: 'Wie neu',
    descriptionDe: 'Hochwertiger Massivholz-Esstisch (180x90 cm) inkl. 4 passender gepolsterter Stühle in Grau. Kaum Gebrauchsspuren. Nur Selbstabholung in Köln-Innenstadt.',
    descriptionEn: 'High quality solid oak dining table (180x90 cm) incl. 4 matching gray upholstered chairs. Barely any signs of wear. Self-pickup in Cologne city center.',
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: false,
    seller: {
      id: 's4',
      name: 'Laura S.',
      trustScore: 95,
      memberSince: 'Oktober 2022',
      verified: true,
    },
  },
  {
    id: 'l5',
    title: 'Sony PlayStation 5 Disc Edition + 2 Controller & 3 Spiele',
    categorySlug: 'elektronik',
    categoryNameDe: 'Tech & Elektronik',
    categoryNameEn: 'Tech & Electronics',
    price: 390,
    priceType: 'fixed',
    locationCity: 'Frankfurt am Main',
    locationPlz: '60311',
    distanceKm: 12,
    postedDate: 'Heute, 11:30',
    condition: 'Wie neu',
    descriptionDe: 'Verkaufe meine PS5 Disc Edition in top Zustand. Inklusive 2 original DualSense Controller (Weiß & Schwarz) und den Spielen EA FC 24, Spider-Man 2 und God of War Ragnarök. Rechnungsbeleg vorhanden.',
    descriptionEn: 'Selling PS5 Disc Edition in mint condition. Includes 2 original DualSense controllers and 3 games. Original invoice included.',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-playing-a-video-game-with-a-controller-41548-large.mp4',
    seller: {
      id: 's5',
      name: 'Dennis M.',
      trustScore: 98,
      memberSince: 'August 2020',
      verified: true,
    },
  },
  {
    id: 'l6',
    title: 'CUBE Nuroad Pro Gravel Bike 2023 - RH 56cm',
    categorySlug: 'fahrzeugwelt',
    categoryNameDe: 'Fahrzeugwelt & Mobilität',
    categoryNameEn: 'Vehicles & Mobility',
    price: 850,
    priceType: 'negotiable',
    locationCity: 'Stuttgart',
    locationPlz: '70173',
    distanceKm: 15,
    postedDate: 'Vor 1 Tag',
    condition: 'Wie neu',
    descriptionDe: 'Gravelbike CUBE Nuroad Pro in der Farbe metalbrook`n`black. Rahmengröße 56cm. Shimano GRX 2x10 Schaltung. Ca. 800 km gefahren, immer drinnen gestanden. Frisch zentriert und eingestellt.',
    descriptionEn: 'CUBE Nuroad Pro Gravel bike, size 56cm. Shimano GRX 2x10 drivetrain. Approx. 800 km ridden, kept indoors. Recently serviced.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: false,
    seller: {
      id: 's6',
      name: 'Florian W.',
      trustScore: 96,
      memberSince: 'Mai 2021',
      verified: true,
    },
  },
  {
    id: 'l7',
    title: 'Kinderwagen Bugaboo Fox 3 All-in-One Komplettset',
    categorySlug: 'baby-kind',
    categoryNameDe: 'Baby, Kind & Familie',
    categoryNameEn: 'Baby, Kids & Family',
    price: 450,
    priceType: 'negotiable',
    locationCity: 'Düsseldorf',
    locationPlz: '40213',
    distanceKm: 5,
    postedDate: 'Vor 2 Tagen',
    condition: 'Gebraucht',
    descriptionDe: 'Kombikinderwagen Bugaboo Fox 3 in Grey Melange. Inklusive Babywanne, Sportsitz, Regenverdeck und Becherhalter. Alles gereinigt und in gutem Zustand.',
    descriptionEn: 'Bugaboo Fox 3 stroller set in Grey Melange. Includes bassinet, seat unit, rain cover, and cup holder. Cleaned and in good condition.',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: false,
    seller: {
      id: 's7',
      name: 'Melanie H.',
      trustScore: 99,
      memberSince: 'Februar 2022',
      verified: true,
    },
  },
  {
    id: 'l8',
    title: 'Zu verschenken: Umzugskartons ca. 25 Stück in Leipzig',
    categorySlug: 'haus-garten',
    categoryNameDe: 'Haus, Garten & Wohnen',
    categoryNameEn: 'Home, Garden & Living',
    price: 0,
    priceType: 'free',
    locationCity: 'Leipzig',
    locationPlz: '04109',
    distanceKm: 3,
    postedDate: 'Vor 4 Stunden',
    condition: 'Gebraucht',
    descriptionDe: 'Gebe ca. 25 stabile Umzugskartons nach erfolgreich absolviertem Umzug kostenlos ab. Nur Komplettabnahme in Leipzig-Zentrum.',
    descriptionEn: 'Giving away approx. 25 sturdy moving boxes for free after moving. Must take all boxes, pickup in Leipzig center.',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    ],
    hasVideo: false,
    seller: {
      id: 's8',
      name: 'Tim O.',
      trustScore: 100,
      memberSince: 'September 2023',
      verified: true,
    },
  }
];

export const GERMANY_CITIES = [
  { name: 'Berlin', plz: '10115', state: 'Berlin' },
  { name: 'München', plz: '80331', state: 'Bayern' },
  { name: 'Hamburg', plz: '22765', state: 'Hamburg' },
  { name: 'Köln', plz: '50667', state: 'Nordrhein-Westfalen' },
  { name: 'Frankfurt am Main', plz: '60311', state: 'Hessen' },
  { name: 'Stuttgart', plz: '70173', state: 'Baden-Württemberg' },
  { name: 'Düsseldorf', plz: '40213', state: 'Nordrhein-Westfalen' },
  { name: 'Leipzig', plz: '04109', state: 'Sachsen' },
  { name: 'Dortmund', plz: '44135', state: 'Nordrhein-Westfalen' },
  { name: 'Essen', plz: '45127', state: 'Nordrhein-Westfalen' },
  { name: 'Bremen', plz: '28195', state: 'Bremen' },
  { name: 'Dresden', plz: '01067', state: 'Sachsen' },
  { name: 'Hannover', plz: '30159', state: 'Niedersachsen' },
  { name: 'Nürnberg', plz: '90402', state: 'Bayern' },
];

export const RADIUS_OPTIONS = [
  { value: '5', labelDe: '+ 5 km', labelEn: '+ 5 km' },
  { value: '10', labelDe: '+ 10 km', labelEn: '+ 10 km' },
  { value: '25', labelDe: '+ 25 km', labelEn: '+ 25 km' },
  { value: '50', labelDe: '+ 50 km', labelEn: '+ 50 km' },
  { value: '100', labelDe: '+ 100 km', labelEn: '+ 100 km' },
  { value: 'all', labelDe: 'Ganz Deutschland', labelEn: 'All Germany' },
];
