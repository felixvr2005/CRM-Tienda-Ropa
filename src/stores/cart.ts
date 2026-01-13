/**
 * Cart Store - Nano Stores
 * Estado global del carrito con persistencia
 * - localStorage para invitados
 * - Servidor para usuarios logueados
 */
import { atom, computed } from 'nanostores';

export interface CartItem {
  id: string; // variant_id o cart_item_id del servidor
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number; // Precio final (con descuento aplicado)
  originalPrice: number; // Precio original sin descuento
  discount: number; // Porcentaje de descuento
  image: string;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
}

// Estado del carrito
export const $cart = atom<CartItem[]>([]);
export const $isCartOpen = atom<boolean>(false);
export const $isCartSyncing = atom<boolean>(false);

// ID del cliente logueado (null si invitado)
export const $customerId = atom<string | null>(null);

// Computed: número total de items
export const $cartCount = computed($cart, (cart) =>
  cart.reduce((sum, item) => sum + item.quantity, 0)
);

// Computed: subtotal
export const $cartSubtotal = computed($cart, (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// Computed: total ahorrado
export const $cartSavings = computed($cart, (cart) =>
  cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
);

// Computed: hay items?
export const $hasItems = computed($cart, (cart) => cart.length > 0);

// Obtener session ID para invitados
export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('fashionstore_guest_session');
  if (!sessionId) {
    sessionId = 'guest_' + crypto.randomUUID();
    localStorage.setItem('fashionstore_guest_session', sessionId);
  }
  return sessionId;
}

// Inicializar desde localStorage
export function initCart() {
  if (typeof window === 'undefined') return;
  
  try {
    const saved = localStorage.getItem('fashionstore_cart');
    const expires = localStorage.getItem('fashionstore_cart_expires');
    
    if (saved && expires) {
      const expiresDate = new Date(expires);
      if (expiresDate > new Date()) {
        $cart.set(JSON.parse(saved));
      } else {
        clearCart();
      }
    }
  } catch (e) {
    console.error('Error loading cart:', e);
  }
}

// Guardar en localStorage
function saveCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('fashionstore_cart', JSON.stringify(cart));
    // Expira en 7 días
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    localStorage.setItem('fashionstore_cart_expires', expires.toISOString());
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

// Añadir al carrito
export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
  const cart = $cart.get();
  const existingIndex = cart.findIndex(i => i.variantId === item.variantId);
  
  let newCart: CartItem[];
  
  if (existingIndex >= 0) {
    // Ya existe, actualizar cantidad
    newCart = cart.map((i, idx) => {
      if (idx === existingIndex) {
        const newQty = Math.min(i.quantity + quantity, i.maxStock);
        return { ...i, quantity: newQty };
      }
      return i;
    });
  } else {
    // Nuevo item
    newCart = [...cart, { ...item, quantity: Math.min(quantity, item.maxStock) }];
  }
  
  $cart.set(newCart);
  saveCart(newCart);
  $isCartOpen.set(true);
}

// Actualizar cantidad
export function updateQuantity(variantId: string, quantity: number) {
  const cart = $cart.get();
  
  if (quantity <= 0) {
    removeFromCart(variantId);
    return;
  }
  
  const newCart = cart.map(item => {
    if (item.variantId === variantId) {
      return { ...item, quantity: Math.min(quantity, item.maxStock) };
    }
    return item;
  });
  
  $cart.set(newCart);
  saveCart(newCart);
}

// Eliminar del carrito
export function removeFromCart(variantId: string) {
  const cart = $cart.get();
  const newCart = cart.filter(item => item.variantId !== variantId);
  $cart.set(newCart);
  saveCart(newCart);
}

// Limpiar carrito
export function clearCart() {
  $cart.set([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fashionstore_cart');
    localStorage.removeItem('fashionstore_cart_expires');
  }
}

// Cargar carrito del servidor (para usuarios logueados)
export async function loadCartFromServer(customerId: string) {
  $isCartSyncing.set(true);
  try {
    const response = await fetch(`/api/cart?customerId=${customerId}`);
    if (response.ok) {
      const { items } = await response.json();
      $cart.set(items);
      $customerId.set(customerId);
    }
  } catch (e) {
    console.error('Error loading cart from server:', e);
  } finally {
    $isCartSyncing.set(false);
  }
}

// Merge carrito de invitado con usuario logueado
export async function mergeCartOnLogin(customerId: string) {
  const guestCart = $cart.get();
  const sessionId = getGuestSessionId();
  
  if (guestCart.length === 0) {
    // No hay carrito de invitado, solo cargar del servidor
    await loadCartFromServer(customerId);
    return;
  }

  $isCartSyncing.set(true);
  try {
    // Enviar items del carrito de invitado al servidor
    await fetch('/api/cart/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        customerId,
        items: guestCart
      })
    });
    
    // Limpiar localStorage
    localStorage.removeItem('fashionstore_cart');
    localStorage.removeItem('fashionstore_cart_expires');
    localStorage.removeItem('fashionstore_guest_session');
    
    // Cargar carrito actualizado del servidor
    await loadCartFromServer(customerId);
  } catch (e) {
    console.error('Error merging cart:', e);
  } finally {
    $isCartSyncing.set(false);
  }
}

// Toggle carrito
export function toggleCart() {
  $isCartOpen.set(!$isCartOpen.get());
}

export function openCart() {
  $isCartOpen.set(true);
}

export function closeCart() {
  $isCartOpen.set(false);
}

