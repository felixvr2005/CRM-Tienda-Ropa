import { describe, it, expect, vi } from 'vitest';

// prevent ensureEnv from failing during import
vi.mock('@lib/ensureEnv', () => ({ ensureEnv: () => true }));
// Mock supabase used by the helper
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'v1', price: 1000, stock: 5, product: { name: 'Zapato Mock', images: [] } } }) }) })
    })
  }
}));

import { buildStripeLineItems } from '../../src/pages/api/checkout/create-session';

describe('buildStripeLineItems', () => {
  it('adds a shipping line item when shippingCost > 0 and correctly converts to cents', async () => {
    const items = [{ variantId: 'v1', quantity: 1, price: 12.5 }];
    const lineItems = await buildStripeLineItems(items, 4.95);

    expect(Array.isArray(lineItems)).toBe(true);
    const shipping = lineItems.find(li => /env[ií]o/i.test(li.price_data.product_data.name));
    expect(shipping).toBeDefined();
    expect(shipping.price_data.unit_amount).toBe(495);

    const product = lineItems.find(li => li.price_data.product_data.name === 'Zapato Mock');
    expect(product).toBeDefined();
    expect(product.price_data.unit_amount).toBe(1250);
  });
});
