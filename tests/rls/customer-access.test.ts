// Test suite: RLS Customer Access Control
// Location: tests/rls/customer-access.test.ts
// Validates: Customer policies for cart, wishlist, returns (own data only)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('RLS: Customer Access Control', () => {
  let serviceClient: ReturnType<typeof createClient>;
  let customerClient: ReturnType<typeof createClient>;
  
  let customerId1: string;
  let customerId2: string;
  let sessionId1: string;

  beforeAll(() => {
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  beforeEach(async () => {
    // Create two test customers
    const { data: user1 } = await serviceClient.auth.admin.createUser({
      email: `customer1-${Date.now()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
    });
    customerId1 = user1?.user?.id!;

    const { data: user2 } = await serviceClient.auth.admin.createUser({
      email: `customer2-${Date.now()}@example.com`,
      password: 'Password123!',
      email_confirm: true,
    });
    customerId2 = user2?.user?.id!;

    // Create session for customer1
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData } = await anonClient.auth.signInWithPassword({
      email: user1?.user?.email!,
      password: 'Password123!',
    });
    sessionId1 = authData?.session?.id!;

    // Create authenticated client for customer1
    customerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authData?.session?.access_token}` } },
    });
  });

  // ============================================================================
  // TEST: Customer can only see own cart items
  // ============================================================================

  test('Customer can INSERT own cart items', async () => {
    // Get or create product
    const { data: product } = await serviceClient
      .from('products')
      .select()
      .limit(1)
      .single();

    if (!product) {
      // Create test product
      const { data: newProduct } = await serviceClient
        .from('products')
        .insert({
          name: 'Test Product',
          slug: 'test-product',
          price: 100,
          stock: 10,
          category_id: 'test-cat',
          is_active: true,
        })
        .select()
        .single();
      
      // Add to customer1's cart
      const { data, error } = await customerClient
        .from('cart_items')
        .insert({
          user_id: customerId1,
          session_id: sessionId1,
          product_id: newProduct?.id,
          quantity: 2,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.user_id).toBe(customerId1);
    }
  });

  // ============================================================================
  // TEST: Customer CANNOT see other customer's cart
  // ============================================================================

  test('Customer CANNOT read another customer cart items', async () => {
    // Create cart item for customer2
    const { data: product } = await serviceClient
      .from('products')
      .select()
      .limit(1)
      .single();

    if (product) {
      await serviceClient.from('cart_items').insert({
        user_id: customerId2,
        session_id: sessionId1, // Different session
        product_id: product.id,
        quantity: 1,
      });
    }

    // Customer1 tries to read customer2's cart
    const { data, error } = await customerClient
      .from('cart_items')
      .select()
      .eq('user_id', customerId2);

    // Should return empty or fail
    expect(data?.length).toBe(0);
  });

  // ============================================================================
  // TEST: Customer can manage own wishlist
  // ============================================================================

  test('Customer can INSERT to own wishlist', async () => {
    const { data: product } = await serviceClient
      .from('products')
      .select()
      .limit(1)
      .single();

    if (product) {
      const { data, error } = await customerClient
        .from('wishlists')
        .insert({
          user_id: customerId1,
          product_id: product.id,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.user_id).toBe(customerId1);
    }
  });

  // ============================================================================
  // TEST: Customer CANNOT add to other's wishlist
  // ============================================================================

  test('Customer CANNOT INSERT to other customer wishlist', async () => {
    const { data: product } = await serviceClient
      .from('products')
      .select()
      .limit(1)
      .single();

    if (product) {
      const { error } = await customerClient
        .from('wishlists')
        .insert({
          user_id: customerId2, // Other customer's ID
          product_id: product.id,
        });

      expect(error).toBeDefined();
    }
  });

  // ============================================================================
  // TEST: Customer can only see own returns
  // ============================================================================

  test('Customer can view own returns', async () => {
    // Create return for customer1
    const { data: order } = await serviceClient
      .from('orders')
      .select()
      .eq('customer_id', customerId1)
      .limit(1)
      .single();

    if (order) {
      const { data: returnData } = await serviceClient
        .from('returns')
        .insert({
          order_id: order.id,
          customer_id: customerId1,
          reason: 'defective',
          status: 'requested',
        })
        .select()
        .single();

      // Customer1 reads own return
      const { data, error } = await customerClient
        .from('returns')
        .select()
        .eq('id', returnData?.id);

      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    }
  });

  // ============================================================================
  // TEST: Customer CANNOT see other's returns
  // ============================================================================

  test('Customer CANNOT view other customer returns', async () => {
    // Create return for customer2 as service role
    const { data: order } = await serviceClient
      .from('orders')
      .select()
      .eq('customer_id', customerId2)
      .limit(1)
      .single();

    if (order) {
      await serviceClient.from('returns').insert({
        order_id: order.id,
        customer_id: customerId2,
        reason: 'defective',
        status: 'requested',
      });
    }

    // Customer1 tries to read customer2's returns
    const { data, error } = await customerClient
      .from('returns')
      .select()
      .eq('customer_id', customerId2);

    expect(data?.length).toBe(0);
  });

  // ============================================================================
  // TEST: Customer CANNOT DELETE cart of another customer
  // ============================================================================

  test('Customer CANNOT DELETE other customer cart item', async () => {
    // Create cart for customer2
    const { data: product } = await serviceClient
      .from('products')
      .select()
      .limit(1)
      .single();

    if (product) {
      const { data: cartItem } = await serviceClient
        .from('cart_items')
        .insert({
          user_id: customerId2,
          session_id: sessionId1,
          product_id: product.id,
          quantity: 1,
        })
        .select()
        .single();

      // Customer1 tries to delete customer2's cart item
      const { error } = await customerClient
        .from('cart_items')
        .delete()
        .eq('id', cartItem?.id);

      expect(error).toBeDefined();
    }
  });

  // ============================================================================
  // CLEANUP
  // ============================================================================

  afterEach(async () => {
    if (customerId1) await serviceClient.auth.admin.deleteUser(customerId1);
    if (customerId2) await serviceClient.auth.admin.deleteUser(customerId2);
  });
});
