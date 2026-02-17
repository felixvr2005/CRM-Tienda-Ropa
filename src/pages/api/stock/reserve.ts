/**
 * API: Reservar stock temporalmente
 * Se llama cuando se añade un producto al carrito
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { variantId, quantity } = await request.json();
    
    if (!variantId || !quantity) {
      return new Response(
        JSON.stringify({ error: 'variantId y quantity son requeridos' }),
        { status: 400 }
      );
    }

    // Verificar stock disponible
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

    if (variant.stock < quantity) {
      return new Response(
        JSON.stringify({ error: 'Stock insuficiente', availableStock: variant.stock }),
        { status: 400 }
      );
    }

    // Restar stock temporalmente
    const newStock = variant.stock - quantity;
    const { error: updateError } = await supabaseAdmin
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Error al reservar stock' }),
        { status: 500 }
      );
    }

    // Registrar cambio en stock_change_log
    await supabaseAdmin
      .from('stock_change_log')
      .insert({
        product_id: variantId,
        previous_stock: variant.stock,
        new_stock: newStock,
        reason: 'reserve_cart'
      });

    logger.info('Stock reservado', { variantId, quantity, newStock });

    return new Response(
      JSON.stringify({ success: true, newStock }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Error reservando stock:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
