export interface Category {
  id: string;
  slug: string;
  nameDe: string;
  nameEn: string;
  iconName: string;
  subcategoriesDe: string[];
  subcategoriesEn: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'fahrzeuge',
    slug: 'fahrzeugwelt',
    nameDe: 'Fahrzeuge',
    nameEn: 'Vehicles',
    iconName: 'Car',
    subcategoriesDe: ['Autos', 'Motorräder', 'E-Scooter & Fahrräder', 'Wohnmobile', 'Auto-Teile & Zubehör'],
    subcategoriesEn: ['Cars', 'Motorcycles', 'E-Scooters & Bikes', 'Camper Vans', 'Auto Parts & Accessories'],
  },
  {
    id: 'immobilien',
    slug: 'immobilien',
    nameDe: 'Immobilien',
    nameEn: 'Real Estate',
    iconName: 'Home',
    subcategoriesDe: ['Mietwohnungen', 'Eigentumswohnungen', 'Häuser zum Kauf', 'WG-Zimmer', 'Garagen & Stellplätze'],
    subcategoriesEn: ['Apartments for Rent', 'Condos for Sale', 'Houses for Sale', 'Shared Rooms (WG)', 'Garages & Parking'],
  },
  {
    id: 'technik',
    slug: 'elektronik',
    nameDe: 'Technik & Elektronik',
    nameEn: 'Tech & Electronics',
    iconName: 'Smartphone',
    subcategoriesDe: ['Smartphones & Tablets', 'PCs & Laptops', 'TV & Audio', 'Gaming & Konsolen', 'Foto & Kamera'],
    subcategoriesEn: ['Smartphones & Tablets', 'PCs & Laptops', 'TV & Audio', 'Gaming & Consoles', 'Cameras & Photo'],
  },
  {
    id: 'haus-garten',
    slug: 'haus-garten',
    nameDe: 'Haus & Garten',
    nameEn: 'Home & Garden',
    iconName: 'Wrench',
    subcategoriesDe: ['Möbel & Einrichtung', 'Küche & Esszimmer', 'Garten & Pflanzen', 'Heimwerker & Werkzeug'],
    subcategoriesEn: ['Furniture & Decor', 'Kitchen & Dining', 'Garden & Plants', 'DIY & Tools'],
  },
  {
    id: 'mode',
    slug: 'mode-beauty',
    nameDe: 'Mode & Accessoires',
    nameEn: 'Fashion & Accessories',
    iconName: 'ShoppingBag',
    subcategoriesDe: ['Damenbekleidung', 'Herrenbekleidung', 'Schuhe', 'Uhren & Schmuck', 'Taschen & Accessoires'],
    subcategoriesEn: ['Womenswear', 'Menswear', 'Shoes', 'Watches & Jewelry', 'Bags & Accessories'],
  },
  {
    id: 'baby-kind',
    slug: 'baby-kind',
    nameDe: 'Baby, Kind & Familie',
    nameEn: 'Baby, Kids & Family',
    iconName: 'Heart',
    subcategoriesDe: ['Babybekleidung', 'Kinderwagen & Sitze', 'Spielzeug', 'Kindermöbel'],
    subcategoriesEn: ['Baby Clothing', 'Strollers & Car Seats', 'Toys & Games', 'Kids Furniture'],
  },
  {
    id: 'jobs',
    slug: 'jobs-karriere',
    nameDe: 'Jobs & Dienstleistungen',
    nameEn: 'Jobs & Services',
    iconName: 'Briefcase',
    subcategoriesDe: ['Stellenangebote', 'Minijobs & Studenten', 'Handwerker & Umzug', 'Nachhilfe'],
    subcategoriesEn: ['Job Openings', 'Mini Jobs', 'Craftsmen & Moving', 'Tutoring'],
  },
  {
    id: 'haustiere',
    slug: 'haustiere',
    nameDe: 'Haustiere & Zubehör',
    nameEn: 'Pets & Supplies',
    iconName: 'Dog',
    subcategoriesDe: ['Hunde', 'Katzen', 'Aquaristik & Fische', 'Kleintiere', 'Zubehör & Futter'],
    subcategoriesEn: ['Dogs', 'Cats', 'Aquarium & Fish', 'Small Animals', 'Supplies & Food'],
  },
];
