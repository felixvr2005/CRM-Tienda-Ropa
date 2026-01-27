/**
 * Cart Page Content - React Island
 * Contenido completo de la página de carrito
 */
import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import { $cart, removeFromCart, updateQuantity, clearCart, getCartTimeRemaining, startCartExpirationTimer, type CartItem } from '@stores/cart';
import { formatPrice, computeShippingCost } from '@lib/utils';
import CouponInput from './CouponInput';

export default function CartPageContent() {
  const cart = useStore($cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Timer de cuenta atrás
  useEffect(() => {
    if (cart.length === 0) return;
    
    startCartExpirationTimer();
    
    const updateTimer = () => {
      setTimeRemaining(getCartTimeRemaining());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [cart.length]);

  // Formatear tiempo como MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Aplicar cupón
  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setCouponError('Ingresa un código');
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponError('');
        alert(`✅ Cupón aplicado: ${data.discountPercentage}% de descuento`);
      } else {
        setCouponError(data.error || 'Código inválido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Error al validar el código');
      setAppliedCoupon(null);
    }
  };

  // item.price ya tiene el descuento aplicado
  const subtotal = cart.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const shipping = computeShippingCost(subtotal, 'standard');
  
  // Aplicar descuento del cupón si existe
  let discountAmount = 0;
  if (appliedCoupon && appliedCoupon.discountType === 'percentage') {
    discountAmount = (subtotal * appliedCoupon.discountPercentage) / 100;
  }
  
  const total = subtotal - discountAmount + shipping;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    // Intentar obtener email del usuario autenticado (si existe) para permitir checkout desde el carrito
    let customerEmail: string | null = null;
    try {
      const authState = (window as any).__FASHION_AUTH_STATE;
      customerEmail = authState?.user?.email || null;
    } catch (e) {
      customerEmail = null;
    }

    // Si no hay email, redirigir a la página de checkout para rellenar datos (email/dirección)
    if (!customerEmail) {
      window.location.href = '/checkout';
      return;
    }

    try {
      const payload = {
        items: cart,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount || 0,
        subtotal,
        shippingCost: shipping,
        shippingMethod: 'standard',
        total,
        email: customerEmail
      } as const;

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al procesar el pago: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="w-20 h-20 mx-auto text-primary-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="font-display text-2xl mb-4">Tu cesta está vacía</h2>
        <p className="text-primary-500 mb-8">Descubre nuestra colección y añade tus prendas favoritas</p>
        <a 
          href="/productos" 
          className="inline-block bg-primary-900 text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors"
        >
          Ver colección
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Timer de reserva */}
      {timeRemaining > 0 && (
        <div className="lg:col-span-3">
          <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded ${
            timeRemaining < 300 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">
              <strong>Stock reservado por:</strong> {formatTime(timeRemaining)}
            </span>
            <span className="text-xs ml-2">
              {timeRemaining < 300 ? '(¡Date prisa!)' : '(El stock se liberará al expirar)'}
            </span>
          </div>
        </div>
      )}
      
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="border-b border-primary-200 pb-4 mb-4 hidden md:grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-primary-500">
          <div className="col-span-6">Producto</div>
          <div className="col-span-2 text-center">Cantidad</div>
          <div className="col-span-2 text-right">Precio</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        <div className="space-y-6">
          {cart.map((item) => {
            // item.price ya tiene el descuento aplicado
            const itemTotal = item.price * item.quantity;

            return (
              <div key={`${item.id}-${item.size}-${item.color}`} className="grid grid-cols-12 gap-4 py-4 border-b border-primary-100">
                {/* Product Info */}
                <div className="col-span-12 md:col-span-6 flex gap-4">
                  <a href={`/productos/${item.slug}`} className="w-24 h-32 bg-primary-100 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <div className="flex-1">
                    <a href={`/productos/${item.slug}`} className="font-medium hover:underline block mb-1">
                      {item.name}
                    </a>
                    <p className="text-sm text-primary-500 mb-2">
                      Talla: {item.size} | Color: {item.color}
                    </p>
                    <div className="md:hidden flex items-center gap-2 mb-2">
                      {item.discount > 0 && (
                        <span className="text-sm text-primary-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                      <span className="text-sm font-medium">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <button
                      onClick={async () => await removeFromCart(item.variantId)}
                      className="text-xs text-primary-500 hover:text-red-600 underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-6 md:col-span-2 flex items-center justify-center">
                  <div className="flex items-center border border-primary-300">
                    <button
                      onClick={async () => await updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-primary-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={async () => await updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-primary-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="hidden md:flex col-span-2 items-center justify-end">
                  <div className="text-right">
                    {item.discount > 0 && (
                      <span className="text-sm text-primary-400 line-through block">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                    <span className="text-sm">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                  <span className="font-medium">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={async () => await clearCart(true)}
            className="text-sm text-primary-500 hover:text-red-600"
          >
            Vaciar cesta
          </button>
          <a href="/productos" className="text-sm underline hover:no-underline">
            Continuar comprando
          </a>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-primary-50 p-6 sticky top-24">
          <h2 className="font-display text-xl mb-6">Resumen del pedido</h2>

          {/* Promo Code */}
          <div className="mb-6">
            <CouponInput 
              onCouponApplied={(code, discount) => {
                setAppliedCoupon({ code, discountPercentage: (discount / subtotal) * 100 });
                setCouponError('');
              }}
              onCouponRemoved={() => {
                setAppliedCoupon(null);
                setPromoCode('');
              }}
            />
          </div>

          {/* Totals */}
          <div className="space-y-3 text-sm border-t border-primary-200 pt-4">
            <div className="flex justify-between">
              <span className="text-primary-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Descuento ({appliedCoupon.discountPercentage}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-primary-600">Envío</span>
              <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-primary-500">
                Envío gratis en pedidos superiores a 100€
              </p>
            )}
            <div className="flex justify-between text-lg font-medium border-t border-primary-200 pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-primary-500">IVA incluido</p>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className="w-full bg-primary-900 text-white py-4 mt-6 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Procesando...' : 'Finalizar compra'}
          </button>

          {/* Payment Methods */}
          <div className="mt-6 text-center">
            <p className="text-xs text-primary-500 mb-3">Pago seguro con</p>
            <div className="flex justify-center gap-3">
              <span className="text-xs text-primary-400">Visa</span>
              <span className="text-xs text-primary-400">Mastercard</span>
              <span className="text-xs text-primary-400">PayPal</span>
            </div>
          </div>

          {/* Guarantees */}
          <div className="mt-6 pt-6 border-t border-primary-200 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Pago 100% seguro</p>
                <p className="text-xs text-primary-500">Conexión SSL encriptada</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Devolución gratuita</p>
                <p className="text-xs text-primary-500">30 días para devolver</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
