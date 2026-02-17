import { logger } from '@lib/logger';
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
            clave: 'flash_sales_enabled',
            valor: String(flash_sales_enabled),
            tipo: 'boolean',
            descripcion: 'Activa/desactiva ofertas flash'
          }, { onConflict: 'clave' })
      );
    }

    if (flash_sales_discount !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            clave: 'flash_sales_discount',
            valor: String(flash_sales_discount),
            tipo: 'number',
            descripcion: 'Descuento de ofertas flash (%)'
          }, { onConflict: 'clave' })
      );
    }

    if (min_order_amount !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            clave: 'min_order_amount',
            valor: String(min_order_amount),
            tipo: 'number',
            descripcion: 'Monto mínimo del pedido'
          }, { onConflict: 'clave' })
      );
    }

    if (free_shipping_threshold !== undefined) {
      updates.push(
        supabaseAdmin
          .from('configuracion')
          .upsert({
            clave: 'free_shipping_threshold',
            valor: String(free_shipping_threshold),
            tipo: 'number',
            descripcion: 'Envío gratis a partir de este monto'
          }, { onConflict: 'clave' })
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

    logger.info('[Settings] Configuration updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configuración actualizada'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('[Settings API] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
