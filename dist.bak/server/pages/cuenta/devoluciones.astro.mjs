/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../AccountLayout.BP0CPR-D.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase, a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

function CreditNoteDownload({
  returnRequestId,
  originalOrderId,
  orderNumber,
  authToken
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDownloadCreditNote = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/invoices/credit-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken || localStorage.getItem("sb-access-token") || ""}`
        },
        body: JSON.stringify({
          returnRequestId,
          originalOrderId
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error descargando abono");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `abono-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Error descargando abono");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleDownloadCreditNote,
        disabled: isLoading,
        className: "flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors",
        title: "Descargar nota de crédito",
        children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
          "Descargando..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }),
          "Descargar abono"
        ] })
      }
    ),
    error && /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-600 mt-2", children: [
      "❌ ",
      error
    ] })
  ] });
}

const $$Astro = createAstro();
const prerender = false;
const $$Devoluciones = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Devoluciones;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/devoluciones");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/devoluciones");
  }
  const { data: currentCustomer } = await supabaseAdmin.from("customers").select("id").eq("auth_user_id", user.id).single();
  if (!currentCustomer?.id) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/devoluciones");
  }
  const { data: returnRequests, error: returnError } = await supabaseAdmin.from("return_requests").select("id, status, reason, description, requested_amount, refund_amount, created_at, updated_at, order_id, customer_id, return_tracking_number, return_label_url, orders(order_number), credit_notes(id, amount, status, credit_note_number, created_at)").eq("customer_id", currentCustomer.id).order("created_at", { ascending: false });
  if (returnError) {
    console.error("Error fetching returns:", returnError);
  }
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const statusMap = {
    "pending": { label: "Pendiente", color: "text-yellow-600", icon: "\u23F3" },
    "label_sent": { label: "Etiqueta Enviada", color: "text-blue-600", icon: "\u{1F4E7}" },
    "approved": { label: "Aprobada", color: "text-blue-600", icon: "\u2713" },
    "shipped": { label: "Enviada", color: "text-purple-600", icon: "\u{1F69A}" },
    "received": { label: "Recibida", color: "text-indigo-600", icon: "\u{1F4E5}" },
    "completed": { label: "Completada", color: "text-green-600", icon: "\u2713" },
    "rejected": { label: "Rechazada", color: "text-red-600", icon: "\u2715" }
  };
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Mis Devoluciones" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <a href="/cuenta" class="hover:text-primary-900">Mi Cuenta</a> <span class="mx-2">/</span> <span class="text-primary-900">Devoluciones</span> </nav> <!-- Header --> <div class="flex items-center justify-between mb-8"> <h1 class="font-display text-3xl md:text-4xl">Mis Devoluciones</h1> <a href="/cuenta/pedidos" class="text-sm text-primary-600 hover:text-primary-900 underline">
Ver todos los pedidos →
</a> </div> ${!returnRequests || returnRequests.length === 0 ? renderTemplate`<div class="bg-white rounded-lg border border-primary-200 p-12 text-center"> <svg class="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4m0 0l-8 4m8-4v10l-8-4v10l8 4 8-4V7"></path> </svg> <p class="text-primary-500 text-lg mb-4">Aún no has solicitado devoluciones</p> <a href="/cuenta/pedidos" class="inline-block px-6 py-3 bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 transition-colors">
Ver mis pedidos
</a> </div>` : renderTemplate`<div class="space-y-6"> ${returnRequests.map((returnReq) => {
    const status = statusMap[returnReq.status] || { label: returnReq.status, color: "text-gray-600", icon: "?" };
    const creditNote = returnReq.credit_notes?.[0];
    return renderTemplate`<div class="bg-white rounded-lg border border-primary-200 p-6 hover:shadow-lg transition-shadow">  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4"> <div> <p class="text-sm text-primary-500">Pedido</p> <a${addAttribute(`/cuenta/pedidos/${returnReq.orders?.order_number}`, "href")} class="text-xl font-semibold text-primary-900 hover:text-primary-600">
#${returnReq.orders?.order_number} </a> </div> <div class="flex items-center gap-3"> <span${addAttribute(`text-lg ${status.color}`, "class")}>${status.icon}</span> <span${addAttribute(`font-medium ${status.color}`, "class")}>${status.label}</span> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-primary-100"> <div> <p class="text-primary-500">Fecha de solicitud</p> <p class="font-medium">${formatDate(returnReq.created_at)}</p> </div> <div> <p class="text-primary-500">Motivo</p> <p class="font-medium">${returnReq.reason || "No especificado"}</p> </div> </div>  <div class="flex flex-col sm:flex-row gap-3"> <a${addAttribute(`/cuenta/devoluciones/${returnReq.id}`, "href")} class="flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-600 text-sm rounded-lg hover:bg-primary-50 transition-colors text-center justify-center"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg>
Ver detalles
</a> ${creditNote && renderTemplate`${renderComponent($$result2, "CreditNoteDownload", CreditNoteDownload, { "client:load": true, "returnRequestId": returnReq.id, "originalOrderId": returnReq.order_id, "orderNumber": returnReq.orders?.order_number, "authToken": accessToken, "client:component-hydration": "load", "client:component-path": "@components/islands/CreditNoteDownload", "client:component-export": "default" })}`} ${returnReq.status === "completed" && !creditNote && renderTemplate`<button disabled title="El abono se generará automáticamente cuando la devolución se complete" class="px-4 py-2 bg-gray-300 text-gray-600 text-sm rounded-lg cursor-not-allowed">
Generar abono
</button>`} </div>  ${creditNote && renderTemplate`<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm"> <p class="text-green-700"> <strong>✓ Abono procesado:</strong> Se abonaron ${formatPrice(creditNote.refund_amount / 100)} a tu método de pago
</p> </div>`} </div>`;
  })} </div>`} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/devoluciones.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/devoluciones.astro";
const $$url = "/cuenta/devoluciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Devoluciones,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
