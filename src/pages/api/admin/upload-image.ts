/**
 * API - Upload de imágenes a Cloudinary
 * POST: Generar firma para upload seguro desde cliente
 */
import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con credenciales del servidor
cloudinary.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { folder = 'productos', timestamp } = body;

    // Generar firma para upload seguro
    const signature = cloudinary.utils.api_sign_request({
      folder,
      timestamp,
      upload_preset: 'tienda_productos'
    }, process.env.CLOUDINARY_API_SECRET || '');

    return new Response(
      JSON.stringify({ signature }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generando firma:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error al generar firma'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
