import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { sendAdminNotificationEmail } from '@lib/email';

export const prerender = false;

/**
 * API para actualizar número de seguimiento
 * PUT /api/admin/orders/update-tracking
 */
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    let { orderNumber, trackingNumber, trackingUrl } = body;

    // Validaciones
    if (!orderNumber) {
      return new Response(
        JSON.stringify({ error: 'Se requiere orderNumber' }),
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
        JSON.stringify({ error: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar tracking
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        status: 'shipped', // Marcar como enviado
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // Enviar email al cliente sobre el envío
    if (order.customer_email) {
      try {
        await sendAdminNotificationEmail({
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          orderNumber: order.order_number,
          status: 'shipped',
          trackingNumber: trackingNumber,
          trackingUrl: trackingUrl
        });
      } catch (emailError) {
        console.error('Error sending tracking email:', emailError);
        // No fallar si el email falla
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Información de seguimiento actualizada'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error updating tracking:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al actualizar seguimiento' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
