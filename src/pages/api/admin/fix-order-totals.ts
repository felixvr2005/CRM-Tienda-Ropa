import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';

export const prerender = false;

/**
 * Endpoint privado para arreglar órdenes con total_amount NULL
 * Endpoint: /api/admin/fix-order-totals
 * Método: POST
 * Authorization: Solo admin (debe pasar token)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Obtener todas las órdenes con total_amount NULL
    const { data: ordersWithNull, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .is('total_amount', null);

    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Error al obtener órdenes',
        details: fetchError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!ordersWithNull || ordersWithNull.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No hay órdenes con total_amount NULL',
        updated: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Encontradas ${ordersWithNull.length} órdenes para reparar`);

    // Actualizar cada orden
    let updated = 0;
    for (const order of ordersWithNull) {
      const subtotal = order.subtotal || 0;
      const shippingCost = order.shipping_cost || 0;
      const discountAmount = order.discount_amount || 0;
      const totalAmount = subtotal + shippingCost - discountAmount;

      console.log(`🔄 Actualizando ${order.order_number}: ${totalAmount}€`);

      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

      if (!updateError) {
        updated++;
      } else {
        console.error(`❌ Error en ${order.order_number}:`, updateError);
      }
    }

    console.log(`✅ ${updated}/${ordersWithNull.length} órdenes actualizadas`);

    return new Response(JSON.stringify({ 
      message: `${updated} órdenes actualizadas correctamente`,
      updated,
      total: ordersWithNull.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
