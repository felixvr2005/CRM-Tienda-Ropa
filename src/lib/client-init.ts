import { logger } from '@lib/logger';
// Client init: listen to Supabase auth changes and sync cart accordingly
import { supabase } from './supabase';
import { mergeCartOnLogin, clearCart, initCart } from '@stores/cart';
import { setUser, clearAuth } from '@stores/auth';

// Run only in the browser
if (typeof window !== 'undefined') {
  // Expose a minimal auth state for UI code that needs it synchronously
  (window as any).__FASHION_AUTH_STATE = (window as any).__FASHION_AUTH_STATE || {};

  // Initialize cart from localStorage (always — this is the primary source of truth)
  try {
    initCart();
  } catch (err) {
    logger.warn('initCart failed:', err);
  }

  // Subscribe to Supabase auth state changes
  try {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      (window as any).__FASHION_AUTH_STATE.user = user;

      // INITIAL_SESSION fires on every page load — just restore user state, don't touch cart
      if (event === 'INITIAL_SESSION' && user) {
        try {
          setUser(user);
        } catch (_err) {
          // noop
        }
        return;
      }

      // SIGNED_IN fires only on actual new login (not page reload in Supabase v2.39+)
      // Use sessionStorage flag to prevent double-merge if event fires multiple times
      if (event === 'SIGNED_IN' && user) {
        const mergeKey = `fashionstore_merged_${user.id}`;
        const alreadyMerged = sessionStorage.getItem(mergeKey);

        if (!alreadyMerged) {
          try {
            await mergeCartOnLogin(user.id);
            sessionStorage.setItem(mergeKey, '1');
          } catch (err) {
            logger.warn('mergeCartOnLogin failed:', err);
          }
        }

        try {
          setUser(user);
        } catch (_err) {
          // noop
        }
      }

      // TOKEN_REFRESHED — just update user, don't touch cart
      if (event === 'TOKEN_REFRESHED' && user) {
        try {
          setUser(user);
        } catch (_err) {
          // noop
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        // Clear client-side cart and guest session to avoid leaking between accounts
        try {
          await clearCart(false);
        } catch (err) {
          logger.warn('clearCart failed:', err);
        }

        try {
          clearAuth();
        } catch (_err) {
          // noop
        }

        // Clear merge flags
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key?.startsWith('fashionstore_merged_')) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (_err) {
          // noop
        }

        // Remove exposed auth state
        (window as any).__FASHION_AUTH_STATE.user = null;
      }
    });
  } catch (err) {
    logger.warn('auth state listener not attached:', err);
  }
}
