/**
 * API - Gestión de imágenes de variantes
 */
export const prerender = false;

import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  logger.info('POST /api/admin/variant-images start');
  
  try {
    logger.debug('Request info', { method: request.method, headers: Object.fromEntries(request.headers.entries()) });
    
    let body: any;
    try {
      body = await request.json();
      logger.silly?.('Body parsed (debug)', JSON.stringify(body, null, 2));
    } catch (parseErr) {
      logger.error('JSON parse error in variant-images', { error: String(parseErr) });
      logger.warn('Request body is empty or invalid');
      return new Response(
        JSON.stringify({ error: 'Body vacío o JSON inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { variant_id, images } = body;

    if (!variant_id) {
      logger.error('ERROR: No variant_id');
      return new Response(JSON.stringify({ error: 'variant_id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!images || images.length === 0) {
      logger.error('ERROR: No images');
      return new Response(JSON.stringify({ error: 'images requeridas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    logger.info('Insertando imágenes para variante', { variant_id, count: images.length });
    
    const imagesToInsert = images.map((img: any) => ({
      variant_id,
      image_url: img.image_url,
      alt_text: img.alt_text || 'Imagen de variante',
      is_primary: img.is_primary === true,
      sort_order: parseInt(img.sort_order) || 0,
    }));

    logger.debug('Datos a insertar (ejemplo)', imagesToInsert[0]);

    const { data, error } = await supabaseAdmin
      .from('variant_images')
      .insert(imagesToInsert)
      .select();

    if (error) {
      logger.error('DB error inserting variant images', { error });
      return new Response(
        JSON.stringify({ 
          error: `Error de BD: ${error.message}`,
          code: error.code
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    logger.info('Variant images inserted', { inserted: data?.length || 0 });

    return new Response(
      JSON.stringify({ 
        success: true,
        images: data || []
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    logger.error('Unhandled exception in /api/admin/variant-images', { error: String(err) });
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
