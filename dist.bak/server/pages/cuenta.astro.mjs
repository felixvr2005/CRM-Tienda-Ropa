/* empty css                              */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../AccountLayout.BP0CPR-D.mjs';
import { s as supabase, a as supabaseAdmin } from '../supabase.41eewI-c.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta");
  }
  const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id, is_active").eq("auth_user_id", user.id).eq("is_active", true).single();
  if (adminUser) {
    return Astro2.redirect("/admin");
  }
  const { data: customer } = await supabase.from("customers").select("*").eq("auth_user_id", user.id).single();
  const { data: orders } = await supabase.from("orders").select("*").eq("customer_id", customer?.id).order("created_at", { ascending: false }).limit(5);
  const { data: allOrders } = await supabase.from("orders").select("total_amount, subtotal").eq("customer_id", customer?.id);
  (allOrders || []).reduce((sum, order) => {
    return sum + (order.total_amount || order.subtotal || 0);
  }, 0);
  const orderStatusMap = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    refunded: "Reembolsado"
  };
  const orderStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800"
  };
  function formatPrice(price) {
    return price.toFixed(2) + "\u20AC";
  }
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Resumen" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Stats Cards --> <div class="grid md:grid-cols-3 gap-6"> <div class="bg-white rounded-lg border border-primary-200 p-6"> <p class="text-primary-500 text-sm font-medium mb-2">PEDIDOS</p> <p class="text-3xl font-bold text-primary-900">${orders?.length || 0}</p> </div> <div class="bg-white rounded-lg border border-primary-200 p-6"> <p class="text-primary-500 text-sm font-medium mb-2">TOTAL GASTADO</p> <p class="text-3xl font-bold text-primary-900">${formatPrice(orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0)}</p> </div> <div class="bg-white rounded-lg border border-primary-200 p-6"> <p class="text-primary-500 text-sm font-medium mb-2">MIEMBRO DESDE</p> <p class="text-3xl font-bold text-primary-900">${new Date(user.created_at).toLocaleDateString("es-ES", { month: "short", year: "2-digit" }).replace(" de ", " ")}</p> </div> </div> <!-- Recent Orders --> <div class="bg-white rounded-lg border border-primary-200 p-6"> <div class="flex items-center justify-between mb-6"> <h2 class="text-xl font-bold text-primary-900">Pedidos Recientes</h2> <a href="/cuenta/pedidos" class="text-sm text-primary-600 hover:text-primary-900">Ver todos →</a> </div> ${orders && orders.length > 0 ? renderTemplate`<div class="space-y-4"> ${orders.slice(0, 3).map((order) => renderTemplate`<a${addAttribute(`/cuenta/pedidos/${order.order_number}`, "href")} class="block p-4 border border-primary-100 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"> <div class="flex items-center justify-between"> <div> <p class="font-semibold text-primary-900">Pedido #${order.order_number}</p> <p class="text-sm text-primary-500">${new Date(order.created_at).toLocaleDateString("es-ES")}</p> </div> <div class="text-right"> <p class="font-semibold">${formatPrice(order.total_amount)}</p> <span${addAttribute(`text-xs font-semibold px-2 py-1 rounded ${orderStatusColors[order.status] || "bg-gray-100 text-gray-800"}`, "class")}> ${orderStatusMap[order.status] || order.status} </span> </div> </div> </a>`)} </div>` : renderTemplate`<div class="text-center py-12"> <svg class="w-16 h-16 text-primary-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path> </svg> <p class="text-primary-500 mb-4">Aún no tienes pedidos</p> <a href="/productos" class="text-primary-600 hover:text-primary-900 font-medium">Explorar Productos →</a> </div>`} </div> <!-- Quick Actions --> <div class="grid md:grid-cols-2 gap-6"> <a href="/cuenta/perfil" class="bg-white rounded-lg border border-primary-200 p-6 hover:shadow-lg transition-shadow"> <div class="flex items-start gap-4"> <svg class="w-6 h-6 text-primary-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path> </svg> <div> <h3 class="font-bold text-primary-900">Editar Perfil</h3> <p class="text-sm text-primary-500">Actualiza tus datos personales</p> </div> </div> </a> <a href="/cuenta/direcciones" class="bg-white rounded-lg border border-primary-200 p-6 hover:shadow-lg transition-shadow"> <div class="flex items-start gap-4"> <svg class="w-6 h-6 text-primary-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> <div> <h3 class="font-bold text-primary-900">Mis Direcciones</h3> <p class="text-sm text-primary-500">Gestiona tus direcciones de envío</p> </div> </div> </a> </div> </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/index.astro";
const $$url = "/cuenta";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
