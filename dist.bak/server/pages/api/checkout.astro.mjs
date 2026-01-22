import { b as createCheckoutSession } from '../../stripe.Ca78DwE8.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    if ("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh".includes("sk_test_...")) {
      console.error("⚠️ STRIPE_SECRET_KEY no configurada en .env.local");
      return new Response(
        JSON.stringify({
          error: "Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local",
          setupGuide: "https://dashboard.stripe.com/apikeys"
        }),
        { status: 500 }
      );
    }
    if ("pk_test_51SXzXlRrW2kGomeyAxCOtKQLLoRBVv5zwbwotI3GdE0MlvF3YWUlb8WIv9T6vCZNvaOPF4prkaa6y1JzZA6dPnQf00gwiIxySN".includes("pk_test_...")) {
      console.error("⚠️ PUBLIC_STRIPE_PUBLISHABLE_KEY no configurada en .env.local");
      return new Response(
        JSON.stringify({
          error: "Las claves de Stripe no están configuradas. Por favor configura STRIPE_SECRET_KEY y PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local"
        }),
        { status: 500 }
      );
    }
    const { items, couponCode } = await request.json();
    console.log("Checkout items recibidos:", JSON.stringify(items, null, 2));
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "El carrito está vacío" }),
        { status: 400 }
      );
    }
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase.from("coupons").select("id, discount_percentage, is_active, max_uses, used_count, expiry_date").eq("code", couponCode.toUpperCase()).single();
      if (couponError || !coupon) {
        return new Response(
          JSON.stringify({ error: "Cupón inválido o expirado" }),
          { status: 400 }
        );
      }
      if (!coupon.is_active) {
        return new Response(
          JSON.stringify({ error: "Este cupón ya no es válido" }),
          { status: 400 }
        );
      }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return new Response(
          JSON.stringify({ error: "Este cupón ha alcanzado el límite de usos" }),
          { status: 400 }
        );
      }
      if (coupon.expiry_date && new Date(coupon.expiry_date) < /* @__PURE__ */ new Date()) {
        return new Response(
          JSON.stringify({ error: "Este cupón ha expirado" }),
          { status: 400 }
        );
      }
      const totalBeforeDiscount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      discountAmount = totalBeforeDiscount * coupon.discount_percentage / 100;
      console.log(`Cupón validado: ${couponCode}, descuento: ${coupon.discount_percentage}%`);
    }
    const lineItems = items.map((item) => {
      console.log(`Item: ${item.name}, precio: ${item.price}€, cantidad: ${item.quantity}`);
      return {
        name: item.name,
        description: `Talla: ${item.size} | Color: ${item.color}`,
        price: Math.round(item.price * 100),
        // Convert to cents
        quantity: item.quantity,
        image: item.image
      };
    });
    console.log("Line items para Stripe:", JSON.stringify(lineItems, null, 2));
    const itemsForMetadata = items.map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    const metadata = {
      items: JSON.stringify(itemsForMetadata),
      couponCode: couponCode || "",
      discountAmount: discountAmount.toString()
    };
    console.log("Metadata para Stripe:", metadata);
    const session = await createCheckoutSession(
      lineItems,
      `${new URL(request.url).origin}/checkout/success`,
      `${new URL(request.url).origin}/carrito`,
      void 0,
      // customerEmail - se capturará en Stripe Checkout
      metadata
    );
    console.log("Stripe session creada:", session.id, session.url);
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    console.error("Error message:", error.message);
    console.error("Error type:", error.type);
    return new Response(
      JSON.stringify({ error: error.message || "Error al procesar el pago" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
