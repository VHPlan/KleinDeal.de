# 🧪 KleinDeal.de – Staging Deployment & Operations Guide

This guide documents the setup, environment separation, access gate, and verification runbook for the private staging environment (`staging.kleindeal.de`).

---

## 1. Staging Environment Architecture & Isolation Guards

| Dimension | Staging Configuration | Production Configuration | Isolation Guard |
| :--- | :--- | :--- | :--- |
| **Hostname** | `staging.kleindeal.de` | `kleindeal.de` | Separate DNS records & TLS certs |
| **Environment Flag** | `APP_ENV=staging` | `APP_ENV=production` | Strict Zod validation in `lib/env.ts` |
| **Session Cookie** | `kleindeal_staging_session` | `kleindeal_session` | Isolated cookie namespace in `lib/auth.ts` |
| **Access Protection** | Server-side Password Gate | Public Marketplace | Middleware gate in `middleware.ts` |
| **Search Indexing** | `noindex, nofollow, noarchive` | Indexed (`index, follow`) | `X-Robots-Tag` & `/robots.txt` disallow |
| **Storage Prefix** | `staging/listings/` | `listings/` | Key prefixing in `lib/storage.ts` |
| **Redis Prefix** | `kleindeal:staging:` | `kleindeal:` | Key namespacing in `lib/rateLimit.ts` |
| **Database** | Staging PostgreSQL | Production PostgreSQL | Isolated database URL & connection pool |
| **Background Jobs** | Webhook via `CRON_SECRET` | Scheduled Cron Trigger | Protected webhook `/api/jobs/[jobName]` |

---

## 2. Owner Action Checklist: External Credentials Provisioning

To deploy staging to a cloud provider (e.g. Vercel, Railway, AWS, Fly.io), the operator must supply the following staging credentials in the deployment platform settings:

| # | Service Required | Environment Variable | Where to Obtain / Recommendation |
| :---: | :--- | :--- | :--- |
| 1 | **Staging PostgreSQL** | `DATABASE_URL`<br>`DIRECT_DATABASE_URL` | Supabase / Neon / AWS RDS (Create dedicated staging database `kleindeal_staging`) |
| 2 | **Staging Object Storage** | `STORAGE_PROVIDER=s3`<br>`S3_ENDPOINT`<br>`S3_BUCKET`<br>`S3_ACCESS_KEY_ID`<br>`S3_SECRET_ACCESS_KEY`<br>`S3_PUBLIC_URL`<br>`S3_KEY_PREFIX=staging/` | Cloudflare R2 / AWS S3 (Create bucket `kleindeal-staging-uploads` with staging prefix) |
| 3 | **Staging Redis** | `REDIS_URL`<br>`REDIS_KEY_PREFIX=kleindeal:staging:` | Upstash Redis (Create serverless database `kleindeal-staging-redis`) |
| 4 | **Staging Email** | `EMAIL_PROVIDER=resend`<br>`RESEND_API_KEY`<br>`EMAIL_FROM=noreply@staging.kleindeal.de` | Resend Dashboard (Create staging API key with verified sending domain) |
| 5 | **Staging Session Secret** | `SESSION_SECRET` | Generate via `openssl rand -base64 48` (Must differ from production) |
| 6 | **Private Access Password** | `STAGING_ACCESS_PASSWORD` | Choose a strong private password for team preview access |
| 7 | **Cron Webhook Token** | `CRON_SECRET` | Generate via `openssl rand -hex 32` for triggering background jobs |
| 8 | **Error Monitoring** | `SENTRY_DSN`<br>`SENTRY_ENVIRONMENT=staging` | Sentry Dashboard (Project Settings -> Client Keys DSN) |
| 9 | **DNS Configuration** | CNAME: `staging.kleindeal.de` -> hosting provider target | Cloudflare / Domain Registrar DNS Management |

---

## 3. Staging Deployment Execution Sequence

```bash
# 1. Install dependencies deterministically
npm ci

# 2. Run quality checks
npm run check-schema
npm run type-check
npm run lint
npm test

# 3. Apply PostgreSQL Migrations to Staging Database
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma

# 4. Seed Fictional Staging Accounts & Listings
npm run seed:staging

# 5. Execute Staging Smoke Test Suite
npm run test:staging

# 6. Build and Deploy
npm run build
```

---

## 4. Staging Exit Criteria & Verification Matrix

| Verification Criterion | Required Evidence | Status |
| :--- | :--- | :--- |
| **1. Database Isolation** | Staging PostgreSQL connected with 0 production records | ⏳ Awaiting Cloud DB Setup |
| **2. Storage Persistence** | Uploaded image survives container restart in staging bucket | ⏳ Awaiting S3 Credentials |
| **3. Redis Rate Limiting** | Rate limits isolate per-IP and per-user across instances | ⏳ Awaiting Redis Instance |
| **4. Email Delivery** | Verification email received in real test inbox | ⏳ Awaiting Resend API Key |
| **5. Private Gate Active** | Direct visits without password redirect to `/staging-login` | ✅ Implemented & Tested Locally |
| **6. Search Engine Protection** | `X-Robots-Tag: noindex` present on all HTML responses | ✅ Implemented & Tested Locally |
| **7. Scheduled Jobs** | `POST /api/jobs/saved_search_matcher` succeeds with `CRON_SECRET` | ✅ Implemented & Tested Locally |
| **8. Smoke Test Suite** | 2-Account Journey + Handover + Review passes | ✅ 100% Passed Locally |
