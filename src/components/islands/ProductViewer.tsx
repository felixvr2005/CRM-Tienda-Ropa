/**
 * ProductViewer - Componente que sincroniza galería de imágenes con selector de color
 */
import { useState, useMemo } from 'react';
import ProductImageGallery from './ProductImageGallery';
import AddToCartButton from './AddToCartButton';
import SizeRecommender from './SizeRecommender';
import type { ProductVariant } from '@lib/database.types';

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
  variantImages: Record<string, VariantImage[]>;
}

export default function ProductViewer({
  productId,
  productName,
  productSlug,
  productPrice,
  productDiscount,
  productImage,
  variants = [],
  variantImages = {},
}: Props) {
  // Estado compartido de color seleccionado
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Asegurar que variants es un array
  const safeVariants = Array.isArray(variants) ? variants : [];

  // Auto-seleccionar primer color
  const colors = useMemo(() => {
    const uniqueColors = new Map<string, string>();
    safeVariants.forEach(v => {
      if (v && v.color && !uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, v.color_hex || '#000000');
      }
    });
    return Array.from(uniqueColors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [safeVariants]);

  const firstColor = colors.length > 0 ? colors[0].name : null;

  // Convertir precio de centavos a euros - manejar valores nulos
  const priceInEuros = Number(productPrice) || 0;
  const discountedPrice = priceInEuros * (1 - (productDiscount || 0) / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Gallery - sincronizada con color seleccionado */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductImageGallery 
          productId={productId}
          variants={safeVariants}
          variantImages={variantImages || {}}
          productName={productName}
          defaultImages={[productImage || '/images/products/placeholder.jpg']}
          selectedColor={selectedColor || firstColor}
          onColorChange={setSelectedColor}
        />
      </div>

      {/* Product Info y Carrito - con selector de color compartido */}
      <div className="py-4">
        <h1 className="font-display text-3xl mb-4">{productName}</h1>
        <div className="flex items-baseline gap-3 mb-8">
          <span className="text-2xl font-bold text-primary-900">
            €{discountedPrice.toFixed(2)}
          </span>
          {productDiscount > 0 && (
            <span className="text-lg text-primary-400 line-through">
              €{priceInEuros.toFixed(2)}
            </span>
          )}
        </div>

        <AddToCartButton
          productId={productId}
          productName={productName}
          productSlug={productSlug}
          productPrice={productPrice}
          productDiscount={productDiscount}
          productImage={productImage || '/images/products/placeholder.jpg'}
          variants={safeVariants}
          variantImages={variantImages || {}}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {/* Recomendador de Talla */}
        <SizeRecommender />
      </div>
    </div>
  );
}
