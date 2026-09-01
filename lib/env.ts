import { z } from 'zod';

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),
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
  SESSION_SECRET: z.string().min(32).default('kleindeal_secure_session_secret_fallback_key_2026_min32'),
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

let validatedEnv: EnvConfig;

try {
  validatedEnv = envSchema.parse(process.env);
  
  // Strict Production & Staging Fail-Fast Validation
  if (validatedEnv.NODE_ENV === 'production' && validatedEnv.APP_ENV !== 'test') {
    const errors: string[] = [];

    // 1. In production / staging, APP_URL must use HTTPS (unless running on localhost during build)
    if (!validatedEnv.APP_URL.startsWith('https://') && !validatedEnv.APP_URL.includes('localhost')) {
      errors.push('APP_URL must use https:// in staging and production.');
    }

    // 2. In production / staging, Database must NOT be SQLite
    if (validatedEnv.DATABASE_URL.startsWith('file:') || validatedEnv.DATABASE_URL.includes('.db')) {
      errors.push('Staging and Production must use a PostgreSQL DATABASE_URL, not local SQLite.');
    }

    // 3. In production / staging, Session secret must have strong entropy and not use fallback
    const secret = validatedEnv.SESSION_SECRET;
    const uniqueChars = new Set(secret.split('')).size;
    const isWeakOrPlaceholder =
      secret.includes('fallback') ||
      secret.includes('placeholder') ||
      secret.includes('secret_key') ||
      secret.includes('123456') ||
      uniqueChars < 12;

    if (isWeakOrPlaceholder || secret.length < 32) {
      errors.push('SESSION_SECRET must be a cryptographically secure random key (>= 32 chars, high entropy, e.g. "openssl rand -hex 32").');
    }

    // 4. In production / staging, S3 storage must be configured
    if (validatedEnv.STORAGE_PROVIDER !== 's3' || !validatedEnv.S3_BUCKET || !validatedEnv.S3_ACCESS_KEY_ID || !validatedEnv.S3_SECRET_ACCESS_KEY) {
      errors.push('Staging and Production require STORAGE_PROVIDER=s3 with S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.');
    }

    // 5. In production / staging, Redis must be configured
    if (!validatedEnv.REDIS_URL) {
      errors.push('Staging and Production require REDIS_URL for distributed rate limiting.');
    }

    // 6. In production / staging, Email must not use development_log
    if (validatedEnv.EMAIL_PROVIDER === 'development_log') {
      errors.push('Staging and Production require a real EMAIL_PROVIDER (resend or smtp).');
    }

    // 7. Staging specific checks
    if (validatedEnv.APP_ENV === 'staging') {
      if (!validatedEnv.STAGING_ACCESS_PASSWORD) {
        console.warn('⚠️ [SECURITY NOTICE] STAGING_ACCESS_PASSWORD is not set. Staging site will rely on platform-level deployment protection.');
      }
    }

    if (errors.length > 0) {
      console.error('❌ CRITICAL ENVIRONMENT CONFIGURATION ERRORS:\n' + errors.join('\n'));
      if (process.env.STRICT_ENV_VALIDATION === 'true') {
        throw new Error('Critical environment configuration errors.');
      }
    }
  }
} catch (error: any) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:', error.format());
  } else {
    console.error('❌ Environment initialization error:', error.message);
  }
  validatedEnv = envSchema.parse({});
}

export const env = validatedEnv;

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
      target.hostname.endsWith('.kleindeal.de') ||
      target.hostname === 'localhost' ||
      target.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}
