/**
 * API: Obtener estado de favorito
 * GET /api/wishlist/status?productId=xxx
 */
import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@lib/supabase';
import { logger } from '@lib/logger';

export const GET: APIRoute = async ({ request, cookies, url }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ isInWishlist: false, authenticated: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ isInWishlist: false, authenticated: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const productId = url.searchParams.get('productId');

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
        JSON.stringify({ isInWishlist: false, authenticated: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si está en favoritos
    const { data: existing } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('product_id', productId)
      .maybeSingle();

    return new Response(
      JSON.stringify({ 
        isInWishlist: !!existing, 
        authenticated: true 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error('Error en wishlist status:', error);
    return new Response(
      JSON.stringify({ isInWishlist: false, authenticated: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
