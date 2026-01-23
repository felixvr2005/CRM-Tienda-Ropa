import { s as supabase } from '../../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../../renderers.mjs';

const GET = async ({ url, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const typeId = url.searchParams.get("type_id");
    if (!typeId) {
      return new Response(JSON.stringify({
        error: "Falta parámetro type_id"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: productType, error } = await supabase.from("product_types").select("available_sizes, size_type").eq("id", typeId).single();
    if (error) throw error;
    if (!productType) {
      return new Response(JSON.stringify({
        error: "Tipo de producto no encontrado"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      sizeType: productType.size_type,
      availableSizes: productType.available_sizes || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en GET /api/admin/product-types/sizes:", error);
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
