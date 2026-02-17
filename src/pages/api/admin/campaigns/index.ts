/**
 * API: Campañas de marketing
 * GET /api/admin/campaigns - Listar campañas
 * POST /api/admin/campaigns - Crear campaña
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[Campaigns] Error listing:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        title: body.title,
        description: body.description || null,
        popup_title: body.popup_title || null,
        popup_message: body.popup_message || null,
        popup_image_url: body.popup_image_url || null,
        discount_code: body.discount_code || null,
        discount_percentage: body.discount_percentage || null,
        discount_amount: body.discount_amount || null,
        active: body.active ?? true,
        start_date: body.start_date,
        end_date: body.end_date || null,
        target_audience: body.target_audience || null,
        show_popup: body.show_popup ?? false,
        popup_delay_ms: body.popup_delay_ms ?? 3000,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('[Campaigns] Created:', data.id);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[Campaigns] Error creating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
