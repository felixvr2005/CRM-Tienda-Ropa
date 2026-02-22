/**
 * API: Verificar si un usuario es admin
 * GET  /api/admin/check-auth  → lee cookie sb-access-token
 * POST /api/admin/check-auth  → recibe { userId }
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';

export const prerender = false;

/* ── GET: la isla AdminLink llama sin body, usa la cookie ── */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get('sb-access-token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!user || error) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    return new Response(JSON.stringify({ isAdmin: !!adminUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ isAdmin: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/* ── POST: mantiene compatibilidad con usos existentes ── */

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .single();

    return new Response(JSON.stringify({ isAdmin: !!adminUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ isAdmin: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
