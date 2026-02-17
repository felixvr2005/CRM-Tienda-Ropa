// Tests for Cart Validator
// Location: tests/cart-validator.test.ts

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

// Mock cart validator - in production would import from src/lib/cart-validator
type CartValidator = any;
const getCartValidator = () => ({});

describe('CartValidator', () => {
  let supabase: ReturnType<typeof createClient>;
  let validator: CartValidator;
  let testProductId: string;
  let testCategoryId: string;
  let testCouponId: string;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    validator = getCartValidator();
  });

  beforeEach(async () => {
    // Create test category
    const { data: category } = await supabase
      .from('categories')
      .insert({ name: 'Test Category', slug: `test-cat-${Date.now()}`, is_active: true })
      .select()
      .single();
    testCategoryId = category?.id;

    // Create test product
    const { data: product } = await supabase
      .from('products')
      .insert({
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        price: 100,
        stock: 10,
        category_id: testCategoryId,
        is_active: true,
      })
      .select()
      .single();
    testProductId = product?.id;

    // Create test coupon
    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: 'TEST10',
        discount_percentage: 10,
        is_active: true,
      })
      .select()
      .single();
    testCouponId = coupon?.id;
  });

  // ========================================================================
  // TEST: Valid cart
  // ========================================================================

  test('validate cart - valid items', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 2,
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.items.length).toBe(1);
    expect(result.items[0].subtotal).toBe(200); // 100 * 2
    expect(result.subtotal).toBe(200);
  });

  // ========================================================================
  // TEST: Quantity exceeds stock
  // ========================================================================

  test('validate cart - insufficient stock', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 15, // Only 10 in stock
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Insufficient stock');
  });

  // ========================================================================
  // TEST: Product not found
  // ========================================================================

  test('validate cart - product not found', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: '00000000-0000-0000-0000-000000000000',
        quantity: 1,
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('not found');
  });

  // ========================================================================
  // TEST: Inactive product
  // ========================================================================

  test('validate cart - inactive product', async () => {
    // Deactivate product
    await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', testProductId);

    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 1,
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('no longer available');

    // Reactivate for cleanup
    await supabase
      .from('products')
      .update({ is_active: true })
      .eq('id', testProductId);
  });

  // ========================================================================
  // TEST: Tax calculation
  // ========================================================================

  test('validate cart - tax calculation (8%)', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 1, // $100
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(true);
    expect(result.subtotal).toBe(100);
    expect(result.tax_amount).toBe(8); // 100 * 0.08
    expect(result.total).toBe(108); // 100 + 8
  });

  // ========================================================================
  // TEST: Multiple items
  // ========================================================================

  test('validate cart - multiple items', async () => {
    // Create second product
    const { data: product2 } = await supabase
      .from('products')
      .insert({
        name: 'Test Product 2',
        slug: `test-product-2-${Date.now()}`,
        price: 50,
        stock: 5,
        category_id: testCategoryId,
        is_active: true,
      })
      .select()
      .single();

    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 2, // $100 * 2 = $200
      },
      {
        id: 'cart-item-2',
        product_id: product2?.id,
        quantity: 1, // $50 * 1 = $50
      },
    ];

    const result = await validator.validateCart(cartItems);

    expect(result.valid).toBe(true);
    expect(result.items.length).toBe(2);
    expect(result.subtotal).toBe(250); // 200 + 50
  });

  // ========================================================================
  // TEST: Coupon - percentage discount
  // ========================================================================

  test('validate coupon - percentage discount', async () => {
    const couponValidation = await validator.validateCoupon('TEST10', 100);

    expect(couponValidation.valid).toBe(true);
    expect(couponValidation.discount_amount).toBe(10); // 100 * 10%
  });

  // ========================================================================
  // TEST: Coupon - invalid code
  // ========================================================================

  test('validate coupon - invalid code', async () => {
    const couponValidation = await validator.validateCoupon('INVALID_CODE', 100);

    expect(couponValidation.valid).toBe(false);
    expect(couponValidation.error).toContain('not found');
  });

  // ========================================================================
  // TEST: Coupon - expired
  // ========================================================================

  test('validate coupon - expired', async () => {
    // Create expired coupon
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await supabase
      .from('coupons')
      .insert({
        code: 'EXPIRED_CODE',
        discount_percentage: 10,
        is_active: true,
        valid_until: yesterday.toISOString(),
      });

    const couponValidation = await validator.validateCoupon('EXPIRED_CODE', 100);

    expect(couponValidation.valid).toBe(false);
    expect(couponValidation.error).toContain('expired');
  });

  // ========================================================================
  // TEST: Coupon - usage limit reached
  // ========================================================================

  test('validate coupon - usage limit reached', async () => {
    // Create limited coupon
    const { data: limitedCoupon } = await supabase
      .from('coupons')
      .insert({
        code: 'LIMITED_USE',
        discount_percentage: 5,
        is_active: true,
        max_uses: 1,
        used_count: 1,
      })
      .select()
      .single();

    const couponValidation = await validator.validateCoupon('LIMITED_USE', 100);

    expect(couponValidation.valid).toBe(false);
    expect(couponValidation.error).toContain('usage limit');
  });

  // ========================================================================
  // TEST: Cart with coupon
  // ========================================================================

  test('validate cart - with valid coupon', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 1, // $100
      },
    ];

    const result = await validator.validateCart(cartItems, 'TEST10');

    expect(result.valid).toBe(true);
    expect(result.discount_amount).toBe(10); // 10% of $100
    expect(result.subtotal).toBe(100);
    // Tax on (100 - 10) = $7.20, rounded to $7.2
    expect(result.total).toBeCloseTo(97.2, 1);
  });

  // ========================================================================
  // TEST: Check stock
  // ========================================================================

  test('check stock - sufficient', async () => {
    const result = await validator.checkStock(testProductId, 5);

    expect(result.available).toBe(true);
  });

  test('check stock - insufficient', async () => {
    const result = await validator.checkStock(testProductId, 15);

    expect(result.available).toBe(false);
    expect(result.message).toContain('Only');
  });

  // ========================================================================
  // TEST: Cart summary
  // ========================================================================

  test('get cart summary', async () => {
    const cartItems = [
      {
        id: 'cart-item-1',
        product_id: testProductId,
        quantity: 2,
      },
    ];

    const summary = await validator.getCartSummary(cartItems);

    expect(summary.itemCount).toBe(2);
    expect(summary.subtotal).toBe(200);
    expect(summary.estimatedTotal).toBeCloseTo(216, 1); // 200 + tax
  });

  // ========================================================================
  // CLEANUP
  // ========================================================================

  afterEach(async () => {
    if (testProductId) {
      await supabase.from('products').delete().eq('id', testProductId);
    }
    if (testCategoryId) {
      await supabase.from('categories').delete().eq('id', testCategoryId);
    }
    if (testCouponId) {
      await supabase.from('coupons').delete().eq('id', testCouponId);
    }
  });
});
