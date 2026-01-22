import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
import { s as sendAdminNotificationEmail } from '../../../../email.Yr7968NY.mjs';
import Stripe from 'stripe';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const stripe = new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh");
const PUT = async ({ request }) => {
  try {
    const body = await request.json();
    let { orderId, orderNumber, status } = body;
    if (!orderId && !orderNumber || !status) {
      return new Response(
        JSON.stringify({ error: "Se requieren orderId/orderNumber y status" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!orderId && orderNumber) {
      const { data: orderData, error: orderError } = await supabaseAdmin.from("orders").select("id").eq("order_number", orderNumber).single();
      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ error: "Pedido no encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      orderId = orderData.id;
    }
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: "Estado inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: orderBefore, error: beforeError } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
    if (beforeError) {
      console.error("Error fetching order before update:", beforeError);
    }
    const { data: order, error: updateError } = await supabaseAdmin.from("orders").update({
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", orderId).select().single();
    if (updateError || !order) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar el pedido" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (order.customer_email) {
      const statusChanged = orderBefore?.status !== status;
      if (statusChanged) {
        try {
          console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Enviando email de cambio de estado para pedido ${order.order_number}`);
          console.log(`   Estado anterior: ${orderBefore?.status || "unknown"} → Estado nuevo: ${status}`);
          const emailResult = await sendAdminNotificationEmail(order.customer_email, {
            order_number: order.order_number,
            previous_status: orderBefore?.status || "unknown",
            new_status: status,
            customer_name: order.customer_name || "Cliente",
            order_date: order.created_at,
            total_amount: order.total_amount,
            tracking_url: `${new URL(request.url).origin}/cuenta/pedidos/${order.order_number}`
          });
          if (emailResult.success) {
            console.log(`Email enviado exitosamente a ${order.customer_email}`);
          } else {
            console.error(`Error al enviar email:`, emailResult.error);
          }
        } catch (emailError) {
          console.error("❌ Error en try/catch al enviar email:", emailError);
        }
      } else {
        console.log(`Estado no cambió, email no enviado`);
      }
    } else {
      console.warn(`No hay email de cliente para el pedido ${order.order_number}`);
    }
    if (status === "refunded") {
      const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", orderId);
      if (items && Array.isArray(items)) {
        for (const item of items) {
          try {
            await supabaseAdmin.rpc("increase_stock", {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity
            });
          } catch (error) {
            console.error("Error restoring stock:", error);
          }
        }
      }
      if (order.payment_method === "stripe" && order.stripe_payment_intent_id) {
        try {
          console.log(`Procesando reembolso en Stripe para el Payment Intent: ${order.stripe_payment_intent_id}`);
          const refund = await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent_id,
            amount: Math.round(order.total_amount * 100)
            // Convertir a centavos
          });
          console.log(`Reembolso procesado exitosamente: ${refund.id}`);
          await supabaseAdmin.from("orders").update({
            refunded_at: (/* @__PURE__ */ new Date()).toISOString(),
            stripe_refund_id: refund.id
          }).eq("id", orderId);
        } catch (error) {
          console.error("Error procesando reembolso en Stripe:", error.message);
        }
      }
    }
    console.log(`[Admin] Order ${order.order_number} status updated to: ${status}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Estado del pedido actualizado",
        order
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Orders API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
