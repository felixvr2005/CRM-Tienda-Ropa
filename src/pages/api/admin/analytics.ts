import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

/**
 * API para obtener analíticas y estadísticas de ventas
 * GET /api/admin/analytics
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Parse URL / params early so debugMode and date range are available
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days') || '7';
    const days = parseInt(daysParam);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const debugMode = url.searchParams.get('debug') === '1';

    // Identificador de build para depuración en producción
    const BUILD_TAG = process.env.GITHUB_SHA || process.env.COMMIT_SHA || process.env.BUILD_ID || process.env.npm_package_version || ('local-' + new Date().toISOString());
    if (debugMode) console.log('Analytics debug: BUILD_TAG', BUILD_TAG);

    // Verificar autenticación (admin)
    // Soportar token en header `Authorization: Bearer ...` o en cookie `sb-access-token` (fetch con credentials)
    let accessToken: string | null = null;
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.split(' ')[1];
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/sb-access-token=([^;]+)/);
      if (match) accessToken = decodeURIComponent(match[1]);
    }

    // If no token and not debug mode => reject
    if (!accessToken && !debugMode) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let authUser: any = null;
    let adminUser: any = null;

    // If token present try to validate admin
    if (accessToken) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken as string);
      if (userError || !userData?.user) {
        console.error('Analytics auth: token invalid or getUser failed', { userError });
        if (!debugMode) return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      } else {
        authUser = userData.user;
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('admin_users')
          .select('id, is_active')
          .eq('auth_user_id', authUser.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          console.error('Analytics auth: user is not admin or admin lookup failed', { adminError, authUserId: authUser?.id });
          if (!debugMode) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        } else {
          adminUser = adminData;
          console.log('Analytics request by admin', { authUserId: authUser.id, adminUserId: adminUser.id });
        }
      }
    } else if (debugMode) {
      console.warn('Analytics debug mode WITHOUT auth - returning debug data');
    }

    if (debugMode) console.log('Analytics debug: startDate', startDate.toISOString());

    // Obtener todas las órdenes en el rango (sin nested order_items para evitar errores de columnas)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        subtotal,
        discount_amount,
        shipping_cost,
        created_at
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      throw ordersError;
    }

    // Obtener items dentro del mismo rango para calcular totales y top-seller
    const { data: itemsInRange, error: itemsInRangeError } = await supabaseAdmin
      .from('order_items')
      .select('id, order_id, product_id, product_name, quantity, unit_price, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (itemsInRangeError) {
      // no queremos romper la API por un fallo en items, pero lo logueamos
      console.error('Analytics: failed to fetch order_items', itemsInRangeError);
    }

    // Procesar datos para analytics usando orders + itemsInRange
    const stats = {
      totalOrders: orders?.length || 0,
      totalRevenue: 0,
      totalItems: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
      totalShipping: 0,
      dailyStats: {} as Record<string, any>
    };

    // Agrupar por día
    const dailyData: Record<string, any> = {};

    // Precomputar items por order
    const itemsByOrder: Record<string, any[]> = {};
    (itemsInRange || []).forEach((it: any) => {
      if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
      itemsByOrder[it.order_id].push(it);
    });

    orders?.forEach((order: any) => {
      const date = new Date(order.created_at);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          date: dateStr,
          orders: 0,
          revenue: 0,
          items: 0,
          discount: 0,
          shipping: 0,
          statuses: {}
        };
      }

      const itemCount = (itemsByOrder[order.id] || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

      dailyData[dateStr].orders += 1;
      dailyData[dateStr].revenue += order.total_amount || 0;
      dailyData[dateStr].items += itemCount;
      dailyData[dateStr].discount += order.discount_amount || 0;
      dailyData[dateStr].shipping += order.shipping_cost || 0;

      if (!dailyData[dateStr].statuses[order.status]) {
        dailyData[dateStr].statuses[order.status] = 0;
      }
      dailyData[dateStr].statuses[order.status] += 1;

      stats.totalRevenue += order.total_amount || 0;
      stats.totalItems += itemCount;
      stats.totalDiscount += order.discount_amount || 0;
      stats.totalShipping += order.shipping_cost || 0;
    });

    stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    stats.dailyStats = dailyData;

    // Calcular estadísticas generales
    const overallStats: any = {
      // Últimos 7 días
      last7days: {
        orders: stats.totalOrders,
        revenue: Math.round(stats.totalRevenue * 100) / 100,
        averageOrder: Math.round(stats.averageOrderValue * 100) / 100,
        itemsSold: stats.totalItems,
        totalDiscount: Math.round(stats.totalDiscount * 100) / 100,
        totalShipping: Math.round(stats.totalShipping * 100) / 100
      },
      // Por día
      byDay: Object.values(dailyData).map((day: any) => ({
        date: day.date,
        orders: day.orders,
        revenue: Math.round(day.revenue * 100) / 100,
        items: day.items,
        discount: Math.round(day.discount * 100) / 100,
        shipping: Math.round(day.shipping * 100) / 100,
        statuses: day.statuses
      }))
    };

    // Añadir tag de build para diagnóstico (solo cuando debugMode)
    if (debugMode) overallStats.buildTag = BUILD_TAG;

    // Calcular producto más vendido server-side (últimos 30 días por defecto para top)
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      since.setHours(0,0,0,0);

      const { data: items, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id, product_name, quantity, created_at')
        .gte('created_at', since.toISOString());

      if (!itemsError && items && (items as any[]).length > 0) {
        const itemsList = items as any[];
        const countsById: Record<string, number> = {};
        const countsByName: Record<string, number> = {};
        for (const it of itemsList) {
          if (it?.product_id) {
            const idKey = String(it.product_id);
            countsById[idKey] = (countsById[idKey] || 0) + (Number(it.quantity) || 0);
          } else if (it?.product_name) {
            const nameKey = String(it.product_name);
            countsByName[nameKey] = (countsByName[nameKey] || 0) + (Number(it.quantity) || 0);
          }
        }

        let top: any = null;
        const topById = Object.entries(countsById).sort((a,b) => b[1]-a[1])[0];
        if (topById) {
          const prodId = topById[0];
          const units = topById[1];
          const { data: prod } = await supabaseAdmin.from('products').select('id, name').eq('id', prodId).single();
          const prodObj: any = prod;
          top = prodObj ? { id: prodObj.id, name: prodObj.name, units } : { id: prodId, name: 'ID:' + prodId, units };
        } else {
          const topByName = Object.entries(countsByName).sort((a,b) => b[1]-a[1])[0];
          if (topByName) {
            top = { name: topByName[0], units: topByName[1] };
          }
        }

        overallStats.topSeller = top;
        if (debugMode) overallStats.debug_items_count = itemsList.length;
      } else {
        if (debugMode) overallStats.debug_items_error = itemsError?.message || null;
      }
    } catch (err: any) {
      console.error('Error computing topSeller:', err);
      if (debugMode) overallStats.debug_top_error = err.message || String(err);
    }

    return new Response(
      JSON.stringify(overallStats),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error en analytics:', error);

    // En modo debug devolver más información (stack, build tag)
    if (debugMode) {
      const payload: any = {
        error: error.message || 'Error al obtener analíticas',
        stack: error.stack || null,
        buildTag: typeof BUILD_TAG !== 'undefined' ? BUILD_TAG : null
      };
      return new Response(JSON.stringify(payload), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Error al obtener analíticas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
