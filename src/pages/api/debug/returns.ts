import { supabaseAdmin, supabase } from '@lib/supabase';

export const prerender = false;

export async function GET({ request }: any) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const accessToken = cookieHeader.split(';').map(s => s.trim()).find(c => c.startsWith('sb-access-token='))?.split('=')[1];

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No access token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const user = userData.user;

    // Find customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    // Orders belonging to customer
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('customer_id', customer?.id);

    const orderIds = (orders || []).map((o: any) => o.id);

    // Find returns by customer_id OR by order_id in orderIds
    let returnsQuery = supabaseAdmin.from('return_requests').select('id, order_id, customer_id, status, reason, created_at').order('created_at', { ascending: false });

    let returnRequests;
    if (orderIds.length > 0) {
      const idsList = `(${orderIds.join(',')})`;
      // use raw SQL for clarity
      const { data: rawReturns } = await supabaseAdmin.rpc('', {} as any).catch(() => ({ data: null }));

      // fallback to two queries
      const { data: byCustomer } = await supabaseAdmin.from('return_requests').select('*').eq('customer_id', customer?.id);
      const { data: byOrders } = await supabaseAdmin.from('return_requests').select('*').in('order_id', orderIds);
      const merged = [...(byCustomer || []), ...(byOrders || [])];
      returnRequests = merged;
    } else {
      const { data } = await returnsQuery.eq('customer_id', customer?.id);
      returnRequests = data || [];
    }

    return new Response(JSON.stringify({ user: { id: user.id, email: user.email }, customer, orders: orderIds, returnCount: returnRequests.length, returnSamples: returnRequests.slice(0, 10) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
