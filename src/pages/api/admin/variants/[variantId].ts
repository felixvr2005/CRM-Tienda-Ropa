/**
 * API - Actualizar variante (color, etc)
 */
export const prerender = false;

import { supabase } from '@lib/supabase';
import type { APIRoute } from 'astro';

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { variantId } = params;
    const body = await request.json();

    const { color, color_hex } = body;

    if (!variantId) {
      return new Response(JSON.stringify({ error: 'ID de variante requerido' }), {
        status: 400,
      });
    }

    const { error } = await supabase
      .from('product_variants')
      .update({
        color,
        color_hex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', variantId);

    if (error) {
      console.error('Error al actualizar variante:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Variante actualizada' }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error en PATCH /api/admin/variants:', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
    });
  }
};
