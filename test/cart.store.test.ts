import { beforeEach, describe, expect, it, vi } from 'vitest';
import { $cart, initCart, clearCart, getCartTimeRemaining, startCartExpirationTimer } from '../src/stores/cart';

// JSDOM localStorage is available in Vitest by default

describe('cart store - persistence & expiration', () => {
  beforeEach(() => {
    localStorage.clear();
    $cart.set([]);
  });

  it('saves and loads cart from localStorage via initCart/saveCart', () => {
    // Simular que hay un carrito guardado
    const mock = [{ id: 'v1', variantId: 'v1', productId: 'p1', name: 'P', slug: 'p', price: 10, originalPrice: 12, discount: 0, image: '', size: 'M', color: 'Negro', quantity: 2, maxStock: 10 }];
    localStorage.setItem('fashionstore_cart', JSON.stringify(mock));
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    localStorage.setItem('fashionstore_cart_expires', expires.toISOString());

    initCart();
    const state = $cart.get();
    expect(state.length).toBe(1);
    expect(state[0].variantId).toBe('v1');
  });

  it('clears cart and removes keys from localStorage', async () => {
    const mock = [{ id: 'v1', variantId: 'v1', productId: 'p1', name: 'P', slug: 'p', price: 10, originalPrice: 12, discount: 0, image: '', size: 'M', color: 'Negro', quantity: 2, maxStock: 10 }];
    $cart.set(mock);
    localStorage.setItem('fashionstore_cart', JSON.stringify(mock));
    localStorage.setItem('fashionstore_cart_expires', new Date().toISOString());

    await clearCart(false);
    expect($cart.get().length).toBe(0);
    expect(localStorage.getItem('fashionstore_cart')).toBeNull();
    expect(localStorage.getItem('fashionstore_cart_expires')).toBeNull();
  });

  it('startCartExpirationTimer returns valid remaining time (non-negative)', () => {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 5);
    localStorage.setItem('fashionstore_cart_expires', expires.toISOString());

    startCartExpirationTimer();
    const remaining = getCartTimeRemaining();
    expect(remaining).toBeGreaterThanOrEqual(0);
  });
});
