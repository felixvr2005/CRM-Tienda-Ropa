/**
 * Cloudinary Configuration
 * Servicio para gestión de imágenes de productos
 */

// Configuración de Cloudinary
const cloudinaryConfig = {
  cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: import.meta.env.PUBLIC_CLOUDINARY_API_KEY || '',
  apiSecret: import.meta.env.CLOUDINARY_API_SECRET || '',
};

/**
 * Genera la URL base de Cloudinary
 */
export function getCloudinaryUrl(): string {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}`;
}

/**
 * Genera una URL de imagen optimizada con transformaciones
 * @param publicId - ID público de la imagen en Cloudinary
 * @param options - Opciones de transformación
 */
export function getImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
    gravity?: 'auto' | 'face' | 'center';
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  return `${getCloudinaryUrl()}/image/upload/${transformString}${publicId}`;
}

/**
 * Genera URL para imagen de producto con tamaños predefinidos
 */
export function getProductImageUrl(
  publicId: string,
  size: 'thumbnail' | 'card' | 'detail' | 'zoom' = 'card'
): string {
  const sizes = {
    thumbnail: { width: 100, height: 100, crop: 'thumb' as const },
    card: { width: 400, height: 500, crop: 'fill' as const },
    detail: { width: 600, height: 750, crop: 'fill' as const },
    zoom: { width: 1200, height: 1500, crop: 'fit' as const },
  };

  return getImageUrl(publicId, sizes[size]);
}

/**
 * Genera URL para banner/hero images
 */
export function getBannerImageUrl(
  publicId: string,
  options: { width?: number; height?: number } = {}
): string {
  return getImageUrl(publicId, {
    width: options.width || 1920,
    height: options.height || 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Genera srcset responsive para imágenes
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [400, 600, 800, 1200]
): string {
  return widths
    .map(w => `${getImageUrl(publicId, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * URL del widget de upload de Cloudinary (para admin)
 */
export function getUploadWidgetConfig() {
  return {
    cloudName: cloudinaryConfig.cloudName,
    apiKey: cloudinaryConfig.apiKey,
    uploadPreset: 'tienda_productos', // Crear este preset en Cloudinary Dashboard
    folder: 'productos',
    sources: ['local', 'url', 'camera'],
    multiple: true,
    maxFiles: 10,
    maxFileSize: 10000000, // 10MB
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    cropping: true,
    croppingAspectRatio: 0.8, // 4:5 para productos
    showSkipCropButton: false,
    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#90A0B3',
        tabIcon: '#0078FF',
        menuIcons: '#5A616A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0078FF',
        action: '#FF620C',
        inactiveTabIcon: '#0E2F5A',
        error: '#F44235',
        inProgress: '#0078FF',
        complete: '#20B832',
        sourceBg: '#E4EBF1',
      },
    },
  };
}

/**
 * Genera firma para upload seguro desde el servidor
 * NOTA: Solo usar en endpoints del servidor (API routes)
 */
export async function generateUploadSignature(
  paramsToSign: Record<string, string>
): Promise<string> {
  // Esta función debe ejecutarse solo en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('generateUploadSignature debe ejecutarse solo en el servidor');
  }

  const crypto = await import('crypto');
  
  // Ordenar parámetros alfabéticamente
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');

  // Crear firma con API Secret
  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + cloudinaryConfig.apiSecret)
    .digest('hex');

  return signature;
}

/**
 * Eliminar imagen de Cloudinary (desde el servidor)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('deleteImage debe ejecutarse solo en el servidor');
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await generateUploadSignature({
      public_id: publicId,
      timestamp: timestamp.toString(),
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', cloudinaryConfig.apiKey);
    formData.append('timestamp', timestamp.toString());

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    return false;
  }
}

export default {
  getImageUrl,
  getProductImageUrl,
  getBannerImageUrl,
  getResponsiveSrcSet,
  getUploadWidgetConfig,
  generateUploadSignature,
  deleteImage,
};
