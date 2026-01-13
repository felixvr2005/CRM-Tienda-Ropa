import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export default function WishlistButton({ productId, className = '', showText = false }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Obtener customer_id
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!customer) {
      setIsLoading(false);
      return;
    }

    setCustomerId(customer.id);

    // Verificar si está en favoritos
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('product_id', productId)
      .single();

    setIsInWishlist(!!data);
    setIsLoading(false);
  };

  const toggleWishlist = async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirigir al login
      window.location.href = `/cuenta/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (!customerId) {
      await checkWishlistStatus();
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Eliminar de favoritos
        await supabase
          .from('wishlists')
          .delete()
          .eq('customer_id', customerId)
          .eq('product_id', productId);

        setIsInWishlist(false);
      } else {
        // Añadir a favoritos
        await supabase
          .from('wishlists')
          .insert({
            customer_id: customerId,
            product_id: productId
          });

        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`transition-all ${className} ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isInWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
      title={isInWishlist ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
    >
      <svg
        className={`w-6 h-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'fill-transparent text-current'}`}
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'En favoritos' : 'Añadir a favoritos'}
        </span>
      )}
    </button>
  );
}
