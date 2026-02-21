import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

/**
 * POST /api/returns/mark-shipped
 * Permite al cliente marcar su devolución como "enviada" (shipped)
 * Solo funciona si el estado actual es label_sent o approved
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { returnRequestId } = await request.json();

    if (!returnRequestId) {
      return new Response(JSON.stringify({ error: 'returnRequestId requerido' }), { status: 400 });
    }

    // Verificar autenticación
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // Obtener la devolución
    const { data: returnRequest, error: returnError } = await supabaseAdmin
      .from('return_requests')
      .select('*, orders(customer_id, customer_email)')
      .eq('id', returnRequestId)
      .single() as any;

    if (returnError || !returnRequest) {
      return new Response(JSON.stringify({ error: 'Devolución no encontrada' }), { status: 404 });
    }

    // Verificar que pertenece al usuario
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    const isOwner =
      (customer?.id && returnRequest.customer_id === customer.id) ||
      (customer?.id && returnRequest.orders?.customer_id === customer.id) ||
      (returnRequest.orders?.customer_email === user.email);

    if (!isOwner) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
    }

    // Solo permitir cambio de label_sent/approved → shipped
    const allowedStatuses = ['label_sent', 'approved'];
    if (!allowedStatuses.includes(returnRequest.status)) {
      return new Response(JSON.stringify({
        error: `No se puede marcar como enviado desde el estado "${returnRequest.status}"`
      }), { status: 400 });
    }

    // Actualizar estado
    const { error: updateError } = await supabaseAdmin
      .from('return_requests')
      .update({
        status: 'shipped',
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', returnRequestId);

    if (updateError) {
      logger.error('Error marking return as shipped', { error: updateError });
      return new Response(JSON.stringify({ error: 'Error actualizando estado' }), { status: 500 });
    }

    logger.info('Return marked as shipped by customer', { returnRequestId, userId: user.id });

    return new Response(JSON.stringify({
      success: true,
      message: 'Devolución marcada como enviada'
    }), { status: 200 });
  } catch (error) {
    logger.error('Error in mark-shipped endpoint', { error: String(error) });
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
