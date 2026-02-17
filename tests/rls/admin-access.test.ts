// Test suite: RLS (Row Level Security) Policies
// Location: tests/rls/admin-access.test.ts
// Validates: Admin policies only allow admin users

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('RLS: Admin Access Control', () => {
  let anonClient: ReturnType<typeof createClient>;
  let adminClient: ReturnType<typeof createClient>;
  let serviceClient: ReturnType<typeof createClient>;
  
  let testAdminId: string;
  let testUserId: string;

  beforeAll(() => {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  // ============================================================================
  // SETUP: Create test users
  // ============================================================================

  beforeEach(async () => {
    // Create non-admin user
    const { data: userData } = await serviceClient.auth.admin.createUser({
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true,
    });
    testUserId = userData?.user?.id!;

    // Create admin user
    const { data: adminData } = await serviceClient.auth.admin.createUser({
      email: `test-admin-${Date.now()}@example.com`,
      password: 'AdminPassword123!',
      email_confirm: true,
    });
    testAdminId = adminData?.user?.id!;

    // Add to admin_users table
    await serviceClient.from('admin_users').insert({
      auth_user_id: testAdminId,
      email: adminData?.user?.email,
      is_active: true,
    });
  });

  // ============================================================================
  // TEST: Non-admin cannot write to products
  // ============================================================================

  test('Non-admin user CANNOT INSERT into products', async () => {
    // Login as non-admin
    const { data: authData } = await anonClient.auth.signInWithPassword({
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
    
    const nonAdminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authData?.session?.access_token}` } },
    });

    // Attempt INSERT
    const { error } = await nonAdminClient.from('products').insert({
      name: 'Hack Product',
      slug: 'hack-product',
      price: 9999,
      stock: 1000,
      category_id: 'fake-id',
    });

    // Should get permission denied (403 or similar)
    expect(error).toBeDefined();
    expect(error?.code).toMatch(/perm|auth/i);
  });

  // ============================================================================
  // TEST: Non-admin cannot see/modify admin-only products
  // ============================================================================

  test('Non-admin user CANNOT UPDATE products', async () => {
    // Create product as service role
    const { data: product } = await serviceClient
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

    // Login as non-admin
    const { data: authData } = await anonClient.auth.signInWithPassword({
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    const nonAdminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authData?.session?.access_token}` } },
    });

    // Attempt UPDATE
    const { error } = await nonAdminClient
      .from('products')
      .update({ price: 1 })
      .eq('id', product?.id);

    expect(error).toBeDefined();
    expect(error?.code).toMatch(/perm|auth/i);
  });

  // ============================================================================
  // TEST: Admin CAN write to products
  // ============================================================================

  test('Admin user CAN INSERT into products', async () => {
    // Login as admin
    const { data: authData } = await anonClient.auth.signInWithPassword({
      email: `test-admin-${Date.now()}@example.com`,
      password: 'AdminPassword123!',
    });

    const adminClientAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authData?.session?.access_token}` } },
    });

    // Attempt INSERT
    const { data, error } = await adminClientAuth
      .from('products')
      .insert({
        name: 'Admin Product',
        slug: 'admin-product',
        price: 50,
        stock: 5,
        category_id: 'test-cat',
        is_active: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.name).toBe('Admin Product');
  });

  // ============================================================================
  // TEST: Public cannot see inactive products
  // ============================================================================

  test('Public CANNOT see inactive products', async () => {
    // Create inactive product as service role
    await serviceClient.from('products').insert({
      name: 'Hidden Product',
      slug: 'hidden-product',
      price: 100,
      stock: 10,
      category_id: 'test-cat',
      is_active: false,
    });

    // Attempt SELECT as anonymous
    const { data, error } = await anonClient
      .from('products')
      .select()
      .eq('is_active', false);

    expect(error).toBeNull();
    expect(data?.length).toBe(0);
  });

  // ============================================================================
  // TEST: Customer can only see own orders
  // ============================================================================

  test('Customer user CANNOT see other customers orders', async () => {
    // Create 2 test orders as service role
    const { data: order1 } = await serviceClient
      .from('orders')
      .insert({
        customer_id: testUserId,
        status: 'pending',
        total_amount: 100,
      })
      .select()
      .single();

    const { data: order2 } = await serviceClient
      .from('orders')
      .insert({
        customer_id: 'different-customer-id',
        status: 'pending',
        total_amount: 100,
      })
      .select()
      .single();

    // Login as testUser
    const { data: authData } = await anonClient.auth.signInWithPassword({
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${authData?.session?.access_token}` } },
    });

    // SELECT orders
    const { data: orders } = await userClient.from('orders').select();

    // Should only see own order
    expect(orders?.length).toBe(1);
    expect(orders?.[0].id).toBe(order1?.id);
  });

  // ============================================================================
  // TEST: Service role can bypass RLS
  // ============================================================================

  test('Service role CAN read all data (bypass RLS)', async () => {
    // Insert test data
    await serviceClient.from('products').insert({
      name: 'Service Role Test',
      slug: 'service-role-test',
      price: 100,
      stock: 10,
      category_id: 'test-cat',
      is_active: false, // Inactive (normally hidden)
    });

    // Service role should see it
    const { data } = await serviceClient
      .from('products')
      .select()
      .eq('is_active', false);

    expect(data?.some(p => p.slug === 'service-role-test')).toBe(true);
  });

  // ============================================================================
  // CLEANUP
  // ============================================================================

  afterEach(async () => {
    // Delete test users
    if (testUserId) {
      await serviceClient.auth.admin.deleteUser(testUserId);
    }
    if (testAdminId) {
      await serviceClient.auth.admin.deleteUser(testAdminId);
    }
  });
});
