/**
 * Dynamic Prisma Client Generator for KleinDeal.de
 * Pure Node.js script - runs in all environments (Vercel postinstall, CI, and local)
 * without requiring tsx or external TypeScript CLI tools.
 */

const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const isPostgres =
  isVercel ||
  dbUrl.startsWith('postgresql://') ||
  dbUrl.startsWith('postgres://') ||
  process.env.APP_ENV === 'production' ||
  process.env.APP_ENV === 'staging';

try {
  if (isPostgres) {
    console.log('🐘 Generating Prisma Client for PostgreSQL (schema.postgresql.prisma)...');
    execSync('npx prisma generate --schema=prisma/schema.postgresql.prisma', { stdio: 'inherit' });
  } else {
    console.log('📦 Generating Prisma Client for SQLite (schema.prisma)...');
    execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error);
  process.exit(1);
}
