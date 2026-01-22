import Stripe from 'stripe';
import { a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh");
const POST = async ({ request }) => {
  const body = await request.text();
  request.headers.get("stripe-signature");
  let event;
  {
    console.warn("⚠️ Webhook sin verificación de firma (modo desarrollo)");
    try {
      event = JSON.parse(body);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object.id);
        break;
      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
async function handleCheckoutCompleted(session) {
  console.log("Processing checkout.session.completed:", session.id);
  const metadata = session.metadata || {};
  const email = metadata.email || session.customer_email || "";
  const phone = metadata.phone || "";
  const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : null;
  const shippingMethod = metadata.shippingMethod || "standard";
  const items = metadata.items ? JSON.parse(metadata.items) : [];
  if (items.length === 0) {
    console.error("No items in checkout session");
    return;
  }
  const orderNumber = await generateSequentialOrderNumber();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === "express" ? 9.95 : subtotal >= 100 ? 0 : 4.95;
  const totalAmount = (session.amount_total || 0) / 100;
  let customerId = null;
  if (email) {
    const { data: existingCustomer } = await supabaseAdmin.from("customers").select("id").eq("email", email).single();
    if (existingCustomer) {
      customerId = existingCustomer.id;
    }
  }
  const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
    order_number: orderNumber,
    customer_id: customerId,
    customer_email: email,
    customer_name: shippingAddress?.name || "",
    customer_phone: phone,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "stripe",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent,
    subtotal,
    shipping_cost: shippingCost,
    discount_amount: 0,
    total_amount: totalAmount,
    shipping_address: shippingAddress,
    shipping_method: shippingMethod
  }).select().single();
  if (orderError) {
    console.error("Error creating order:", orderError);
    throw new Error(`Failed to create order: ${orderError.message}`);
  }
  console.log("Order created:", order.id, order.order_number);
  for (const item of items) {
    const { data: variant } = await supabaseAdmin.from("product_variants").select(`
        id, color, size, price, stock,
        product:products(id, name, images)
      `).eq("id", item.variantId).single();
    if (!variant) {
      console.error(`Variant not found: ${item.variantId}`);
      continue;
    }
    const variantData = variant;
    const { error: itemError } = await supabaseAdmin.from("order_items").insert({
      order_id: order.id,
      product_id: variantData.product?.id,
      variant_id: item.variantId,
      product_name: variantData.product?.name || "Producto",
      variant_info: `${variantData.color || ""} / ${variantData.size || ""}`,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      image_url: variantData.product?.images?.[0] || null
    });
    if (itemError) {
      console.error("Error creating order item:", itemError);
    }
    const { error: stockError } = await supabaseAdmin.rpc("decrease_stock", {
      p_variant_id: item.variantId,
      p_quantity: item.quantity
    });
    if (stockError) {
      console.error("Error decreasing stock:", stockError);
      await supabaseAdmin.from("product_variants").update({ stock: Math.max(0, variantData.stock - item.quantity) }).eq("id", item.variantId);
    }
    console.log(`Stock updated for variant ${item.variantId}: -${item.quantity}`);
  }
  console.log("Checkout completed successfully:", orderNumber);
}
async function generateSequentialOrderNumber() {
  const timestamp = Math.floor(Date.now() / 1e3);
  const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${randomStr}`;
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
