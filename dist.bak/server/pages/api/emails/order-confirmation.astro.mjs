import { b as sendCustomerEmail } from '../../../email.Yr7968NY.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405
    });
  }
  try {
    const { customerEmail, orderData } = await request.json();
    if (!customerEmail || !orderData) {
      return new Response(
        JSON.stringify({ error: "customerEmail y orderData son requeridos" }),
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400
      });
    }
    const result = await sendCustomerEmail(customerEmail, orderData);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Correo de confirmación enviado a ${customerEmail}`,
        messageId: result.messageId
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return new Response(
      JSON.stringify({
        error: "Error al enviar el correo",
        details: error.message
      }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
