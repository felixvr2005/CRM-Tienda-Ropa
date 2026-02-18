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
  variants = [],
  variantImages = {},
  productName,
  defaultImages,
  selectedColor: externalSelectedColor,
  onColorChange,
}: Props) {
  const [localSelectedColor, setLocalSelectedColor] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(defaultImages);
  
  // Asegurar que variants es un array
  const safeVariants = Array.isArray(variants) ? variants : [];
  const safeVariantImages = variantImages || {};
  
  // Usar color externo si viene del padre, sino usar local
  const selectedColor = externalSelectedColor ?? localSelectedColor;
  const setSelectedColor = onColorChange ? (c: string) => onColorChange(c) : setLocalSelectedColor;

  // Development-only debug (kept behind Vite's DEV flag so production logs are not emitted)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('ProductImageGallery — variants:', safeVariants.length, 'variantImagesKeys:', Object.keys(safeVariantImages).length);
    }
  }, [safeVariants, safeVariantImages]);

  // Obtener colores únicos y disponibles
  const colors = useMemo(() => {
    if (!safeVariants || safeVariants.length === 0) return [];
    
    const uniqueColors = new Map<string, { hex: string; stock: number }>();
    
    safeVariants.forEach((v) => {
      if (v && v.color && v.color.trim()) {
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
    
    if (import.meta.env.DEV) console.debug('Colors found:', result);
    return result;
  }, [safeVariants]);

  // Seleccionar el primer color por defecto
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      if (import.meta.env.DEV) console.debug('Auto-selecting first color:', colors[0].name);
      setSelectedColor(colors[0].name);
    }
  }, [colors, selectedColor]);

  // Cambiar imágenes cuando se selecciona un color
  useEffect(() => {
    if (!selectedColor) {
      if (import.meta.env.DEV) console.debug('⚠️ No selectedColor');
      return;
    }

    if (import.meta.env.DEV) console.debug('🎨 Color seleccionado:', selectedColor);

    // Buscar TODAS las variantes del color seleccionado (Rojo/S, Rojo/M, etc. comparten fotos)
    const colorVariants = safeVariants.filter((v) => v.color === selectedColor);

    if (import.meta.env.DEV) console.debug('Found variants for color:', colorVariants.length);

    if (colorVariants.length > 0) {
      // Recoger imágenes de TODAS las variantes de este color (normalmente subidas a una sola)
      const allColorImages: VariantImage[] = [];
      for (const variant of colorVariants) {
        const variantImgs = safeVariantImages[variant.id];
        if (variantImgs && Array.isArray(variantImgs)) {
          allColorImages.push(...variantImgs);
        }
      }

      if (import.meta.env.DEV) console.debug('Total images found for color:', allColorImages.length);

      if (allColorImages.length > 0) {
        // Deduplicar por URL y ordenar
        const uniqueUrls = new Map<string, VariantImage>();
        allColorImages.forEach(img => {
          if (!uniqueUrls.has(img.image_url)) uniqueUrls.set(img.image_url, img);
        });
        const sortedImages = Array.from(uniqueUrls.values())
          .sort((a, b) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          })
          .map((img) => img.image_url);
        
        if (import.meta.env.DEV) console.debug('✅ Imágenes ordenadas:', sortedImages);
        setImages(sortedImages);
      } else {
        // Variantes sin fotos propias → usar defaultImages (fotos del producto)
        if (import.meta.env.DEV) console.debug('⚠️ Sin imágenes para este color, usando fotos del producto');
        setImages(defaultImages);
      }
    } else {
      if (import.meta.env.DEV) console.debug('❌ Variante no encontrada para color:', selectedColor);
      setImages(defaultImages);
    }

    setCurrentImageIndex(0);
  }, [selectedColor, safeVariants, safeVariantImages, defaultImages]);

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
