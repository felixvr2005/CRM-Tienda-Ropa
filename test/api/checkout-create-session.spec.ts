import { vi, describe, it, expect } from 'vitest';

// Mock ensureEnv BEFORE importing the API handler so tests don't require real secrets
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));

// Provide a Stripe mock with a spyable checkout.sessions.create implementation
vi.mock('stripe', () => {
  const _mc = vi.fn().mockResolvedValue({ id: 'sess_test_1', url: 'https://stripe.test/session' });
  return {
    default: class StripeMock {
      static __mockCreate = _mc;
      checkout = { sessions: { create: _mc } } as any;
      coupons = { create: vi.fn().mockResolvedValue({ id: 'cp_test' }) } as any;
      constructor() {}
    }
  };
});

// ensure ensureEnv doesn't throw during import
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));

// Mock minimal supabase responses required by the handler (product_variants select + stock check)
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { stock: 10, product: { name: 'Test product', images: [] } } }) }) })
    })
  }
}));

import { POST as createSession } from '../../src/pages/api/checkout/create-session';

describe('POST /api/checkout/create-session (validation)', () => {
  it('returns 400 when required data is missing (no items)', async () => {
    const req = new Request('http://localhost/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', items: [] })
    });

    const res: any = await (createSession as any)({ request: req });
    expect(res).toBeDefined();
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.error).toMatch(/Datos incompletos/i);
  });

  it('includes shipping as a line item when shippingCost > 0', async () => {
    const Stripe = await import('stripe');
    const mockCreate = Stripe.default.__mockCreate;
    mockCreate.mockClear();

    const payload = {
      email: 'buyer@example.com',
      items: [{ variantId: 'v1', quantity: 1, price: 10.00 }],
      subtotal: 10.00,
      shippingCost: 4.95,
      shippingMethod: 'standard',
      discount: 0
    };

    const req = new Request('http://localhost/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const res: any = await (createSession as any)({ request: req });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBeDefined();
    expect(mockCreate).toHaveBeenCalled();

    const calledWith = mockCreate.mock.calls[0][0];
    const shippingLine = (calledWith.line_items || []).find((li: any) => /env[ií]o/i.test(li.price_data.product_data.name));
    expect(shippingLine).toBeDefined();
    expect(shippingLine.price_data.unit_amount).toBe(495); // 4.95€ -> 495 cents
  });
});
