/**
 * API: Seguimiento público de pedido (para invitados)
 * Valida email + orderNumber como credenciales de acceso
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase();
  const orderNumber = url.searchParams.get('orderNumber')?.trim();

  if (!email || !orderNumber) {
    return new Response(
      JSON.stringify({ error: 'Se requiere email y número de pedido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Buscar pedido que coincida en email Y orderNumber
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('customer_email', email)
    .single();

  if (error || !order) {
    return new Response(
      JSON.stringify({ error: 'No se encontró ningún pedido con esos datos. Verifica tu email y número de pedido.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Obtener items del pedido
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  return new Response(
    JSON.stringify({
      order: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        coupon_code: order.coupon_code,
        shipping_address: order.shipping_address,
        tracking_number: order.tracking_number,
        shipping_method: order.shipping_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items: (orderItems || []).map((item: any) => ({
        product_name: item.product_name,
        product_image: item.product_image,
        product_slug: item.product_slug,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total || item.total_price || (item.unit_price * item.quantity),
        discount_percentage: item.discount_percentage || 0,
      })),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
