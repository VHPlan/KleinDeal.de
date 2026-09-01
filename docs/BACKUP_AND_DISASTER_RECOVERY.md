# 🛡️ KleinDeal.de - Backup & Disaster Recovery Runbook

> **Status Notice**: Automated database snapshots, Point-In-Time-Recovery (PITR), and S3 versioning are **NOT YET CONFIGURED** on external cloud hosting. They must be enabled upon provisioning production PostgreSQL and Cloudflare R2 / AWS S3 instances.

---

## 1. Objectives & SLAs

- **Target Recovery Point Objective (RPO)**: < 1 hour (maximum 1 hour of data loss in a catastrophic disaster).
- **Target Recovery Time Objective (RTO)**: < 30 minutes (restoration to active service within 30 minutes).
- **Responsible Operator**: Infrastructure Lead / DevOps Engineer.

---

## 2. Cloud Activation Checklist for Operator

| Step | Action | Provider Setting | Status |
| :--- | :--- | :--- | :--- |
| 1 | **PostgreSQL Daily Snapshots** | Enable automated daily encrypted snapshots retained for 30 days | ⏳ Awaiting Cloud DB Setup |
| 2 | **Continuous WAL Archiving & PITR** | Enable 7-to-30 day Point-in-Time Recovery | ⏳ Awaiting Cloud DB Setup |
| 3 | **S3 Bucket Versioning** | Enable bucket versioning on `kleindeal-uploads` | ⏳ Awaiting S3/R2 Setup |
| 4 | **S3 Lifecycle Rules** | Expire non-current object versions after 30 days | ⏳ Awaiting S3/R2 Setup |
| 5 | **Backup Restore Verification** | Perform scheduled dry-run restore to staging instance | ⏳ Scheduled Post-Launch |

---

## 3. Manual On-Demand Backup & Restore Commands

### Manual Backup Command
```bash
pg_dump -Fc --no-acl --no-owner -h <host> -U <user> -d <dbname> > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Staging Restore Procedure
```bash
pg_restore -v --clean --no-acl --no-owner -h <staging_host> -U <user> -d <staging_dbname> backup_target.dump
```

Verify data integrity via readiness probe:
```bash
curl https://staging.kleindeal.de/api/ready
```
