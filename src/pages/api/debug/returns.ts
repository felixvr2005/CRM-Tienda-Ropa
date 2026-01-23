import { supabaseAdmin, supabase } from '@lib/supabase';

export const prerender = false;

export async function GET({ request }: any) {
  try {
    let returnError: any = null;
    let returnRequests: any[] = [];
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

    if (orderIds.length > 0) {
      // Get returns tied to orders
      const { data: byOrders, error: errorByOrders } = await supabaseAdmin
        .from('return_requests')
        .select('id, order_id, customer_id, status, reason, created_at, orders(order_number), credit_notes(id, refund_amount, status)')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (errorByOrders) {
        console.error('Error fetching returns by order IDs:', errorByOrders);
        returnRequests = byOrders || [];
        returnError = returnError || errorByOrders;
      } else {
        returnRequests = byOrders || [];
      }

      // Also include returns for the customer (if exists)
      if (customer?.id) {
        const { data: byCustomer, error: errorByCustomer } = await supabaseAdmin
          .from('return_requests')
          .select('id, order_id, customer_id, status, reason, created_at, orders(order_number), credit_notes(id, refund_amount, status)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        if (errorByCustomer) {
          console.error('Error fetching returns by customer:', errorByCustomer);
          returnError = returnError || errorByCustomer;
        } else {
          returnRequests = Array.from(new Map([...(returnRequests || []), ...(byCustomer || [])].map(r => [r.id, r])).values());
        }
      }
    } else {
      const { data, error } = await returnsQuery.eq('customer_id', customer?.id);
      if (error) {
        console.error('Error fetching returns:', error);
        returnError = error;
        returnRequests = data || [];
      } else {
        returnRequests = data || [];
      }
    }

    return new Response(JSON.stringify({ user: { id: user.id, email: user.email }, customer, orders: orderIds, returnCount: returnRequests.length, returnSamples: returnRequests.slice(0, 10) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error in /api/debug/returns:', err);
    const message = err?.message || String(err);
    const deployHint = message.includes('catch is not a function')
      ? 'Old deployment detected or incompatible runtime. Trigger a redeploy to pick up latest commits.'
      : null;
    return new Response(JSON.stringify({ error: message, hint: deployHint }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
