import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      couponCode,
      items,
      subtotal,
      shippingCost,
      discount,
      total
    } = body;

    // Validaciones
    if (!email || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar stock de los productos
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock, product:products(name)')
        .eq('id', item.variantId)
        .single();

      const variantData = variant as any;
      if (!variantData || variantData.stock < item.quantity) {
        return new Response(JSON.stringify({ 
          error: `Stock insuficiente para ${variantData?.product?.name || 'producto'}` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Crear line items para Stripe
    const lineItems = await Promise.all(items.map(async (item: any) => {
      const { data: variant } = await supabase
        .from('product_variants')
        .select(`
          id, color, size, price,
          product:products(name, images, price)
        `)
        .eq('id', item.variantId)
        .single();

      const variantData = variant as any;
      const productData = variantData?.product as any;
      
      // El precio viene en euros desde el cliente
      // Stripe necesita céntimos (multiplicar por 100)
      // item.price ya está en euros, así que solo multiplicar por 100
      const priceInCents = Math.round(item.price * 100);
      
      console.log(`Item: ${productData?.name}, price from client: €${item.price}, in cents: ${priceInCents}`);
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productData?.name || 'Producto',
            description: `${variantData?.color || ''} / ${variantData?.size || ''}`,
            images: productData?.images?.slice(0, 1) || [],
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    }));

    // Añadir envío si hay coste
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingMethod === 'express' ? 'Envío Express' : 'Envío Estándar',
            images: [],
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Configurar descuento si hay cupón
    const discounts: any[] = [];
    if (couponCode && discount > 0) {
      // Crear un cupón temporal en Stripe
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: 'eur',
        duration: 'once',
        name: couponCode,
      });
      discounts.push({ coupon: coupon.id });
    }

    // Solo tarjeta por ahora - añadir más métodos cuando estén verificados
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : undefined,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/carrito`,
      customer_email: email,
      metadata: {
        email,
        phone,
        shippingAddress: JSON.stringify(shippingAddress),
        shippingMethod,
        couponCode: couponCode || '',
        items: JSON.stringify(items),
      },
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'AD', 'DE', 'IT', 'BE', 'NL', 'AT', 'CH'],
      },
      phone_number_collection: {
        enabled: true,
      },
      // Permitir códigos promocionales desde Stripe Dashboard
      allow_promotion_codes: true,
      // Información de facturación
      billing_address_collection: 'auto',
      // Expiración de la sesión (30 minutos)
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      // Locale en español
      locale: 'es',
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Stripe error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error al crear la sesión de pago' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
