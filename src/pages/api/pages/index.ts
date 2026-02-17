/**
 * API: Páginas estáticas
 * GET /api/pages - Listar páginas activas
 * GET /api/pages?slug=xxx - Obtener página por slug
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');

    if (slug) {
      const { data, error } = await supabaseAdmin
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Página no encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Listar todas las páginas activas
    const { data, error } = await supabaseAdmin
      .from('static_pages')
      .select('id, slug, title, is_active, created_at, updated_at')
      .order('title', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('[StaticPages] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
