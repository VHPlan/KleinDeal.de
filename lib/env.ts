import { z } from 'zod';

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().optional().default('file:./dev.db'),
  DIRECT_DATABASE_URL: z.string().optional(),

  // Redis / Rate Limiting
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().default('kleindeal:'),

  // Email
  EMAIL_PROVIDER: z.enum(['development_log', 'smtp', 'resend', 'test']).default('development_log'),
  EMAIL_FROM: z.string().default('KleinDeal.de <noreply@kleindeal.de>'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  S3_KEY_PREFIX: z.string().default(''),

  // Security & Staging Gate
  SESSION_SECRET: z.string().default('kleindeal_secure_session_secret_fallback_key_2026_min32'),
  STAGING_ACCESS_PASSWORD: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),

  // Feature Flags
  NEXT_PUBLIC_DEMO_MODE: z.enum(['true', 'false']).default('false'),
  AI_LISTING_ASSISTANT_ENABLED: z.enum(['true', 'false']).default('false'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  parsedEnv = envSchema.parse({});
}

export const env = parsedEnv;

/**
 * Scoped environment validation functions (lazy, invoked on demand)
 */

export function validateDatabaseConfig(): { valid: boolean; error?: string } {
  const url = env.DATABASE_URL;
  if (!url) return { valid: false, error: 'DATABASE_URL is not configured' };
  if (env.NODE_ENV === 'production' && (url.startsWith('file:') || url.includes('.db'))) {
    return { valid: false, error: 'Production requires a PostgreSQL DATABASE_URL' };
  }
  return { valid: true };
}

export function validateSessionSecret(): { valid: boolean; error?: string } {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return { valid: false, error: 'SESSION_SECRET must be at least 32 characters' };
  }
  if (env.NODE_ENV === 'production') {
    const uniqueChars = new Set(secret.split('')).size;
    if (secret.includes('fallback') || uniqueChars < 12) {
      return { valid: false, error: 'SESSION_SECRET must be a high-entropy random string' };
    }
  }
  return { valid: true };
}

export function validateStorageConfig(): { valid: boolean; error?: string } {
  if (env.STORAGE_PROVIDER === 's3') {
    if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      return { valid: false, error: 'S3 storage requires S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY' };
    }
  }
  return { valid: true };
}

export function validateEmailConfig(): { valid: boolean; error?: string } {
  if (env.EMAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
    return { valid: false, error: 'RESEND_API_KEY is required for Resend email provider' };
  }
  if (env.EMAIL_PROVIDER === 'smtp' && !env.SMTP_HOST) {
    return { valid: false, error: 'SMTP_HOST is required for SMTP email provider' };
  }
  return { valid: true };
}

/**
 * Validates that an origin or URL matches the trusted APP_URL
 */
export function isTrustedOrigin(urlOrOrigin: string): boolean {
  try {
    const target = new URL(urlOrOrigin, env.APP_URL);
    const appOrigin = new URL(env.APP_URL);
    return (
      target.origin === appOrigin.origin ||
      target.hostname === 'kleindeal.de' ||
      target.hostname === 'www.kleindeal.de' ||
      target.hostname.endsWith('.kleindeal.de') ||
      target.hostname.endsWith('.vercel.app') ||
      target.hostname === 'localhost' ||
      target.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}
