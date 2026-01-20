/**
 * ProductImageGallery - Galería de imágenes dinámicas por color
 * Carga automáticamente las imágenes cuando se selecciona un color
 */
import React, { useState, useEffect, useMemo } from 'react';
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
  variants: ProductVariant[];
  variantImages: Record<string, VariantImage[]>;
  productName: string;
  defaultImages: string[];
  selectedColor?: string | null;
  onColorChange?: (color: string) => void;
}

export default function ProductImageGallery({
  productId,
  variants,
  variantImages,
  productName,
  defaultImages,
  selectedColor: externalSelectedColor,
  onColorChange,
}: Props) {
  const [localSelectedColor, setLocalSelectedColor] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(defaultImages);
  
  // Usar color externo si viene del padre, sino usar local
  const selectedColor = externalSelectedColor ?? localSelectedColor;
  const setSelectedColor = onColorChange ? (c: string) => onColorChange(c) : setLocalSelectedColor;

  // Debug: Verificar datos al montar
  useEffect(() => {
    console.log('🔍 ProductImageGallery Debug:');
    console.log('Variants:', variants);
    console.log('VariantImages object:', variantImages);
    console.log('Number of variants:', variants.length);
  }, [variants, variantImages]);

  // Obtener colores únicos y disponibles
  const colors = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    
    const uniqueColors = new Map<string, { hex: string; stock: number }>();
    
    variants.forEach((v) => {
      if (v.color && v.color.trim()) {
        if (!uniqueColors.has(v.color)) {
          uniqueColors.set(v.color, { 
            hex: v.color_hex || '#808080',
            stock: 0
          });
        }
        // Actualizar stock para este color
        const colorData = uniqueColors.get(v.color);
        if (colorData) {
          colorData.stock = Math.max(colorData.stock, v.stock || 0);
        }
      }
    });
    
    const result = Array.from(uniqueColors.entries()).map(([name, data]) => ({ 
      name, 
      hex: data.hex,
      stock: data.stock
    }));
    
    console.log('Colors found:', result);
    return result;
  }, [variants]);

  // Seleccionar el primer color por defecto
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      console.log('Auto-selecting first color:', colors[0].name);
      setSelectedColor(colors[0].name);
    }
  }, [colors, selectedColor]);

  // Cambiar imágenes cuando se selecciona un color
  useEffect(() => {
    if (!selectedColor) {
      console.log('⚠️ No selectedColor');
      return;
    }

    console.log('🎨 Color seleccionado:', selectedColor);

    // Encontrar variante del color seleccionado
    const variant = variants.find((v) => v.color === selectedColor);

    console.log('Found variant:', variant);

    if (variant) {
      console.log(`📸 Buscando imágenes para variant.id: ${variant.id}`);
      const variantImgs = variantImages[variant.id];
      console.log('Imágenes encontradas:', variantImgs);

      if (variantImgs && Array.isArray(variantImgs) && variantImgs.length > 0) {
        // Ordenar por sort_order, principal primero
        const sortedImages = variantImgs
          .sort((a, b) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          })
          .map((img) => img.image_url);
        
        console.log('✅ Imágenes ordenadas:', sortedImages);
        setImages(sortedImages);
      } else {
        console.log('⚠️ Sin imágenes para esta variante, usando default');
        setImages(defaultImages);
      }
    } else {
      console.log('❌ Variante no encontrada para color:', selectedColor);
      console.log('Available colors in variants:', variants.map(v => v.color));
    }

    setCurrentImageIndex(0);
  }, [selectedColor, variants, variantImages, defaultImages]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-primary-50 rounded-lg overflow-hidden mb-4 group">
        <img
          src={images[currentImageIndex]}
          alt={`${productName} - ${selectedColor} - imagen ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Siguiente imagen"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden transition-all ${
                idx === currentImageIndex
                  ? 'ring-2 ring-primary-900'
                  : 'ring-1 ring-primary-200 hover:ring-primary-500'
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Information */}
      {images.length > 0 && images[currentImageIndex] && (
        <p className="text-xs text-primary-500 text-center">
          Imagen {currentImageIndex + 1} de {images.length}
        </p>
      )}
    </div>
  );
}
