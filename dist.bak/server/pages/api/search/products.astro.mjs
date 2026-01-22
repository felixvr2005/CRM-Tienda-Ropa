import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ url }) => {
  try {
    const query = url.searchParams.get("q");
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ results: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: products, error } = await supabase.from("products").select("id, name, slug, price, discount_percentage, images").or(`name.ilike.%${query}%,description.ilike.%${query}%`).limit(10);
    if (error) {
      console.error("Search error:", error);
      return new Response(
        JSON.stringify({ error: "Error en búsqueda" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const results = products?.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discount_percentage: p.discount_percentage || 0,
      image_url: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
    })) || [];
    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
