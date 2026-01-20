import React, { useState, useCallback } from 'react';
import { supabase } from '@lib/supabase';

interface VariantImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

interface VariantImagesUploaderProps {
  variantId: string;
  variantInfo: string; // ej: "Rojo / M"
  productId: string;
  onImagesUpdated?: () => void;
}

export function VariantImagesUploader({
  variantId,
  variantInfo,
  productId,
  onImagesUpdated
}: VariantImagesUploaderProps) {
  const [images, setImages] = useState<VariantImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar imágenes existentes
  React.useEffect(() => {
    loadVariantImages();
  }, [variantId]);

  const loadVariantImages = async () => {
    try {
      setIsLoading(true);
      const { data, error: loadError } = await supabase
        .from('variant_images')
        .select('*')
        .eq('variant_id', variantId)
        .order('sort_order', { ascending: true });

      if (loadError) throw loadError;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    try {
      setIsUploading(true);
      setError(null);

      for (const file of Array.from(files)) {
        // Subir a storage de Supabase
        const fileName = `${productId}/${variantId}/${Date.now()}-${file.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Guardar en BD
        const { error: dbError } = await supabase
          .from('variant_images')
          .insert({
            variant_id: variantId,
            image_url: publicUrl,
            alt_text: `${variantInfo} - ${file.name}`,
            sort_order: images.length,
            is_primary: images.length === 0 // Primera imagen como primaria
          });

        if (dbError) throw dbError;
      }

      // Recargar imágenes
      await loadVariantImages();
      onImagesUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.rpc('set_primary_variant_image', {
        p_image_id: imageId
      });

      if (updateError) throw updateError;
      await loadVariantImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('variant_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;
      await loadVariantImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Actualizar orden en BD
    try {
      setError(null);
      for (let i = 0; i < newImages.length; i++) {
        await supabase
          .from('variant_images')
          .update({ sort_order: i })
          .eq('id', newImages[i].id);
      }
      setImages(newImages);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white border border-primary-200 rounded-lg p-6">
      <h3 className="font-bold text-lg text-primary-900 mb-4">
        Imágenes de la variante: <span className="text-primary-600">{variantInfo}</span>
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Uploader de imágenes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-700 mb-3">
          Añadir Imágenes
        </label>
        <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center hover:bg-primary-50 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
            id={`file-input-${variantId}`}
          />
          <label htmlFor={`file-input-${variantId}`} className="cursor-pointer">
            <svg
              className="w-12 h-12 mx-auto text-primary-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-primary-600 font-medium">
              {isUploading ? 'Subiendo...' : 'Arrastra imágenes aquí o haz clic'}
            </p>
            <p className="text-sm text-primary-500 mt-1">
              JPG, PNG hasta 5MB cada una
            </p>
          </label>
        </div>
      </div>

      {/* Galería de imágenes */}
      {isLoading ? (
        <div className="text-center text-primary-500">Cargando imágenes...</div>
      ) : images.length === 0 ? (
        <div className="text-center text-primary-500 py-8">
          No hay imágenes para esta variante
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary-700 mb-3">
            {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
          </p>
          <div className="grid gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  image.is_primary
                    ? 'border-green-300 bg-green-50'
                    : 'border-primary-200 bg-primary-50'
                }`}
              >
                {/* Imagen */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 truncate">
                    {image.alt_text}
                  </p>
                  {image.is_primary && (
                    <span className="inline-block mt-1 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      ⭐ Imagen Principal
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      title="Establecer como principal"
                      className="p-2 hover:bg-primary-200 rounded transition-colors"
                    >
                      ⭐
                    </button>
                  )}

                  {index > 0 && (
                    <button
                      onClick={() => handleReorder(index, index - 1)}
                      title="Mover arriba"
                      className="p-2 hover:bg-primary-200 rounded transition-colors"
                    >
                      ↑
                    </button>
                  )}

                  {index < images.length - 1 && (
                    <button
                      onClick={() => handleReorder(index, index + 1)}
                      title="Mover abajo"
                      className="p-2 hover:bg-primary-200 rounded transition-colors"
                    >
                      ↓
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    title="Eliminar"
                    className="p-2 hover:bg-red-200 text-red-600 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
