import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabaseAdmin as supabase } from '../../../lib/supabase';
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
    // Build description only from non-empty trimmed values — Stripe rejects empty strings
    const descParts = [variantData?.color, variantData?.size]
      .map(s => typeof s === 'string' ? s.trim() : s)
      .filter(Boolean);
    const productDataObj: Record<string, any> = {
      name: productData?.name || 'Producto',
    };
    // Only add images if non-empty array with valid URLs
    const productImages = (productData?.images || []).filter((img: string) => typeof img === 'string' && img.trim());
    if (productImages.length > 0) {
      productDataObj.images = productImages.slice(0, 1);
    }
    if (descParts.length > 0) {
      productDataObj.description = descParts.join(' / ');
    }
    return {
      price_data: {
        currency: 'eur',
        product_data: productDataObj,
        unit_amount: priceInCents,
      },
      quantity: item.quantity,
    };
  }));

  if (shippingCost > 0) {
    result.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Envío' },
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
    // Nota: el stock ya fue reservado (decrementado) al añadir al carrito,
    // así que aquí solo verificamos que no sea negativo (anomalía)
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock, product:products(name)')
        .eq('id', item.variantId)
        .single();

      const variantData = variant as any;
      if (!variantData) {
        return new Response(JSON.stringify({ 
          error: `Producto no encontrado. Por favor, actualiza tu carrito.` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Si el stock es negativo, hubo un error en la reserva
      if (variantData.stock < 0) {
        return new Response(JSON.stringify({ 
          error: `"${variantData?.product?.name || 'Producto'}" se ha agotado. Por favor, elimínalo del carrito.` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Construir line items (helper separado, testeable)
    const lineItems = await buildStripeLineItems(items, shippingCost);

    // Sanitizar line items: eliminar cualquier description vacía que Stripe rechazaría
    for (const li of lineItems) {
      const pd = li.price_data?.product_data;
      if (pd && ('description' in pd) && (!pd.description || (typeof pd.description === 'string' && !pd.description.trim()))) {
        delete pd.description;
      }
      // También limpiar images vacíos
      if (pd && 'images' in pd && Array.isArray(pd.images) && pd.images.length === 0) {
        delete pd.images;
      }
    }

    // ── Descuento: re-calcular en servidor (no confiar en el valor del cliente) ──
    const discounts: any[] = [];
    let serverDiscountAmt = 0; // en euros

    if (couponCode) {
      // 1. Buscar en tabla coupons
      const { data: dbCoupon } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', couponCode)
        .maybeSingle();

      if (dbCoupon) {
        const itemsSubtotal = Number(subtotal) || items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
        if (dbCoupon.discount_type === 'percentage') {
          // discount_value es el porcentaje entero (20 = 20%)
          serverDiscountAmt = itemsSubtotal * (dbCoupon.discount_value / 100);
          // Respetar max_discount si existe (también en euros)
          if (dbCoupon.max_discount) {
            serverDiscountAmt = Math.min(serverDiscountAmt, dbCoupon.max_discount);
          }
        } else if (dbCoupon.discount_type === 'fixed') {
          // discount_value está en euros directamente (20 = 20€)
          serverDiscountAmt = dbCoupon.discount_value;
        }
        logger.debug(`Cupón ${couponCode} validado (server): tipo=${dbCoupon.discount_type}, valor=${dbCoupon.discount_value}, descuento=${serverDiscountAmt}€`);
      } else {
        // 2. Fallback: newsletter_subscribers (20% fijo)
        const { data: newsletter } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .eq('discount_code', couponCode.toUpperCase())
          .maybeSingle();

        if (newsletter && !newsletter.used) {
          const itemsSubtotal = Number(subtotal) || items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
          serverDiscountAmt = itemsSubtotal * 0.20; // 20%
          logger.debug(`Newsletter cupón ${couponCode}: 20% de ${itemsSubtotal} = ${serverDiscountAmt}€`);
        }
      }

      // Crear cupón temporal en Stripe si hay descuento
      if (serverDiscountAmt > 0) {
        const discountInCents = Math.round(serverDiscountAmt * 100);
        const coupon = await getStripe().coupons.create({
          amount_off: discountInCents,
          currency: 'eur',
          duration: 'once',
          name: couponCode,
        });
        logger.debug(`Stripe cupón creado: ${discountInCents} céntimos`);
        discounts.push({ coupon: coupon.id });
      }
    }

    // Solo tarjeta por ahora - añadir más métodos cuando estén verificados
    // En modo E2E/local devolvemos un session mock para que las pruebas intercepten sin Stripe.
    // BUT: don't short-circuit during unit tests (Vitest) — those mock the Stripe SDK and expect the handler to call it.
    if (process.env.PLAYWRIGHT_RUNNING && !process.env.VITEST) {
      logger.info('PLAYWRIGHT_RUNNING: returning mocked Stripe session');
      return new Response(JSON.stringify({ url: 'https://checkout.stripe.test/mock-session', sessionId: 'sess_e2e_mock' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Construir config — allow_promotion_codes y discounts son MUTUAMENTE EXCLUYENTES en Stripe
    const sessionConfig: Record<string, any> = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/carrito`,
      customer_email: email,
      metadata: {
        email,
        phone: phone || '',
        shippingMethod: shippingMethod || 'standard',
        couponCode: couponCode || '',
        discountAmount: String(serverDiscountAmt || 0),
        subtotal: String(subtotal || 0),
        shippingCost: String(shippingCost || 0),
        // Stripe metadata limit: 500 chars per value
        // Reduce items to minimal fields and split if needed
        ...(() => {
          const minItems = (items || []).map((i: any) => ({
            v: i.variantId,
            q: i.quantity,
            p: i.price,
          }));
          const serialized = JSON.stringify(minItems);
          if (serialized.length <= 500) {
            return { items: serialized };
          }
          // Split into chunks of max 500 chars each
          const result: Record<string, string> = {};
          let chunkIndex = 0;
          let currentChunk: any[] = [];
          for (const item of minItems) {
            currentChunk.push(item);
            if (JSON.stringify(currentChunk).length > 480) {
              // Last item pushed it over — save current chunk without it
              if (currentChunk.length > 1) {
                currentChunk.pop();
                result[`items_${chunkIndex}`] = JSON.stringify(currentChunk);
                chunkIndex++;
                currentChunk = [item];
              } else {
                result[`items_${chunkIndex}`] = JSON.stringify(currentChunk);
                chunkIndex++;
                currentChunk = [];
              }
            }
          }
          if (currentChunk.length > 0) {
            result[`items_${chunkIndex}`] = JSON.stringify(currentChunk);
          }
          result.items_chunks = String(chunkIndex + (currentChunk.length > 0 ? 1 : 0));
          return result;
        })(),
      },
      shipping_address_collection: {
        allowed_countries: ['ES', 'PT', 'FR', 'AD', 'DE', 'IT', 'BE', 'NL', 'AT', 'CH'],
      },
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      locale: 'es',
    };

    // Solo UNO de los dos: discounts O allow_promotion_codes (nunca ambos)
    if (discounts.length > 0) {
      sessionConfig.discounts = discounts;
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    const session = await getStripe().checkout.sessions.create(sessionConfig);

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
