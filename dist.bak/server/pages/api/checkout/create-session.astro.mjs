import Stripe from 'stripe';
import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const stripe = new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh");
const POST = async ({ request }) => {
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
      total,
      discountAmount
    } = body;
    if (!email || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    for (const item of items) {
      const { data: variant } = await supabase.from("product_variants").select("stock, product:products(name)").eq("id", item.variantId).single();
      const variantData = variant;
      if (!variantData || variantData.stock < item.quantity) {
        return new Response(JSON.stringify({
          error: `Stock insuficiente para ${variantData?.product?.name || "producto"}`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    const lineItems = await Promise.all(items.map(async (item) => {
      const { data: variant } = await supabase.from("product_variants").select(`
          id, color, size, price,
          product:products(name, images, price)
        `).eq("id", item.variantId).single();
      const variantData = variant;
      const productData = variantData?.product;
      const priceInCents = Math.round(item.price * 100);
      console.log(`Item: ${productData?.name}, price from client: €${item.price}, in cents: ${priceInCents}`);
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: productData?.name || "Producto",
            description: `${variantData?.color || ""} / ${variantData?.size || ""}`,
            images: productData?.images?.slice(0, 1) || []
          },
          unit_amount: priceInCents
        },
        quantity: item.quantity
      };
    }));
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: shippingMethod === "express" ? "Envío Express" : "Envío Estándar",
            images: []
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }
    const discounts = [];
    if (couponCode && (discountAmount || discount)) {
      const discountInCents = Math.round((discountAmount || discount) * 100);
      const coupon = await stripe.coupons.create({
        amount_off: discountInCents,
        currency: "eur",
        duration: "once",
        name: couponCode
      });
      console.log(`Cupón ${couponCode} creado: ${discountInCents} céntimos`);
      discounts.push({ coupon: coupon.id });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : void 0,
      mode: "payment",
      success_url: `${request.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/carrito`,
      customer_email: email,
      metadata: {
        email,
        phone,
        shippingAddress: JSON.stringify(shippingAddress),
        shippingMethod,
        couponCode: couponCode || "",
        items: JSON.stringify(items)
      },
      shipping_address_collection: {
        allowed_countries: ["ES", "PT", "FR", "AD", "DE", "IT", "BE", "NL", "AT", "CH"]
      },
      phone_number_collection: {
        enabled: true
      },
      // Permitir códigos promocionales desde Stripe Dashboard
      allow_promotion_codes: true,
      // Información de facturación
      billing_address_collection: "auto",
      // Expiración de la sesión (30 minutos)
      expires_at: Math.floor(Date.now() / 1e3) + 1800,
      // Locale en español
      locale: "es"
    });
    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Error al crear la sesión de pago"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
