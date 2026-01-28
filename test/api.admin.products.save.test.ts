import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabaseAdmin module BEFORE importing the handler
vi.mock('@lib/supabase', () => {
  return {
    supabaseAdmin: {
      from: (table: string) => ({
        insert: (payload: any) => {
          if (table === 'products') {
            // support chaining: .insert(...).select(...).single()
            return {
              select: (_sel: string) => ({
                single: async () => ({ data: { id: 'prod_test_1' } })
              })
            };
          }

          if (table === 'product_variants') {
            return { error: null };
          }

          return { error: null, data: null };
        }
      })
    }
  };
});

import { POST } from '../src/pages/api/admin/products/save';

// Mock cookies helper
function makeCookies(getValue?: string) {
  return {
    get: (name: string) => ({ value: getValue }),
    delete: () => {}
  } as any;
}

describe('POST /api/admin/products/save', () => {
  it('creates product and inserts variants when payload is valid and auth cookie present', async () => {
    const productPayload = {
      name: 'Test Product',
      product_type_id: 'type_1',
      price: 19.99,
    };

    const body = JSON.stringify({ ...productPayload, variants: [{ size: 'M', color: 'Negro', stock: 10 }] });
    const request = new Request('http://localhost/api/admin/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const response = await POST({ request, cookies: makeCookies('dummy_token') } as any);
    const json = await response.json();
    console.log('SAVE response:', response.status, json);

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.productId).toBeDefined();
  });

  it('returns 401 when sb-access-token cookie missing', async () => {
    const productPayload = { name: 'P', product_type_id: 't', price: 1 };
    const request = new Request('http://localhost/api/admin/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productPayload })
    });

    const response = await POST({ request, cookies: makeCookies(undefined) } as any);
    expect(response.status).toBe(401);
  });
});
