/**
 * Staging Environment Seed Script for KleinDeal.de
 * 
 * Sets up isolated test accounts and realistic mock listings for staging validation.
 * 
 * Safety Rules:
 * - Strictly refuses to run in production (APP_ENV === 'production').
 * - Idempotent upsert operations.
 * - Creates clearly marked fictional staging accounts (A: Seller, B: Buyer, C: Outsider, Admin).
 * - Generates realistic German test listings.
 * 
 * Usage:
 *   npx tsx scripts/seed-staging.ts
 */

import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function seedStaging() {
  if (process.env.APP_ENV === 'production') {
    console.error('❌ FATAL: seed-staging.ts cannot be executed in production environment!');
    process.exit(1);
  }

  console.log('==============================================================');
  console.log('🌱 SEEDING KLEINDEAL.DE STAGING ENVIRONMENT');
  console.log('==============================================================\n');

  const defaultPasswordHash = await bcrypt.hash('StagingTestPassword2026!', 10);

  // 1. Account A - Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller.staging@kleindeal.local' },
    update: {
      name: 'Max Mustermann (Staging Seller)',
      emailVerified: true,
      city: 'Berlin',
      plz: '10115',
    },
    create: {
      name: 'Max Mustermann (Staging Seller)',
      email: 'seller.staging@kleindeal.local',
      password: defaultPasswordHash,
      emailVerified: true,
      city: 'Berlin',
      plz: '10115',
      accountType: 'Privat',
      bio: 'Zuverlässiger Privatverkäufer für Foto- und Audioequipment in Berlin Mitte.',
    },
  });
  console.log(`✅ Account A (Seller) bereitgestellt: ${seller.email}`);

  // 2. Account B - Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer.staging@kleindeal.local' },
    update: {
      name: 'Erika Musterfrau (Staging Buyer)',
      emailVerified: true,
      city: 'Berlin',
      plz: '10437',
    },
    create: {
      name: 'Erika Musterfrau (Staging Buyer)',
      email: 'buyer.staging@kleindeal.local',
      password: defaultPasswordHash,
      emailVerified: true,
      city: 'Berlin',
      plz: '10437',
      accountType: 'Privat',
      bio: 'Fotografie-Enthusiastin aus Prenzlauer Berg.',
    },
  });
  console.log(`✅ Account B (Buyer) bereitgestellt: ${buyer.email}`);

  // 3. Account C - Unauthorized Outsider
  const outsider = await prisma.user.upsert({
    where: { email: 'outsider.staging@kleindeal.local' },
    update: {
      name: 'Karl Außenstehender (Staging Outsider)',
      emailVerified: true,
    },
    create: {
      name: 'Karl Außenstehender (Staging Outsider)',
      email: 'outsider.staging@kleindeal.local',
      password: defaultPasswordHash,
      emailVerified: true,
      city: 'Hamburg',
      plz: '20095',
      accountType: 'Privat',
    },
  });
  console.log(`✅ Account C (Outsider) bereitgestellt: ${outsider.email}`);

  // 4. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin.staging@kleindeal.local' },
    update: {
      name: 'Staging Moderator & Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
    create: {
      name: 'Staging Moderator & Admin',
      email: 'admin.staging@kleindeal.local',
      password: defaultPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
      city: 'Frankfurt',
      plz: '60311',
      accountType: 'Gewerblich',
    },
  });
  console.log(`✅ Admin Account bereitgestellt: ${admin.email}`);

  // 5. Create Realistic Staging Listings for Account A
  const stagingListings = [
    {
      title: 'Sony Alpha 7 IV Vollformat Systemkamera (Body)',
      categorySlug: 'elektronik',
      categoryNameDe: 'Elektronik',
      categoryNameEn: 'Electronics',
      price: 1850,
      priceType: 'negotiable',
      locationCity: 'Berlin',
      locationPlz: '10115',
      distanceKm: 2,
      condition: 'Wie neu',
      deliveryOptions: 'Abholung & Versand',
      descriptionDe: 'Verkaufe meine Sony A7 IV in absolutem Bestzustand. Ca. 4.200 Auslösungen, Nichtraucherhaushalt, inklusive OVP und Originalakku.',
      descriptionEn: 'Selling my Sony A7 IV in mint condition with approx. 4,200 shutter actuations.',
      images: JSON.stringify(['/uploads/staging-sony-a7iv.webp']),
    },
    {
      title: 'Herman Miller Aeron Bürostuhl Größe B (Graphite)',
      categorySlug: 'haus-garten',
      categoryNameDe: 'Haus & Garten',
      categoryNameEn: 'Home & Garden',
      price: 680,
      priceType: 'fixed',
      locationCity: 'Berlin',
      locationPlz: '10115',
      distanceKm: 3,
      condition: 'Sehr gut',
      deliveryOptions: 'Nur Abholung',
      descriptionDe: 'Ergonomischer Bürostuhl Herman Miller Aeron in Größe B. Mit Lordosenstütze und voll verstellbaren Armlehnen.',
      descriptionEn: 'Herman Miller Aeron office chair size B in graphite.',
      images: JSON.stringify(['/uploads/staging-aeron.webp']),
    },
  ];

  for (const item of stagingListings) {
    const existing = await prisma.listing.findFirst({
      where: { userId: seller.id, title: item.title },
    });

    if (!existing) {
      await prisma.listing.create({
        data: {
          ...item,
          userId: seller.id,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log(`✅ ${stagingListings.length} realistische Testanzeigen für Verkäufer angelegt.`);
  console.log('\n==============================================================');
  console.log('🎉 STAGING SEED ERFOLGREICH ABGESCHLOSSEN');
  console.log('==============================================================\n');
}

seedStaging()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Fehler beim Staging-Seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
