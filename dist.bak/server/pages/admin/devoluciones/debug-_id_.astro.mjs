/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../AdminLayout.7POnspUO.mjs';
import { a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Debugid = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Debugid;
  const { id } = Astro2.params;
  console.log("=== ADMIN DEVOLUCIONES DETAIL DEBUG ===");
  console.log("ID recibido:", id);
  console.log("Tipo de ID:", typeof id);
  const debugInfo = {
    id_received: id,
    id_type: typeof id,
    steps: []
  };
  if (!id || typeof id !== "string") {
    console.error("\u274C PASO 1 FAILED: ID no v\xE1lido");
    debugInfo.steps.push({ step: 1, status: "FAILED", reason: "Invalid ID" });
    return Astro2.redirect("/admin/devoluciones");
  }
  debugInfo.steps.push({ step: 1, status: "OK", message: "ID validated" });
  let formattedReturn = null;
  try {
    console.log("\u{1F4CD} PASO 2: Obteniendo devoluci\xF3n...");
    const { data: returnRequest, error: queryError } = await supabaseAdmin.from("return_requests").select("*").eq("id", id).single();
    console.log("Query 1 error:", queryError);
    console.log("Query 1 data:", returnRequest);
    if (queryError) {
      debugInfo.steps.push({
        step: 2,
        status: "ERROR",
        error: queryError.message,
        code: queryError.code
      });
    } else if (!returnRequest) {
      debugInfo.steps.push({ step: 2, status: "NO_DATA", message: "No return request found" });
    } else {
      debugInfo.steps.push({ step: 2, status: "OK", message: "Return request found", id: returnRequest.id });
    }
    if (queryError || !returnRequest) {
      console.error("\u274C PASO 2 FAILED: No se encontr\xF3 la devoluci\xF3n");
      console.error("Error completo:", queryError);
      return Astro2.redirect("/admin/devoluciones");
    }
    console.log("\u{1F4CD} PASO 3: Obteniendo pedido...");
    let orderData = null;
    if (returnRequest.order_id) {
      const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("id, order_number").eq("id", returnRequest.order_id).single();
      console.log("Order error:", orderError);
      console.log("Order data:", order);
      if (orderError) {
        debugInfo.steps.push({
          step: 3,
          status: "ERROR",
          error: orderError.message
        });
      } else {
        debugInfo.steps.push({ step: 3, status: "OK", message: "Order found" });
        orderData = order;
      }
    }
    console.log("\u{1F4CD} PASO 4: Obteniendo cliente...");
    let customerData = null;
    if (returnRequest.customer_id) {
      const { data: customer, error: customerError } = await supabaseAdmin.from("customers").select("first_name, last_name, email, phone").eq("id", returnRequest.customer_id).single();
      console.log("Customer error:", customerError);
      console.log("Customer data:", customer);
      if (customerError) {
        debugInfo.steps.push({
          step: 4,
          status: "ERROR",
          error: customerError.message
        });
      } else {
        debugInfo.steps.push({ step: 4, status: "OK", message: "Customer found" });
        customerData = customer;
      }
    }
    console.log("\u{1F4CD} PASO 5: Obteniendo items...");
    const { data: items, error: itemsError } = await supabaseAdmin.from("return_request_items").select("*").eq("return_request_id", id);
    console.log("Items error:", itemsError);
    console.log("Items data:", items);
    if (itemsError) {
      debugInfo.steps.push({
        step: 5,
        status: "ERROR",
        error: itemsError.message
      });
    } else {
      debugInfo.steps.push({ step: 5, status: "OK", message: `Found ${items?.length || 0} items` });
    }
    formattedReturn = {
      ...returnRequest,
      orders: orderData,
      customers: customerData,
      items: items || []
    };
    debugInfo.steps.push({ step: 6, status: "OK", message: "Data formatted successfully" });
  } catch (e) {
    console.error("\u274C EXCEPTION:", e);
    debugInfo.steps.push({
      step: "exception",
      status: "ERROR",
      error: e.message
    });
    return Astro2.redirect("/admin/devoluciones");
  }
  if (!formattedReturn) {
    console.error("\u274C FINAL VALIDATION FAILED: formattedReturn is null");
    debugInfo.steps.push({ step: "final", status: "FAILED", reason: "formattedReturn is null" });
    return Astro2.redirect("/admin/devoluciones");
  }
  console.log("\u2705 TODO OK - Renderizando p\xE1gina");
  console.log("Debug info:", JSON.stringify(debugInfo, null, 2));
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Devoluci\xF3n - ${formattedReturn?.id?.slice(0, 8) || "Error"}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"> <div class="mb-8"> <a href="/admin/devoluciones" class="flex items-center gap-2 text-blue-600 hover:text-blue-700"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Volver a Devoluciones
</a> </div> <h1 class="text-4xl font-bold text-primary-900 mb-8">
Solicitud de Devolución #${formattedReturn?.id?.slice(0, 8) || "Error"} </h1> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2 space-y-6">  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"> <h2 class="text-xl font-bold mb-4">Cliente</h2> <p class="mb-2"><strong>Nombre:</strong> ${formattedReturn?.customers?.first_name} ${formattedReturn?.customers?.last_name}</p> <p class="mb-2"><strong>Email:</strong> ${formattedReturn?.customers?.email}</p> <p><strong>Teléfono:</strong> ${formattedReturn?.customers?.phone || "N/A"}</p> </div>  <div class="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500"> <h2 class="text-xl font-bold mb-4">Detalles</h2> <p class="mb-2"><strong>Motivo:</strong> ${formattedReturn?.reason}</p> <p class="mb-2"><strong>Descripción:</strong> ${formattedReturn?.description || "N/A"}</p> <p class="mb-2"><strong>Monto:</strong> €${formattedReturn?.refund_amount?.toFixed(2) || "0.00"}</p> <p><strong>Estado:</strong> ${formattedReturn?.status}</p> </div> </div> <div class="space-y-6"> <div class="bg-white rounded-lg shadow p-6"> <h2 class="text-lg font-bold mb-4">Información</h2> <p class="text-sm text-gray-600 mb-2">ID: ${formattedReturn?.id}</p> <p class="text-sm text-gray-600">Pedido: #${formattedReturn?.orders?.order_number || "N/A"}</p> </div> </div> </div>  <div class="mt-12 bg-gray-100 p-6 rounded-lg"> <h3 class="font-bold text-lg mb-4">Debug Info</h3> <pre class="text-xs overflow-auto">${JSON.stringify(debugInfo, null, 2)}</pre> </div> </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/devoluciones/debug-[id].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/devoluciones/debug-[id].astro";
const $$url = "/admin/devoluciones/debug-[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Debugid,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
