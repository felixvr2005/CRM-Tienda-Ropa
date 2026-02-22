// Cart Validator & Price Calculator
// Location: src/lib/cart-validator.ts
// Purpose: Comprehensive cart validation before checkout

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Obtener variables de entorno de forma compatible con Astro y Node
function getEnvVar(name: string): string {
  return (typeof import.meta !== 'undefined' && import.meta.env?.[name]) || process.env[name] || '';
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  variant_ids?: string[];
}

interface ValidatedCart {
  valid: boolean;
  errors: string[];
  items: ValidatedCartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
}

interface ValidatedCartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variants: any[];
}

// ============================================================================
// VALIDATORS
// ============================================================================

const CartItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  variant_ids: z.array(z.string().uuid()).optional(),
});

const CouponSchema = z.object({
  code: z.string().min(1),
  discount_percentage: z.number().optional(),
  discount_amount: z.number().optional(),
});

// ============================================================================
// CART VALIDATOR CLASS
// ============================================================================

export class CartValidator {
  private supabase;

  constructor() {
    // Usar service_role para bypasear RLS (validaciones de servidor)
    this.supabase = createClient(
      getEnvVar('PUBLIC_SUPABASE_URL') || getEnvVar('SUPABASE_URL'),
      getEnvVar('SUPABASE_SERVICE_KEY') || getEnvVar('SUPABASE_ANON_KEY')
    );
  }

  /**
   * Validate entire cart before checkout
   */
  async validateCart(items: CartItem[], couponCode?: string): Promise<ValidatedCart> {
    const errors: string[] = [];
    const validatedItems: ValidatedCartItem[] = [];
    let subtotal = 0;

    // ========================================================================
    // 1. VALIDATE CART ITEMS STRUCTURE
    // ========================================================================

    for (const item of items) {
      try {
        CartItemSchema.parse(item);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Item ${item.id}: ${error.errors[0].message}`);
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        items: [],
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        total: 0,
      };
    }

    // ========================================================================
    // 2. FETCH PRODUCT DATA
    // ========================================================================

    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select('id, name, price, stock, is_active')
      .in('id', productIds);

    if (productsError) {
      errors.push('Failed to fetch product data');
      return {
        valid: false,
        errors,
        items: [],
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        total: 0,
      };
    }

    const productMap = new Map(products?.map((p) => [p.id, p]) || []);

    // ========================================================================
    // 3. VALIDATE EACH CART ITEM
    // ========================================================================

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        errors.push(`Product ${item.product_id} not found`);
        continue;
      }

      if (!product.is_active) {
        errors.push(`Product "${product.name}" is no longer available`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
        continue;
      }

      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for "${product.name}"`);
        continue;
      }

      // ====================================================================
      // 4. FETCH & VALIDATE VARIANTS
      // ====================================================================

      let variants: any[] = [];
      if (item.variant_ids && item.variant_ids.length > 0) {
        const { data: variantData, error: variantError } = await this.supabase
          .from('variants')
          .select('id, type, value, stock')
          .in('id', item.variant_ids)
          .eq('product_id', item.product_id);

        if (variantError) {
          errors.push(`Failed to fetch variants for "${product.name}"`);
          continue;
        }

        // Validate all variants exist and are available
        for (const variantId of item.variant_ids) {
          const variant = variantData?.find((v) => v.id === variantId);
          if (!variant) {
            errors.push(`Variant not found for "${product.name}"`);
            continue;
          }

          if (variant.stock <= 0) {
            errors.push(`Variant "${variant.value}" out of stock for "${product.name}"`);
          }

          variants.push(variant);
        }
      }

      // ====================================================================
      // 5. CALCULATE ITEM TOTAL
      // ====================================================================

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        id: item.id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: itemSubtotal,
        variants,
      });
    }

    // ========================================================================
    // 6. VALIDATE COUPON (if provided)
    // ========================================================================

    let discountAmount = 0;

    if (couponCode) {
      const couponValidation = await this.validateCoupon(couponCode, subtotal);

      if (!couponValidation.valid) {
        errors.push(`Coupon error: ${couponValidation.error}`);
      } else {
        discountAmount = couponValidation.discount_amount || 0;
      }
    }

    // ========================================================================
    // 7. CALCULATE TOTALS
    // ========================================================================

    const taxRate = 0.08; // 8% tax (configurable)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
    const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    // ========================================================================
    // 8. RETURN VALIDATION RESULT
    // ========================================================================

    return {
      valid: errors.length === 0,
      errors,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
    };
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(
    code: string,
    orderTotal: number
  ): Promise<{
    valid: boolean;
    error?: string;
    discount_amount?: number;
    discount_percentage?: number;
  }> {
    try {
      // Fetch coupon
      const { data: coupon, error: couponError } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (couponError || !coupon) {
        return { valid: false, error: 'Coupon code not found' };
      }

      // Check if active
      if (!coupon.is_active) {
        return { valid: false, error: 'Coupon is no longer valid' };
      }

      // Check expiration
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return { valid: false, error: 'Coupon has expired' };
      }

      if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
        return { valid: false, error: 'Coupon is not yet valid' };
      }

      // Check usage limit
      if (coupon.max_uses && coupon.max_uses > 0) {
        if (coupon.used_count >= coupon.max_uses) {
          return { valid: false, error: 'Coupon usage limit reached' };
        }
      }

      // Calculate discount
      let discountAmount = 0;

      if (coupon.discount_percentage) {
        discountAmount = Math.round((orderTotal * coupon.discount_percentage) / 100 * 100) / 100;
      } else if (coupon.discount_amount) {
        discountAmount = coupon.discount_amount;
      }

      // Discount cannot exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      return {
        valid: true,
        discount_amount: discountAmount,
        discount_percentage: coupon.discount_percentage,
      };
    } catch (error) {
      return { valid: false, error: 'Error validating coupon' };
    }
  }

  /**
   * Check individual product stock
   */
  async checkStock(productId: string, quantity: number): Promise<{ available: boolean; message: string }> {
    const { data: product, error } = await this.supabase
      .from('products')
      .select('stock, name')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return { available: false, message: 'Product not found' };
    }

    if (product.stock < quantity) {
      return {
        available: false,
        message: `Only ${product.stock} items available for "${product.name}"`,
      };
    }

    return { available: true, message: 'Stock available' };
  }

  /**
   * Get cart summary (for display purposes)
   */
  async getCartSummary(items: CartItem[]): Promise<{
    itemCount: number;
    subtotal: number;
    estimatedTotal: number;
  }> {
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const { data: products } = await this.supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    const productMap = new Map(products?.map((p) => [p.id, p.price]) || []);

    let subtotal = 0;
    for (const item of items) {
      const price = productMap.get(item.product_id) || 0;
      subtotal += price * item.quantity;
    }

    const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
    const estimatedTotal = subtotal + taxAmount;

    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100,
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let validatorInstance: CartValidator | null = null;

export function getCartValidator(): CartValidator {
  if (!validatorInstance) {
    validatorInstance = new CartValidator();
  }
  return validatorInstance;
}
