/**
 * ProductViewer - Componente que sincroniza galería de imágenes con selector de color
 */
import { useState, useMemo } from 'react';
import ProductImageGallery from './ProductImageGallery';
import AddToCartButton from './AddToCartButton';
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
  variants,
  variantImages,
}: Props) {
  // Estado compartido de color seleccionado
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Auto-seleccionar primer color
  const colors = useMemo(() => {
    const uniqueColors = new Map<string, string>();
    variants.forEach(v => {
      if (!uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, v.color_hex || '#000000');
      }
    });
    return Array.from(uniqueColors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const firstColor = colors.length > 0 ? colors[0].name : null;

  // Convertir precio de centavos a euros
  const priceInEuros = productPrice / 100;
  const discountedPrice = priceInEuros * (1 - productDiscount / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Gallery - sincronizada con color seleccionado */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductImageGallery 
          productId={productId}
          variants={variants}
          variantImages={variantImages}
          productName={productName}
          defaultImages={[productImage]}
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
          productImage={productImage}
          variants={variants}
          variantImages={variantImages}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>
    </div>
  );
}
