import { describe, expect, it } from 'vitest';
import { normalizeCouponForClient } from '../src/lib/coupons';

describe('normalizeCouponForClient', () => {
  it('normalizes a percent-off coupon', () => {
    const raw = { code: 'WELCOME', percent_off: 20 };
    const out = normalizeCouponForClient(raw as any);
    expect(out).toMatchObject({ code: 'WELCOME', discount_percentage: 20, discount_amount: 0, discount_type: 'percentage' });
  });

  it('normalizes an amount_off coupon (cents)', () => {
    const raw = { code: 'FIX10', amount_off: 1000 }; // 10.00 EUR
    const out = normalizeCouponForClient(raw as any);
    expect(out).toMatchObject({ code: 'FIX10', discount_amount: 10.0, discount_percentage: 0, discount_type: 'fixed' });
  });

  it('returns null for falsy input', () => {
    expect(normalizeCouponForClient(null)).toBeNull();
  });
});
