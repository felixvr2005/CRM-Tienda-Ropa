/**
 * Panel Unificado de Personalización de Variantes
 * - Selector de colores RGB
 * - Carga de imágenes drag & drop con Cloudinary Widget
 * - Preview de imágenes
 * - Auto-guardado
 */
import React, { useState, useRef, useEffect } from 'react';
import type { ProductVariant } from '@lib/database.types';

interface VariantImage {
  id: string;
  variant_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

type Variant = ProductVariant & {
  images: VariantImage[];
};

interface Props {
  productId: string;
  productName: string;
  productSlug?: string;
  variants: Variant[];
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function VariantsPanel({ productId, productName, productSlug, variants }: Props) {
  const [variantsList, setVariantsList] = useState<Variant[]>(variants);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ [key: string]: { type: 'success' | 'error'; text: string } }>({});
  const [expandedVariant, setExpandedVariant] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Cargar widget de Cloudinary
  useEffect(() => {
    if (window.cloudinary) {
      setWidgetLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => setWidgetLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Mostrar mensaje temporalmente
  const showMessage = (variantId: string, type: 'success' | 'error', text: string) => {
    setMessage(prev => ({ ...prev, [variantId]: { type, text } }));
    setTimeout(() => {
      setMessage(prev => {
        const newMsg = { ...prev };
        delete newMsg[variantId];
        return newMsg;
      });
    }, 2500);
  };

  // Actualizar color de la variante
  const handleColorChange = async (variantId: string, newColor: string) => {
    try {
      setSaving(prev => ({ ...prev, [variantId]: true }));

      // Extraer color_hex del input
      const colorName = newColor || 'Personalizado';
      const hexValue = newColor.startsWith('#') ? newColor : '#000000';

      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          color: colorName,
          color_hex: hexValue
        })
      });

      if (!response.ok) throw new Error('Error al guardar color');

      // Actualizar estado local
      setVariantsList(prev =>
        prev.map(v =>
          v.id === variantId
            ? { ...v, color: colorName, color_hex: hexValue }
            : v
        )
      );

      showMessage(variantId, 'success', 'Color actualizado');
    } catch (error) {
      showMessage(variantId, 'error', 'Error al guardar color');
      console.error(error);
    } finally {
      setSaving(prev => ({ ...prev, [variantId]: false }));
    }
  };

  // Abrir widget de Cloudinary para cargar imágenes
  const handleImageUpload = async (variantId: string) => {
    if (!widgetLoaded || !window.cloudinary) {
      showMessage(variantId, 'error', 'El widget no está listo');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'tienda_productos',
        folder: 'productos',
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: 5,
        maxFileSize: 10000000, // 10MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        cropping: false,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#CBD5E1',
            tabIcon: '#3B82F6',
            menuIcons: '#64748B',
            textDark: '#1E293B',
            textLight: '#FFFFFF',
            link: '#3B82F6',
            action: '#F97316',
            inactiveTabIcon: '#94A3B8',
            error: '#EF4444',
            inProgress: '#3B82F6',
            complete: '#22C55E',
            sourceBg: '#F1F5F9',
          },
        },
      },
      async (error: any, result: any) => {
        console.log('Widget callback:', { error, resultEvent: result?.event, hasInfo: !!result?.info });

        if (error) {
          console.error('Cloudinary error:', error);
          showMessage(variantId, 'error', `Error: ${error.message}`);
          return;
        }

        if (result && result.event === 'success') {
          console.log('Image uploaded successfully:', result.info);
          
          try {
            setSaving(prev => ({ ...prev, [variantId]: true }));

            const imageUrl = result.info.secure_url;
            const imageAlt = result.info.original_filename || result.info.public_id;

            console.log('Saving to DB:', { variant_id: variantId, image_url: imageUrl });

            // Guardar en la BD
            const response = await fetch('/api/admin/variant-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                variant_id: variantId,
                images: [{
                  image_url: imageUrl,
                  alt_text: imageAlt,
                  is_primary: false,
                  sort_order: variantsList.find(v => v.id === variantId)?.images?.length || 0,
                }]
              })
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API error response:', errorText);
              try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.error || 'Error al guardar imágenes');
              } catch (e) {
                throw new Error('Error al guardar imágenes: ' + errorText);
              }
            }

            const result_data = await response.json();
            console.log('Images saved:', result_data.images?.length);

            // Actualizar lista
            setVariantsList(prev =>
              prev.map(v =>
                v.id === variantId
                  ? { ...v, images: [...(v.images || []), ...(result_data.images || [])] }
                  : v
              )
            );

            showMessage(variantId, 'success', 'Imagen agregada');
          } catch (error) {
            showMessage(variantId, 'error', `Error al guardar: ${error instanceof Error ? error.message : 'desconocido'}`);
            console.error('Save error:', error);
          } finally {
            setSaving(prev => ({ ...prev, [variantId]: false }));
          }
        }
      }
    );

    widget.open();
  };

  // Handle file input changes (para compatibilidad con input file)
  const handleFileInputChange = (variantId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      handleImageUpload(variantId);
    }
  };

  // Eliminar imagen
  const handleDeleteImage = async (variantId: string, imageId: string) => {
    try {
      setSaving(prev => ({ ...prev, [variantId]: true }));

      const response = await fetch(`/api/admin/variant-images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar imagen');
      }

      setVariantsList(prev =>
        prev.map(v =>
          v.id === variantId
            ? { ...v, images: v.images?.filter(img => img.id !== imageId) || [] }
            : v
        )
      );

      showMessage(variantId, 'success', 'Imagen eliminada');
    } catch (error) {
      showMessage(variantId, 'error', 'Error al eliminar imagen');
      console.error('Delete error:', error);
    } finally {
      setSaving(prev => ({ ...prev, [variantId]: false }));
    }
  };

  // Marcar imagen como principal
  const handleSetPrimary = async (variantId: string, imageId: string) => {
    try {
      setSaving(prev => ({ ...prev, [variantId]: true }));

      const response = await fetch(`/api/admin/variant-images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          variant_id: variantId,
          is_primary: true 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar imagen principal');
      }

      setVariantsList(prev =>
        prev.map(v =>
          v.id === variantId
            ? {
                ...v,
                images: v.images?.map(img => ({
                  ...img,
                  is_primary: img.id === imageId
                })) || []
              }
            : v
        )
      );

      showMessage(variantId, 'success', 'Imagen principal actualizada');
    } catch (error) {
      showMessage(variantId, 'error', 'Error al actualizar imagen');
      console.error('Set primary error:', error);
    } finally {
      setSaving(prev => ({ ...prev, [variantId]: false }));
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{productName}</h1>
        <p className="text-slate-500 mt-2">Personaliza colores e imágenes de cada variante</p>
      </div>

      {/* Variantes Accordion */}
      <div className="space-y-4">
        {variantsList.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-500">No hay variantes disponibles</p>
          </div>
        ) : (
          variantsList.map((variant) => (
            <div
              key={variant.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header del Acordeón */}
              <button
                onClick={() =>
                  setExpandedVariant(expandedVariant === variant.id ? null : variant.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Color Preview */}
                  <div
                    className="w-12 h-12 rounded-full border-2 border-slate-200 shadow-md"
                    style={{
                      backgroundColor: variant.color_hex || '#e2e8f0'
                    }}
                  />

                  {/* Información de la Variante */}
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">
                      {variant.color || 'Sin color'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {variant.size} • {variant.images?.length || 0} imagen(es) • Stock: {variant.stock}
                    </p>
                  </div>
                </div>

                {/* Indicador de expansión */}
                <svg
                  className={`w-5 h-5 text-slate-600 transition-transform ${
                    expandedVariant === variant.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Contenido Expandido */}
              {expandedVariant === variant.id && (
                <div className="border-t border-slate-200 px-6 py-6 bg-white space-y-6">
                  {/* Mensaje de Estado */}
                  {message[variant.id] && (
                    <div
                      className={`p-4 rounded-lg text-sm font-medium ${
                        message[variant.id].type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {message[variant.id].text}
                    </div>
                  )}

                  {/* SECCIÓN 1: COLOR */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Color
                    </label>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 mb-2">Selector RGB</label>
                        <input
                          type="color"
                          value={variant.color_hex || '#000000'}
                          onChange={(e) =>
                            handleColorChange(variant.id, e.target.value)
                          }
                          disabled={saving[variant.id]}
                          className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 mb-2">Nombre</label>
                        <input
                          type="text"
                          value={variant.color || ''}
                          onChange={(e) => {
                            setVariantsList(prev =>
                              prev.map(v =>
                                v.id === variant.id
                                  ? { ...v, color: e.target.value }
                                  : v
                              )
                            );
                          }}
                          onBlur={(e) => {
                            if (e.target.value !== variant.color) {
                              handleColorChange(variant.id, variant.color_hex || '#000000');
                            }
                          }}
                          placeholder="Ej: Azul Marino"
                          disabled={saving[variant.id]}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: IMÁGENES */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Imágenes
                    </label>

                    {/* Área de Carga */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleImageUpload(variant.id);
                      }}
                      onClick={() => handleImageUpload(variant.id)}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      <svg
                        className="w-10 h-10 text-slate-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-slate-700">
                        Arrastra imágenes aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG o GIF • Máx 5MB
                      </p>
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[variant.id] = el;
                        }}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(variant.id, e)}
                        className="hidden"
                        disabled={saving[variant.id]}
                      />
                    </div>

                    {/* Galería de Imágenes */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-600 mb-3">
                          {variant.images.length} imagen(es) cargada(s)
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {variant.images.map((image) => (
                            <div
                              key={image.id}
                              className="relative group rounded-lg overflow-hidden bg-slate-100 aspect-square"
                            >
                              <img
                                src={image.image_url}
                                alt={image.alt_text}
                                className="w-full h-full object-cover"
                              />

                              {/* Overlay de acciones */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {/* Botón: Marcar como Principal */}
                                <button
                                  onClick={() => handleSetPrimary(variant.id, image.id)}
                                  title="Marcar como imagen principal"
                                  disabled={saving[variant.id]}
                                  className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>

                                {/* Botón: Eliminar */}
                                <button
                                  onClick={() => handleDeleteImage(variant.id, image.id)}
                                  title="Eliminar imagen"
                                  disabled={saving[variant.id]}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* Badge: Imagen Principal */}
                              {image.is_primary && (
                                <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                                  Principal
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN 3: ACCIONES */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <a
                      href={`/productos/${productSlug || productName.toLowerCase().replace(/\s+/g, '-')}?color=${encodeURIComponent(variant.color || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver en tienda
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
