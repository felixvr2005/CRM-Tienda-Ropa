import { a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const PUT = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      flash_sales_enabled,
      flash_sales_discount,
      min_order_amount,
      free_shipping_threshold
    } = body;
    const updates = [];
    if (flash_sales_enabled !== void 0) {
      updates.push(
        supabaseAdmin.from("configuracion").upsert({
          key: "flash_sales_enabled",
          value: String(flash_sales_enabled),
          type: "boolean",
          description: "Activa/desactiva ofertas flash"
        }, { onConflict: "key" })
      );
    }
    if (flash_sales_discount !== void 0) {
      updates.push(
        supabaseAdmin.from("configuracion").upsert({
          key: "flash_sales_discount",
          value: String(flash_sales_discount),
          type: "number",
          description: "Descuento de ofertas flash (%)"
        }, { onConflict: "key" })
      );
    }
    if (min_order_amount !== void 0) {
      updates.push(
        supabaseAdmin.from("configuracion").upsert({
          key: "min_order_amount",
          value: String(min_order_amount),
          type: "number",
          description: "Monto mínimo del pedido"
        }, { onConflict: "key" })
      );
    }
    if (free_shipping_threshold !== void 0) {
      updates.push(
        supabaseAdmin.from("configuracion").upsert({
          key: "free_shipping_threshold",
          value: String(free_shipping_threshold),
          type: "number",
          description: "Envío gratis a partir de este monto"
        }, { onConflict: "key" })
      );
    }
    const results = await Promise.all(updates);
    const hasErrors = results.some((r) => r.error);
    if (hasErrors) {
      return new Response(
        JSON.stringify({ error: "Error al actualizar configuración" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("[Settings] Configuration updated successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Configuración actualizada"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Settings API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
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
