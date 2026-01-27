import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

/**
 * API para validar cupones de descuento
 * POST /api/coupons/validate
 */
import { normalizeCouponForClient } from '@lib/coupons';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Código requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar en tabla `coupons` primero (API canonical)
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', code.toUpperCase())
      .maybeSingle();

    if (coupon) {
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return new Response(JSON.stringify({ valid: false, error: 'Código expirado' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      if (coupon.times_used && coupon.times_used >= (coupon.usage_limit || 0)) {
        return new Response(JSON.stringify({ valid: false, error: 'Este código ya no está disponible' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(normalizeCouponForClient(coupon)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback: buscar en newsletter_subscribers (códigos legacy)
    const { data: newsletter } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('discount_code', code.toUpperCase())
      .maybeSingle();

    if (newsletter) {
      if (newsletter.used) {
        return new Response(JSON.stringify({ error: 'Este código ya ha sido utilizado', valid: false }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(normalizeCouponForClient({
        code: newsletter.discount_code,
        discount_percentage: 20,
      })), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Si no lo encuentra, devolver error
    return new Response(JSON.stringify({ error: 'Código de descuento inválido', valid: false }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error en validate coupon:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al validar cupón' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
