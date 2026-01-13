/**
 * Auth Store - Nano Stores
 * Maneja autenticación separada para clientes y admin
 */
import { atom, computed } from 'nanostores';
import type { User } from '@supabase/supabase-js';

export interface CustomerProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_subscribed_newsletter: boolean;
}

export interface AuthState {
  user: User | null;
  customer: CustomerProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

// Estado de autenticación
export const $auth = atom<AuthState>({
  user: null,
  customer: null,
  isAdmin: false,
  isLoading: true,
  error: null,
});

// Computed: está autenticado?
export const $isAuthenticated = computed($auth, (auth) => !!auth.user);

// Computed: nombre para mostrar
export const $displayName = computed($auth, (auth) => {
  if (auth.customer?.first_name) {
    return auth.customer.first_name;
  }
  if (auth.user?.email) {
    return auth.user.email.split('@')[0];
  }
  return 'Invitado';
});

// Setters
export function setUser(user: User | null) {
  $auth.set({ ...$auth.get(), user, isLoading: false });
}

export function setCustomer(customer: CustomerProfile | null) {
  $auth.set({ ...$auth.get(), customer });
}

export function setIsAdmin(isAdmin: boolean) {
  $auth.set({ ...$auth.get(), isAdmin });
}

export function setAuthLoading(isLoading: boolean) {
  $auth.set({ ...$auth.get(), isLoading });
}

export function setAuthError(error: string | null) {
  $auth.set({ ...$auth.get(), error });
}

export function clearAuth() {
  $auth.set({
    user: null,
    customer: null,
    isAdmin: false,
    isLoading: false,
    error: null,
  });
}

// Session ID para invitados (persistente)
export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('fashionstore_guest_session');
  if (!sessionId) {
    sessionId = 'guest_' + crypto.randomUUID();
    localStorage.setItem('fashionstore_guest_session', sessionId);
  }
  return sessionId;
}

export function clearGuestSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fashionstore_guest_session');
}
