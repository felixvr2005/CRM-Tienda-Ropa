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
        // Iniciar timer de expiración
        startCartExpirationTimer();
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
    // Expira en 15 minutos (para liberar stock reservado)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);
    localStorage.setItem('fashionstore_cart_expires', expires.toISOString());
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

// Añadir al carrito con reserva de stock
export async function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
  const cart = $cart.get();
  const existingIndex = cart.findIndex(i => i.variantId === item.variantId);
  
  let newCart: CartItem[];
  let quantityToReserve = quantity;
  
  if (existingIndex >= 0) {
    // Ya existe, calcular cuánto más reservar
    const existingItem = cart[existingIndex];
    const newQty = Math.min(existingItem.quantity + quantity, existingItem.maxStock);
    quantityToReserve = newQty - existingItem.quantity;
    
    newCart = cart.map((i, idx) => {
      if (idx === existingIndex) {
        return { ...i, quantity: newQty };
      }
      return i;
    });
  } else {
    // Nuevo item
    quantityToReserve = Math.min(quantity, item.maxStock);
    newCart = [...cart, { ...item, quantity: quantityToReserve }];
  }
  
  // Reservar stock en el servidor
  if (quantityToReserve > 0) {
    try {
      const response = await fetch('/api/stock/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: item.variantId, quantity: quantityToReserve })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error reservando stock:', error);
        alert(error.error || 'Error al reservar el producto');
        return;
      }
    } catch (e) {
      console.error('Error en reserva de stock:', e);
    }
  }
  
  $cart.set(newCart);
  saveCart(newCart);
  // Reiniciar timer al añadir productos
  startCartExpirationTimer();
  $isCartOpen.set(true);
}

// Actualizar cantidad (con gestión de stock)
export async function updateQuantity(variantId: string, quantity: number) {
  const cart = $cart.get();
  const item = cart.find(i => i.variantId === variantId);
  
  if (!item) return;
  
  if (quantity <= 0) {
    await removeFromCart(variantId);
    return;
  }
  
  const oldQty = item.quantity;
  const newQty = Math.min(quantity, item.maxStock);
  const diff = newQty - oldQty;
  
  // Si aumentamos, reservar más stock
  if (diff > 0) {
    try {
      const response = await fetch('/api/stock/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: diff })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Stock insuficiente');
        return;
      }
    } catch (e) {
      console.error('Error reservando stock:', e);
      return;
    }
  }
  // Si reducimos, liberar stock
  else if (diff < 0) {
    try {
      await fetch('/api/stock/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: Math.abs(diff) })
      });
    } catch (e) {
      console.error('Error liberando stock:', e);
    }
  }
  
  const newCart = cart.map(i => {
    if (i.variantId === variantId) {
      return { ...i, quantity: newQty };
    }
    return i;
  });
  
  $cart.set(newCart);
  saveCart(newCart);
}

// Eliminar del carrito (libera stock)
export async function removeFromCart(variantId: string) {
  const cart = $cart.get();
  const item = cart.find(i => i.variantId === variantId);
  
  if (item) {
    // Liberar stock reservado
    try {
      await fetch('/api/stock/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: item.quantity })
      });
    } catch (e) {
      console.error('Error liberando stock:', e);
    }
  }
  
  const newCart = cart.filter(i => i.variantId !== variantId);
  $cart.set(newCart);
  saveCart(newCart);
}

// Limpiar carrito (libera todo el stock reservado)
export async function clearCart(releaseStock: boolean = true) {
  const cart = $cart.get();
  
  // Liberar todo el stock reservado
  if (releaseStock && cart.length > 0) {
    for (const item of cart) {
      try {
        await fetch('/api/stock/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity })
        });
      } catch (e) {
        console.error('Error liberando stock:', e);
      }
    }
  }
  
  $cart.set([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fashionstore_cart');
    localStorage.removeItem('fashionstore_cart_expires');
    // Disparar evento para actualizar UI
    window.dispatchEvent(new CustomEvent('cart:cleared'));
  }
}

// Timer de expiración del carrito
let cartExpirationTimer: ReturnType<typeof setTimeout> | null = null;

export function startCartExpirationTimer() {
  if (typeof window === 'undefined') return;
  
  // Limpiar timer anterior
  if (cartExpirationTimer) {
    clearTimeout(cartExpirationTimer);
  }
  
  const expires = localStorage.getItem('fashionstore_cart_expires');
  if (!expires) return;
  
  const expiresDate = new Date(expires);
  const now = new Date();
  const msUntilExpiry = expiresDate.getTime() - now.getTime();
  
  if (msUntilExpiry <= 0) {
    // Ya expiró, liberar stock
    clearCart(true);
    return;
  }
  
  // Programar limpieza automática (libera stock al expirar)
  cartExpirationTimer = setTimeout(async () => {
    await clearCart(true); // Liberar stock
    alert('Tu carrito ha expirado después de 15 minutos. Los productos han sido devueltos al stock.');
  }, msUntilExpiry);
}

// Obtener tiempo restante del carrito en segundos
export function getCartTimeRemaining(): number {
  if (typeof window === 'undefined') return 0;
  
  const expires = localStorage.getItem('fashionstore_cart_expires');
  if (!expires) return 0;
  
  const expiresDate = new Date(expires);
  const now = new Date();
  const msRemaining = expiresDate.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(msRemaining / 1000));
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

