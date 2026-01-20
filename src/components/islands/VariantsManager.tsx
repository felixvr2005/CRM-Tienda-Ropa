/**
 * VariantsManager - Panel para personalizar variantes
 * Permite cambiar colores (HEX/RGB) y subir imágenes por variante
 */
import React, { useState } from 'react';
import VariantCard from './VariantCard';

interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

interface Variant {
  id: string;
  product_id: string;
  color: string;
  color_hex: string | null;
  size: string;
  stock: number;
  images: VariantImage[];
}

interface Props {
  productId: string;
  productName: string;
  variants: Variant[];
}

export default function VariantsManager({
  productId,
  productName,
  variants,
}: Props) {
  const [variantsList, setVariantsList] = useState<Variant[]>(variants || []);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variantsList.length > 0 ? variantsList[0].id : null
  );
  const [saving, setSaving] = useState(false);

  const selectedVariant = variantsList.find(v => v.id === selectedVariantId);

  const handleColorChange = async (variantId: string, newColor: string, newHex: string) => {
    // Actualizar estado local
    setVariantsList(prev =>
      prev.map(v =>
        v.id === variantId
          ? { ...v, color: newColor, color_hex: newHex }
          : v
      )
    );

    // Guardar en BD
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: newColor,
          color_hex: newHex
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar color');
      }

      console.log('✅ Color actualizado:', newColor);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar color');
    } finally {
      setSaving(false);
    }
  };

  const handleImagesChange = (variantId: string, newImages: VariantImage[]) => {
    setVariantsList(prev =>
      prev.map(v =>
        v.id === variantId
          ? { ...v, images: newImages }
          : v
      )
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Lista de variantes */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-primary-900 mb-4">Variantes</h2>
          <div className="space-y-2">
            {variantsList.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={`w-full text-left px-4 py-3 rounded transition-all ${
                  selectedVariantId === variant.id
                    ? 'bg-primary-900 text-white'
                    : 'bg-primary-50 text-primary-900 hover:bg-primary-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border-2 border-current"
                    style={{
                      backgroundColor: variant.color_hex || '#ccc'
                    }}
                  />
                  <div>
                    <div className="font-medium">{variant.color || 'Sin color'}</div>
                    <div className="text-xs opacity-75">Talla: {variant.size}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main - Editor de variante seleccionada */}
      <div className="lg:col-span-3">
        {selectedVariant ? (
          <VariantCard
            variant={selectedVariant}
            saving={saving}
            onColorChange={handleColorChange}
            onImagesChange={handleImagesChange}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-primary-600">
            <p>Selecciona una variante para editar</p>
          </div>
        )}
      </div>
    </div>
  );
}
