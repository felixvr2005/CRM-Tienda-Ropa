/**
 * API: Liberar stock reservado
 * Se llama cuando expira el timer del carrito o se elimina un producto.
 * Soporta tanto release individual como batch.
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

// Máximo stock posible por variante (protección contra inflación)
const MAX_STOCK_PER_VARIANT = 10000;
const MAX_RELEASE_PER_REQUEST = 50;
const MAX_BATCH_SIZE = 30;

/**
 * Libera stock de forma atómica usando un UPDATE con expresión SQL
 */
async function releaseStockAtomic(variantId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  if (!variantId || !quantity || quantity <= 0) {
    return { success: false, error: 'variantId y quantity (> 0) son requeridos' };
  }
  if (quantity > MAX_RELEASE_PER_REQUEST) {
    logger.warn('Intento de liberar cantidad excesiva', { variantId, quantity });
    return { success: false, error: 'Cantidad a liberar excede el límite permitido' };
  }

  // Atomic update via existing RPC
  const { error: updateError } = await supabaseAdmin.rpc('increase_stock', {
    p_variant_id: variantId,
    p_quantity: quantity,
  });

  // If RPC fails, fallback to standard update
  if (updateError) {
    const { data: variant } = await supabaseAdmin
      .from('product_variants')
      .select('stock')
      .eq('id', variantId)
      .single();

    if (!variant) return { success: false, error: 'Variante no encontrada' };

    const newStock = Math.min(variant.stock + quantity, MAX_STOCK_PER_VARIANT);
    const { error: fallbackError } = await supabaseAdmin
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (fallbackError) return { success: false, error: 'Error al liberar stock' };

    logger.info('Stock liberado (fallback)', { variantId, quantity, newStock });
    return { success: true };
  }

  if (updateError) {
    logger.error('Error liberando stock', { variantId, error: updateError });
    return { success: false, error: 'Error al liberar stock' };
  }

  logger.info('Stock liberado (atomic)', { variantId, quantity });
  return { success: true };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // BATCH mode: { items: [{ variantId, quantity }, ...] }
    if (Array.isArray(body.items)) {
      const items = body.items.slice(0, MAX_BATCH_SIZE);
      const results: { variantId: string; success: boolean; error?: string }[] = [];

      for (const item of items) {
        const result = await releaseStockAtomic(item.variantId, item.quantity);
        results.push({ variantId: item.variantId, ...result });
      }

      const allSuccess = results.every(r => r.success);
      return new Response(
        JSON.stringify({ success: allSuccess, results }),
        { status: allSuccess ? 200 : 207 }
      );
    }

    // SINGLE mode: { variantId, quantity }
    const { variantId, quantity } = body;

    if (!variantId || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({ error: 'variantId y quantity (> 0) son requeridos' }),
        { status: 400 }
      );
    }

    const result = await releaseStockAtomic(variantId, quantity);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.error === 'Variante no encontrada' ? 404 : 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
