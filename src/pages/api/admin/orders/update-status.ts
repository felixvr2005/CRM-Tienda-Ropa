import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { sendAdminNotificationEmail } from '@lib/email';
import Stripe from 'stripe';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

/**
 * API para actualizar estado de pedidos
 * PUT /api/admin/orders/update-status
 * Envía email al cliente cada que se actualiza el estado
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    // Validaciones
    if (!orderId || !status) {
      return new Response(
        JSON.stringify({ error: 'Se requieren orderId y status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el estado es válido
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el pedido actual ANTES de actualizar
    const { data: orderBefore, error: beforeError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (beforeError) {
      console.error('Error fetching order before update:', beforeError);
    }

    // Actualizar el pedido
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !order) {
      console.error('Error updating order:', updateError);
      return new Response(
        JSON.stringify({ error: 'No se pudo actualizar el pedido' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 📧 Enviar notificación al cliente sobre cambio de estado
    if (order.customer_email) {
      // Verificar si el estado realmente cambió
      const statusChanged = orderBefore?.status !== status;
      
      if (statusChanged) {
        try {
          console.log(`[${new Date().toISOString()}] Enviando email de cambio de estado para pedido ${order.order_number}`);
          console.log(`   Estado anterior: ${orderBefore?.status || 'unknown'} → Estado nuevo: ${status}`);
          
          const emailResult = await sendAdminNotificationEmail(order.customer_email, {
            order_number: order.order_number,
            previous_status: orderBefore?.status || 'unknown',
            new_status: status,
            customer_name: order.customer_name || 'Cliente',
            order_date: order.created_at,
            total_amount: order.total_amount,
            tracking_url: `${new URL(request.url).origin}/cuenta/pedidos/${order.order_number}`
          });
          
          if (emailResult.success) {
            console.log(`Email enviado exitosamente a ${order.customer_email}`);
          } else {
            console.error(`Error al enviar email:`, emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Error en try/catch al enviar email:', emailError);
          // No bloquear la operación si falla el email
        }
      } else {
        console.log(`Estado no cambió, email no enviado`);
      }
    } else {
      console.warn(`No hay email de cliente para el pedido ${order.order_number}`);
    }

    // Si el estado es "refunded", restaurar stock y procesar reembolso
    if (status === 'refunded') {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (items && Array.isArray(items)) {
        for (const item of items) {
          try {
            await supabaseAdmin.rpc('increase_stock', {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity
            });
          } catch (error) {
            console.error('Error restoring stock:', error);
          }
        }
      }

      // Procesar reembolso en Stripe si pagó con Stripe
      if (order.payment_method === 'stripe' && order.stripe_payment_intent_id) {
        try {
          console.log(`Procesando reembolso en Stripe para el Payment Intent: ${order.stripe_payment_intent_id}`);
          const refund = await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent_id,
            amount: Math.round(order.total_amount * 100) // Convertir a centavos
          });
          console.log(`Reembolso procesado exitosamente: ${refund.id}`);
          
          // Actualizar la BD con info del reembolso
          await supabaseAdmin
            .from('orders')
            .update({
              refunded_at: new Date().toISOString(),
              stripe_refund_id: refund.id
            })
            .eq('id', orderId);
        } catch (error: any) {
          console.error('Error procesando reembolso en Stripe:', error.message);
          // No bloquear si falla el reembolso
        }
      }
    }

    console.log(`[Admin] Order ${order.order_number} status updated to: ${status}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estado del pedido actualizado',
        order
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Orders API] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
