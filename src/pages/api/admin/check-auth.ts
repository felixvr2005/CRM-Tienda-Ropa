/**
 * API: Verificar si un usuario es admin
 * POST /api/admin/check-auth
 */
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';

export const prerender = false;

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
