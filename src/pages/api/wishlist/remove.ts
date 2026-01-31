/**
 * API: Eliminar de favoritos por wishlistId
 * POST /api/wishlist/remove
 * Body: { wishlistId: string }
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const body = await request.json();
    const { wishlistId } = body;

    if (!wishlistId) {
      return new Response(
        JSON.stringify({ error: 'wishlistId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
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

    // Eliminar de favoritos (verificando que pertenece al usuario)
    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)
      .eq('customer_id', customer.id);

    if (error) {
      throw new Error(`Error eliminando: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Eliminado de favoritos' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
