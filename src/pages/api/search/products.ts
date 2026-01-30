import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

/**
 * API para búsqueda live de productos
 * GET /api/search/products?q=termino
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Búsqueda ILIKE (insensible a mayúsculas/minúsculas)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, price, discount_percentage, images')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);

    if (error) {
      logger.error('Search error:', error);
      return new Response(
        JSON.stringify({ error: 'Error en búsqueda' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mapear resultados
    const results = products?.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discount_percentage: p.discount_percentage || 0,
      image_url: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    })) || [];

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Search API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
