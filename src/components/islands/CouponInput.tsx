/**
 * Coupon Input - Aplicar códigos de descuento
 * Valida y aplica cupones al carrito
 */
import { useState } from 'react';

interface CouponInputProps {
  onCouponApplied?: (code: string, discount: number) => void;
  onCouponRemoved?: () => void;
}

export default function CouponInput({ onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Ingresa un código de cupón');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Llamar a la API para validar el cupón
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Cupón inválido');
        return;
      }

      setAppliedCode(code.toUpperCase());
      setDiscountAmount(data.discount || 0);
      setSuccess(`¡Cupón aplicado! Descuento: -${data.discount_percentage || 0}%`);
      setCode('');

      onCouponApplied?.(code.toUpperCase(), data.discount || 0);
    } catch (err) {
      console.error('Coupon validation error:', err);
      setError('Error al validar el cupón');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setCode('');
    setError('');
    setSuccess('');
    onCouponRemoved?.();
  };

  return (
    <div className="space-y-4">
      {/* Cupón aplicado */}
      {appliedCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">{appliedCode}</p>
                <p className="text-xs text-green-700">Cupón aplicado correctamente</p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-900 transition-colors"
              title="Remover cupón"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Formulario para ingresar cupón */}
      {!appliedCode && (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="Código de cupón..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            className="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validando...
              </span>
            ) : (
              'Aplicar'
            )}
          </button>
        </form>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Mensajes de éxito */}
      {success && !appliedCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">✓ {success}</p>
        </div>
      )}
    </div>
  );
}
