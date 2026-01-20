import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

/**
 * POST /api/admin/products/variants
 * Crear, actualizar o eliminar variantes de producto
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    const { action, productId, variants } = data;

    if (action === 'upsert-multiple') {
      // Actualizar múltiples variantes
      const updates = variants.map((v: any) => ({
        id: v.id,
        product_id: productId,
        color: v.color,
        size: v.size,
        stock: v.stock,
        sku: v.sku
      }));

      const { error } = await supabaseAdmin
        .from('product_variants')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        message: 'Variantes actualizadas'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Acción no reconocida'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en POST /api/admin/products/variants:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/admin/products/variants
 * Eliminar una variante
 */
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    const { variantId } = data;

    // Primero eliminar las imágenes asociadas
    const { data: images } = await supabaseAdmin
      .from('variant_images')
      .select('image_url')
      .eq('variant_id', variantId);

    // TODO: Eliminar archivos del storage

    // Eliminar registros de imágenes
    await supabaseAdmin
      .from('variant_images')
      .delete()
      .eq('variant_id', variantId);

    // Eliminar la variante
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      message: 'Variante eliminada'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en DELETE /api/admin/products/variants:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
