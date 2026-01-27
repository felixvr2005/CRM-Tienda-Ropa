/**
 * CartIcon Component (React Island)
 * Icono del carrito con contador
 */
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $cartCount, initCart } from '@stores/cart';
// Init client-only listeners (auth state → cart sync)
import '@lib/client-init';

export default function CartIcon() {
  const count = useStore($cartCount);
  
  useEffect(() => {
    initCart();
  }, []);
  
  const openCart = () => {
    (window as any).openCart?.();
  };
  
  return (
    <button 
      onClick={openCart}
      className="relative p-2 hover:bg-primary-100 rounded-full transition-colors"
      aria-label={`Carrito (${count} artículos)`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
        />
      </svg>
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-2xs flex items-center justify-center rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
