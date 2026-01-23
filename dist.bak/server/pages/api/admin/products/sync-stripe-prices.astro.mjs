import Stripe from 'stripe';
import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const PUT = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const stripe = new Stripe("sk_test_51SXzXlRrW2kGomeyvD6pFi2uUKew3HgdG9GfBuay0MJIVzCbAbwIPAR8NaDmjN990dAnlaDIpuIm1WDq8yYRNYea00NQuDx0fh");
    const { data: products, error } = await supabaseAdmin.from("products").select(`
        id,
        name,
        price,
        stripe_product_id,
        variants:product_variants(
          id,
          color,
          size,
          price,
          stripe_price_id
        )
      `);
    if (error) {
      throw new Error(`Error obteniendo productos: ${error.message}`);
    }
    const results = {
      total: 0,
      synced: 0,
      errors: [],
      details: []
    };
    for (const product of products) {
      results.total++;
      if (!product.stripe_product_id) {
        results.errors.push(`${product.name}: sin stripe_product_id`);
        continue;
      }
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const priceInCents = Math.round(variant.price * 100);
          if (variant.stripe_price_id) {
            try {
              await stripe.prices.update(variant.stripe_price_id, {
                metadata: {
                  sync_date: (/* @__PURE__ */ new Date()).toISOString(),
                  price_eur: variant.price.toString(),
                  color: variant.color || "",
                  size: variant.size || ""
                }
              });
              results.synced++;
              results.details.push({
                product: product.name,
                variant: `${variant.color}/${variant.size}`,
                price: `€${variant.price}`,
                status: "synced"
              });
            } catch (err) {
              results.errors.push(`${product.name} (${variant.color}/${variant.size}): ${err.message}`);
            }
          }
        }
      } else {
        const priceInCents = Math.round(product.price * 100);
        const stripePrices = await stripe.prices.list({
          product: product.stripe_product_id,
          active: true,
          limit: 1
        });
        if (stripePrices.data.length > 0) {
          const stripePrice = stripePrices.data[0];
          try {
            if (stripePrice.unit_amount !== priceInCents) {
              await stripe.prices.update(stripePrice.id, { active: false });
              const newPrice = await stripe.prices.create({
                product: product.stripe_product_id,
                unit_amount: priceInCents,
                currency: "eur",
                metadata: {
                  sync_date: (/* @__PURE__ */ new Date()).toISOString(),
                  price_eur: product.price.toString()
                }
              });
              await supabaseAdmin.from("products").update({ stripe_price_id: newPrice.id }).eq("id", product.id);
              results.synced++;
              results.details.push({
                product: product.name,
                oldPrice: `${stripePrice.unit_amount / 100}€`,
                newPrice: `€${product.price}`,
                status: "updated"
              });
            } else {
              results.synced++;
              results.details.push({
                product: product.name,
                price: `€${product.price}`,
                status: "already_correct"
              });
            }
          } catch (err) {
            results.errors.push(`${product.name}: ${err.message}`);
          }
        }
      }
    }
    console.log("Sync results:", results);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronización completada: ${results.synced}/${results.total} sincronizados`,
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en sync-stripe-prices:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al sincronizar precios" }),
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
