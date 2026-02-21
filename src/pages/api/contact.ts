import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

/**
 * API para enviar mensajes de contacto
 * POST /api/contact
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, subject, orderNumber, message } = body;

    // Validaciones
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos: name, email, subject, message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generar ticket number único
    const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Insertar en support_tickets (tabla real en la DB)
    const { data: ticket, error: insertError } = await (supabaseAdmin as any)
      .from('support_tickets')
      .insert({
        email,
        subject,
        message,
        customer_name: name,
        customer_phone: phone || null,
        order_id: orderNumber || null,
        ticket_number: ticketNumber,
        status: 'open',
        priority: 'normal',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error inserting support ticket:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error al guardar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info('[Contact] Ticket created', { email, subject, ticketNumber });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tu mensaje ha sido enviado correctamente',
        id: ticket.id,
        ticketNumber
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('[Contact API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET - Listar mensajes (solo admin)
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar que es admin (no implementado en este ejemplo)
    // Por ahora solo retornar 403
    
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    logger.error('[Contact API GET] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
