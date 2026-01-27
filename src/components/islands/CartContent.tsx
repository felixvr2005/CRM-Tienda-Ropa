/**
 * CartContent Component (React Island)
 * Contenido del panel lateral del carrito
 */
import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import { 
  $cart, 
  $cartSubtotal, 
  $hasItems,
  updateQuantity, 
  removeFromCart,
  clearCart,
  getCartTimeRemaining,
  startCartExpirationTimer
} from '@stores/cart';
import { formatPrice, computeShippingCost } from '@lib/utils';

export default function CartContent() {
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const hasItems = useStore($hasItems);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Actualizar timer cada segundo
  useEffect(() => {
    if (!hasItems) return;
    
    // Iniciar timer de expiración
    startCartExpirationTimer();
    
    const updateTimer = () => {
      const remaining = getCartTimeRemaining();
      setTimeRemaining(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [hasItems, cart]);
  
  // Formatear tiempo como MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleQuantityChange = async (variantId: string, newQty: number) => {
    await updateQuantity(variantId, newQty);
  };
  
  const handleRemove = async (variantId: string) => {
    await removeFromCart(variantId);
  };
  
  const handleCheckout = () => {
    window.location.href = '/carrito';
  };
  
  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6">
        <svg className="w-16 h-16 text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p className="text-primary-500 text-sm mb-4">Tu cesta está vacía</p>
        <button 
          onClick={() => (window as any).closeCart?.()}
          className="text-sm underline hover:no-underline"
        >
          Continuar comprando
        </button>
      </div>
    );
  }
  
  const shippingCost = computeShippingCost(subtotal, 'standard');
  const total = subtotal + shippingCost;
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4">
            {/* Image */}
            <a href={`/productos/${item.slug}`} className="flex-shrink-0 w-20 aspect-[3/4] bg-primary-100">
              <img 
                src={item.image || 'https://via.placeholder.com/100x100?text=Imagen'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </a>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <a 
                href={`/productos/${item.slug}`}
                className="text-sm font-medium text-primary-900 hover:underline line-clamp-1"
              >
                {item.name}
              </a>
              <p className="text-xs text-primary-500 mt-1">
                {item.size} | {item.color}
              </p>
              
              {/* Quantity */}
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                  className="w-7 h-7 border border-primary-300 flex items-center justify-center hover:border-primary-900 transition-colors"
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxStock}
                  className="w-7 h-7 border border-primary-300 flex items-center justify-center hover:border-primary-900 transition-colors disabled:opacity-50"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-xs text-primary-400 line-through">
                    {formatPrice(item.originalPrice * item.quantity)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Remove */}
            <button 
              onClick={() => handleRemove(item.variantId)}
              className="p-1 text-primary-400 hover:text-primary-900 transition-colors"
              aria-label="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="border-t border-primary-200 p-6 space-y-4">
        {/* Timer de expiración */}
        {timeRemaining > 0 && (
          <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-sm ${
            timeRemaining < 300 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Reservado por: <strong>{formatTime(timeRemaining)}</strong>
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-primary-500">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-500">Envío</span>
          <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
        </div>
        {shippingCost > 0 && (
          <p className="text-xs text-primary-400">
            Envío gratis en pedidos superiores a 100€
          </p>
        )}
        <div className="flex justify-between text-base font-medium pt-2 border-t border-primary-200">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        
        <button 
          onClick={handleCheckout}
          className="w-full bg-primary-900 text-white text-sm tracking-widest uppercase py-4 hover:bg-primary-800 transition-colors"
        >
          Tramitar pedido
        </button>
        
        <button 
          onClick={() => (window as any).closeCart?.()}
          className="w-full text-sm text-primary-500 hover:text-primary-900 transition-colors"
        >
          Continuar comprando
        </button>
      </div>
    </div>
  );
}
