import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const prerender = false;

/**
 * API para validar cupones de descuento
 * POST /api/coupons/validate
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Código requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar en newsletter_subscribers
    const { data: newsletter } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('discount_code', code.toUpperCase())
      .single();

    if (newsletter) {
      // Validar que no haya sido usado
      if (newsletter.used) {
        return new Response(
          JSON.stringify({ 
            error: 'Este código ya ha sido utilizado',
            valid: false 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          code: newsletter.discount_code,
          discountPercentage: 20,
          discountType: 'percentage',
          description: 'Descuento de bienvenida - 20% de descuento'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Si no lo encuentra, devolver error
    return new Response(
      JSON.stringify({ 
        error: 'Código de descuento inválido',
        valid: false 
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error en validate coupon:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al validar cupón' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
