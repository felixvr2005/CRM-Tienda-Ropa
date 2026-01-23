/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../../AccountLayout.BP0CPR-D.mjs';
import { s as supabase, a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
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
  const { id } = Astro2.params;
  const { data: returnRequest, error } = await supabaseAdmin.from("return_requests").select("*, orders(*), return_request_items(*), credit_notes(*)").eq("id", id).eq("customer_id", currentCustomer.id).single();
  if (!returnRequest) {
    return Astro2.redirect("/cuenta/devoluciones");
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
    "refunded": { label: "Reembolsada", color: "text-green-600", icon: "\u2713" },
    "completed": { label: "Completada", color: "text-green-600", icon: "\u2713" },
    "rejected": { label: "Rechazada", color: "text-red-600", icon: "\u2715" }
  };
  const currentStatus = statusMap[returnRequest.status] || { label: returnRequest.status, color: "text-gray-600", icon: "?" };
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": `Devoluci\xF3n #${returnRequest.id.slice(0, 8)}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <a href="/cuenta" class="hover:text-primary-900">Mi Cuenta</a> <span class="mx-2">/</span> <a href="/cuenta/devoluciones" class="hover:text-primary-900">Mis Devoluciones</a> <span class="mx-2">/</span> <span class="text-primary-900">Devolución #${returnRequest.id.slice(0, 8)}</span> </nav> <!-- Back Button --> <a href="/cuenta/devoluciones" class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-900 font-medium"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Volver a devoluciones
</a> <!-- Main Content --> <div class="grid gap-6"> <!-- Header Card --> <div class="bg-white rounded-lg border border-primary-200 p-6"> <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> <div> <h1 class="font-display text-3xl text-primary-900 mb-2">Devolución #${returnRequest.id.slice(0, 8)}</h1> <p class="text-primary-500">${formatDate(returnRequest.created_at)}</p> </div> <div class="flex items-center gap-3"> <span${addAttribute(`text-3xl ${currentStatus.color}`, "class")}>${currentStatus.icon}</span> <div> <p class="text-sm text-primary-500">Estado</p> <p${addAttribute(`text-lg font-bold ${currentStatus.color}`, "class")}>${currentStatus.label}</p> </div> </div> </div> </div> <!-- Detalles de la Devolución --> <div class="bg-white rounded-lg border border-primary-200 p-6"> <h2 class="font-bold text-primary-900 mb-4">Detalles de la Devolución</h2> <div class="grid md:grid-cols-2 gap-6"> <div> <p class="text-sm text-primary-500 mb-1">Motivo</p> <p class="font-medium text-primary-900">${returnRequest.reason}</p> </div> <div> <p class="text-sm text-primary-500 mb-1">Descripción</p> <p class="font-medium text-primary-900">${returnRequest.description || "Sin descripci\xF3n"}</p> </div> <div> <p class="text-sm text-primary-500 mb-1">Monto Solicitado</p> <p class="font-bold text-lg text-primary-900">${formatPrice(returnRequest.requested_amount)}</p> </div> ${returnRequest.label_code && renderTemplate`<div> <p class="text-sm text-primary-500 mb-1">Código de Etiqueta</p> <p class="font-mono font-semibold text-primary-900">${returnRequest.label_code}</p> </div>`} </div> </div> <!-- Artículos en Devolución --> <div class="bg-white rounded-lg border border-primary-200 p-6"> <h2 class="font-bold text-primary-900 mb-4">Artículos en Devolución</h2> ${returnRequest.return_request_items && returnRequest.return_request_items.length > 0 ? renderTemplate`<div class="space-y-4"> ${returnRequest.return_request_items.map((item) => renderTemplate`<div class="flex gap-4 pb-4 border-b border-primary-100 last:border-0 last:pb-0"> <div class="flex-1"> <p class="font-medium text-primary-900">${item.product_name}</p> <p class="text-sm text-primary-500">Cantidad: ${item.quantity}</p> <p class="text-sm text-primary-500">Talla: ${item.size || "N/A"}</p> <p class="text-sm text-primary-500">Color: ${item.color || "N/A"}</p> </div> <div class="text-right"> <p class="font-semibold text-primary-900">${formatPrice(item.unit_price)}</p> </div> </div>`)} </div>` : renderTemplate`<p class="text-primary-500">No hay artículos en esta devolución</p>`} </div> <!-- Nota de Crédito --> ${returnRequest.credit_notes && returnRequest.credit_notes.length > 0 && renderTemplate`<div class="bg-white rounded-lg border border-primary-200 p-6"> <h2 class="font-bold text-primary-900 mb-4">Nota de Crédito</h2> ${returnRequest.credit_notes.map((creditNote) => renderTemplate`<div${addAttribute(creditNote.id, "key")} class="space-y-3"> <div class="grid md:grid-cols-2 gap-4"> <div> <p class="text-sm text-primary-500 mb-1">Número de Nota</p> <p class="font-mono font-medium text-primary-900">${creditNote.credit_note_number}</p> </div> <div> <p class="text-sm text-primary-500 mb-1">Monto</p> <p class="font-bold text-lg text-primary-900">${formatPrice(creditNote.amount)}</p> </div> <div> <p class="text-sm text-primary-500 mb-1">Estado</p> <span${addAttribute(`inline-block px-3 py-1 rounded text-sm font-semibold ${creditNote.status === "pending" ? "bg-yellow-100 text-yellow-800" : creditNote.status === "processed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`, "class")}> ${creditNote.status === "pending" ? "Pendiente" : creditNote.status === "processed" ? "Procesada" : creditNote.status} </span> </div> <div> <p class="text-sm text-primary-500 mb-1">Fecha de Creación</p> <p class="font-medium text-primary-900">${formatDate(creditNote.created_at)}</p> </div> </div> </div>`)} </div>`} <!-- Información del Pedido Original --> ${returnRequest.orders && renderTemplate`<div class="bg-white rounded-lg border border-primary-200 p-6"> <h2 class="font-bold text-primary-900 mb-4">Pedido Original</h2> <div class="grid md:grid-cols-2 gap-4"> <div> <p class="text-sm text-primary-500 mb-1">Número de Pedido</p> <a${addAttribute(`/cuenta/pedidos/${returnRequest.orders.order_number}`, "href")} class="font-medium text-primary-600 hover:text-primary-900 underline">
#${returnRequest.orders.order_number} </a> </div> <div> <p class="text-sm text-primary-500 mb-1">Total del Pedido</p> <p class="font-bold text-primary-900">${formatPrice(returnRequest.orders.total_amount)}</p> </div> </div> </div>`} </div> </div> ` })} `;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/devoluciones/[id].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/devoluciones/[id].astro";
const $$url = "/cuenta/devoluciones/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
