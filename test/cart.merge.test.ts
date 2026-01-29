import { describe, it, expect, beforeEach, vi } from 'vitest';
import { $cart, getGuestSessionId, initCart, mergeCartOnLogin } from '../src/stores/cart';

beforeEach(() => {
  localStorage.clear();
  $cart.set([]);
});

describe('mergeCartOnLogin', () => {
  it('posts guest cart to /api/cart/merge and clears localStorage', async () => {
    // Setup guest cart
    const mockCart = [{ id: 'v1', variantId: 'v1', productId: 'p1', name: 'P', slug: 'p', price: 10, originalPrice: 12, discount: 0, image: '', size: 'M', color: 'Negro', quantity: 2, maxStock: 10 }];
    localStorage.setItem('fashionstore_cart', JSON.stringify(mockCart));
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    localStorage.setItem('fashionstore_cart_expires', expires.toISOString());
    localStorage.setItem('fashionstore_guest_session', 'guest_test_123');

    // Init cart from localStorage so $cart contains guest items
    initCart();

    // Mock fetch to handle /api/cart/merge and /api/cart
    const fetchMock = vi.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/cart/merge')) {
        return { ok: true, json: async () => ({ success: true }) } as any;
      }
      if (url.includes('/api/cart?customerId=')) {
        return { ok: true, json: async () => ({ items: [] }) } as any;
      }
      return { ok: false } as any;
    });

    vi.stubGlobal('fetch', fetchMock);

    await mergeCartOnLogin('cust_123');

    // After merge, localStorage keys should be removed
    expect(localStorage.getItem('fashionstore_cart')).toBeNull();
    expect(localStorage.getItem('fashionstore_cart_expires')).toBeNull();
    expect(localStorage.getItem('fashionstore_guest_session')).toBeNull();

    // fetch called for merge and for loading cart
    expect(fetchMock).toHaveBeenCalled();
    const mergeCall = fetchMock.mock.calls.find(c => (c[0] as string).includes('/api/cart/merge'));
    expect(mergeCall).toBeDefined();
  });

  it('when guest cart empty, only loads cart from server', async () => {
    // Ensure cart empty
    $cart.set([]);

    const fetchMock = vi.fn(async (input: any) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/cart?customerId=')) {
        return { ok: true, json: async () => ({ items: [{ id: 'v2', variantId: 'v2', productId: 'p2', name: 'Q', slug: 'q', price: 5, originalPrice: 5, discount: 0, image: '', size: 'S', color: 'Blanco', quantity: 1, maxStock: 10 }] }) } as any;
      }
      return { ok: false } as any;
    });

    vi.stubGlobal('fetch', fetchMock);

    await mergeCartOnLogin('cust_789');

    const cartState = $cart.get();
    expect(cartState.length).toBe(1);
    expect(cartState[0].variantId).toBe('v2');
  });
});
