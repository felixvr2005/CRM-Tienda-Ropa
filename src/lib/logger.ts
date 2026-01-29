/**
 * Simple logger wrapper
 * - debug: enabled only when NODE_ENV !== 'production' or LOG_LEVEL=debug
 * - info/warn/error: always emit (but can be routed to external sinks later)
 */
const isDebug = ((): boolean => {
  try {
    const env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || (import.meta as any).env?.NODE_ENV;
    const level = (typeof process !== 'undefined' && process.env && process.env.LOG_LEVEL) || (import.meta as any).env?.LOG_LEVEL;
    return env !== 'production' || level === 'debug';
  } catch (e) {
    return false;
  }
})();

// Optional Sentry integration (only if SENTRY_DSN is provided)
let Sentry: any = null;
try {
  const dsn = (typeof process !== 'undefined' && process.env && process.env.SENTRY_DSN) || (import.meta as any).env?.SENTRY_DSN;
  if (dsn) {
    // lazy-require to avoid adding runtime dependency when not configured
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/node');
    Sentry.init({ dsn, tracesSampleRate: 0.0 });
  }
} catch (e) {
  // If Sentry isn't installed or init fails, continue silently
  Sentry = null;
}

export const logger = {
  debug: (...args: any[]) => {
    if (!isDebug) return;
    if (console.debug) console.debug(...args);
    else console.log('[debug]', ...args);
  },
  info: (...args: any[]) => {
    if (console.info) console.info(...args);
    else console.log('[info]', ...args);
  },
  warn: (...args: any[]) => {
    if (console.warn) console.warn(...args);
    else console.log('[warn]', ...args);
    if (Sentry) Sentry.captureMessage(args.map(String).join(' '), 'warning');
  },
  error: (...args: any[]) => {
    if (console.error) console.error(...args);
    else console.log('[error]', ...args);
    if (Sentry) Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(args.map(String).join(' ')));
  }
};
