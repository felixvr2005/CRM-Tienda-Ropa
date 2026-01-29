import { vi, describe, it, expect } from 'vitest';

// Mock ensureEnv BEFORE importing the API handler so tests don't require real secrets
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));

// Mock supabaseAdmin and nodemailer to make the handler deterministic
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockResolvedValue({ data: null });
vi.mock('@lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({
      upsert: mockUpsert,
      select: () => ({ maybeSingle: async () => ({ data: null }) }),
      eq: () => ({ maybeSingle: async () => ({ data: null }) })
    })
  }
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: async () => ({ messageId: 'mocked' }) }) }
}));

import { POST as subscribe } from '../../src/pages/api/newsletter/subscribe';

describe('POST /api/newsletter/subscribe (validation)', () => {
  it('returns 400 when email is missing', async () => {
    const req = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const res: any = await (subscribe as any)({ request: req });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/Email requerido/i);
  });

  it('returns 400 when email is invalid', async () => {
    const req = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });

    const res: any = await (subscribe as any)({ request: req });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/Email inválido/i);
  });

  it('returns a discount code on success (mocked)', async () => {
    const nowEmail = `test+${Date.now()}@example.com`;
    const req = new Request('http://localhost/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nowEmail })
    });

    const res: any = await (subscribe as any)({ request: req });
    expect([200,201].includes(res.status)).toBeTruthy();
    const json = await res.json();
    expect(json.code).toBeDefined();
  });
});
