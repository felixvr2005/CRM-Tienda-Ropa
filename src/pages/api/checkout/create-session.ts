import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabase';
import { ensureEnv } from '@lib/ensureEnv';
import { logger } from '@lib/logger';

export const prerender = false;

// Verificación en tiempo de ejecución — útil para CI / deploys
ensureEnv(['STRIPE_SECRET_KEY']);

// Lazy-init Stripe so importing this module in tests doesn't try to instantiate the SDK
let _stripe: Stripe | null = null;
function getStripe() {
  if (_stripe) return _stripe;
  ensureEnv(['STRIPE_SECRET_KEY']);
  _stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  return _stripe;
}

/**
 * Helper testable: construye los line_items que se enviarán a Stripe a partir de los items del carrito
 */
export async function buildStripeLineItems(items: any[], shippingCost = 0) {
  const result = await Promise.all(items.map(async (item: any) => {
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
    const priceInCents = Math.round(item.price * 100);
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

  if (shippingCost > 0) {
    result.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Envío Estándar', images: [] },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  return result;
}

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
      shippingCost: rawShippingCost,
      discount,
      total,
      discountAmount
    } = body;

    // Coerce and sanitize shipping cost (accept '4.95' or '4,95')
    let shippingCost = 0;
    if (typeof rawShippingCost === 'string') {
      const normalized = rawShippingCost.replace(',', '.').trim();
      shippingCost = Number(normalized);
    } else if (typeof rawShippingCost === 'number') {
      shippingCost = rawShippingCost;
    }
    if (!Number.isFinite(shippingCost) || shippingCost < 0) shippingCost = 0;

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

    // Construir line items (helper separado, testeable)
    const lineItems = await buildStripeLineItems(items, shippingCost);

    // Configurar descuento si hay cupón o descuento
    const discounts: any[] = [];
    const discountAmt = Number(discountAmount || discount || 0) || 0;
    if (couponCode && discountAmt > 0) {
      const discountInCents = Math.round(discountAmt * 100);
      // Crear un cupón temporal en Stripe
      const coupon = await getStripe().coupons.create({
        amount_off: discountInCents,
        currency: 'eur',
        duration: 'once',
        name: couponCode,
      });
      logger.debug(`Cupón ${couponCode} creado: ${discountInCents} céntimos`);
      discounts.push({ coupon: coupon.id });
    }

    // Solo tarjeta por ahora - añadir más métodos cuando estén verificados
    // En modo E2E/local devolvemos un session mock para que las pruebas intercepten sin Stripe.
    // BUT: don't short-circuit during unit tests (Vitest) — those mock the Stripe SDK and expect the handler to call it.
    if (process.env.PLAYWRIGHT_RUNNING && !process.env.VITEST) {
      logger.info('PLAYWRIGHT_RUNNING: returning mocked Stripe session');
      return new Response(JSON.stringify({ url: 'https://checkout.stripe.test/mock-session', sessionId: 'sess_e2e_mock' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const session = await getStripe().checkout.sessions.create({
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
        discountAmount: String(discountAmt || 0),
        subtotal: String(subtotal || 0),
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
    logger.error('Stripe error creating session', { error: String(error) });
    return new Response(JSON.stringify({ 
      error: error.message || 'Error al crear la sesión de pago' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
