/**
 * API: Vaciar todos los favoritos
 * POST /api/wishlist/clear
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Sesión inválida' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener customer_id
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!customer) {
      return new Response(
        JSON.stringify({ error: 'Cliente no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar todos los favoritos del usuario
    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('customer_id', customer.id);

    if (error) {
      throw new Error(`Error vaciando favoritos: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Favoritos vaciados' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
