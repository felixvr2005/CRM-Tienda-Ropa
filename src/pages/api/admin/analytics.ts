import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

/**
 * API para obtener analíticas y estadísticas de ventas
 * GET /api/admin/analytics
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación (admin)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener parámetro de rango de fechas (por defecto últimos 7 días)
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days') || '7';
    const days = parseInt(daysParam);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Obtener todas las órdenes en el rango
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
        created_at,
        order_items(quantity, total_price)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      throw ordersError;
    }

    // Procesar datos para analytics
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

      const itemCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

      dailyData[dateStr].orders += 1;
      dailyData[dateStr].revenue += order.total_amount;
      dailyData[dateStr].items += itemCount;
      dailyData[dateStr].discount += order.discount_amount || 0;
      dailyData[dateStr].shipping += order.shipping_cost || 0;

      if (!dailyData[dateStr].statuses[order.status]) {
        dailyData[dateStr].statuses[order.status] = 0;
      }
      dailyData[dateStr].statuses[order.status] += 1;

      stats.totalRevenue += order.total_amount;
      stats.totalItems += itemCount;
      stats.totalDiscount += order.discount_amount || 0;
      stats.totalShipping += order.shipping_cost || 0;
    });

    stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    stats.dailyStats = dailyData;

    // Calcular estadísticas generales
    const overallStats = {
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

    return new Response(
      JSON.stringify(overallStats),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error en analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al obtener analíticas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
