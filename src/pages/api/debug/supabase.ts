import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

export async function GET() {
  try {
    const hasServiceKey = !!(process.env.SUPABASE_SERVICE_KEY);

    // Quick test: can supabaseAdmin read a row from return_requests?
    const { data, error } = await supabaseAdmin
      .from('return_requests')
      .select('id')
      .limit(1);

    return new Response(JSON.stringify({ hasServiceKey, testReturnFetch: { data: data || null, error: error || null } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
