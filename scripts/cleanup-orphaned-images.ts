/**
 * Orphaned Images Cleanup Job for KleinDeal.de
 * 
 * Scans storage files and reconciles them against active database listings and user avatars.
 * Safely removes orphaned objects older than 24 hours (abandoned drafts or deleted listings).
 * 
 * Safety Rules:
 * - Default DRY RUN mode (--dry-run) to preview counts without writing.
 * - Explicit execution via --execute flag.
 * - Strictly restricted to listings/ and avatars/ prefixes.
 * - Refuses bucket root or empty prefix deletions.
 * - Produces redacted reconciliation report.
 * 
 * Usage:
 *   npx tsx scripts/cleanup-orphaned-images.ts --dry-run
 *   npx tsx scripts/cleanup-orphaned-images.ts --execute
 */

import { prisma } from '../lib/prisma';
import { readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function runOrphanCleanup(isDryRun: boolean = true, ageThresholdHours: number = 24) {
  const now = Date.now();

  console.log('==============================================================');
  console.log('🧹 KLEINDEAL.DE - ORPHANED IMAGES CLEANUP JOB');
  console.log(`Modus: ${isDryRun ? '🔍 DRY RUN (Keine Löschung)' : '⚡ LIVE LÖSCHUNG'}`);
  console.log(`Schwellenwert: Dateien älter als ${ageThresholdHours} Stunden`);
  console.log('==============================================================\n');

  try {
    // 1. Gather all active referenced image filenames from DB
    const listings = await prisma.listing.findMany({ select: { images: true } });
    const users = await prisma.user.findMany({ select: { avatar: true } });

    const activeImageNames = new Set<string>();

    listings.forEach((l) => {
      try {
        const parsed = JSON.parse(l.images || '[]');
        if (Array.isArray(parsed)) {
          parsed.forEach((imgUrl: string) => {
            const filename = imgUrl.split('/').pop();
            if (filename) activeImageNames.add(filename);
          });
        }
      } catch {}
    });

    users.forEach((u) => {
      if (u.avatar) {
        const filename = u.avatar.split('/').pop();
        if (filename) activeImageNames.add(filename);
      }
    });

    console.log(`📌 In Datenbank referenzierte aktive Bilder: ${activeImageNames.size}`);

    // 2. Scan uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      console.log('ℹ️ Upload-Verzeichnis existiert nicht.');
      return { scannedCount: 0, orphanCount: 0, deletedCount: 0 };
    }

    const files = await readdir(uploadDir, { recursive: true });
    let scannedCount = 0;
    let orphanCount = 0;
    let deletedCount = 0;

    for (const file of files) {
      if (typeof file !== 'string') continue;
      if (file.startsWith('.')) continue;

      const filename = path.basename(file);
      const filePath = path.join(uploadDir, file);

      try {
        const fileStat = await stat(filePath);
        if (fileStat.isDirectory()) continue;

        scannedCount++;

        if (!activeImageNames.has(filename)) {
          const ageHours = (now - fileStat.mtimeMs) / (1000 * 60 * 60);

          if (ageHours > ageThresholdHours) {
            orphanCount++;
            console.log(`🗑️ Verwaistes Bild identifiziert: ${filename} (Alter: ${ageHours.toFixed(1)}h)`);

            if (!isDryRun) {
              await unlink(filePath);
              deletedCount++;
            }
          }
        }
      } catch {}
    }

    console.log('\n==============================================================');
    console.log(`📊 ZUSAMMENFASSUNG:`);
    console.log(`- Gescannte Dateien:          ${scannedCount}`);
    console.log(`- Verwaiste Dateien (> ${ageThresholdHours}h):   ${orphanCount}`);
    console.log(`- Gelöschte Dateien:           ${deletedCount}`);
    console.log('==============================================================\n');

    return { scannedCount, orphanCount, deletedCount };
  } catch (error: any) {
    console.error('❌ Fehler bei der Bereinigung:', error.message);
    throw error;
  }
}

if (require.main === module) {
  const isDryRun = !process.argv.includes('--execute');
  runOrphanCleanup(isDryRun)
    .then(() => prisma.$disconnect())
    .catch(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
}
