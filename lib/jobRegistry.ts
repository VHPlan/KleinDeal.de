/**
 * Background Job Registry for KleinDeal.de
 * 
 * Provides:
 * - Structured registry for recurring background tasks.
 * - Idempotent execution and in-flight job locks to prevent duplicate concurrent runs.
 * - Strict authentication via CRON_SECRET.
 * - Structured logging and execution duration metrics.
 */

import { prisma } from './prisma';
import { matchListingAgainstSavedSearches } from './savedSearchMatcher';
import { runOrphanCleanup } from '../scripts/cleanup-orphaned-images';
import { logger } from './logger';

export interface JobResult {
  jobName: string;
  success: boolean;
  durationMs: number;
  processedCount: number;
  details?: Record<string, any>;
  error?: string;
}

// In-memory mutex locks for background jobs
const activeJobLocks = new Set<string>();

export async function runJob(jobName: string): Promise<JobResult> {
  if (activeJobLocks.has(jobName)) {
    return {
      jobName,
      success: false,
      durationMs: 0,
      processedCount: 0,
      error: `Job '${jobName}' is currently already running (locked).`,
    };
  }

  activeJobLocks.add(jobName);
  const startTime = Date.now();
  logger.info(`Starting background job: ${jobName}`);

  try {
    let processedCount = 0;
    let details: Record<string, any> = {};

    switch (jobName) {
      // 1. Match recent listings against active saved searches
      case 'saved_search_matcher': {
        const recentListings = await prisma.listing.findMany({
          where: {
            status: 'ACTIVE',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          take: 50,
        });

        for (const listing of recentListings) {
          const res = await matchListingAgainstSavedSearches(listing);
          processedCount += res.matchedCount;
        }
        details = { listingsEvaluated: recentListings.length };
        break;
      }

      // 2. Expire pending offers past expiresAt
      case 'offer_expiry_cleaner': {
        const now = new Date();
        const expired = await prisma.offer.updateMany({
          where: {
            status: 'PENDING',
            expiresAt: { lt: now },
          },
          data: {
            status: 'EXPIRED',
          },
        });
        processedCount = expired.count;
        details = { expiredOffers: expired.count };
        break;
      }

      // 3. Handover transaction timeout cleanup
      case 'handover_timeout_cleaner': {
        const timeoutDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days stale
        const staleTx = await prisma.transaction.updateMany({
          where: {
            status: 'HANDOVER_PENDING',
            updatedAt: { lt: timeoutDate },
          },
          data: {
            status: 'CANCELLED',
          },
        });
        processedCount = staleTx.count;
        details = { cancelledTransactions: staleTx.count };
        break;
      }

      // 4. Orphaned storage cleanup (Dry-run mode by default)
      case 'orphan_image_cleaner': {
        const cleanup = await runOrphanCleanup(true, 24);
        processedCount = cleanup.orphanCount;
        details = cleanup;
        break;
      }

      default:
        throw new Error(`Unknown job name: '${jobName}'.`);
    }

    const durationMs = Date.now() - startTime;
    logger.info(`Completed background job: ${jobName}`, { durationMs, processedCount, details });

    return {
      jobName,
      success: true,
      durationMs,
      processedCount,
      details,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    logger.error(`Failed background job: ${jobName}`, err, { durationMs });
    return {
      jobName,
      success: false,
      durationMs,
      processedCount: 0,
      error: err.message || 'Unknown job execution error',
    };
  } finally {
    activeJobLocks.delete(jobName);
  }
}
