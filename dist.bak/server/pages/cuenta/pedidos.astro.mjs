/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../AccountLayout.BP0CPR-D.mjs';
import { s as supabase, a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/pedidos");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/pedidos");
  }
  const { data: customer } = await supabaseAdmin.from("customers").select("id, email").eq("auth_user_id", user.id).single();
  const { data: orders } = await supabaseAdmin.from("orders").select("*").eq("customer_id", customer?.id).order("created_at", { ascending: false });
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
  const orderStatusMap = {
    "pending": { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    "confirmed": { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
    "processing": { label: "Procesando", color: "bg-indigo-100 text-indigo-800" },
    "shipped": { label: "Enviado", color: "bg-purple-100 text-purple-800" },
    "delivered": { label: "Entregado", color: "bg-green-100 text-green-800" },
    "cancelled": { label: "Cancelado", color: "bg-red-100 text-red-800" },
    "refunded": { label: "Reembolsado", color: "bg-gray-100 text-gray-800" }
  };
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Mis Pedidos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> ${!orders || orders.length === 0 ? renderTemplate`<div class="bg-white border border-primary-200 rounded-lg p-12 text-center"> <svg class="w-16 h-16 mx-auto mb-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> <h2 class="text-xl font-medium mb-2">No tienes pedidos todavía</h2> <p class="text-primary-500 mb-6">¡Explora nuestra colección y encuentra algo que te encante!</p> <a href="/productos" class="inline-block bg-primary-900 text-white px-8 py-3 rounded hover:bg-primary-800 transition-colors">
Explorar Productos
</a> </div>` : renderTemplate`<div class="space-y-4"> ${orders.map((order) => renderTemplate`<div class="bg-white border border-primary-200 rounded-lg p-6"> <div class="flex flex-wrap items-start justify-between gap-4 mb-4"> <div> <p class="text-sm text-primary-500">Pedido</p> <p class="font-medium">#${order.order_number}</p> </div> <div> <p class="text-sm text-primary-500">Fecha</p> <p class="font-medium">${formatDate(order.created_at)}</p> </div> <div> <p class="text-sm text-primary-500">Total</p> <p class="font-medium"> ${(() => {
    const total = order.total_amount || order.subtotal || 0;
    return formatPrice(total);
  })()} </p> </div> <div> <p class="text-sm text-primary-500">Estado</p> <span${addAttribute(`inline-block px-3 py-1 text-xs font-medium rounded-full ${orderStatusMap[order.status]?.color || "bg-gray-100 text-gray-800"}`, "class")}> ${orderStatusMap[order.status]?.label || order.status} </span> </div> </div> <div class="flex flex-wrap gap-3"> <a${addAttribute(`/cuenta/pedidos/${order.order_number}`, "href")} class="px-4 py-2 border border-primary-900 text-primary-900 text-sm rounded hover:bg-primary-900 hover:text-white transition-colors">
Ver Detalles
</a> </div> </div>`)} </div>`} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/pedidos/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/pedidos/index.astro";
const $$url = "/cuenta/pedidos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
