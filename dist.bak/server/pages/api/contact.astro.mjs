import { a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, subject, orderNumber, message } = body;
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Campos requeridos: name, email, subject, message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: contact, error: insertError } = await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      subject,
      order_number: orderNumber || null,
      message,
      status: "new",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (insertError) {
      console.error("Error inserting contact message:", insertError);
      return new Response(
        JSON.stringify({ error: "Error al guardar el mensaje" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("[Contact] Message received from:", email, "- Subject:", subject);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Tu mensaje ha sido enviado correctamente",
        id: contact.id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const GET = async ({ request }) => {
  try {
    return new Response(
      JSON.stringify({ error: "No autorizado" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Contact API GET] Error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
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
