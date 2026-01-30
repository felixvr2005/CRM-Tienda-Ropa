/**
 * API: Toggle de favoritos
 * POST /api/wishlist/toggle
 * Body: { productId: string }
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

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

    // Obtener body
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'productId es requerido' }),
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

    // Verificar si ya está en favoritos
    const { data: existing } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('product_id', productId)
      .maybeSingle();

    let isInWishlist = false;

    if (existing) {
      // Eliminar de favoritos
      const { error } = await supabaseAdmin
        .from('wishlists')
        .delete()
        .eq('id', existing.id);

      if (error) {
        throw new Error(`Error eliminando de favoritos: ${error.message}`);
      }
      isInWishlist = false;
    } else {
      // Añadir a favoritos
      const { error } = await supabaseAdmin
        .from('wishlists')
        .insert({
          customer_id: customer.id,
          product_id: productId
        });

      if (error) {
        throw new Error(`Error añadiendo a favoritos: ${error.message}`);
      }
      isInWishlist = true;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isInWishlist,
        message: isInWishlist ? 'Añadido a favoritos' : 'Eliminado de favoritos'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('Error en toggle wishlist:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
