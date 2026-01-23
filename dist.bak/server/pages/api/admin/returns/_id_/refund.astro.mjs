import { a as supabaseAdmin } from '../../../../../supabase.41eewI-c.mjs';
import Stripe from 'stripe';
export { renderers } from '../../../../../renderers.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const POST = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
    }
    const { data: returnRequest } = await supabaseAdmin.from("return_requests").select(`
        *,
        order:orders(id, payment_intent_id, customer:customers(email, name))
      `).eq("id", id).single();
    if (!returnRequest) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    const refundAmount = Math.round(returnRequest.requested_amount * 100);
    let stripeRefundId = null;
    if (returnRequest.order?.payment_intent_id) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: returnRequest.order.payment_intent_id,
          amount: refundAmount,
          metadata: {
            return_request_id: id,
            order_id: returnRequest.order.id
          }
        });
        stripeRefundId = refund.id;
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
      }
    }
    await supabaseAdmin.from("return_requests").update({
      status: "refunded",
      refund_date: (/* @__PURE__ */ new Date()).toISOString(),
      stripe_refund_id: stripeRefundId,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    const { data: creditNotes } = await supabaseAdmin.from("credit_notes").select("id").eq("return_request_id", id).limit(1);
    if (creditNotes && creditNotes.length > 0) {
      await supabaseAdmin.from("credit_notes").update({ status: "processed" }).eq("id", creditNotes[0].id);
    }
    console.log(`💰 Reembolso procesado: €${refundAmount / 100} para ${returnRequest.order?.customer?.email}`);
    return new Response(JSON.stringify({
      success: true,
      message: "Reembolso procesado",
      refundAmount: refundAmount / 100,
      stripeRefundId
    }), { status: 200 });
  } catch (error) {
    console.error("Refund error:", error);
    return new Response(JSON.stringify({ error: "Error processing refund" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
