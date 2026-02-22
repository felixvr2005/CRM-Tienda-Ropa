export const prerender = false;

import { logger } from '@lib/logger';
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '');

export const POST: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
    }

    const { data: returnRequest } = await supabaseAdmin
      .from('return_requests')
      .select(`
        *,
        order:orders(id, stripe_payment_intent_id, customer:customers(email, name))
      `)
      .eq('id', id)
      .single() as any;

    if (!returnRequest) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    const refundAmount = Math.round((returnRequest.refund_amount || 0) * 100);
    let stripeRefundId = null;

    if (returnRequest.order?.stripe_payment_intent_id) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: returnRequest.order.stripe_payment_intent_id,
          amount: refundAmount,
          metadata: {
            return_request_id: id,
            order_id: returnRequest.order.id
          }
        });
        stripeRefundId = refund.id;
      } catch (stripeError) {
        logger.error('Stripe error:', stripeError);
      }
    }

    await supabaseAdmin
      .from('return_requests')
      .update({
        status: 'refunded',
        refund_date: new Date().toISOString(),
        stripe_refund_id: stripeRefundId,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id);

    const { data: creditNotes } = await supabaseAdmin
      .from('credit_notes')
      .select('id')
      .eq('return_request_id', id)
      .limit(1) as any;

    if (creditNotes && creditNotes.length > 0) {
      await supabaseAdmin
        .from('credit_notes')
        .update({ status: 'processed' } as any)
        .eq('id', creditNotes[0].id);
    }

    logger.info(`Reembolso procesado: ${refundAmount/100} para ${returnRequest.order?.customer?.email}`);

    // ✅ RESTAURAR STOCK de los items devueltos
    try {
      const { data: returnItems } = await supabaseAdmin
        .from('return_request_items')
        .select('order_item_id, quantity')
        .eq('return_request_id', id) as any;

      if (returnItems && returnItems.length > 0) {
        for (const ri of returnItems) {
          const { data: orderItem } = await supabaseAdmin
            .from('order_items')
            .select('variant_id, quantity')
            .eq('id', ri.order_item_id)
            .single();

          if (orderItem?.variant_id) {
            const qtyToRestore = ri.quantity || orderItem.quantity;
            await supabaseAdmin.rpc('increase_stock', {
              p_variant_id: orderItem.variant_id,
              p_quantity: qtyToRestore
            });
            logger.info('Stock restaurado por devolucion', { variantId: orderItem.variant_id, qty: qtyToRestore });
          }
        }
      } else {
        // Fallback: si no hay return_request_items, restaurar todos los items del pedido
        const orderId = returnRequest.order?.id;
        if (orderId) {
          const { data: orderItems } = await supabaseAdmin
            .from('order_items')
            .select('variant_id, quantity')
            .eq('order_id', orderId);

          for (const oi of (orderItems || [])) {
            if (oi.variant_id) {
              await supabaseAdmin.rpc('increase_stock', {
                p_variant_id: oi.variant_id,
                p_quantity: oi.quantity
              });
              logger.info('Stock restaurado (fallback pedido completo)', { variantId: oi.variant_id, qty: oi.quantity });
            }
          }
        }
      }
    } catch (stockError) {
      logger.error('Error restaurando stock en devolucion:', stockError);
    }

    // ✅ Marcar pedido original como 'refunded' para que analytics lo excluya
    if (returnRequest.order?.id) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'refunded', refunded_at: new Date().toISOString() } as any)
        .eq('id', returnRequest.order.id);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Reembolso procesado y stock restaurado',
      refundAmount: refundAmount / 100,
      stripeRefundId
    }), { status: 200 });
  } catch (error) {
    logger.error('Refund error:', error);
    return new Response(JSON.stringify({ error: 'Error processing refund' }), { status: 500 });
  }
};
