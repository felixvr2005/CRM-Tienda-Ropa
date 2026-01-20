/**
 * VariantCard - Editor individual de variante
 * Color picker + Gestor de imágenes
 */
import React, { useState } from 'react';

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
  color: string;
  color_hex: string | null;
  size: string;
  stock: number;
  images: VariantImage[];
}

interface Props {
  variant: Variant;
  saving: boolean;
  onColorChange: (variantId: string, color: string, hex: string) => void;
  onImagesChange: (variantId: string, images: VariantImage[]) => void;
}

export default function VariantCard({
  variant,
  saving,
  onColorChange,
  onImagesChange,
}: Props) {
  const [colorInput, setColorInput] = useState(variant.color_hex || '#000000');
  const [colorName, setColorName] = useState(variant.color || '');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<VariantImage[]>(variant.images);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorInput(value);
  };

  const handleColorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorName(e.target.value);
  };

  const handleColorSave = () => {
    if (!colorName.trim()) {
      alert('Por favor ingresa un nombre para el color');
      return;
    }
    onColorChange(variant.id, colorName, colorInput);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      // Subir cada imagen a Supabase Storage
      const uploadedImages: VariantImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileName = `variant-${variant.id}-${timestamp}-${i}`;

        // Subir a storage
        const { data: uploadData, error: uploadError } = await (window as any)
          .supabaseClient
          .storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          continue;
        }

        // Obtener URL pública
        const { data: publicUrl } = (window as any)
          .supabaseClient
          .storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedImages.push({
          id: `temp-${timestamp}-${i}`,
          variant_id: variant.id,
          image_url: publicUrl.publicUrl,
          alt_text: `${variant.color} - Imagen ${i + 1}`,
          is_primary: i === 0,
          sort_order: images.length + i,
        });
      }

      if (uploadedImages.length > 0) {
        // Guardar en BD
        const response = await fetch('/api/admin/variant-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variant_id: variant.id,
            images: uploadedImages
          })
        });

        if (response.ok) {
          const newImages = [...images, ...uploadedImages];
          setImages(newImages);
          onImagesChange(variant.id, newImages);
          console.log('✅ Imágenes guardadas');
        } else {
          throw new Error('Error al guardar imágenes');
        }
      }
    } catch (error) {
      console.error('❌ Error al subir imágenes:', error);
      alert('Error al subir imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      // Eliminar de BD
      const response = await fetch(`/api/admin/variant-images/${imageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        onImagesChange(variant.id, newImages);
        console.log('✅ Imagen eliminada');
      }
    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error);
      alert('Error al eliminar imagen');
    }
  };

  const handleSetPrimary = (imageId: string) => {
    const newImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }));
    setImages(newImages);

    // Guardar en BD
    fetch('/api/admin/variant-images/primary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variant.id,
        primary_image_id: imageId
      })
    }).catch(console.error);
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Color */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary-900 mb-6">
          Editar Color - Talla {variant.size}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-3">
              Color HEX
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={colorInput}
                onChange={handleColorInputChange}
                className="w-20 h-20 rounded cursor-pointer border-2 border-primary-300"
              />
              <input
                type="text"
                value={colorInput}
                onChange={handleColorInputChange}
                className="flex-1 px-4 py-2 border border-primary-300 rounded font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Nombre del Color */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-3">
              Nombre del Color
            </label>
            <input
              type="text"
              value={colorName}
              onChange={handleColorNameChange}
              className="w-full px-4 py-2 border border-primary-300 rounded"
              placeholder="Ej: Azul Marino, Rojo Oscuro"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 flex items-center gap-4">
          <div className="text-sm text-primary-600">Vista previa:</div>
          <div
            className="w-24 h-24 rounded border-2 border-primary-300"
            style={{ backgroundColor: colorInput }}
          />
          <div>
            <div className="font-medium text-primary-900">{colorName || 'Sin nombre'}</div>
            <div className="text-sm text-primary-600 font-mono">{colorInput}</div>
            <div className="text-xs text-primary-500 mt-2">Stock: {variant.stock}</div>
          </div>
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleColorSave}
          disabled={saving}
          className={`mt-6 w-full py-3 rounded font-medium transition-all ${
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-primary-900 text-white hover:bg-primary-800'
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar Color'}
        </button>
      </div>

      {/* Tarjeta de Imágenes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary-900 mb-6">
          Imágenes del Color {colorName || variant.color}
        </h2>

        {/* Upload */}
        <div className="mb-6 p-4 border-2 border-dashed border-primary-300 rounded bg-primary-50">
          <label className="cursor-pointer">
            <div className="text-center">
              <svg
                className="mx-auto w-8 h-8 text-primary-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div className="text-sm font-medium text-primary-900">
                Haz click para subir imágenes
              </div>
              <div className="text-xs text-primary-600 mt-1">
                O arrastra archivos aquí
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImages}
              className="hidden"
            />
          </label>
        </div>

        {uploadingImages && (
          <div className="text-center text-primary-600 mb-6">
            Subiendo imágenes...
          </div>
        )}

        {/* Galería de Imágenes */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square bg-primary-100 rounded overflow-hidden">
                  <img
                    src={img.image_url}
                    alt={img.alt_text}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                      img.is_primary
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/80 text-primary-900 hover:bg-white'
                    }`}
                  >
                    {img.is_primary ? '★ Principal' : 'Principal'}
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="px-3 py-2 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Badge Principal */}
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    ★ Principal
                  </div>
                )}

                {/* Número */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {idx + 1}/{images.length}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-primary-600">
            <p>No hay imágenes aún para este color</p>
            <p className="text-sm mt-2">Sube las primeras imágenes arriba</p>
          </div>
        )}
      </div>
    </div>
  );
}
