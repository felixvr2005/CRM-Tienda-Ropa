/**
 * API: Admin - Páginas estáticas CRUD
 * POST /api/admin/pages - Crear página
 * PUT /api/admin/pages - Actualizar página
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('static_pages')
      .insert({
        slug: body.slug,
        title: body.title,
        content: body.content,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('[StaticPages] Created:', data.id);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[StaticPages] Error creating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabaseAdmin
      .from('static_pages')
      .update({
        slug: body.slug,
        title: body.title,
        content: body.content,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        is_active: body.is_active,
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    logger.info('[StaticPages] Updated:', body.id);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[StaticPages] Error updating:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
