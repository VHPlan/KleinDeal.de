/**
 * Dynamic Prisma Client Generator for KleinDeal.de
 * 
 * Automatically generates:
 * - PostgreSQL Prisma Client (schema.postgresql.prisma) on Vercel deployments, in staging/production, or when DATABASE_URL is PostgreSQL.
 * - SQLite Prisma Client (schema.prisma) for local development and local tests.
 */

import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URL || '';
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const isPostgres =
  isVercel ||
  dbUrl.startsWith('postgresql://') ||
  dbUrl.startsWith('postgres://') ||
  process.env.APP_ENV === 'production' ||
  process.env.APP_ENV === 'staging';

if (isPostgres) {
  console.log('🐘 Generating Prisma Client for PostgreSQL (schema.postgresql.prisma)...');
  execSync('npx prisma generate --schema=prisma/schema.postgresql.prisma', { stdio: 'inherit' });
} else {
  console.log('📦 Generating Prisma Client for SQLite (schema.prisma)...');
  execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
}
