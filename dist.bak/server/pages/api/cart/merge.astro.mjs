import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  const body = await request.json();
  const { sessionId, customerId, items } = body;
  if (!customerId) {
    return new Response(JSON.stringify({ error: "Missing customerId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    if (items && items.length > 0) {
      for (const item of items) {
        const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("customer_id", customerId).eq("variant_id", item.variantId).single();
        if (existing) {
          await supabase.from("cart_items").update({ quantity: existing.quantity + item.quantity }).eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({
            customer_id: customerId,
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity
          });
        }
      }
    }
    if (sessionId) {
      const { data: guestItems } = await supabase.from("cart_items").select("*").eq("session_id", sessionId);
      if (guestItems && guestItems.length > 0) {
        for (const guestItem of guestItems) {
          const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("customer_id", customerId).eq("variant_id", guestItem.variant_id).single();
          if (existing) {
            await supabase.from("cart_items").update({ quantity: existing.quantity + guestItem.quantity }).eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({
              customer_id: customerId,
              product_id: guestItem.product_id,
              variant_id: guestItem.variant_id,
              quantity: guestItem.quantity
            });
          }
        }
        await supabase.from("cart_items").delete().eq("session_id", sessionId);
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
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
