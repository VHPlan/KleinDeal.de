# 🚀 KleinDeal.de - Production Deployment Guide

This guide provides instructions for deploying **KleinDeal.de** to production on cloud hosting platforms (e.g., Vercel, AWS ECS/Amplify, Railway, Fly.io, or standard Docker environments).

---

## 1. Required Production Infrastructure & Credentials

Before launching to live traffic, ensure the following cloud services are provisioned:

| Service | Recommended Providers | Required Environment Variables |
| :--- | :--- | :--- |
| **PostgreSQL Database** | Supabase, Neon, AWS RDS, Railway | `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| **Distributed Cache / Rate Limiter** | Upstash Redis, Redis Cloud, AWS ElastiCache | `REDIS_URL` |
| **Object Storage** | Cloudflare R2, AWS S3, Backblaze B2 | `STORAGE_PROVIDER=s3`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_URL` |
| **Transactional Email** | Resend (Recommended), Postmark, SendGrid | `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` |
| **Session Security** | Internal Random Secret | `SESSION_SECRET` (generate with `openssl rand -hex 32`) |

---

## 2. Deployment Sequence

### Step 1: Set Environment Variables
In your hosting platform's dashboard, configure all variables as specified in `.env.example`.

### Step 2: Apply Database Migrations
Run the versioned PostgreSQL migration:
```bash
npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
```

### Step 3: Execute Production Build
```bash
npm ci
npm run build
```

### Step 4: Verify Service Readiness
Check the readiness probe:
```bash
curl https://kleindeal.de/api/ready
```
Expected response:
```json
{
  "status": "ready"
}
```

---

## 3. Rollback Procedure

If a critical issue occurs post-deployment:
1. **Application Code**: Revert the Git commit or promote the previous successful deployment in your hosting dashboard.
2. **Database**: If a rollback migration is required, apply the rollback SQL script documented in `docs/DATABASE_MIGRATION_RUNBOOK.md`.
3. **Cache & Sessions**: Flush Redis cache or rotate `SESSION_SECRET` if a security breach occurred.
