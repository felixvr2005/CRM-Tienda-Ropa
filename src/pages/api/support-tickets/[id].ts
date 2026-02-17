/**
 * API: Ticket de soporte individual
 * GET /api/support-tickets/[id] - Obtener ticket
 * PUT /api/support-tickets/[id] - Actualizar/responder ticket
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', params.id!)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.status) updateData.status = body.status;
    if (body.admin_response) {
      updateData.admin_response = body.admin_response;
      updateData.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', params.id!)
      .select()
      .single();

    if (error) throw error;

    logger.info('[SupportTickets] Updated:', params.id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[SupportTickets] Error updating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
