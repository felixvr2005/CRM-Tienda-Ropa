import { vi, describe, it, expect } from 'vitest';

// Mock ensureEnv so handler loads
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));

// Mocks for stripe webhook verification and supabaseAdmin
let mockConstructEvent: any = null;
vi.mock('stripe', () => {
  // reference the outer variable (assign in test body)
  return {
    default: class StripeMock {
      constructor() {}
      webhooks = { constructEvent: (...args: any[]) => mockConstructEvent(...args) };
    }
  };
});

// Spy on Supabase admin queries
const mockFrom = vi.fn();
vi.mock('@lib/supabase', () => ({
  supabaseAdmin: {
    from: (...args: any[]) => ({
      select: (...s: any[]) => ({ single: async () => ({ data: null }) }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      // allow chaining and custom behaviors in tests by inspecting mockFrom
      eq: () => ({ single: async () => ({ data: null }) }),
    })
  }
}));

import { POST } from '../../src/pages/api/webhooks/stripe';

describe('Stripe webhook - idempotency', () => {
  it('returns 200 and does nothing if order already exists for session', async () => {
    // Simulate Stripe event body (raw) and signature header
    const fakeEvent = { type: 'checkout.session.completed', data: { object: { id: 'sess_123', metadata: { items: '[]' } } } };
    // assign the mock function before it's called by the mocked Stripe class
    mockConstructEvent = vi.fn();
    mockConstructEvent.mockReturnValue(fakeEvent);

    // Mock supabase to return an existing order when checking stripe_checkout_session_id
    const supabase = await import('../../src/lib/supabase');
    // Replace implementation for this scenario (select().eq().single())
    (supabase.supabaseAdmin.from as any) = () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'order_1', order_number: '000001' } }) }) })
    });

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 't=123,v1=abc' },
      body: JSON.stringify(fakeEvent)
    });

    const res: any = await (POST as any)({ request: req });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
