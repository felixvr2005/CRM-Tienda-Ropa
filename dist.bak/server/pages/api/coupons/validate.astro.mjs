import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const { code } = await request.json();
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Código requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: newsletter } = await supabase.from("newsletter_subscribers").select("*").eq("discount_code", code.toUpperCase()).single();
    if (newsletter) {
      if (newsletter.used) {
        return new Response(
          JSON.stringify({
            error: "Este código ya ha sido utilizado",
            valid: false
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          valid: true,
          code: newsletter.discount_code,
          discountPercentage: 20,
          discountType: "percentage",
          description: "Descuento de bienvenida - 20% de descuento"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Código de descuento inválido",
        valid: false
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en validate coupon:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al validar cupón" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
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
