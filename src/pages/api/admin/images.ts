/**
 * API Endpoint para gestión de imágenes con Cloudinary
 * POST: Generar firma para upload seguro
 * DELETE: Eliminar imagen
 */
import type { APIRoute } from 'astro';
import { generateUploadSignature, deleteImage } from '../../../lib/cloudinary';

// Generar firma para upload seguro
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return new Response(
        JSON.stringify({ error: 'Parámetros requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const signature = await generateUploadSignature(paramsToSign);

    return new Response(
      JSON.stringify({ signature }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Error generando firma', { error: String(error) });
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Eliminar imagen de Cloudinary
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return new Response(
        JSON.stringify({ error: 'publicId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const success = await deleteImage(publicId);

    if (success) {
      return new Response(
        JSON.stringify({ message: 'Imagen eliminada correctamente' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'No se pudo eliminar la imagen' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    logger.error('Error eliminando imagen', { error: String(error) });
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
