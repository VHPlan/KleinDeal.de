# 🇩🇪 KleinDeal.de – Dein lokaler Marktplatz für Deutschland

**KleinDeal.de** is a modern, high-performance, German classifieds and local marketplace platform designed for buying and selling locally with speed, clarity, and security.

---

## ✨ Features & Architecture

* **Authentication & Account Security**:
  * Email registration with token verification & password reset.
  * Two-Factor Authentication (TOTP) with cryptographically hashed recovery codes.
  * Active session tracking with remote revocation.
* **Classified Listings Lifecycle**:
  * Multi-image uploads with automatic EXIF/GPS scrubbing, orientation normalization, and WebP compression.
  * Search by keyword, category, German PLZ/City, and radius filtering.
  * Private seller listing analytics (views, favorites, inquiries).
* **Direct Messaging & Offers**:
  * Participant-isolated conversations and direct messaging.
  * Price negotiation with binding offer, counteroffer, and decline workflows.
* **Safe Handover & Genuine Reviews**:
  * 6-digit cryptographically hashed handover PIN verification with attempt limiting.
  * Genuine review system strictly restricted to completed transactions.
* **Saved Searches & Instant Alerts**:
  * Background job matcher for user-defined filters and instant notifications.
* **Trust, Safety & Moderation**:
  * User blocking, listing reporting, appeal submission, and moderator audit trails.
* **Private Staging Access Gate**:
  * Isolated staging environment (`staging.kleindeal.de`) with server-side password access gate and `X-Robots-Tag: noindex`.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Edge Middleware)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Graphite & Emerald design system)
* **ORM & Database**: [Prisma ORM](https://www.prisma.io/) (SQLite for local dev, PostgreSQL for production with 100% semantic schema parity)
* **Storage**: Modular storage adapter (Local disk for dev, S3/Cloudflare R2 for production/staging)
* **Rate Limiting**: Distributed Redis token-bucket rate limiter with fail-closed security policy for auth routes
* **Transactional Email**: Resend / SMTP adapter with isolated development log fallback

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

### 2. Installation
```bash
git clone https://github.com/VHPlan/KleinDeal.de.git
cd KleinDeal.de
npm install
```

### 3. Local Development Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

---

## 🧪 Quality Gate & Testing

KleinDeal.de includes a 100% passing test and audit suite:

```bash
# Run complete security & functional audit test suite (44 assertions)
npm test

# Run semantic Prisma schema parity check (SQLite vs PostgreSQL)
npm run check-schema

# Run schema parity negative fixture tests
npm run test:unit

# Run staging smoke test suite (18 assertions)
npm run test:staging

# Run object storage lifecycle test
npm run test:storage

# Verify no 'prisma db push' in deployment guides
npm run verify:docs

# Type-check and lint
npm run type-check
npm run lint

# Production build
npm run build
```

---

## 📄 Documentation

* [Staging Deployment Guide](docs/STAGING_DEPLOYMENT_GUIDE.md)
* [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT.md)
* [Database Migration Runbook](docs/DATABASE_MIGRATION_RUNBOOK.md)
* [Redis Outage & Failure Policy](docs/REDIS_FAILURE_POLICY.md)
* [Backup & Disaster Recovery Runbook](docs/BACKUP_AND_DISASTER_RECOVERY.md)

---

## ⚖️ License
Proprietary / All rights reserved.
