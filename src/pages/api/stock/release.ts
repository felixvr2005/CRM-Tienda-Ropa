/**
 * API: Liberar stock reservado
 * Se llama cuando expira el timer del carrito o se elimina un producto.
 * Incluye validación contra inflación de stock.
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

// Máximo stock posible por variante (protección contra inflación)
const MAX_STOCK_PER_VARIANT = 10000;
const MAX_RELEASE_PER_REQUEST = 50;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { variantId, quantity } = await request.json();
    
    if (!variantId || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({ error: 'variantId y quantity (> 0) son requeridos' }),
        { status: 400 }
      );
    }

    // Protección: limitar cantidad máxima por request
    if (quantity > MAX_RELEASE_PER_REQUEST) {
      logger.warn('Intento de liberar cantidad excesiva', { variantId, quantity });
      return new Response(
        JSON.stringify({ error: 'Cantidad a liberar excede el límite permitido' }),
        { status: 400 }
      );
    }

    // Obtener stock actual
    const { data: variant, error: fetchError } = await supabaseAdmin
      .from('product_variants')
      .select('stock')
      .eq('id', variantId)
      .single();

    if (fetchError || !variant) {
      return new Response(
        JSON.stringify({ error: 'Variante no encontrada' }),
        { status: 404 }
      );
    }

    // Devolver stock con cap para evitar inflación
    const newStock = Math.min(variant.stock + quantity, MAX_STOCK_PER_VARIANT);
    const { error: updateError } = await supabaseAdmin
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Error al liberar stock' }),
        { status: 500 }
      );
    }

    // Registrar cambio en stock_change_log (no bloquear si falla)
    // Registrar cambio (fire-and-forget, no bloquear si falla)
    Promise.resolve(
      supabaseAdmin
        .from('stock_change_log')
        .insert({
          product_id: variantId,
          previous_stock: variant.stock,
          new_stock: newStock,
          reason: 'release_cart'
        })
    ).catch(() => {});

    logger.info('Stock liberado', { variantId, quantity, newStock });

    return new Response(
      JSON.stringify({ success: true, newStock }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error liberando stock:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
