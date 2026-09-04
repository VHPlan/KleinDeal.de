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


export const MOCK_LISTINGS: Listing[] = [];

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
