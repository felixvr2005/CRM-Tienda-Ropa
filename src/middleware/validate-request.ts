// @ts-nocheck
// Validation Middleware for API Endpoints
// Location: src/middleware/validate-request.ts
// Purpose: Express middleware to validate all incoming requests

import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidatedRequest extends Request {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
}

// ============================================================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================================================

/**
 * Factory function to create validation middleware
 * Usage: app.post('/api/cart', validateRequest({ body: AddToCartSchema }), handler)
 */
export function validateRequest(options: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return async (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (options.body && ['POST', 'PATCH', 'PUT'].includes(req.method)) {
        try {
          req.validatedBody = await options.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Invalid request body',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code,
              })),
            });
          }
          throw error;
        }
      }

      // Validate query parameters
      if (options.query && req.method === 'GET') {
        try {
          req.validatedQuery = await options.query.parseAsync(req.query);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Invalid query parameters',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code,
              })),
            });
          }
          throw error;
        }
      }

      // Validate URL parameters
      if (options.params) {
        try {
          req.validatedParams = await options.params.parseAsync(req.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Invalid path parameters',
              details: error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code,
              })),
            });
          }
          throw error;
        }
      }

      next();
    } catch (error) {
      console.error('[ValidateRequest] Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// ============================================================================
// CONVENIENCE MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Body validation only (for POST/PATCH/PUT)
 */
export function validateBody(schema: z.ZodSchema) {
  return validateRequest({ body: schema });
}

/**
 * Query validation only (for GET)
 */
export function validateQuery(schema: z.ZodSchema) {
  return validateRequest({ query: schema });
}

/**
 * Params validation only (for :id routes)
 */
export function validateParams(schema: z.ZodSchema) {
  return validateRequest({ params: schema });
}

// ============================================================================
// COMBINED VALIDATORS
// ============================================================================

export function validateBodyAndQuery(body?: z.ZodSchema, query?: z.ZodSchema) {
  return validateRequest({ body, query });
}

export function validateBodyAndParams(body?: z.ZodSchema, params?: z.ZodSchema) {
  return validateRequest({ body, params });
}

export function validateAll(
  body?: z.ZodSchema,
  query?: z.ZodSchema,
  params?: z.ZodSchema
) {
  return validateRequest({ body, query, params });
}

// ============================================================================
// ERROR RESPONSE UTILITIES
// ============================================================================

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  statusCode: number,
  message: string,
  details: any[] = []
) {
  res.status(statusCode).json({
    error: message,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) {
  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// SUCCESS RESPONSE UTILITIES
// ============================================================================

export function sendSuccess(res: Response, statusCode: number, data: any) {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function sendSuccessWithMeta(
  res: Response,
  statusCode: number,
  data: any,
  meta: any
) {
  res.status(statusCode).json({
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  });
}
