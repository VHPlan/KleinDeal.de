/**
 * Structured Server Logger for KleinDeal.de
 * 
 * Enforces:
 * - JSON output in production
 * - Correlation IDs for request tracing
 * - Strict field redaction (passwords, session cookies, tokens, emails, phone numbers, full private messages)
 */

export interface LogPayload {
  level: 'info' | 'warn' | 'error' | 'security';
  message: string;
  correlationId?: string;
  route?: string;
  durationMs?: number;
  userId?: string;
  meta?: Record<string, any>;
}

const REDACTED_KEYS = [
  'password',
  'token',
  'secret',
  'cookie',
  'authorization',
  'resettoken',
  'verificationtoken',
  'sessionsecret',
  'handovercode',
  'email',
  'phone',
  'content',
  'api_key',
  'apikey',
];

function sanitizeValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;

  const lowerKey = key.toLowerCase();
  if (REDACTED_KEYS.some((k) => lowerKey.includes(k))) {
    return '[REDACTED]';
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const sanitizedObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitizedObj[k] = sanitizeValue(k, v);
    }
    return sanitizedObj;
  }

  if (Array.isArray(value)) {
    return value.map((item, idx) => sanitizeValue(`${key}_${idx}`, item));
  }

  return value;
}

export function sanitizeMeta(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta) return undefined;
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(meta)) {
    sanitized[key] = sanitizeValue(key, value);
  }

  return sanitized;
}

export const logger = {
  info(message: string, meta?: Record<string, any>, correlationId?: string) {
    outputLog({ level: 'info', message, meta, correlationId });
  },

  warn(message: string, meta?: Record<string, any>, correlationId?: string) {
    outputLog({ level: 'warn', message, meta, correlationId });
  },

  error(message: string, error?: any, meta?: Record<string, any>, correlationId?: string) {
    const errorDetails = error instanceof Error
      ? { errorName: error.name, errorMessage: error.message }
      : { error };
    outputLog({ level: 'error', message, meta: { ...meta, ...errorDetails }, correlationId });
  },

  security(message: string, meta?: Record<string, any>, correlationId?: string) {
    outputLog({ level: 'security', message, meta, correlationId });
  },
};

function outputLog(payload: LogPayload) {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = sanitizeMeta(payload.meta);

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for Datadog / CloudWatch / GCP Logging
    console.log(
      JSON.stringify({
        timestamp,
        ...payload,
        meta: sanitizedMeta,
      })
    );
  } else {
    // Pretty print for development
    const prefix = `[${timestamp}] [${payload.level.toUpperCase()}]`;
    console.log(`${prefix} ${payload.message}`, sanitizedMeta || '');
  }
}
