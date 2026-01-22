/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: orders } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };
  const statusLabels = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado"
  };
  function formatDate(date) {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Pedidos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <div class="flex items-center justify-between"> <div> <h1 class="text-2xl font-display">Pedidos</h1> <p class="text-primary-500">Gestiona los pedidos de la tienda</p> </div> </div> <div class="bg-white border border-primary-200 overflow-hidden"> <table class="w-full"> <thead class="bg-primary-50"> <tr> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Pedido</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Cliente</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Fecha</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Total</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Estado</th> <th class="text-right text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Acciones</th> </tr> </thead> <tbody class="divide-y divide-primary-100"> ${orders && orders.length > 0 ? orders.map((order) => renderTemplate`<tr class="hover:bg-primary-50 transition-colors"> <td class="px-6 py-4"> <span class="font-mono text-sm">#${order.order_number}</span> </td> <td class="px-6 py-4"> <div> <p class="font-medium">${order.customer_name || "Cliente"}</p> <p class="text-sm text-primary-500">${order.customer_email}</p> </div> </td> <td class="px-6 py-4 text-sm text-primary-600"> ${formatDate(order.created_at)} </td> <td class="px-6 py-4 font-medium"> ${formatPrice(order.total_amount)} </td> <td class="px-6 py-4"> <span${addAttribute(`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`, "class")}> ${statusLabels[order.status] || order.status} </span> </td> <td class="px-6 py-4 text-right"> <a${addAttribute(`/admin/pedidos/${order.order_number}`, "href")} class="text-primary-600 hover:text-primary-900 text-sm">
Ver detalles
</a> </td> </tr>`) : renderTemplate`<tr> <td colspan="6" class="px-6 py-12 text-center text-primary-500">
No hay pedidos todavía
</td> </tr>`} </tbody> </table> </div> </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/pedidos/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/pedidos/index.astro";
const $$url = "/admin/pedidos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
