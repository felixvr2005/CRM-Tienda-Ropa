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
    const {
      id,
      name,
      description,
      category_id,
      product_type_id,
      price,
      compare_at_price,
      discount_percentage,
      brand,
      material,
      care_instructions,
      is_featured,
      is_new,
      is_flash_offer,
      is_active
    } = data;
    if (!name || !product_type_id || !price) {
      return new Response(JSON.stringify({
        success: false,
        error: "Falta nombre, tipo de producto o precio"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    const productData = {
      name,
      slug,
      description,
      category_id,
      product_type_id,
      price,
      compare_at_price,
      discount_percentage,
      brand,
      material,
      care_instructions,
      is_featured,
      is_new,
      is_flash_offer,
      is_active
    };
    let productId;
    if (id) {
      const { error: updateError } = await supabaseAdmin.from("products").update(productData).eq("id", id);
      if (updateError) throw updateError;
      productId = id;
    } else {
      const { data: newProduct, error: insertError } = await supabaseAdmin.from("products").insert([productData]).select("id").single();
      if (insertError) throw insertError;
      if (!newProduct) throw new Error("No se retornó ID del producto");
      productId = newProduct.id;
    }
    return new Response(JSON.stringify({
      success: true,
      productId,
      message: id ? "Producto actualizado" : "Producto creado"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en POST /api/admin/products/save:", error);
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
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
