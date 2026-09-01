/**
 * Dynamic Prisma Client Generator for KleinDeal.de
 * Automatically selects PostgreSQL schema when DATABASE_URL is postgres or in staging/production,
 * and SQLite schema for local development.
 */

import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres =
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
