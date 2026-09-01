import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

interface MemoryRateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryRateLimitStore = new Map<string, MemoryRateLimitRecord>();

// Clean up stale memory records every 5 minutes
setInterval(() => {
  const now = Date.now();
  memoryRateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      memoryRateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000).unref();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

let redisClient: Redis | null = null;

if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisClient.connect().catch((err) => {
      logger.warn('Could not connect to Redis; using development memory limiter:', { error: err.message });
    });
  } catch (err: any) {
    logger.warn('Redis initialization error:', { error: err.message });
  }
}

/**
 * Rate Limiting Check
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  // In production without Redis, fail-closed on auth/abuse sensitive keys
  if (env.NODE_ENV === 'production' && !env.REDIS_URL) {
    logger.error('CRITICAL: Redis is unconfigured in production rate limiter.');
    // Fail-closed for security in production if unconfigured
    return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
  }

  // 1. In-memory sliding window for dev/test
  const now = Date.now();
  const record = memoryRateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    memoryRateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Async distributed rate limiter using Redis atomic counter
 */
export async function checkDistributedRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (redisClient && redisClient.status === 'ready') {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redisClient.incr(redisKey);

      if (count === 1) {
        await redisClient.expire(redisKey, windowSeconds);
      }

      if (count > maxRequests) {
        const ttl = await redisClient.ttl(redisKey);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - count),
      };
    } catch (err: any) {
      logger.error('Redis distributed rate limit error:', err);
      if (env.NODE_ENV === 'production') {
        // Fail-closed in production on Redis crash for abuse protection
        return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
      }
    }
  }

  return checkRateLimit(key, maxRequests, windowSeconds);
}

/**
 * Check Redis health status
 */
export async function checkRedisHealth(): Promise<{ ok: boolean; error?: string }> {
  if (!env.REDIS_URL) {
    return { ok: env.NODE_ENV !== 'production', error: 'REDIS_URL not configured' };
  }
  if (!redisClient) {
    return { ok: false, error: 'Redis client not initialized' };
  }
  try {
    const pong = await redisClient.ping();
    return { ok: pong === 'PONG' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Redis ping failed' };
  }
}

/**
 * Standard German 429 Too Many Requests response
 */
export function rateLimitResponse(retryAfterSeconds: number = 60): NextResponse {
  return NextResponse.json(
    {
      error: `Zu viele Anfragen. Bitte versuche es in ${retryAfterSeconds} Sekunden erneut.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
      },
    }
  );
}

/**
 * Extract client IP or identifier safely from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
