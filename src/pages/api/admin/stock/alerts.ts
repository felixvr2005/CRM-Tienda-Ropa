/**
 * API: Alertas de Stock
 * - GET: Devuelve variantes con stock bajo (< umbral)
 * - GET ?summary=true: Solo devuelve conteo (para badge de campana)
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const prerender = false;

const LOW_STOCK_THRESHOLD = 10;

export const GET: APIRoute = async ({ url, cookies }) => {
  // Verificar autenticación admin
  const accessToken = cookies.get('sb-access-token')?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const summaryOnly = url.searchParams.get('summary') === 'true';

    if (summaryOnly) {
      // Solo conteo para el badge
      const { count: lowStockCount } = await supabaseAdmin
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .lt('stock', LOW_STOCK_THRESHOLD)
        .eq('is_active', true);

      const { count: outOfStockCount } = await supabaseAdmin
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)
        .eq('is_active', true);

      return new Response(JSON.stringify({
        low_stock_count: lowStockCount || 0,
        out_of_stock_count: outOfStockCount || 0,
        total_alerts: (lowStockCount || 0),
        threshold: LOW_STOCK_THRESHOLD
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Listado completo con filtros opcionales
    const filter = url.searchParams.get('filter'); // 'low', 'out', 'all'
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        product_id,
        size,
        color,
        color_hex,
        stock,
        sku,
        is_active,
        updated_at,
        product:products(id, name, slug, image_url, sku, category_id, is_active, category:categories(id, name))
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('stock', { ascending: true });

    // Filtros de stock
    if (filter === 'out') {
      query = query.eq('stock', 0);
    } else if (filter === 'low') {
      query = query.lt('stock', LOW_STOCK_THRESHOLD).gt('stock', 0);
    } else if (filter === 'ok') {
      query = query.gte('stock', LOW_STOCK_THRESHOLD);
    } else {
      // Default: mostrar los de stock bajo primero
      query = query.lt('stock', LOW_STOCK_THRESHOLD);
    }

    // Paginación
    query = query.range(offset, offset + limit - 1);

    const { data: variants, error, count } = await query;

    if (error) throw error;

    // Si se busca por nombre o categoría, filtrar en JS (Supabase no permite filtrar en joins directamente con count)
    let filtered = variants || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((v: any) =>
        v.product?.name?.toLowerCase().includes(searchLower) ||
        v.sku?.toLowerCase().includes(searchLower) ||
        v.color?.toLowerCase().includes(searchLower) ||
        v.product?.sku?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filtered = filtered.filter((v: any) =>
        v.product?.category_id === category ||
        v.product?.category?.name?.toLowerCase() === category.toLowerCase()
      );
    }

    // Agrupar por producto para una vista más organizada
    const groupedByProduct: Record<string, {
      product_id: string;
      product_name: string;
      product_slug: string;
      product_image: string;
      category_name: string;
      variants: Array<{
        id: string;
        size: string;
        color: string;
        color_hex: string;
        stock: number;
        sku: string;
        updated_at: string;
      }>;
      total_stock: number;
      min_stock: number;
      has_out_of_stock: boolean;
    }> = {};

    for (const v of filtered as any[]) {
      const pid = v.product_id;
      if (!groupedByProduct[pid]) {
        groupedByProduct[pid] = {
          product_id: pid,
          product_name: v.product?.name || 'Desconocido',
          product_slug: v.product?.slug || '',
          product_image: v.product?.image_url || '',
          category_name: v.product?.category?.name || 'Sin categoría',
          variants: [],
          total_stock: 0,
          min_stock: Infinity,
          has_out_of_stock: false
        };
      }
      groupedByProduct[pid].variants.push({
        id: v.id,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex || '',
        stock: v.stock,
        sku: v.sku || '',
        updated_at: v.updated_at
      });
      groupedByProduct[pid].total_stock += v.stock || 0;
      groupedByProduct[pid].min_stock = Math.min(groupedByProduct[pid].min_stock, v.stock || 0);
      if (v.stock === 0) groupedByProduct[pid].has_out_of_stock = true;
    }

    return new Response(JSON.stringify({
      variants: filtered,
      grouped: Object.values(groupedByProduct),
      total: count || 0,
      page,
      limit,
      threshold: LOW_STOCK_THRESHOLD
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    logger.error('Error en stock alerts:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Error interno'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
