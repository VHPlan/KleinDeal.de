/**
 * KleinDeal.de Configuration
 * 
 * DEMO MODE CONFIGURATION:
 * Safe explicit boolean parsing: ONLY `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` evaluates to `true`.
 * Missing variables, empty strings, or any value other than 'true' (such as 'false') safely default to false.
 * 
 * To enable Demo Mode: Set NEXT_PUBLIC_DEMO_MODE=true in .env.local
 * To disable Demo Mode: Set NEXT_PUBLIC_DEMO_MODE=false or remove the variable in .env.local
 */

export const IS_DEMO_MODE_ENABLED = false;
