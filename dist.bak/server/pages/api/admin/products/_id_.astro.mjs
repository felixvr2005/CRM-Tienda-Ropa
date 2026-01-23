import { s as supabase } from '../../../../supabase.41eewI-c.mjs';
import { s as slugify } from '../../../../utils.Ceah_axf.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const GET = async ({ params }) => {
  try {
    const { id } = params;
    const { data, error } = await supabase.from("products").select("*, variants:product_variants(*)").eq("id", id).single();
    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Producto no encontrado" }),
      { status: 404 }
    );
  }
};
const PUT = async ({ params, request }) => {
  try {
    const { id } = params;
    const { product, variants } = await request.json();
    console.log("PUT /api/admin/products/[id]", { id, product, variantsCount: variants?.length || 0 });
    if (!product.name || product.name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El nombre del producto es obligatorio" }),
        { status: 400 }
      );
    }
    if (product.name) {
      product.slug = slugify(product.name);
      const { data: existing } = await supabase.from("products").select("slug").eq("slug", product.slug).neq("id", id).single();
      if (existing) {
        product.slug = `${product.slug}-${Date.now()}`;
      }
    }
    const updateData = {};
    const allowedFields = [
      "name",
      "slug",
      "description",
      "category_id",
      "price",
      "compare_at_price",
      "discount_percentage",
      "images",
      "brand",
      "material",
      "care_instructions",
      "is_active",
      "is_featured",
      "is_new",
      "is_flash_offer",
      "tags",
      "meta_title",
      "meta_description",
      "sku",
      "cost_price"
    ];
    allowedFields.forEach((field) => {
      if (field in product) {
        let value = product[field];
        if (field === "images" && Array.isArray(value)) {
          updateData[field] = value;
          return;
        }
        if (value === null || value === void 0) {
          return;
        }
        if (field === "price" && typeof value === "number") {
          value = Math.round(value * 100);
        } else if (field === "compare_at_price" && typeof value === "number") {
          value = Math.round(value * 100);
        }
        updateData[field] = value;
      }
    });
    updateData.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    console.log("Updating product:", id, "with data:", updateData);
    const { error: productError, data: updatedProduct } = await supabase.from("products").update(updateData).eq("id", id).select().single();
    if (productError) {
      console.error("Product update error:", productError);
      throw productError;
    }
    if (variants && Array.isArray(variants)) {
      const { data: existingVariants } = await supabase.from("product_variants").select("id").eq("product_id", id);
      const existingIds = existingVariants?.map((v) => v.id) || [];
      const newVariantIds = variants.filter((v) => v.id).map((v) => v.id);
      const toDelete = existingIds.filter((vid) => !newVariantIds.includes(vid));
      if (toDelete.length > 0) {
        await supabase.from("product_variants").delete().in("id", toDelete);
      }
      for (const variant of variants) {
        if (variant.id) {
          const { id: variantId, ...variantData } = variant;
          await supabase.from("product_variants").update({ ...variantData, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", variantId);
        } else {
          await supabase.from("product_variants").insert({
            ...variant,
            product_id: id
          });
        }
      }
    }
    return new Response(
      JSON.stringify({ success: true, message: "Producto actualizado correctamente" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el producto", details: String(error) }),
      { status: 500 }
    );
  }
};
const DELETE = async ({ params }) => {
  try {
    const { id } = params;
    await supabase.from("product_variants").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar el producto" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
