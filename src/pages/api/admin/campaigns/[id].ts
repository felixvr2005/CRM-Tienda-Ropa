/**
 * API: Campaña individual
 * GET /api/admin/campaigns/[id] - Obtener campaña
 * PUT /api/admin/campaigns/[id] - Actualizar campaña
 * DELETE /api/admin/campaigns/[id] - Eliminar campaña
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', params.id!)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[Campaigns] Error getting:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({
        title: body.title,
        description: body.description,
        popup_title: body.popup_title,
        popup_message: body.popup_message,
        popup_image_url: body.popup_image_url,
        discount_code: body.discount_code,
        discount_percentage: body.discount_percentage,
        discount_amount: body.discount_amount,
        active: body.active,
        start_date: body.start_date,
        end_date: body.end_date,
        target_audience: body.target_audience,
        show_popup: body.show_popup,
        popup_delay_ms: body.popup_delay_ms,
      })
      .eq('id', params.id!)
      .select()
      .single();

    if (error) throw error;

    logger.info('[Campaigns] Updated:', params.id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[Campaigns] Error updating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', params.id!);

    if (error) throw error;

    logger.info('[Campaigns] Deleted:', params.id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[Campaigns] Error deleting:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
