/**
 * API - Gestión de imágenes de variantes
 */
export const prerender = false;

import { supabaseAdmin } from '@lib/supabase';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  console.log('=== POST /api/admin/variant-images START ===');
  
  try {
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    let body: any;
    try {
      body = await request.json();
      console.log('✓ Body parsed:', JSON.stringify(body, null, 2));
    } catch (parseErr) {
      console.error('❌ JSON Parse error:', parseErr);
      console.log('Request body is empty or invalid');
      return new Response(
        JSON.stringify({ error: 'Body vacío o JSON inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { variant_id, images } = body;

    if (!variant_id) {
      console.error('ERROR: No variant_id');
      return new Response(JSON.stringify({ error: 'variant_id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!images || images.length === 0) {
      console.error('ERROR: No images');
      return new Response(JSON.stringify({ error: 'images requeridas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✓ Insertando ${images.length} imagen(es) para variante ${variant_id}`);
    
    const imagesToInsert = images.map((img: any) => ({
      variant_id,
      image_url: img.image_url,
      alt_text: img.alt_text || 'Imagen de variante',
      is_primary: img.is_primary === true,
      sort_order: parseInt(img.sort_order) || 0,
    }));

    console.log('Datos a insertar:', JSON.stringify(imagesToInsert[0], null, 2));

    const { data, error } = await supabaseAdmin
      .from('variant_images')
      .insert(imagesToInsert)
      .select();

    if (error) {
      console.error('❌ DB ERROR:', error);
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

    console.log(`✅ Insertadas ${data?.length || 0} imágenes`);

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
    console.error('❌ CATCH ERROR:', err);
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
