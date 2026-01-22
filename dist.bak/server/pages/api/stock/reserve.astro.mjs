import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const { variantId, quantity } = await request.json();
    if (!variantId || !quantity) {
      return new Response(
        JSON.stringify({ error: "variantId y quantity son requeridos" }),
        { status: 400 }
      );
    }
    const { data: variant, error: fetchError } = await supabase.from("product_variants").select("stock").eq("id", variantId).single();
    if (fetchError || !variant) {
      return new Response(
        JSON.stringify({ error: "Variante no encontrada" }),
        { status: 404 }
      );
    }
    if (variant.stock < quantity) {
      return new Response(
        JSON.stringify({ error: "Stock insuficiente", availableStock: variant.stock }),
        { status: 400 }
      );
    }
    const newStock = variant.stock - quantity;
    const { error: updateError } = await supabase.from("product_variants").update({ stock: newStock }).eq("id", variantId);
    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Error al reservar stock" }),
        { status: 500 }
      );
    }
    console.log(`Stock reservado: variant ${variantId}, cantidad ${quantity}, nuevo stock: ${newStock}`);
    return new Response(
      JSON.stringify({ success: true, newStock }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error reservando stock:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
