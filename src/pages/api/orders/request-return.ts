import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export async function POST({ request }: any) {
  try {
    const { orderNumber, reason } = await request.json();

    if (!orderNumber || !reason) {
      return new Response(
        JSON.stringify({ message: 'Faltan parámetros requeridos' }),
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

    // Validar que el pedido esté entregado
    if (order.status !== 'delivered') {
      return new Response(
        JSON.stringify({ 
          message: 'Solo se pueden devolver pedidos entregados' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si ya existe una solicitud de devolución
    const { data: existingReturn } = await supabaseAdmin
      .from('return_requests')
      .select('id')
      .eq('order_id', order.id)
      .neq('status', 'rejected')
      .single();

    if (existingReturn) {
      return new Response(
        JSON.stringify({ 
          message: 'Ya existe una solicitud de devolución para este pedido' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear solicitud de devolución
    const { data: returnRequest, error: createError } = await supabaseAdmin
      .from('return_requests')
      .insert({
        order_id: order.id,
        customer_id: order.customer_id,
        status: 'pending',
        reason,
        refund_amount: order.total_amount || order.subtotal
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creando solicitud de devolución:', createError);
      return new Response(
        JSON.stringify({ message: 'Error al solicitar la devolución' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Enviar email al cliente notificando que recibimos la solicitud
    // TODO: Enviar email al admin con la solicitud de devolución para que procese

    return new Response(
      JSON.stringify({
        message: 'Solicitud de devolución creada correctamente',
        returnId: returnRequest.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en request-return:', error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
