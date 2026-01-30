/**
 * API: Checkout - Crear sesión de Stripe
 */
import type { APIRoute } from 'astro';
import { createCheckoutSession } from '@lib/stripe';
import { supabase } from '@lib/supabase';
import type { CartItem } from '@stores/cart';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar que las claves de Stripe estén configuradas
    if (!import.meta.env.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY === 'sk_test_...') {
      logger.error('STRIPE_SECRET_KEY no configurada en .env.local');
      return new Response(
        JSON.stringify({ 
          error: 'Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local',
          setupGuide: 'https://dashboard.stripe.com/apikeys'
        }),
        { status: 500 }
      );
    }

    if (!import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY === 'pk_test_...') {
      logger.error('PUBLIC_STRIPE_PUBLISHABLE_KEY no configurada en .env.local');
      return new Response(
        JSON.stringify({ 
          error: 'Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local'
        }),
        { status: 500 }
      );
    }

    const { items, couponCode } = await request.json() as { items: CartItem[], couponCode?: string };
    
    logger.debug('Checkout items recibidos', { items });    
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El carrito está vacío' }),
        { status: 400 }
      );
    }
    
    // Validar cupón si se proporciona
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('id, discount_percentage, is_active, max_uses, used_count, expiry_date')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (couponError || !coupon) {
        return new Response(
          JSON.stringify({ error: 'Cupón inválido o expirado' }),
          { status: 400 }
        );
      }

      // Verificar si el cupón está activo
      if (!coupon.is_active) {
        return new Response(
          JSON.stringify({ error: 'Este cupón ya no es válido' }),
          { status: 400 }
        );
      }

      // Verificar límite de usos
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return new Response(
          JSON.stringify({ error: 'Este cupón ha alcanzado el límite de usos' }),
          { status: 400 }
        );
      }

      // Verificar expiración
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Este cupón ha expirado' }),
          { status: 400 }
        );
      }

      // Calcular descuento total
      const totalBeforeDiscount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      discountAmount = (totalBeforeDiscount * coupon.discount_percentage) / 100;

      logger.info('Cupón validado', { couponCode, discountPct: coupon.discount_percentage });
    }

    
    // item.price ya tiene el descuento aplicado (en euros)
    const lineItems = items.map(item => {
      logger.debug('Checkout item', { name: item.name, price: item.price, quantity: item.quantity });
      return {
        name: item.name,
        description: `Talla: ${item.size} | Color: ${item.color}`,
        price: Math.round(item.price * 100), // Convert to cents
        quantity: item.quantity,
        image: item.image,
      };
    });
    
    logger.debug('Line items para Stripe (sanitized)', JSON.stringify(lineItems, null, 2));
    
    // Preparar items simplificados para metadata (Stripe tiene límite de 500 caracteres por valor)
    const itemsForMetadata = items.map(item => ({
      variantId: item.variantId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    // Metadata para crear el pedido después del pago
    const metadata: Record<string, string> = {
      items: JSON.stringify(itemsForMetadata),
      couponCode: couponCode || '',
      discountAmount: discountAmount.toString()
    };
    
    logger.debug('Metadata para Stripe (trimmed)', metadata);
    
    const session = await createCheckoutSession(
      lineItems,
      `https://${new URL(request.url).host}/checkout/success`,
      `https://${new URL(request.url).host}/carrito`,
      undefined, // customerEmail - se capturará en Stripe Checkout
      metadata
    );
    
    logger.info('Stripe session creada', { sessionId: session.id, url: session.url });
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Checkout error completo', { message: error?.message, type: error?.type, code: error?.code, param: error?.param });
    if (error?.raw) {
      logger.debug('Stripe raw error', { raw: error.raw });
    }
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error al procesar el pago',
        details: {
          type: error.type,
          code: error.code,
          param: error.param
        }
      }),
      { status: 500 }
    );
  }
};
