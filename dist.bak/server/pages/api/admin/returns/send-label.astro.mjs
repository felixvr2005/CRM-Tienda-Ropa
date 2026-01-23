import { a as supabaseAdmin } from '../../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { returnRequestId, customerEmail, customerName } = await request.json();
    if (!returnRequestId || !customerEmail) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    const labelCode = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await supabaseAdmin.from("return_requests").update({
      label_code: labelCode,
      status: "shipped"
    }).eq("id", returnRequestId);
    console.log(`📧 Email enviado a: ${customerEmail}`);
    console.log(`Código: ${labelCode}`);
    return new Response(JSON.stringify({
      success: true,
      message: "Etiqueta enviada",
      labelCode
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al enviar etiqueta" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
