/* empty css                                    */
import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../AdminLayout.7POnspUO.mjs';
import { a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = false;
const $$orderNumber = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$orderNumber;
  const { orderNumber } = Astro2.params;
  let successMessage = "";
  let errorMessage = "";
  const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("order_number", orderNumber).single();
  if (orderError || !order) {
    return Astro2.redirect("/admin/pedidos");
  }
  const { data: orderItems } = await supabaseAdmin.from("order_items").select("*").eq("order_id", order.id);
  const items = orderItems || [];
  const statusOptions = [
    { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmado", color: "bg-blue-100 text-blue-800" },
    { value: "processing", label: "Procesando", color: "bg-purple-100 text-purple-800" },
    { value: "shipped", label: "Enviado", color: "bg-indigo-100 text-indigo-800" },
    { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" }
  ];
  const currentStatus = statusOptions.find((s) => s.value === order.status) || statusOptions[0];
  function formatDate(date) {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  const shippingAddress = order.shipping_address;
  return renderTemplate(_a || (_a = __template(["", " <script>\n  // Handler para actualizar estado del pedido\n  const updateStatusBtn = document.getElementById('updateStatusBtn');\n  if (updateStatusBtn) {\n    updateStatusBtn.addEventListener('click', async () => {\n      const originalText = updateStatusBtn.textContent;\n      const statusSelect = document.getElementById('statusSelect');\n      \n      if (!statusSelect || !statusSelect.value) {\n        alert('Por favor, selecciona un estado');\n        return;\n      }\n\n      updateStatusBtn.disabled = true;\n      updateStatusBtn.textContent = 'Procesando...';\n\n      try {\n        const orderNumber = window.location.pathname.split('/').pop();\n        const response = await fetch('/api/admin/orders/update-status', {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({\n            orderNumber: orderNumber,\n            status: statusSelect.value\n          })\n        });\n        \n        if (response.ok) {\n          window.location.reload();\n        } else {\n          const error = await response.json();\n          alert('Error: ' + error.error);\n          updateStatusBtn.disabled = false;\n          updateStatusBtn.textContent = originalText;\n        }\n      } catch (error) {\n        alert('Error: ' + error);\n        updateStatusBtn.disabled = false;\n        updateStatusBtn.textContent = originalText;\n      }\n    });\n  }\n\n  // Handler para actualizar seguimiento\n  const updateTrackingBtn = document.getElementById('updateTrackingBtn');\n  if (updateTrackingBtn) {\n    updateTrackingBtn.addEventListener('click', async () => {\n      const originalText = updateTrackingBtn.textContent;\n      const trackingNumber = document.getElementById('trackingNumber')?.value.trim();\n      const trackingUrl = document.getElementById('trackingUrl')?.value.trim();\n      \n      if (!trackingNumber) {\n        alert('Por favor, ingresa un n\xFAmero de seguimiento');\n        return;\n      }\n\n      updateTrackingBtn.disabled = true;\n      updateTrackingBtn.textContent = 'Guardando...';\n\n      try {\n        const orderNumber = window.location.pathname.split('/').pop();\n        const response = await fetch('/api/admin/orders/update-tracking', {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({\n            orderNumber: orderNumber,\n            trackingNumber: trackingNumber,\n            trackingUrl: trackingUrl || null\n          })\n        });\n        \n        if (response.ok) {\n          window.location.reload();\n        } else {\n          const error = await response.json();\n          alert('Error: ' + error.error);\n          updateTrackingBtn.disabled = false;\n          updateTrackingBtn.textContent = originalText;\n        }\n      } catch (error) {\n        alert('Error: ' + error);\n        updateTrackingBtn.disabled = false;\n        updateTrackingBtn.textContent = originalText;\n      }\n    });\n  }\n<\/script>"])), renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Pedido #${orderNumber}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto space-y-6"> <!-- Header --> <div class="flex items-center justify-between"> <div class="flex items-center gap-4"> <a href="/admin/pedidos" class="text-primary-500 hover:text-primary-900"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <div> <h1 class="text-2xl font-display">Pedido #${orderNumber}</h1> <p class="text-sm text-primary-500">${formatDate(order.created_at)}</p> </div> </div> <span${addAttribute(`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`, "class")}> ${currentStatus.label} </span> </div> ${successMessage} ${errorMessage} <div class="grid lg:grid-cols-3 gap-6"> <!-- Main Content --> <div class="lg:col-span-2 space-y-6"> <!-- Items del pedido --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Productos (${items.length})</h2> <div class="divide-y divide-primary-100"> ${items.map((item) => renderTemplate`<div class="py-4 flex gap-4"> ${item.image_url ? renderTemplate`<img${addAttribute(item.image_url, "src")}${addAttribute(item.product_name, "alt")} class="w-20 h-20 object-cover bg-primary-100">` : renderTemplate`<div class="w-20 h-20 bg-primary-100 flex items-center justify-center"> <svg class="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div>`} <div class="flex-1"> <h3 class="font-medium">${item.product_name}</h3> <p class="text-sm text-primary-500">${item.variant_info}</p> <div class="mt-2 flex items-center justify-between"> <span class="text-sm">Cantidad: ${item.quantity}</span> <span class="font-medium">${formatPrice(item.total_price)}</span> </div> </div> </div>`)} </div> <!-- Totales --> <div class="border-t border-primary-200 mt-4 pt-4 space-y-2"> <div class="flex justify-between text-sm"> <span>Subtotal</span> <span>${formatPrice(order.subtotal)}</span> </div> <div class="flex justify-between text-sm"> <span>Envío</span> <span>${order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}</span> </div> ${order.discount_amount > 0 && renderTemplate`<div class="flex justify-between text-sm text-green-600"> <span>Descuento</span> <span>-${formatPrice(order.discount_amount)}</span> </div>`} <div class="flex justify-between font-medium text-lg pt-2 border-t border-primary-200"> <span>Total</span> <span>${formatPrice(order.total_amount)}</span> </div> </div> </div> <!-- Información de pago --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Información de pago</h2> <dl class="grid grid-cols-2 gap-4 text-sm"> <div> <dt class="text-primary-500">Estado del pago</dt> <dd class="mt-1 font-medium capitalize">${order.payment_status}</dd> </div> <div> <dt class="text-primary-500">Método</dt> <dd class="mt-1 capitalize">${order.payment_method || "Stripe"}</dd> </div> ${order.stripe_session_id && renderTemplate`<div class="col-span-2"> <dt class="text-primary-500">ID Sesión Stripe</dt> <dd class="mt-1 font-mono text-xs break-all">${order.stripe_session_id}</dd> </div>`} ${order.stripe_payment_intent && renderTemplate`<div class="col-span-2"> <dt class="text-primary-500">Payment Intent</dt> <dd class="mt-1 font-mono text-xs break-all">${order.stripe_payment_intent}</dd> </div>`} </dl> </div> </div> <!-- Sidebar --> <div class="space-y-6"> <!-- Cliente --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Cliente</h2> <div class="space-y-3 text-sm"> <div> <span class="text-primary-500">Nombre:</span> <p class="font-medium">${order.customer_name || "No especificado"}</p> </div> <div> <span class="text-primary-500">Email:</span> <p>${order.customer_email}</p> </div> ${order.customer_phone && renderTemplate`<div> <span class="text-primary-500">Teléfono:</span> <p>${order.customer_phone}</p> </div>`} </div> </div> <!-- Dirección de envío --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Dirección de envío</h2> ${shippingAddress ? renderTemplate`<address class="not-italic text-sm space-y-1"> <p class="font-medium">${shippingAddress.name}</p> <p>${shippingAddress.street}</p> ${shippingAddress.street2 && renderTemplate`<p>${shippingAddress.street2}</p>`} <p>${shippingAddress.postal_code} ${shippingAddress.city}</p> <p>${shippingAddress.province}, ${shippingAddress.country}</p> ${shippingAddress.phone && renderTemplate`<p class="mt-2">Tel: ${shippingAddress.phone}</p>`} </address>` : renderTemplate`<p class="text-sm text-primary-500">No hay dirección registrada</p>`} </div> <!-- Actualizar estado --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Actualizar estado</h2> <div class="space-y-4"> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Nuevo estado
</label> <select id="statusSelect" class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"> ${statusOptions.map((status) => renderTemplate`<option${addAttribute(status.value, "value")}${addAttribute(status.value === order.status, "selected")}> ${status.label} </option>`)} </select> </div> <button id="updateStatusBtn" type="button" class="w-full bg-primary-900 text-white py-2 text-sm hover:bg-primary-800 transition-colors disabled:opacity-50">
Actualizar estado
</button> </div> </div> <!-- Información de envío --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Seguimiento de envío</h2> <div class="space-y-4"> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Número de seguimiento
</label> <input id="trackingNumber" type="text"${addAttribute(order.tracking_number || "", "value")} class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900" placeholder="Ej: 1Z999AA10123456784"> </div> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
URL de seguimiento
</label> <input id="trackingUrl" type="url"${addAttribute(order.tracking_url || "", "value")} class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900" placeholder="https://..."> </div> <button id="updateTrackingBtn" type="button" class="w-full bg-indigo-600 text-white py-2 text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
Guardar y marcar como enviado
</button> </div> ${order.tracking_number && renderTemplate`<div class="mt-4 p-3 bg-primary-50 text-sm"> <p class="font-medium">Tracking: ${order.tracking_number}</p> ${order.tracking_url && renderTemplate`<a${addAttribute(order.tracking_url, "href")} target="_blank" class="text-indigo-600 hover:underline">
Ver seguimiento →
</a>`} </div>`} </div> <!-- Timeline --> <div class="bg-white border border-primary-200 p-6"> <h2 class="font-medium mb-4">Historial</h2> <div class="space-y-4 text-sm"> <div class="flex gap-3"> <div class="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div> <div> <p class="font-medium">Pedido creado</p> <p class="text-primary-500">${formatDate(order.created_at)}</p> </div> </div> ${order.updated_at !== order.created_at && renderTemplate`<div class="flex gap-3"> <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div> <div> <p class="font-medium">Última actualización</p> <p class="text-primary-500">${formatDate(order.updated_at)}</p> </div> </div>`} </div> </div> </div> </div> </div> ` }));
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/pedidos/[orderNumber].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/pedidos/[orderNumber].astro";
const $$url = "/admin/pedidos/[orderNumber]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$orderNumber,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
