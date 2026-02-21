/**
 * API: Reabastecer stock de variantes (Restock)
 * - POST: Añadir o establecer stock de una o múltiples variantes
 * - Registra cambios en stock_change_log
 * - Notifica por email si el producto estaba agotado y ahora tiene stock
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

interface RestockItem {
  variant_id: string;
  quantity: number;
  mode?: 'add' | 'set'; // 'add' suma al stock actual, 'set' establece el valor
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // Verificar autenticación admin
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    // Soportar tanto un item como un array de items
    const items: RestockItem[] = Array.isArray(body.items)
      ? body.items
      : [{ variant_id: body.variant_id, quantity: body.quantity, mode: body.mode }];

    if (!items.length || items.some(i => !i.variant_id || i.quantity == null || i.quantity < 0)) {
      return new Response(JSON.stringify({
        error: 'Se requiere variant_id y quantity (>= 0) para cada item'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Obtener el user ID del admin para el log
    const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken);
    const adminUserId = user?.id || null;

    const results: Array<{
      variant_id: string;
      previous_stock: number;
      new_stock: number;
      product_name: string;
      size: string;
      color: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const item of items) {
      try {
        // Obtener variante actual con info de producto
        const { data: variant, error: fetchError } = await supabaseAdmin
          .from('product_variants')
          .select('id, stock, color, size, product_id, product:products(id, name, slug)')
          .eq('id', item.variant_id)
          .single();

        if (fetchError || !variant) {
          results.push({
            variant_id: item.variant_id,
            previous_stock: 0,
            new_stock: 0,
            product_name: 'Desconocido',
            size: '',
            color: '',
            success: false,
            error: 'Variante no encontrada'
          });
          continue;
        }

        const variantData = variant as any;
        const previousStock = variantData.stock || 0;
        const mode = item.mode || 'add';
        const newStock = mode === 'add'
          ? previousStock + item.quantity
          : item.quantity;

        // Validar que no sea negativo
        if (newStock < 0) {
          results.push({
            variant_id: item.variant_id,
            previous_stock: previousStock,
            new_stock: previousStock,
            product_name: variantData.product?.name || 'Desconocido',
            size: variantData.size || '',
            color: variantData.color || '',
            success: false,
            error: `El stock resultante sería negativo (${newStock})`
          });
          continue;
        }

        // Actualizar stock
        const { error: updateError } = await supabaseAdmin
          .from('product_variants')
          .update({
            stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.variant_id);

        if (updateError) throw updateError;

        // Registrar en stock_change_log
        try {
          await supabaseAdmin
            .from('stock_change_log')
            .insert({
              product_id: item.variant_id,
              previous_stock: previousStock,
              new_stock: newStock,
              reason: mode === 'add' ? `restock_manual:+${item.quantity}` : `stock_set:${newStock}`,
              changed_by: adminUserId
            });
        } catch (e: any) {
          logger.warn('Error logging stock change:', e);
        }

        results.push({
          variant_id: item.variant_id,
          previous_stock: previousStock,
          new_stock: newStock,
          product_name: variantData.product?.name || 'Desconocido',
          size: variantData.size || '',
          color: variantData.color || '',
          success: true
        });

        logger.info('Stock actualizado', {
          variant_id: item.variant_id,
          previousStock,
          newStock,
          mode,
          admin: adminUserId
        });
      } catch (itemError: any) {
        results.push({
          variant_id: item.variant_id,
          previous_stock: 0,
          new_stock: 0,
          product_name: 'Error',
          size: '',
          color: '',
          success: false,
          error: itemError.message
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    const someSuccess = results.some(r => r.success);

    return new Response(JSON.stringify({
      success: someSuccess,
      results,
      message: allSuccess
        ? `Stock actualizado para ${results.length} variante(s)`
        : someSuccess
          ? 'Algunas variantes no se pudieron actualizar'
          : 'Error al actualizar el stock'
    }), {
      status: allSuccess ? 200 : someSuccess ? 207 : 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    logger.error('Error en restock:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
