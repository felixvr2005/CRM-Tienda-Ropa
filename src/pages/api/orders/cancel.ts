import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export async function POST({ request }: any) {
  try {
    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ message: 'Número de pedido requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ message: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el pedido pueda ser cancelado (solo si está en "confirmed" o "pending")
    if (!['confirmed', 'pending'].includes(order.status)) {
      return new Response(
        JSON.stringify({ 
          message: 'Este pedido no puede ser cancelado. Solo se pueden cancelar pedidos pendientes o confirmados.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener items del pedido para restaurar stock
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', order.id);

    if (itemsError) {
      console.error('Error obteniendo items:', itemsError);
      return new Response(
        JSON.stringify({ message: 'Error al procesar la cancelación' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Restaurar stock para cada variante
    for (const item of orderItems || []) {
      if (item.variant_id) {
        const { error: updateError } = await supabaseAdmin
          .from('product_variants')
          .update({
            stock: supabaseAdmin.rpc('increment_stock', { 
              variant_id: item.variant_id, 
              quantity: item.quantity 
            })
          })
          .eq('id', item.variant_id);

        // Si rpc falla, usar update directo
        if (updateError) {
          await supabaseAdmin
            .from('product_variants')
            .update({
              stock: supabaseAdmin.raw(`stock + ${item.quantity}`)
            })
            .eq('id', item.variant_id);
        }
      }
    }

    // Actualizar estado del pedido a "cancelled"
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ message: 'Error al actualizar el estado del pedido' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Procesar reembolso en Stripe si existe payment intent
    if (order.stripe_payment_intent && order.payment_status === 'paid') {
      try {
        const response = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `payment_intent=${order.stripe_payment_intent}`
        });

        const refundData = await response.json();
        
        if (!response.ok) {
          console.error('Error en Stripe refund:', refundData);
          // Continuar aunque falle Stripe
        }
      } catch (stripeError) {
        console.error('Error procesando reembolso Stripe:', stripeError);
        // No bloquear si falla Stripe, el reembolso se puede procesar manualmente
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Pedido cancelado correctamente',
        orderNumber
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en cancel order:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
