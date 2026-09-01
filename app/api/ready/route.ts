import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { emailService } from '@/lib/email';
import { checkRedisHealth } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} check timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function GET() {
  let isReady = true;
  const failureReasons: string[] = [];

  // 1. Check Database connection with 2000ms timeout
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2000, 'Database');
  } catch (err: any) {
    isReady = false;
    failureReasons.push('database_unavailable');
    logger.error('Readiness check: Database unresponsive', err);
  }

  // 2. Check Storage adapter with 2000ms timeout
  try {
    const storageHealth = await withTimeout(storage.checkHealth(), 2000, 'Storage');
    if (!storageHealth.ok) {
      isReady = false;
      failureReasons.push('storage_unavailable');
      logger.error('Readiness check: Storage unhealthy', storageHealth.error);
    }
  } catch (err: any) {
    isReady = false;
    failureReasons.push('storage_unavailable');
    logger.error('Readiness check: Storage timed out', err);
  }

  // 3. Check Redis / Rate Limiting with 2000ms timeout
  try {
    const redisHealth = await withTimeout(checkRedisHealth(), 2000, 'Redis');
    if (!redisHealth.ok && process.env.NODE_ENV === 'production') {
      isReady = false;
      failureReasons.push('redis_unavailable');
      logger.error('Readiness check: Redis unhealthy in production', redisHealth.error);
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      isReady = false;
      failureReasons.push('redis_unavailable');
      logger.error('Readiness check: Redis timed out in production', err);
    }
  }

  // 4. Check Email configuration (Does NOT send email)
  try {
    const emailHealth = await withTimeout(emailService.checkHealth(), 2000, 'Email');
    if (!emailHealth.ok && process.env.NODE_ENV === 'production') {
      isReady = false;
      failureReasons.push('email_unconfigured');
      logger.error('Readiness check: Email unconfigured in production', emailHealth.error);
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      isReady = false;
      failureReasons.push('email_unconfigured');
      logger.error('Readiness check: Email check timed out', err);
    }
  }

  if (isReady) {
    return NextResponse.json({ status: 'ready' }, { status: 200 });
  } else {
    // Return generic status without leaking internal infrastructure details
    return NextResponse.json(
      { status: 'unavailable' },
      { status: 503 }
    );
  }
}
