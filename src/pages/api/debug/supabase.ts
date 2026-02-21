import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // 1. Obtener una fila existente de order_items para ver sus columnas reales
    const { data: sampleItem, error: sampleErr } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .limit(1)
      .single();

    results.existing_order_item = {
      columns: sampleItem ? Object.keys(sampleItem) : [],
      sample: sampleItem || null,
      error: sampleErr?.message || null
    };

    // 2. Contar items del último pedido
    const { data: lastOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastOrder) {
      const { data: lastItems, error: lastErr } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', lastOrder.id);
      results.last_order = {
        id: lastOrder.id,
        order_number: lastOrder.order_number,
        items_count: lastItems?.length || 0,
        items_error: lastErr?.message || null,
        items: lastItems,
      };
    }

    return new Response(JSON.stringify(results, null, 2), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err), results }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
