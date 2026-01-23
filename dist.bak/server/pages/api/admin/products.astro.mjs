import { s as supabase } from '../../../supabase.41eewI-c.mjs';
import { s as slugify } from '../../../utils.Ceah_axf.mjs';
import { c as createStripeProduct, a as createStripePrice } from '../../../stripe.Ca78DwE8.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  try {
    const { data, error } = await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al obtener productos" }),
      { status: 500 }
    );
  }
};
const POST = async ({ request }) => {
  try {
    const { product, variants } = await request.json();
    if (!product.name || !product.price) {
      return new Response(
        JSON.stringify({ error: "Nombre y precio son requeridos" }),
        { status: 400 }
      );
    }
    const priceInCents = Math.round(product.price * 100);
    let sku = product.sku;
    if (!sku) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      sku = `SKU-${timestamp}-${random}`;
    }
    let slug = slugify(product.name);
    const { data: existing } = await supabase.from("products").select("slug").eq("slug", slug).single();
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    const productData = {
      name: product.name,
      slug,
      description: product.description || null,
      category_id: product.category_id || null,
      price: priceInCents,
      compare_at_price: product.compare_at_price ? Math.round(product.compare_at_price * 100) : null,
      discount_percentage: parseInt(product.discount_percentage || "0") || 0,
      images: Array.isArray(product.images) ? product.images : [],
      brand: product.brand || null,
      material: product.material || null,
      care_instructions: product.care_instructions || null,
      is_active: !!product.is_active,
      is_featured: !!product.is_featured,
      is_new: !!product.is_new,
      is_flash_offer: !!product.is_flash_offer,
      tags: Array.isArray(product.tags) ? product.tags : [],
      meta_title: product.meta_title || null,
      meta_description: product.meta_description || null,
      sku
    };
    let stripeProductId = null;
    let stripePriceId = null;
    try {
      const stripeProduct = await createStripeProduct({
        name: product.name,
        description: product.description || void 0,
        images: productData.images || void 0,
        metadata: {
          slug: productData.slug,
          category_id: productData.category_id?.toString() || ""
        }
      });
      stripeProductId = stripeProduct.id;
      const stripePrice = await createStripePrice({
        productId: stripeProductId,
        unitAmount: priceInCents,
        currency: "eur",
        metadata: {
          compare_at_price: productData.compare_at_price?.toString() || ""
        }
      });
      stripePriceId = stripePrice.id;
      productData.stripe_product_id = stripeProductId;
      productData.stripe_price_id = stripePriceId;
      console.log(`Producto "${productData.name}" creado en Stripe: ${stripeProductId}`);
    } catch (stripeError) {
      console.warn("Error al crear producto en Stripe (continuando sin Stripe):", stripeError);
    }
    const { data: newProduct, error: productError } = await supabase.from("products").insert(productData).select().single();
    if (productError || !newProduct) {
      console.error("Product creation error:", productError);
      throw productError || new Error("No se pudo crear el producto");
    }
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantsWithProductId = variants.map((v) => ({
        size: v.size,
        color: v.color || null,
        stock: parseInt(v.stock || "0") || 0,
        product_id: newProduct.id
      }));
      const { error: variantsError } = await supabase.from("product_variants").insert(variantsWithProductId);
      if (variantsError) {
        console.error("Variants creation error:", variantsError);
        throw variantsError;
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        product: newProduct,
        stripe: {
          productId: stripeProductId,
          priceId: stripePriceId
        }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el producto", details: String(error) }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
