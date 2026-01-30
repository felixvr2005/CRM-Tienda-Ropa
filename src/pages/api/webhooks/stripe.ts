/**
 * Stripe Webhook Endpoint
 * Procesa eventos de Stripe (pagos completados, etc.)
 */
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabaseAdmin } from '@lib/supabase';
import { ensureEnv } from '@lib/ensureEnv';
import { logger } from '@lib/logger';

export const prerender = false;

// Verificación de entorno crítica: fallar rápido si faltan claves de Stripe
ensureEnv(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']);

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  // Si hay webhook secret configurado, verificar firma
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      logger.error('Webhook signature verification failed:', err?.message || err);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err?.message || err}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else {
    // En desarrollo, aceptar sin verificar firma
    logger.warn('⚠️ Webhook sin verificación de firma (modo desarrollo)');
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Manejar el evento
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        logger.info('PaymentIntent succeeded', { id: event.data.object.id });
        break;

      case 'payment_intent.payment_failed':
        logger.warn('PaymentIntent failed', { id: event.data.object.id });
        break;

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    logger.error('Error processing webhook', { error: error?.message || String(error) });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Procesa un checkout completado
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout.session.completed', { sessionId: session.id });

  // Obtener metadata del checkout
  const metadata = session.metadata || {};
  const email = metadata.email || session.customer_email || '';
  const phone = metadata.phone || '';
  const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : null;
  const shippingMethod = metadata.shippingMethod || 'standard';
  const items = metadata.items ? JSON.parse(metadata.items) : [];

  // Idempotency guard: si ya existe un pedido con esta sesión, salir sin duplicar
  try {
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('stripe_checkout_session_id', session.id)
      .single();

    if (existingOrder) {
      logger.info(`Webhook already processed for session ${session.id} (order ${existingOrder.order_number})`);
      return;
    }
  } catch (err) {
    // Si la comprobación falla no bloqueamos el procesamiento — sólo registramos
    logger.warn('Idempotency check failed, continuing processing:', err);
  }

  if (items.length === 0) {
    logger.error('No items in checkout session');
    return;
  }

  // Generar número de pedido único secuencial
  const orderNumber = await generateSequentialOrderNumber();

  // Calcular totales
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  // Free shipping threshold aligned with checkout UI (100€)
  const shippingCost = shippingMethod === 'express' ? 9.95 : (subtotal >= 100 ? 0 : 4.95);
  // Intentar obtener descuento desde metadata (si la UI lo envió)
  const discountAmount = Number(metadata.discountAmount || metadata.discount_amount || 0) || 0;

  // Stripe amount_total viene en céntimos; si no está presente o no coincide con el total calculado, preferimos el cálculo server-side
  let totalAmount = (session.amount_total || 0) / 100; // Stripe usa centavos
  const expectedTotal = Math.round((subtotal + shippingCost - discountAmount) * 100) / 100;
  if (!totalAmount || Math.abs(totalAmount - expectedTotal) > 0.009) {
    logger.warn(`Stripe total (${totalAmount}€) does not match expected total (${expectedTotal}€) for session ${session.id} — using server-calculated total`);
    totalAmount = expectedTotal;
  }

  // Buscar o crear customer (por email). Si existe, usar id; si no, crear cliente para poder asociar pedidos a clientes sin cuenta
  let customerId = null;
  if (email) {
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', email)
      .single() as any;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Crear customer como invitado (sin auth_user_id) para asociar pedidos y permitir que aparezcan en el dashboard
      const name = shippingAddress?.name || '';
      const [first_name, ...rest] = name.split(' ');
      const last_name = rest.join(' ') || null;
      const { data: newCustomer, error: newCustomerError } = await supabaseAdmin
        .from('customers')
        .insert({
          email,
          first_name: first_name || null,
          last_name: last_name,
          phone: phone || null
        })
        .select()
        .single() as any;

      if (newCustomer && newCustomer.id) {
        customerId = newCustomer.id;
      } else if (newCustomerError) {
        logger.error('Error creating customer for guest checkout:', newCustomerError);
      }
    }
  }

  // Crear el pedido
  const couponCode = metadata.couponCode || null;
  
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      customer_email: email,
      customer_name: shippingAddress?.name || '',
      customer_phone: phone,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'stripe',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      discount_code: couponCode,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      shipping_method: shippingMethod
    } as any)
    .select()
    .single() as any;

  if (orderError) {
    logger.error('Error creating order', { error: orderError });
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  logger.info('Order created', { id: order.id, orderNumber: order.order_number });

  // Crear los items del pedido y descontar stock
  for (const item of items) {
    // Obtener información del variant
    const { data: variant } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id, color, size, price, stock,
        product:products(id, name, images)
      `)
      .eq('id', item.variantId)
      .single() as any;

    if (!variant) {
      logger.error('Variant not found', { variantId: item.variantId });
      continue;
    }

    const variantData = variant as any;

    // Crear order item con todos los campos necesarios para la vista
    const { error: itemError } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: variantData.product?.id,
        variant_id: item.variantId,
        product_name: variantData.product?.name || item.name || 'Producto',
        product_slug: item.slug || null,
        product_image: variantData.product?.images?.[0] || item.image || null,
        color: variantData.color || item.color || null,
        size: variantData.size || item.size || null,
        variant_info: `${variantData.color || ''} / ${variantData.size || ''}`,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
        discount_percentage: item.discount || 0,
        image_url: variantData.product?.images?.[0] || item.image || null
      } as any);

    if (itemError) {
      logger.error('Error creating order item', { error: itemError });
    }

    // Descontar stock usando función atómica
    const { error: stockError } = await (supabaseAdmin as any).rpc('decrease_stock', {
      p_variant_id: item.variantId,
      p_quantity: item.quantity
    });

    if (stockError) {
      logger.error('Error decreasing stock', { error: stockError });
      // Fallback: actualización directa (menos seguro)
      await (supabaseAdmin as any)
        .from('product_variants')
        .update({ stock: Math.max(0, variantData.stock - item.quantity) })
        .eq('id', item.variantId);
    }

    logger.info('Stock updated for variant', { variantId: item.variantId, decrement: item.quantity });
  }

  logger.info('Checkout completed successfully', { orderNumber });
}

/**
 * Genera un número de pedido único secuencial
 * Formato: ORD-TIMESTAMP-RANDOM (e.g., ORD-1705600000-ABC123XYZ)
 * Garantiza unicidad evitando colisiones
 */
async function generateSequentialOrderNumber(): Promise<string> {
  // Usar timestamp + random para garantizar unicidad
  const timestamp = Math.floor(Date.now() / 1000);
  const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${randomStr}`;
}
