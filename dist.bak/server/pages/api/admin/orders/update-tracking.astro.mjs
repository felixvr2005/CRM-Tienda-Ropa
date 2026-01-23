import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
import { s as sendAdminNotificationEmail } from '../../../../email.Yr7968NY.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const PUT = async ({ request }) => {
  try {
    const body = await request.json();
    let { orderNumber, trackingNumber, trackingUrl } = body;
    if (!orderNumber) {
      return new Response(
        JSON.stringify({ error: "Se requiere orderNumber" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("order_number", orderNumber).single();
    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Pedido no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const { error: updateError } = await supabaseAdmin.from("orders").update({
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      status: "shipped",
      // Marcar como enviado
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", order.id);
    if (updateError) {
      throw updateError;
    }
    if (order.customer_email) {
      try {
        await sendAdminNotificationEmail({
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          orderNumber: order.order_number,
          status: "shipped",
          trackingNumber,
          trackingUrl
        });
      } catch (emailError) {
        console.error("Error sending tracking email:", emailError);
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Información de seguimiento actualizada"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating tracking:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error al actualizar seguimiento" }),
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
