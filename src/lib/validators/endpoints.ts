// Request/Response Validators using Zod
// Location: src/lib/validators/endpoints.ts
// Purpose: Centralized validation for all API endpoints

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const UUIDSchema = z.string().uuid('Invalid UUID format');
export const EmailSchema = z.string().email('Invalid email format');
export const PositiveNumberSchema = z.number().positive('Must be positive number');
export const PositiveIntSchema = z.number().int().positive('Must be positive integer');

// ============================================================================
// CART ENDPOINTS
// ============================================================================

export const AddToCartSchema = z.object({
  product_id: UUIDSchema,
  quantity: PositiveIntSchema,
  variant_ids: z.array(UUIDSchema).optional(),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: PositiveIntSchema,
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

// ============================================================================
// ORDER ENDPOINTS
// ============================================================================

export const CreateOrderSchema = z.object({
  coupon_code: z.string().optional(),
  shipping_address: z.object({
    street: z.string().min(1, 'Street required'),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zip: z.string().min(1, 'Zip required'),
    country: z.string().min(1, 'Country required'),
  }),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ============================================================================
// COUPON ENDPOINTS
// ============================================================================

export const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code required').max(50),
  order_total: PositiveNumberSchema.optional(),
});

export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;

// ============================================================================
// RETURN ENDPOINTS
// ============================================================================

export const CreateReturnItemSchema = z.object({
  product_id: UUIDSchema.optional(),
  product_name: z.string().min(1),
  product_sku: z.string().optional(),
  quantity: PositiveIntSchema,
  unit_price: PositiveNumberSchema,
  reason: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const CreateReturnSchema = z.object({
  order_id: UUIDSchema,
  reason: z.enum(['defective', 'wrong_size', 'not_as_described', 'changed_mind']),
  notes: z.string().max(500).optional(),
  items: z.array(CreateReturnItemSchema).optional(),
});

export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;

// ============================================================================
// ADMIN: PRODUCT MANAGEMENT
// ============================================================================

export const ProductInputSchema = z.object({
  name: z.string().min(1, 'Product name required').max(255),
  slug: z.string().min(1, 'Slug required').max(255),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  stock: z.number().int().nonnegative('Stock must be non-negative').optional(),
  category_id: UUIDSchema,
  is_active: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

// ============================================================================
// ADMIN: CATEGORY MANAGEMENT
// ============================================================================

export const CategoryInputSchema = z.object({
  name: z.string().min(1, 'Category name required').max(255),
  slug: z.string().min(1, 'Slug required').max(255),
  description: z.string().max(2000).optional(),
  is_active: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;

// ============================================================================
// ADMIN: COUPON MANAGEMENT
// ============================================================================

export const CouponInputSchema = z.object({
  code: z.string().min(1, 'Code required').max(50),
  description: z.string().max(500).optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().nonnegative(),
  min_purchase: z.number().nonnegative().optional(),
  max_discount: z.number().nonnegative().optional(),
  max_uses: z.number().int().positive().optional(),
  max_uses_per_customer: z.number().int().positive().optional(),
  applicable_categories: z.array(UUIDSchema).optional(),
  applicable_products: z.array(UUIDSchema).optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  scope: z.enum(['global', 'user_specific', 'single_use']).optional(),
  customer_id: UUIDSchema.optional(),
  is_active: z.boolean().optional(),
});

export type CouponInput = z.infer<typeof CouponInputSchema>;

// ============================================================================
// WEBHOOK PAYLOADS
// ============================================================================

// Stripe webhook signature validation
export const StripeWebhookPayloadSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
    previous_attributes: z.any().optional(),
  }),
  created: z.number(),
});

export type StripeWebhookPayload = z.infer<typeof StripeWebhookPayloadSchema>;

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export const PaginationSchema = z.object({
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

export const FilterSchema = z.object({
  search: z.string().optional(),
  category_id: UUIDSchema.optional(),
  is_active: z.coerce.boolean().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  sort_by: z.enum(['created_at', 'price', 'name']).optional(),
});

export type FilterParams = z.infer<typeof FilterSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate request body against schema
 * Returns { success: true, data } or { success: false, error, details }
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details: any[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      };
    }
    return {
      success: false,
      error: 'Validation error',
      details: [],
    };
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  data: Record<string, any>
): { success: true; data: T } | { success: false; error: string; details: any[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Query validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return {
      success: false,
      error: 'Query validation error',
      details: [],
    };
  }
}

// ============================================================================
// ADMIN: CAMPAIGN MANAGEMENT
// ============================================================================

export const CampaignInputSchema = z.object({
  name: z.string().min(1, 'Campaign name required').max(255),
  slug: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().nonnegative(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  is_active: z.boolean().optional(),
  banner_image: z.string().url().optional(),
  applicable_categories: z.array(UUIDSchema).optional(),
  applicable_products: z.array(UUIDSchema).optional(),
});

export type CampaignInput = z.infer<typeof CampaignInputSchema>;

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export const SupportTicketInputSchema = z.object({
  email: EmailSchema,
  subject: z.string().min(1, 'Subject required').max(255),
  message: z.string().min(1, 'Message required').max(5000),
});

export type SupportTicketInput = z.infer<typeof SupportTicketInputSchema>;

export const SupportTicketResponseSchema = z.object({
  admin_response: z.string().min(1).max(5000),
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
});

export type SupportTicketResponseInput = z.infer<typeof SupportTicketResponseSchema>;

// ============================================================================
// STATIC PAGES
// ============================================================================

export const StaticPageInputSchema = z.object({
  slug: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

export type StaticPageInput = z.infer<typeof StaticPageInputSchema>;

// ============================================================================
// REVIEW VOTES
// ============================================================================

export const ReviewVoteInputSchema = z.object({
  review_id: UUIDSchema,
  visitor_id: z.string().min(1).max(255),
});

export type ReviewVoteInput = z.infer<typeof ReviewVoteInputSchema>;

// ============================================================================
// NEWSLETTER
// ============================================================================

export const NewsletterSubscribeSchema = z.object({
  email: EmailSchema,
});

export type NewsletterSubscribeInput = z.infer<typeof NewsletterSubscribeSchema>;
