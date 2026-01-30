import { useState, useEffect, useCallback } from 'react';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({ productId, className = '', showText = false }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/wishlist/status?productId=${productId}`);
      const data = await response.json();
      
      setIsInWishlist(data.isInWishlist || false);
      setIsAuthenticated(data.authenticated || false);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      // Redirigir al login
      window.location.href = `/cuenta/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsInWishlist(data.isInWishlist);
        
        // Mostrar toast si está disponible
        if (typeof window !== 'undefined' && (window as any).toast) {
          if (data.isInWishlist) {
            (window as any).toast.success('Añadido a favoritos');
          } else {
            (window as any).toast.info('Eliminado de favoritos');
          }
        }
      } else if (response.status === 401) {
        window.location.href = `/cuenta/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      } else {
        console.error('Error en toggle:', data.error);
        if (typeof window !== 'undefined' && (window as any).toast) {
          (window as any).toast.error(data.error || 'Error al actualizar favoritos');
        }
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error('Error de conexión');
      }
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
