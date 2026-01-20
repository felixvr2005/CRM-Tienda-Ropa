/**
 * AddToCartButton Component (React Island)
 * Botón para añadir productos al carrito con selector de talla y color
 */
import { useState, useMemo } from 'react';
import { addToCart } from '@stores/cart';
import type { ProductVariant } from '@lib/database.types';
import { formatPrice, calculateDiscountedPrice } from '@lib/utils';

interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

interface Props {
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productDiscount: number;
  productImage: string;
  variants: ProductVariant[];
  variantImages?: Record<string, VariantImage[]>;
  selectedColor?: string | null;
  onColorChange?: (color: string) => void;
}

export default function AddToCartButton({
  productId,
  productName,
  productSlug,
  productPrice,
  productDiscount,
  productImage,
  variants,
  variantImages = {},
  selectedColor: externalSelectedColor,
  onColorChange,
}: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [localSelectedColor, setLocalSelectedColor] = useState<string | null>(null);
  
  // Usar color externo si viene del padre, sino usar local
  const selectedColor = externalSelectedColor ?? localSelectedColor;
  const setSelectedColor = onColorChange ? (c: string) => onColorChange(c) : setLocalSelectedColor;
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Obtener tallas únicas
  const sizes = useMemo(() => {
    const sizeSet = new Set<string>();
    variants.forEach(v => sizeSet.add(v.size));
    return Array.from(sizeSet);
  }, [variants]);
  
  const colors = useMemo(() => {
    const uniqueColors = new Map<string, string>();
    variants.forEach(v => {
      if (!uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, v.color_hex || '#000000');
      }
    });
    return Array.from(uniqueColors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);
  
  // Obtener variante seleccionada
  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return variants.find(v => v.size === selectedSize && v.color === selectedColor);
  }, [selectedSize, selectedColor, variants]);

  // Obtener imagen del color seleccionado
  const colorImage = useMemo(() => {
    if (!selectedColor || !selectedVariant) return productImage;
    
    const images = variantImages[selectedVariant.id];
    if (images && images.length > 0) {
      // Buscar imagen principal primero
      const primaryImage = images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image_url : images[0].image_url;
    }
    
    return productImage;
  }, [selectedColor, selectedVariant, variantImages, productImage]);
  
  // Verificar disponibilidad de combinación
  const isAvailable = (size: string, color: string) => {
    const variant = variants.find(v => v.size === size && v.color === color);
    return variant && variant.stock > 0;
  };
  
  // Stock de la variante seleccionada
  const currentStock = selectedVariant?.stock ?? 0;
  const finalPrice = calculateDiscountedPrice(productPrice, productDiscount);
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Selecciona una talla');
      return;
    }
    if (!selectedColor) {
      setError('Selecciona un color');
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      setError('Combinación no disponible');
      return;
    }
    
    setIsAdding(true);
    setError(null);
    
    addToCart({
      id: selectedVariant.id,
      productId,
      variantId: selectedVariant.id,
      name: productName,
      slug: productSlug,
      price: finalPrice,
      originalPrice: productPrice,
      discount: productDiscount,
      image: colorImage,
      size: selectedSize,
      color: selectedColor,
      maxStock: selectedVariant.stock,
    });
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      {/* Color Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-primary-500 uppercase tracking-wider">Color</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map(({ name, hex }) => (
            <button
              key={name}
              onClick={() => {
                setSelectedColor(name);
                setError(null);
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === name 
                  ? 'border-primary-900 ring-1 ring-offset-1 ring-primary-900' 
                  : 'border-primary-200 hover:border-primary-400'
              }`}
              style={{ backgroundColor: hex }}
              title={name}
              aria-label={name}
            />
          ))}
        </div>
      </div>
      
      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-primary-500 uppercase tracking-wider">Talla</span>
          <button className="text-xs text-primary-500 underline hover:text-primary-900">
            Guía de tallas
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => {
            const available = selectedColor ? isAvailable(size, selectedColor) : variants.some(v => v.size === size && v.stock > 0);
            return (
              <button
                key={size}
                onClick={() => {
                  if (available) {
                    setSelectedSize(size);
                    setError(null);
                  }
                }}
                disabled={!available}
                className={`py-3 text-sm border transition-all ${
                  selectedSize === size
                    ? 'border-primary-900 bg-primary-900 text-white'
                    : available
                    ? 'border-primary-300 hover:border-primary-900'
                    : 'border-primary-200 text-primary-300 cursor-not-allowed line-through'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Stock indicator */}
      {selectedVariant && currentStock > 0 && currentStock <= 5 && (
        <p className="text-sm text-amber-600">
          ⚠️ Solo quedan {currentStock} unidades
        </p>
      )}
      
      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`w-full py-4 text-sm tracking-widest uppercase font-medium transition-all ${
          isAdding
            ? 'bg-green-600 text-white'
            : 'bg-primary-900 text-white hover:bg-primary-800'
        }`}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Añadido
          </span>
        ) : (
          `Añadir - ${formatPrice(finalPrice)}`
        )}
      </button>
      
      {/* Additional info */}
      <div className="space-y-3 pt-4 border-t border-primary-200">
        <div className="flex items-center gap-3 text-sm text-primary-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Envío gratis a partir de 100€</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-primary-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Devolución gratuita en 30 días</span>
        </div>
      </div>
    </div>
  );
}
