import { vi, describe, it, expect } from 'vitest';

// Mock ensureEnv BEFORE importing the API handler so tests don't require real secrets
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));
// Mock Stripe constructor to avoid requiring real API key at module load
vi.mock('stripe', () => ({ default: class StripeMock { constructor() {} } }));

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
});
