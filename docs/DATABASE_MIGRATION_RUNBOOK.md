# 🗄️ KleinDeal.de - Database Migration & Data Import Runbook

This runbook covers executing PostgreSQL migrations in CI/CD and migrating existing local SQLite data to PostgreSQL.

---

## 1. PostgreSQL Schema Migrations

### Apply Migrations in Production / Staging
```bash
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
```

### Create a New Migration
When making schema modifications:
```bash
npx prisma migrate dev --name <migration_name> --schema=prisma/schema.postgresql.prisma
```

---

## 2. Transferring SQLite Data to PostgreSQL

If you have legitimate user and listing records in `dev.db` that must be imported into PostgreSQL:

### Step 1: Dry Run Verification (No database writes)
```bash
POSTGRES_TARGET_URL="postgresql://user:pass@host:5432/db" npx tsx scripts/migrate-sqlite-to-postgres.ts --dry-run
```
Review the reconciliation output to verify record counts and relationships.

### Step 2: Live Execution
```bash
POSTGRES_TARGET_URL="postgresql://user:pass@host:5432/db" npx tsx scripts/migrate-sqlite-to-postgres.ts --execute
```

---

## 3. Migration Rollback Procedure

To roll back a failed migration:
1. Revert the schema definition in `prisma/schema.postgresql.prisma`.
2. Apply the corresponding down-migration SQL script:
```sql
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;
DROP TABLE IF EXISTS "Favorite" CASCADE;
DROP TABLE IF EXISTS "Listing" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
```
