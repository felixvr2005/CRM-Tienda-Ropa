import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';

export const prerender = false;

/**
 * API para actualizar configuración de la tienda
 * PUT /api/admin/settings
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación (aquí se debería validar el token)
    // Por ahora se asume que es admin si llega la solicitud
    
    const body = await request.json();
    const {
      flash_sales_enabled,
      flash_sales_discount,
      min_order_amount,
      free_shipping_threshold
    } = body;

    // Actualizar o insertar cada configuración
    const updates = [];

    if (flash_sales_enabled !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            key: 'flash_sales_enabled',
            value: String(flash_sales_enabled),
            type: 'boolean',
            description: 'Activa/desactiva ofertas flash'
          }, { onConflict: 'key' })
      );
    }

    if (flash_sales_discount !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            key: 'flash_sales_discount',
            value: String(flash_sales_discount),
            type: 'number',
            description: 'Descuento de ofertas flash (%)'
          }, { onConflict: 'key' })
      );
    }

    if (min_order_amount !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            key: 'min_order_amount',
            value: String(min_order_amount),
            type: 'number',
            description: 'Monto mínimo del pedido'
          }, { onConflict: 'key' })
      );
    }

    if (free_shipping_threshold !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            key: 'free_shipping_threshold',
            value: String(free_shipping_threshold),
            type: 'number',
            description: 'Envío gratis a partir de este monto'
          }, { onConflict: 'key' })
      );
    }

    // Ejecutar todas las actualizaciones
    const results = await Promise.all(updates);

    // Verificar errores
    const hasErrors = results.some(r => r.error);
    if (hasErrors) {
      return new Response(
        JSON.stringify({ error: 'Error al actualizar configuración' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Settings] Configuration updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configuración actualizada'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Settings API] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
