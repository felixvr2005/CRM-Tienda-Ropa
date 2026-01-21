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
    if (!import.meta.env.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
      console.error('⚠️ STRIPE_SECRET_KEY no configurada en .env.local');
      return new Response(
        JSON.stringify({ 
          error: 'Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local',
          setupGuide: 'https://dashboard.stripe.com/apikeys'
        }),
        { status: 500 }
      );
    }

    if (!import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('pk_test_...')) {
      console.error('⚠️ PUBLIC_STRIPE_PUBLISHABLE_KEY no configurada en .env.local');
      return new Response(
        JSON.stringify({ 
          error: 'Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local'
        }),
        { status: 500 }
      );
    }

    const { items, couponCode } = await request.json() as { items: CartItem[], couponCode?: string };
    
    console.log('Checkout items recibidos:', JSON.stringify(items, null, 2));
    
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

      console.log(`Cupón validado: ${couponCode}, descuento: ${coupon.discount_percentage}%`);
    }

    
    // item.price ya tiene el descuento aplicado (en euros)
    const lineItems = items.map(item => {
      console.log(`Item: ${item.name}, precio: ${item.price}€, cantidad: ${item.quantity}`);
      return {
        name: item.name,
        description: `Talla: ${item.size} | Color: ${item.color}`,
        price: Math.round(item.price * 100), // Convert to cents
        quantity: item.quantity,
        image: item.image,
      };
    });
    
    console.log('Line items para Stripe:', JSON.stringify(lineItems, null, 2));
    
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
    
    console.log('Metadata para Stripe:', metadata);
    
    const session = await createCheckoutSession(
      lineItems,
      `${new URL(request.url).origin}/checkout/success`,
      `${new URL(request.url).origin}/carrito`,
      undefined, // customerEmail - se capturará en Stripe Checkout
      metadata
    );
    
    console.log('Stripe session creada:', session.id, session.url);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al procesar el pago' }),
      { status: 500 }
    );
  }
};
