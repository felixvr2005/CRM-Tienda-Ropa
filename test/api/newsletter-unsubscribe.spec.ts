import { vi, describe, it, expect } from 'vitest';

// Mock ensureEnv and supabaseAdmin
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));
const mockUpdate = vi.fn().mockResolvedValue({ error: null, data: [{ email: 'a@b.com' }] });
const mockSelect = vi.fn().mockResolvedValue({ data: null });
vi.mock('@lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ maybeSingle: async () => ({ data: null }) }),
      update: mockUpdate,
      eq: () => ({})
    })
  }
}));

import { GET, POST } from '../../src/pages/api/newsletter/unsubscribe';

describe('newsletter/unsubscribe API', () => {
  it('GET without params -> 400', async () => {
    const req = new Request('http://localhost/api/newsletter/unsubscribe');
    const res: any = await (GET as any)({ request: req });
    expect(res.status).toBe(400);
  });

  it('POST without body -> 400', async () => {
    const req = new Request('http://localhost/api/newsletter/unsubscribe', { method: 'POST', body: JSON.stringify({}) });
    const res: any = await (POST as any)({ request: req });
    expect(res.status).toBe(400);
  });
});