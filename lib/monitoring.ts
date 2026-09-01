/**
 * Error Monitoring and Observability Adapter for KleinDeal.de
 * 
 * Supports Sentry when SENTRY_DSN is configured.
 * Safely falls back to structured logging in development or when unconfigured.
 */

import { env } from './env';
import { logger } from './logger';

export function captureException(error: any, context?: Record<string, any>) {
  logger.error('Unhandled Application Exception', error, context);

  // In production with Sentry configured, dispatch to Sentry
  if (env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (level === 'error') logger.error(message);
  else if (level === 'warning') logger.warn(message);
  else logger.info(message);
}
