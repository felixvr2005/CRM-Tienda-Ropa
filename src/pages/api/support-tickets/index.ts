/**
 * API: Tickets de soporte
 * GET /api/support-tickets - Listar tickets
 * POST /api/support-tickets - Crear ticket
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const status = url.searchParams.get('status');
    let query = supabaseAdmin
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as 'open' | 'in_progress' | 'closed');
    }

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[SupportTickets] Error listing:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.email || !body.subject || !body.message) {
      return new Response(
        JSON.stringify({ error: 'email, subject y message son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        email: body.email,
        subject: body.subject,
        message: body.message,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('[SupportTickets] Created:', data.id);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[SupportTickets] Error creating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
