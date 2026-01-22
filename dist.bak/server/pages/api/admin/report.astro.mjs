import { a as sendAdminEmail } from '../../../email.Yr7968NY.mjs';
import { g as generateAdminEmailData } from '../../../reports.PxkWspH9.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
  }
  try {
    const { dateRange, adminEmail, startDate, endDate } = await request.json();
    if (!dateRange || !adminEmail) {
      return new Response(
        JSON.stringify({
          error: "dateRange y adminEmail son requeridos"
        }),
        { status: 400 }
      );
    }
    if (!["day", "week", "month", "year", "custom"].includes(dateRange)) {
      return new Response(
        JSON.stringify({ error: "dateRange inválido" }),
        { status: 400 }
      );
    }
    const reportData = await generateAdminEmailData(
      dateRange,
      startDate ? new Date(startDate) : void 0,
      endDate ? new Date(endDate) : void 0
    );
    const result = await sendAdminEmail(adminEmail, reportData);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reporte enviado a ${adminEmail}`,
        messageId: result.messageId
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al enviar reporte:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar el reporte",
        details: error.message
      }),
      { status: 500 }
    );
  }
};
const GET = async ({ url }) => {
  try {
    const dateRange = url.searchParams.get("dateRange") || "day";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (!["day", "week", "month", "year", "custom"].includes(dateRange)) {
      return new Response(
        JSON.stringify({ error: "dateRange inválido" }),
        { status: 400 }
      );
    }
    const reportData = await generateAdminEmailData(
      dateRange,
      startDate ? new Date(startDate) : void 0,
      endDate ? new Date(endDate) : void 0
    );
    return new Response(JSON.stringify(reportData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al obtener preview del reporte:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar el reporte",
        details: error.message
      }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
