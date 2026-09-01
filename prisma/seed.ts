import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  // 1. Create a default verified user
  const hashedPassword = await bcrypt.hash('kleindeal123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@kleindeal.de' },
    update: {},
    create: {
      name: 'Maximilian Klein',
      email: 'admin@kleindeal.de',
      password: hashedPassword,
      phone: '+49 176 9876543',
      city: 'Berlin',
      plz: '10115',
    },
  });

  console.log('User created:', user.email);

  // 2. Initial real listings
  const initialListings = [
    {
      title: 'Apple iPhone 15 Pro Max 256GB Titan Natur',
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
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      ]),
      hasVideo: true,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-green-screen-41544-large.mp4',
    },
    {
      title: 'Volkswagen Golf VII 2.0 TDI GTD - Scheckheft',
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
      descriptionDe: 'Verkaufe meinen geliebten Golf 7 GTD. Baujahr 2017, 135.000 km. Lückenlos bei VW scheckheftgepflegt. Panorama-Dach, Dynaudio Soundsystem, LED-Scheinwerfer.',
      descriptionEn: 'Selling my Golf 7 GTD. Year 2017, 135,000 km. Full VW service history. Panoramic roof, Dynaudio sound system, LED headlights.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      ]),
      hasVideo: true,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-road-in-the-countryside-41551-large.mp4',
    },
    {
      title: 'Moderne 2-Zimmer-Wohnung mit Balkon in Hamburg',
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
      descriptionDe: 'Schöne 62 m² Altbauwohnung mit Südbalkon, Einbauküche und Dielenboden im Herzen von Altona. Kaltmiete 950 € zzgl. Nebenkosten.',
      descriptionEn: 'Beautiful 62 m² historic apartment with south-facing balcony, fitted kitchen, and hardwood floors in Altona.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ]),
      hasVideo: true,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-view-of-the-city-41552-large.mp4',
    },
    {
      title: 'Sony PlayStation 5 Disc Edition + 2 Controller',
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
      descriptionDe: 'Verkaufe meine PS5 Disc Edition in top Zustand. Inklusive 2 original DualSense Controller (Weiß & Schwarz) und Rechnungsbeleg.',
      descriptionEn: 'Selling PS5 Disc Edition in mint condition. Includes 2 original DualSense controllers and receipt.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      ]),
      hasVideo: true,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-playing-a-video-game-with-a-controller-41548-large.mp4',
    },
  ];

  for (const item of initialListings) {
    await prisma.listing.create({
      data: {
        ...item,
        userId: user.id,
      },
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
