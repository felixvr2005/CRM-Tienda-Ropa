// @ts-nocheck
// Rate Limiting & DDoS Protection Middleware
// Location: src/middleware/rate-limit.ts
// Purpose: Prevent brute force, DDoS, and excessive API usage

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

// ============================================================================
// REDIS CLIENT (Optional - falls back to in-memory)
// ============================================================================

let redisClient: any = null;

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });
  redisClient.connect().catch((err: any) => {
    console.error('Redis connection failed, using in-memory store:', err);
    redisClient = null;
  });
}

// ============================================================================
// RATE LIMITERS BY ENDPOINT
// ============================================================================

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:api:',
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// ============================================================================
// AUTHENTICATION ENDPOINTS - Strict rate limiting
// ============================================================================

// Login: 5 attempts per 15 minutes per IP (prevent brute force)
export const loginLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:login:',
      })
    : undefined,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email (if provided) OR IP
    const email = req.body?.email;
    return email ? `${email}` : req.ip || 'unknown';
  },
});

// Register: 3 attempts per hour per IP
export const registerLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:register:',
      })
    : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email ? `${email}` : req.ip || 'unknown';
  },
});

// Password reset: 3 attempts per hour per IP
export const passwordResetLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:password-reset:',
      })
    : undefined,
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email ? `${email}` : req.ip || 'unknown';
  },
});

// ============================================================================
// CHECKOUT & PAYMENT ENDPOINTS
// ============================================================================

// Checkout: 10 requests per minute per user (prevent rapid order spam)
export const checkoutLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:checkout:',
      })
    : undefined,
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many checkout requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user_id if authenticated, otherwise by IP
    const userId = req.user?.id;
    return userId ? `user:${userId}` : req.ip || 'unknown';
  },
});

// Stripe Webhook: 100 requests per minute per IP (Stripe sends in batch)
export const webhookLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:webhook:',
      })
    : undefined,
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if Stripe signature is valid (indicate trusted source)
    // This requires Stripe signature validation middleware to run first
    return req.stripeSignatureValid === true;
  },
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

// ============================================================================
// CART & PRODUCT ENDPOINTS
// ============================================================================

// Add to cart: 30 requests per minute per user
export const addToCartLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:add-to-cart:',
      })
    : undefined,
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many add-to-cart requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id;
    return userId ? `user:${userId}` : req.ip || 'unknown';
  },
});

// Product list: 60 requests per minute per IP (reasonable for browsing)
export const productListLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:products:',
      })
    : undefined,
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many product list requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Admin operations: 30 requests per minute per admin user
export const adminLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:admin:',
      })
    : undefined,
  windowMs: 60 * 1000,
  max: 30,
  message: 'Admin rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const adminId = req.user?.admin_id;
    return adminId ? `admin:${adminId}` : req.ip || 'unknown';
  },
  skip: (req) => {
    // Skip if not authenticated as admin
    return !req.user?.admin_id;
  },
});

// Bulk import: 2 requests per hour per admin (heavy operation)
export const bulkImportLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:bulk-import:',
      })
    : undefined,
  windowMs: 60 * 60 * 1000,
  max: 2,
  message: 'Bulk import limit exceeded (max 2 per hour)',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const adminId = req.user?.admin_id;
    return adminId ? `admin:${adminId}` : req.ip || 'unknown';
  },
});

// ============================================================================
// SEARCH ENDPOINTS - Protect from search-based enumeration
// ============================================================================

// Search: 20 requests per minute per IP
export const searchLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:search:',
      })
    : undefined,
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many search requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

// ============================================================================
// GLOBAL ERROR HANDLER FOR RATE LIMIT ERRORS
// ============================================================================

export function handleRateLimitError(error: any, req: any, res: any, next: any) {
  if (error.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.retryAfter || 60,
      message: error.message,
    });
  }
  next(error);
}

// ============================================================================
// CUSTOM RATE LIMIT FACTORY (for dynamic limits)
// ============================================================================

export function createCustomLimiter(options: {
  windowMs: number;
  max: number;
  prefix: string;
  keyGenerator?: (req: any) => string;
}) {
  return rateLimit({
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix: options.prefix,
        })
      : undefined,
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'unknown'),
  });
}

// ============================================================================
// MONITORING & METRICS
// ============================================================================

export function getRedisStore() {
  return redisClient;
}

export async function getRateLimitMetrics() {
  if (!redisClient) {
    return { message: 'Redis not available, using in-memory store' };
  }

  const keys = await redisClient.keys('rl:*');
  return {
    total_limits_tracked: keys.length,
    prefixes: {
      api: keys.filter((k: string) => k.startsWith('rl:api:')).length,
      login: keys.filter((k: string) => k.startsWith('rl:login:')).length,
      checkout: keys.filter((k: string) => k.startsWith('rl:checkout:')).length,
      webhook: keys.filter((k: string) => k.startsWith('rl:webhook:')).length,
    },
  };
}

// ============================================================================
// CLEANUP ON SHUTDOWN
// ============================================================================

process.on('exit', async () => {
  if (redisClient) {
    await redisClient.disconnect();
  }
});
