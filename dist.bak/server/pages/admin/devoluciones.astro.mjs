/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: returnRequests, error: returnError } = await supabaseAdmin.from("return_requests").select("*, orders(order_number), customers(first_name, last_name, email)").order("created_at", { ascending: false });
  console.log("Return Error:", returnError);
  console.log("Returns:", returnRequests);
  const statusCounts = {
    pending: returnRequests?.filter((r) => r.status === "pending").length || 0,
    approved: returnRequests?.filter((r) => r.status === "approved").length || 0,
    shipped: returnRequests?.filter((r) => r.status === "shipped").length || 0,
    received: returnRequests?.filter((r) => r.status === "received").length || 0,
    refunded: returnRequests?.filter((r) => r.status === "refunded").length || 0,
    rejected: returnRequests?.filter((r) => r.status === "rejected").length || 0
  };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Devoluciones" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 py-8"> <h1 class="text-3xl font-bold text-primary-900 mb-8">Gestión de Devoluciones</h1> <!-- Stats --> <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"> <div class="bg-yellow-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Pendientes</p> <p class="text-2xl font-bold text-yellow-700">${statusCounts.pending}</p> </div> <div class="bg-blue-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Aprobadas</p> <p class="text-2xl font-bold text-blue-700">${statusCounts.approved}</p> </div> <div class="bg-purple-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Enviadas</p> <p class="text-2xl font-bold text-purple-700">${statusCounts.shipped}</p> </div> <div class="bg-indigo-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Recibidas</p> <p class="text-2xl font-bold text-indigo-700">${statusCounts.received}</p> </div> <div class="bg-green-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Reembolsadas</p> <p class="text-2xl font-bold text-green-700">${statusCounts.refunded}</p> </div> <div class="bg-red-100 p-4 rounded-lg"> <p class="text-gray-600 text-sm">Rechazadas</p> <p class="text-2xl font-bold text-red-700">${statusCounts.rejected}</p> </div> </div> <!-- Table --> <div class="bg-white rounded-lg shadow overflow-hidden"> <table class="w-full"> <thead class="bg-gray-50 border-b"> <tr> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monto</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Creado</th> <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th> </tr> </thead> <tbody class="divide-y"> ${returnRequests && returnRequests.map((ret) => renderTemplate`<tr class="hover:bg-gray-50"> <td class="px-6 py-4 text-sm text-gray-900">${ret.id.slice(0, 8)}</td> <td class="px-6 py-4 text-sm text-gray-900">${ret.customers?.first_name} ${ret.customers?.last_name}</td> <td class="px-6 py-4 text-sm text-gray-600">${ret.customers?.email || "N/A"}</td> <td class="px-6 py-4 text-sm font-semibold">€${ret.refund_amount || ret.requested_amount || "0.00"}</td> <td class="px-6 py-4 text-sm"> <span${addAttribute(`px-3 py-1 rounded-full text-xs font-semibold ${ret.status === "pending" ? "bg-yellow-100 text-yellow-800" : ret.status === "approved" ? "bg-blue-100 text-blue-800" : ret.status === "shipped" ? "bg-purple-100 text-purple-800" : ret.status === "received" ? "bg-indigo-100 text-indigo-800" : ret.status === "refunded" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, "class")}> ${ret.status} </span> </td> <td class="px-6 py-4 text-sm text-gray-600">${new Date(ret.created_at).toLocaleDateString()}</td> <td class="px-6 py-4 text-sm"> <a${addAttribute(`/admin/devoluciones/${ret.id}`, "href")} class="text-blue-600 hover:underline">Ver detalles</a> </td> </tr>`)} </tbody> </table> </div> </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/devoluciones/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/devoluciones/index.astro";
const $$url = "/admin/devoluciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
