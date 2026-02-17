// Test suite: Stock Concurrency Control
// Location: tests/concurrency/stock-reserve.test.ts
// Validates: Concurrent stock reservations don't oversell
// Issue: Database stock integrity under high concurrency

import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('Stock Concurrency: Reserve and Restore Functions', () => {
  let supabase: ReturnType<typeof createClient>;
  let testProductId: string;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  });

  beforeEach(async () => {
    // Create test product with limited stock
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: 'Concurrency Test Product',
        slug: `test-concurrent-${Date.now()}`,
        price: 50,
        stock: 10, // Only 10 items available
        category_id: 'test-cat',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
    testProductId = product?.id;
  });

  // ============================================================================
  // TEST: Sequential reserves don't exceed stock
  // ============================================================================

  test('Sequential stock reserves: stock decreases correctly', async () => {
    // Reserve 5 units
    const { data: result1 } = await supabase.rpc('descontar_stock', {
      p_product_id: testProductId,
      p_cantidad: 5,
    });

    // Verify stock was reserved
    const { data: product1 } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product1?.stock).toBe(5); // 10 - 5 = 5

    // Reserve another 3 units
    const { data: result2 } = await supabase.rpc('descontar_stock', {
      p_product_id: testProductId,
      p_cantidad: 3,
    });

    // Verify new stock
    const { data: product2 } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product2?.stock).toBe(2); // 5 - 3 = 2
  });

  // ============================================================================
  // TEST: Cannot reserve more than available
  // ============================================================================

  test('Reserve fails when quantity exceeds stock', async () => {
    // Try to reserve 15 units (only 10 available)
    const { data, error } = await supabase.rpc('descontar_stock', {
      p_product_id: testProductId,
      p_cantidad: 15,
    });

    // Should fail or return success=false
    expect(error || data?.success === false).toBeTruthy();
  });

  // ============================================================================
  // TEST: Concurrent reserves (race condition protection)
  // ============================================================================

  test('Concurrent reserves: 10 simultaneous requests on 10-item stock', async () => {
    // Create 10 concurrent reservation requests
    // Each tries to reserve 1 item from stock of 10

    const promises = Array.from({ length: 10 }).map((_, index) =>
      supabase.rpc('descontar_stock', {
        p_product_id: testProductId,
        p_cantidad: 1,
      })
    );

    const results = await Promise.allSettled(promises);

    // Count successes
    const successes = results.filter(
      (r) => r.status === 'fulfilled' && r.value.data?.success !== false
    );

    // Count failures (expected: 0 failures, all should succeed since stock=10)
    const failures = results.filter(
      (r) => r.status === 'rejected' || r.value.data?.success === false
    );

    expect(successes.length).toBe(10);
    expect(failures.length).toBe(0);

    // Verify stock is now 0
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product?.stock).toBe(0);
  });

  // ============================================================================
  // TEST: Concurrent reserves exceed stock (oversell prevention)
  // ============================================================================

  test('Concurrent reserves: 11 requests on 10-item stock (1 should fail)', async () => {
    // Create 11 concurrent requests on 10-item stock
    // Expected: 10 succeed, 1 fails

    const promises = Array.from({ length: 11 }).map((_, index) =>
      supabase.rpc('descontar_stock', {
        p_product_id: testProductId,
        p_cantidad: 1,
      })
    );

    const results = await Promise.allSettled(promises);

    const successes = results.filter(
      (r) => r.status === 'fulfilled' && r.value.data?.success !== false
    );

    const failures = results.filter(
      (r) => r.status === 'rejected' || r.value.data?.success === false
    );

    // 10 should succeed, 1 should fail
    expect(successes.length).toBeGreaterThanOrEqual(10);
    expect(failures.length).toBeGreaterThan(0);

    // Final stock should be 0 (not negative!)
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product?.stock).toBeGreaterThanOrEqual(0);
  });

  // ============================================================================
  // TEST: Stock restore function works
  // ============================================================================

  test('Restore stock: aumenta cantidad después de reserve', async () => {
    // Reserve 5 items
    await supabase.rpc('descontar_stock', {
      p_product_id: testProductId,
      p_cantidad: 5,
    });

    // Verify stock is 5
    const { data: reserved } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();
    expect(reserved?.stock).toBe(5);

    // Restore 3 items
    await supabase.rpc('restaurar_stock', {
      p_product_id: testProductId,
      p_cantidad: 3,
    });

    // Verify stock is 8
    const { data: restored } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();
    expect(restored?.stock).toBe(8);
  });

  // ============================================================================
  // TEST: Large concurrent load test
  // ============================================================================

  test('Large concurrent load: 50 simultaneous requests', async () => {
    // Reset product to 50 items
    await supabase
      .from('products')
      .update({ stock: 50 })
      .eq('id', testProductId);

    // 50 concurrent requests, each reserving 1
    const promises = Array.from({ length: 50 }).map(() =>
      supabase.rpc('descontar_stock', {
        p_product_id: testProductId,
        p_cantidad: 1,
      })
    );

    const results = await Promise.allSettled(promises);
    const successes = results.filter((r) => r.status === 'fulfilled');

    expect(successes.length).toBe(50);

    // Stock should be exactly 0
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product?.stock).toBe(0);
  });

  // ============================================================================
  // TEST: Mixed concurrent operations (reserve + restore)
  // ============================================================================

  test('Mixed operations: concurrent reserves and restores', async () => {
    // Mix of reserve (odd) and restore (even) operations
    const promises = Array.from({ length: 20 }).map((_, index) => {
      if (index % 2 === 0) {
        // Reserve
        return supabase.rpc('descontar_stock', {
          p_product_id: testProductId,
          p_cantidad: 1,
        });
      } else {
        // Restore
        return supabase.rpc('restaurar_stock', {
          p_product_id: testProductId,
          p_cantidad: 1,
        });
      }
    });

    const results = await Promise.allSettled(promises);
    expect(results.filter((r) => r.status === 'fulfilled').length).toBeGreaterThan(0);

    // After 10 reserves and 10 restores, stock should still be valid
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();

    expect(product?.stock).toBeGreaterThanOrEqual(0);
  });

  // ============================================================================
  // CLEANUP
  // ============================================================================

  afterEach(async () => {
    if (testProductId) {
      await supabase
        .from('products')
        .delete()
        .eq('id', testProductId);
    }
  });
});
