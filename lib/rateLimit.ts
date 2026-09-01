import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

interface MemoryRateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryRateLimitStore = new Map<string, MemoryRateLimitRecord>();
let lastCleanup = Date.now();

function cleanupStaleMemoryRecords() {
  const now = Date.now();
  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    memoryRateLimitStore.forEach((record, key) => {
      if (now > record.resetTime) {
        memoryRateLimitStore.delete(key);
      }
    });
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

let redisClient: Redis | null = null;

if (env.REDIS_URL && env.REDIS_URL.startsWith('redis')) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisClient.connect().catch((err) => {
      logger.warn('Redis connection fallback to memory limiter:', { error: err.message });
    });
  } catch (err: any) {
    logger.warn('Redis initialization error:', { error: err.message });
  }
}

/**
 * In-memory fallback rate limiting check (safe for serverless and development)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  cleanupStaleMemoryRecords();
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
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
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
      const redisKey = `${env.REDIS_KEY_PREFIX}ratelimit:${key}`;
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
      logger.warn('Redis rate limit fallback to memory:', err);
    }
  }

  return checkRateLimit(key, maxRequests, windowSeconds);
}

/**
 * Check Redis health status
 */
export async function checkRedisHealth(): Promise<{ ok: boolean; error?: string }> {
  if (!env.REDIS_URL) {
    return { ok: true };
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
