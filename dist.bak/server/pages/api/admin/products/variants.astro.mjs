import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const { action, productId, variants } = data;
    if (action === "upsert-multiple") {
      const updates = variants.map((v) => ({
        id: v.id,
        product_id: productId,
        color: v.color,
        size: v.size,
        stock: v.stock,
        sku: v.sku
      }));
      const { error } = await supabaseAdmin.from("product_variants").upsert(updates, { onConflict: "id" });
      if (error) throw error;
      return new Response(JSON.stringify({
        success: true,
        message: "Variantes actualizadas"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: false,
      error: "Acción no reconocida"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en POST /api/admin/products/variants:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const { variantId } = data;
    const { data: images } = await supabaseAdmin.from("variant_images").select("image_url").eq("variant_id", variantId);
    await supabaseAdmin.from("variant_images").delete().eq("variant_id", variantId);
    const { error } = await supabaseAdmin.from("product_variants").delete().eq("id", variantId);
    if (error) throw error;
    return new Response(JSON.stringify({
      success: true,
      message: "Variante eliminada"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en DELETE /api/admin/products/variants:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
