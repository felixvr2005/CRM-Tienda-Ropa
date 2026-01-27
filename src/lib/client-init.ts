// Client init: listen to Supabase auth changes and sync cart accordingly
import { supabase } from './supabase';
import { mergeCartOnLogin, clearCart, initCart } from '@stores/cart';
import { setUser, clearAuth } from '@stores/auth';

// Run only in the browser
if (typeof window !== 'undefined') {
  // Expose a minimal auth state for UI code that needs it synchronously
  (window as any).__FASHION_AUTH_STATE = (window as any).__FASHION_AUTH_STATE || {};

  // Initialize cart from localStorage
  try {
    initCart();
  } catch (err) {
    console.warn('initCart failed:', err);
  }

  // Subscribe to Supabase auth state changes
  try {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      (window as any).__FASHION_AUTH_STATE.user = user;

      if (event === 'SIGNED_IN' && user) {
        // Merge guest cart into user cart
        try {
          await mergeCartOnLogin(user.id);
        } catch (err) {
          console.warn('mergeCartOnLogin failed:', err);
        }

        try {
          setUser(user);
        } catch (err) {
          // noop
        }
      }

      if (event === 'SIGNED_OUT') {
        // Clear client-side cart and guest session to avoid leaking between accounts
        try {
          await clearCart(false);
        } catch (err) {
          console.warn('clearCart failed:', err);
        }

        try {
          clearAuth();
        } catch (err) {
          // noop
        }

        // Remove exposed auth state
        (window as any).__FASHION_AUTH_STATE.user = null;
      }
    });
  } catch (err) {
    console.warn('auth state listener not attached:', err);
  }
}
