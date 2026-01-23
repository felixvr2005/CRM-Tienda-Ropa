/* empty css                                    */
import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../../../PublicLayout.D3A_txxX.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
import { s as supabase, a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
/* empty css                                        */
export { renderers } from '../../../renderers.mjs';

function InvoiceDownload({
  orderId,
  orderNumber,
  authToken
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDownload = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/invoices/generate?orderId=${orderId}`,
        {
          headers: {
            "Authorization": `Bearer ${authToken || localStorage.getItem("sb-access-token") || ""}`
          }
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error descargando factura");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Error descargando factura");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleDownload,
        disabled: isLoading,
        className: "w-full flex items-center justify-center gap-2 px-4 py-3 text-primary-600 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed",
        title: "Descargar factura en PDF",
        children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" }),
          "Descargando..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          "Descargar factura"
        ] })
      }
    ),
    error && /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-600 mt-2", children: [
      "❌ ",
      error
    ] })
  ] });
}

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
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect(`/cuenta/login?redirect=/cuenta/pedidos/${orderNumber}`);
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect(`/cuenta/login?redirect=/cuenta/pedidos/${orderNumber}`);
  }
  const { data: currentCustomer } = await supabaseAdmin.from("customers").select("id").eq("auth_user_id", user.id).single();
  if (!currentCustomer?.id) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/pedidos");
  }
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("order_number", orderNumber).single();
  if (!order) {
    return Astro2.redirect("/cuenta/pedidos");
  }
  if (order.customer_id !== currentCustomer.id) {
    return Astro2.redirect("/cuenta/pedidos");
  }
  const { data: orderItems } = await supabaseAdmin.from("order_items").select("*").eq("order_id", order.id);
  const itemsWithProducts = orderItems || [];
  console.log("Order:", order.order_number);
  console.log("Order Items:", itemsWithProducts);
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
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const orderStatusMap = {
    "pending": { label: "Pendiente de pago", color: "text-yellow-600", icon: "\u23F3" },
    "processing": { label: "Procesando", color: "text-blue-600", icon: "\u{1F4E6}" },
    "shipped": { label: "Enviado", color: "text-purple-600", icon: "\u{1F69A}" },
    "delivered": { label: "Entregado", color: "text-green-600", icon: "\u2713" },
    "cancelled": { label: "Cancelado", color: "text-red-600", icon: "\u2715" },
    "refunded": { label: "Reembolsado", color: "text-gray-600", icon: "\u21A9" }
  };
  const currentStatus = orderStatusMap[order.status] || { label: order.status, color: "text-gray-600", icon: "?" };
  const timeline = [
    { status: "pending", label: "Pedido recibido", date: order.created_at },
    { status: "processing", label: "Preparando env\xEDo", date: order.status !== "pending" ? order.updated_at : null },
    { status: "shipped", label: "Enviado", date: order.tracking_number ? order.updated_at : null },
    { status: "delivered", label: "Entregado", date: order.status === "delivered" ? order.updated_at : null }
  ];
  return renderTemplate(_a || (_a = __template(["", " <script is:client>\n  function setupOrderModals() {\n    console.log('\u{1F527} Setting up order modals...');\n\n    const cancelModal = document.getElementById('cancelModal');\n    const returnModal = document.getElementById('returnModal');\n    const cancelOrderBtn = document.getElementById('cancelOrderBtn');\n    const returnOrderBtn = document.getElementById('returnOrderBtn');\n\n    if (!cancelModal || !returnModal) {\n      console.error('\u274C Modal elements not found');\n      return;\n    }\n\n    console.log('\u2705 Modal elements found');\n\n    const getOrderNumber = () => {\n      const header = document.querySelector('h1');\n      if (header) {\n        const text = header.textContent || '';\n        return text.replace('PEDIDO #', '').trim();\n      }\n      return '';\n    };\n\n    // MODAL CANCELACI\xD3N\n    if (cancelOrderBtn) {\n      cancelOrderBtn.addEventListener('click', () => {\n        console.log('\u{1F513} Opening cancel modal');\n        cancelModal.classList.remove('hidden');\n      });\n    }\n\n    // MODAL DEVOLUCI\xD3N\n    if (returnOrderBtn) {\n      returnOrderBtn.addEventListener('click', () => {\n        console.log('\u{1F513} Opening return modal');\n        returnModal.classList.remove('hidden');\n      });\n    }\n\n    // Cerrar modales al click fuera\n    cancelModal.addEventListener('click', (e) => {\n      if (e.target === cancelModal) {\n        console.log('\u{1F512} Closing cancel modal');\n        cancelModal.classList.add('hidden');\n      }\n    });\n\n    returnModal.addEventListener('click', (e) => {\n      if (e.target === returnModal) {\n        console.log('\u{1F512} Closing return modal');\n        returnModal.classList.add('hidden');\n        const form = returnModal.querySelector('#returnForm');\n        const success = returnModal.querySelector('#returnSuccess');\n        if (form) form.classList.remove('hidden');\n        if (success) success.classList.add('hidden');\n      }\n    });\n\n    // CONFIRM CANCEL BUTTON\n    const confirmCancelBtn = document.getElementById('confirmCancelBtn');\n    if (confirmCancelBtn) {\n      confirmCancelBtn.addEventListener('click', async () => {\n        const orderNumber = getOrderNumber();\n        if (!orderNumber) {\n          alert('No se pudo determinar el n\xFAmero de pedido');\n          return;\n        }\n\n        console.log('\u{1F504} Canceling order:', orderNumber);\n        confirmCancelBtn.disabled = true;\n        const spinner = cancelModal.querySelector('#cancelSpinner');\n        if (spinner) spinner.classList.remove('hidden');\n\n        try {\n          const response = await fetch('/api/orders/cancel', {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({ orderNumber })\n          });\n\n          const data = await response.json();\n\n          if (response.ok) {\n            alert('\u2705 Pedido cancelado correctamente. Se ha procesado el reembolso.');\n            window.location.href = '/cuenta/pedidos';\n          } else {\n            console.error('\u274C Cancel error:', data);\n            alert(data.message || 'Error al cancelar el pedido');\n            confirmCancelBtn.disabled = false;\n            if (spinner) spinner.classList.add('hidden');\n          }\n        } catch (error) {\n          console.error('\u274C Cancel request error:', error);\n          alert('Error al cancelar el pedido');\n          confirmCancelBtn.disabled = false;\n          if (spinner) spinner.classList.add('hidden');\n        }\n      });\n    }\n\n    // RETURN FORM SUBMIT\n    const returnForm = returnModal.querySelector('#returnForm');\n    if (returnForm) {\n      returnForm.addEventListener('submit', async (e) => {\n        e.preventDefault();\n\n        const returnReason = returnForm.querySelector('#returnReason');\n        const reason = returnReason ? returnReason.value : '';\n        const orderNumber = getOrderNumber();\n        const submitBtn = returnForm.querySelector('#submitReturnBtn');\n\n        if (!reason) {\n          alert('Por favor, cu\xE9ntanos el motivo de la devoluci\xF3n');\n          return;\n        }\n\n        if (!orderNumber) {\n          alert('No se pudo determinar el n\xFAmero de pedido');\n          return;\n        }\n\n        console.log('\u{1F504} Requesting return for order:', orderNumber);\n        if (submitBtn) {\n          submitBtn.disabled = true;\n          submitBtn.textContent = 'Procesando...';\n        }\n\n        try {\n          const response = await fetch('/api/orders/request-return', {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({ orderNumber, reason })\n          });\n\n          const data = await response.json();\n\n          if (response.ok) {\n            console.log('\u2705 Return request created:', data);\n            const form = returnModal.querySelector('#returnForm');\n            const success = returnModal.querySelector('#returnSuccess');\n            if (form) form.classList.add('hidden');\n            if (success) success.classList.remove('hidden');\n\n            setTimeout(() => {\n              window.location.href = '/cuenta/pedidos';\n            }, 3000);\n          } else {\n            console.error('\u274C Return error:', data);\n            alert(data.message || 'Error al solicitar la devoluci\xF3n');\n            if (submitBtn) {\n              submitBtn.disabled = false;\n              submitBtn.textContent = 'Solicitar Devoluci\xF3n';\n            }\n          }\n        } catch (error) {\n          console.error('\u274C Return request error:', error);\n          alert('Error al solicitar la devoluci\xF3n');\n          if (submitBtn) {\n            submitBtn.disabled = false;\n            submitBtn.textContent = 'Solicitar Devoluci\xF3n';\n          }\n        }\n      });\n    }\n\n    // Close buttons\n    const cancelModalCloseBtn = document.getElementById('cancelModalCloseBtn');\n    if (cancelModalCloseBtn) {\n      cancelModalCloseBtn.addEventListener('click', () => {\n        console.log('\u{1F512} Closing cancel modal via button');\n        cancelModal.classList.add('hidden');\n      });\n    }\n\n    const returnModalCloseBtn = document.getElementById('returnModalCloseBtn');\n    if (returnModalCloseBtn) {\n      returnModalCloseBtn.addEventListener('click', () => {\n        console.log('\u{1F512} Closing return modal via button');\n        returnModal.classList.add('hidden');\n        const form = returnModal.querySelector('#returnForm');\n        const success = returnModal.querySelector('#returnSuccess');\n        if (form) form.classList.remove('hidden');\n        if (success) success.classList.add('hidden');\n      });\n    }\n\n    const returnSuccessCloseBtn = document.getElementById('returnSuccessCloseBtn');\n    if (returnSuccessCloseBtn) {\n      returnSuccessCloseBtn.addEventListener('click', () => {\n        console.log('\u{1F512} Closing return modal via success button');\n        window.location.href = '/cuenta/pedidos';\n      });\n    }\n\n    console.log('\u2705 Order modals setup complete');\n  }\n\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', setupOrderModals);\n  } else {\n    setupOrderModals();\n  }\n\n  document.addEventListener('astro:page-load', setupOrderModals);\n<\/script> "])), renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": `Pedido #${orderNumber} | FashionStore`, "data-astro-cid-ekvggi4k": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-4 py-8" data-astro-cid-ekvggi4k> <!-- Breadcrumb --> <nav class="text-sm mb-6" data-astro-cid-ekvggi4k> <ol class="flex items-center gap-2 text-primary-500" data-astro-cid-ekvggi4k> <li data-astro-cid-ekvggi4k><a href="/" class="hover:text-primary-900" data-astro-cid-ekvggi4k>Inicio</a></li> <li data-astro-cid-ekvggi4k>/</li> <li data-astro-cid-ekvggi4k><a href="/cuenta" class="hover:text-primary-900" data-astro-cid-ekvggi4k>Mi Cuenta</a></li> <li data-astro-cid-ekvggi4k>/</li> <li data-astro-cid-ekvggi4k><a href="/cuenta/pedidos" class="hover:text-primary-900" data-astro-cid-ekvggi4k>Mis Pedidos</a></li> <li data-astro-cid-ekvggi4k>/</li> <li class="text-primary-900" data-astro-cid-ekvggi4k>#${orderNumber}</li> </ol> </nav> <!-- Header --> <div class="flex flex-wrap items-start justify-between gap-4 mb-8" data-astro-cid-ekvggi4k> <div data-astro-cid-ekvggi4k> <h1 class="text-2xl font-light mb-2" data-astro-cid-ekvggi4k>PEDIDO #${orderNumber}</h1> <p class="text-primary-500" data-astro-cid-ekvggi4k>Realizado el ${formatDate(order.created_at)}</p> </div> <div class="flex items-center gap-2" data-astro-cid-ekvggi4k> <span${addAttribute(`text-2xl ${currentStatus.color}`, "class")} data-astro-cid-ekvggi4k>${currentStatus.icon}</span> <span${addAttribute(`text-lg font-medium ${currentStatus.color}`, "class")} data-astro-cid-ekvggi4k>${currentStatus.label}</span> </div> </div> <div class="grid lg:grid-cols-3 gap-8" data-astro-cid-ekvggi4k> <!-- Main Content --> <div class="lg:col-span-2 space-y-6" data-astro-cid-ekvggi4k> <!-- Order Status Timeline --> <div class="bg-white border border-primary-200 p-6" data-astro-cid-ekvggi4k> <h2 class="text-lg font-medium mb-6" data-astro-cid-ekvggi4k>Estado del Pedido</h2> <div class="relative" data-astro-cid-ekvggi4k> <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200" data-astro-cid-ekvggi4k></div> <div class="space-y-6" data-astro-cid-ekvggi4k> ${timeline.map((step, index) => {
    const isPast = timeline.findIndex((t) => t.status === order.status) >= index;
    const isCurrent = step.status === order.status;
    return renderTemplate`<div class="flex items-start gap-4 relative" data-astro-cid-ekvggi4k> <div${addAttribute(`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isPast ? "bg-primary-900 text-white" : "bg-primary-200 text-primary-400"} ${isCurrent ? "ring-4 ring-primary-100" : ""}`, "class")} data-astro-cid-ekvggi4k> ${isPast ? "\u2713" : index + 1} </div> <div class="flex-1 pt-1" data-astro-cid-ekvggi4k> <p${addAttribute(`font-medium ${isPast ? "text-primary-900" : "text-primary-400"}`, "class")} data-astro-cid-ekvggi4k> ${step.label} </p> ${step.date && isPast && renderTemplate`<p class="text-sm text-primary-500" data-astro-cid-ekvggi4k>${formatDate(step.date)}</p>`} </div> </div>`;
  })} </div> </div> ${order.tracking_number && renderTemplate`<div class="mt-6 pt-6 border-t border-primary-200" data-astro-cid-ekvggi4k> <p class="text-sm text-primary-500 mb-1" data-astro-cid-ekvggi4k>Número de seguimiento</p> <p class="font-mono text-lg" data-astro-cid-ekvggi4k>${order.tracking_number}</p> <a${addAttribute(`https://www.google.com/search?q=tracking+${order.tracking_number}`, "href")} target="_blank" rel="noopener noreferrer" class="inline-block mt-2 text-sm text-primary-600 hover:text-primary-900 underline" data-astro-cid-ekvggi4k>
Rastrear envío →
</a> </div>`} </div> <!-- Order Items --> <div class="bg-white border border-primary-200 p-6" data-astro-cid-ekvggi4k> <h2 class="text-lg font-medium mb-6" data-astro-cid-ekvggi4k>Productos (${itemsWithProducts?.length || 0})</h2> <div class="space-y-4" data-astro-cid-ekvggi4k> ${itemsWithProducts?.map((item) => {
    item.product_variant;
    item.product;
    return renderTemplate`<div class="flex gap-4 pb-4 border-b border-primary-100 last:border-0 last:pb-0" data-astro-cid-ekvggi4k> <a${addAttribute(`/productos/${item.product_slug}`, "href")} class="w-24 aspect-[3/4] bg-primary-100 flex-shrink-0" data-astro-cid-ekvggi4k> ${item.product_image && renderTemplate`<img${addAttribute(item.product_image, "src")}${addAttribute(item.product_name, "alt")} class="w-full h-full object-cover" data-astro-cid-ekvggi4k>`} </a> <div class="flex-1" data-astro-cid-ekvggi4k> <a${addAttribute(`/productos/${item.product_slug}`, "href")} class="font-medium hover:underline" data-astro-cid-ekvggi4k> ${item.product_name} </a> <p class="text-sm text-primary-500 mt-1" data-astro-cid-ekvggi4k>
Color: ${item.color} | Talla: ${item.size} </p> <p class="text-sm text-primary-500" data-astro-cid-ekvggi4k>Cantidad: ${item.quantity}</p> <div class="flex items-center gap-2 mt-2" data-astro-cid-ekvggi4k> <span class="font-medium" data-astro-cid-ekvggi4k>${formatPrice(item.line_total)}</span> ${item.discount_percentage > 0 && renderTemplate`<span class="text-sm text-primary-400" data-astro-cid-ekvggi4k> ${item.discount_percentage}% descuento
</span>`} </div> ${order.status === "delivered" && renderTemplate`<button class="mt-2 text-sm text-primary-600 hover:text-primary-900 underline" data-astro-cid-ekvggi4k>
Escribir reseña
</button>`} </div> </div>`;
  })} </div> </div> </div> <!-- Sidebar --> <div class="space-y-6" data-astro-cid-ekvggi4k> <!-- Order Summary --> <div class="bg-white border border-primary-200 p-6" data-astro-cid-ekvggi4k> <h2 class="text-lg font-medium mb-4" data-astro-cid-ekvggi4k>Resumen</h2> <div class="space-y-3 text-sm" data-astro-cid-ekvggi4k> <div class="flex justify-between" data-astro-cid-ekvggi4k> <span class="text-primary-500" data-astro-cid-ekvggi4k>Subtotal</span> <span data-astro-cid-ekvggi4k>${formatPrice(order.subtotal)}</span> </div> ${order.discount_amount > 0 && renderTemplate`<div class="flex justify-between text-sm text-green-600" data-astro-cid-ekvggi4k> <span data-astro-cid-ekvggi4k>Descuento</span> <span data-astro-cid-ekvggi4k>-${formatPrice(order.discount_amount)}</span> </div>`} <div class="flex justify-between" data-astro-cid-ekvggi4k> <span class="text-primary-500" data-astro-cid-ekvggi4k>Envío</span> <span data-astro-cid-ekvggi4k>${order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : "Gratis"}</span> </div> <div class="flex justify-between pt-3 border-t border-primary-200 text-lg font-medium" data-astro-cid-ekvggi4k> <span data-astro-cid-ekvggi4k>Total</span> <span data-astro-cid-ekvggi4k>${formatPrice(order.total_amount || order.subtotal)}</span> </div> </div> ${order.coupon_code && renderTemplate`<div class="mt-4 pt-4 border-t border-primary-200" data-astro-cid-ekvggi4k> <p class="text-sm text-primary-500" data-astro-cid-ekvggi4k>Cupón aplicado</p> <p class="font-mono" data-astro-cid-ekvggi4k>${order.coupon_code}</p> </div>`} </div> <!-- Shipping Address --> <div class="bg-white border border-primary-200 p-6" data-astro-cid-ekvggi4k> <h2 class="text-lg font-medium mb-4" data-astro-cid-ekvggi4k>Dirección de Envío</h2> ${order.shipping_address ? renderTemplate`<div class="text-sm space-y-1" data-astro-cid-ekvggi4k> <p class="font-medium" data-astro-cid-ekvggi4k>${order.shipping_address.name}</p> <p data-astro-cid-ekvggi4k>${order.shipping_address.street}</p> ${order.shipping_address.street2 && renderTemplate`<p data-astro-cid-ekvggi4k>${order.shipping_address.street2}</p>`} <p data-astro-cid-ekvggi4k>${order.shipping_address.postal_code} ${order.shipping_address.city}</p> <p data-astro-cid-ekvggi4k>${order.shipping_address.province}, ${order.shipping_address.country}</p> ${order.shipping_address.phone && renderTemplate`<p class="mt-2" data-astro-cid-ekvggi4k>Tel: ${order.shipping_address.phone}</p>`} </div>` : renderTemplate`<p class="text-sm text-primary-500" data-astro-cid-ekvggi4k>No disponible</p>`} </div> <!-- Payment Method --> <div class="bg-white border border-primary-200 p-6" data-astro-cid-ekvggi4k> <h2 class="text-lg font-medium mb-4" data-astro-cid-ekvggi4k>Método de Pago</h2> <div class="flex items-center gap-3" data-astro-cid-ekvggi4k> <div class="w-10 h-6 bg-primary-100 rounded flex items-center justify-center text-xs font-bold" data-astro-cid-ekvggi4k> ${order.payment_method === "card" ? "\u{1F4B3}" : "\u{1F3E6}"} </div> <div data-astro-cid-ekvggi4k> <p class="text-sm font-medium" data-astro-cid-ekvggi4k> ${order.payment_method === "card" ? "Tarjeta de cr\xE9dito/d\xE9bito" : "Transferencia bancaria"} </p> ${order.stripe_payment_intent && renderTemplate`<p class="text-xs text-primary-500" data-astro-cid-ekvggi4k>Ref: ${order.stripe_payment_intent.slice(-8)}</p>`} </div> </div> </div> <!-- Actions --> <div class="bg-white rounded-lg border border-primary-200 p-6" data-astro-cid-ekvggi4k> <div class="space-y-2" data-astro-cid-ekvggi4k> <a href="/cuenta/pedidos" class="flex items-center justify-center gap-2 w-full px-4 py-3 text-primary-900 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200 font-medium" data-astro-cid-ekvggi4k> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" data-astro-cid-ekvggi4k></path> </svg>
Volver a mis pedidos
</a> ${order.status !== "cancelled" && order.status !== "refunded" && renderTemplate`${renderComponent($$result2, "InvoiceDownload", InvoiceDownload, { "client:load": true, "orderId": order.id, "orderNumber": orderNumber, "authToken": Astro2.cookies.get("sb-access-token")?.value, "client:component-hydration": "load", "client:component-path": "@components/islands/InvoiceDownload", "client:component-export": "default", "data-astro-cid-ekvggi4k": true })}`} ${(order.status === "confirmed" || order.status === "pending") && renderTemplate`<button class="w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg border border-red-200 font-medium flex items-center justify-center gap-2" id="cancelOrderBtn" data-astro-cid-ekvggi4k> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" data-astro-cid-ekvggi4k></path> </svg>
Cancelar pedido
</button>`} ${order.status === "delivered" && renderTemplate`<button class="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors rounded-lg border border-blue-200 font-medium flex items-center justify-center gap-2" id="returnOrderBtn" data-astro-cid-ekvggi4k> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" data-astro-cid-ekvggi4k></path> </svg>
Solicitar devolución
</button>`} <button onclick="window.print()" class="w-full px-4 py-3 text-primary-600 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200 font-medium flex items-center justify-center gap-2" data-astro-cid-ekvggi4k> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm-6-4a2 2 0 11-4 0 2 2 0 014 0z" data-astro-cid-ekvggi4k></path> </svg>
Imprimir pedido
</button> <a${addAttribute(`mailto:soporte@fashionstore.com?subject=Consulta sobre pedido ${orderNumber}`, "href")} class="flex items-center justify-center gap-2 w-full px-4 py-3 text-primary-600 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200 font-medium" data-astro-cid-ekvggi4k> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" data-astro-cid-ekvggi4k></path> </svg>
Contactar soporte
</a> </div> </div> </div> </div> </main>  <div id="cancelModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-astro-cid-ekvggi4k> <div class="bg-white rounded-lg max-w-md w-full mx-4 p-8 shadow-xl" data-astro-cid-ekvggi4k> <h3 class="text-2xl font-display font-medium mb-4" data-astro-cid-ekvggi4k>Cancelar Pedido</h3> <p class="text-primary-600 mb-6" data-astro-cid-ekvggi4k>
¿Estás seguro de que deseas cancelar este pedido? Se restaurará el stock automáticamente y recibirás un reembolso a tu método de pago.
</p> <div class="space-y-3" data-astro-cid-ekvggi4k> <button class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium" id="confirmCancelBtn" data-astro-cid-ekvggi4k>
Sí, cancelar pedido
</button> <button class="w-full border border-primary-300 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition-colors" id="cancelModalCloseBtn" data-astro-cid-ekvggi4k>
No, mantener pedido
</button> </div> <div id="cancelSpinner" class="hidden text-center mt-4" data-astro-cid-ekvggi4k> <div class="inline-block animate-spin" data-astro-cid-ekvggi4k> <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-astro-cid-ekvggi4k></circle> </svg> </div> <p class="text-sm text-primary-600 mt-2" data-astro-cid-ekvggi4k>Procesando cancelación...</p> </div> </div> </div>  <div id="returnModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-h-screen overflow-y-auto" data-astro-cid-ekvggi4k> <div class="bg-white rounded-lg max-w-md w-full mx-4 p-8 shadow-xl my-8" data-astro-cid-ekvggi4k> <div class="flex items-start gap-3 mb-4" data-astro-cid-ekvggi4k> <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" data-astro-cid-ekvggi4k> <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ekvggi4k> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-ekvggi4k></path> </svg> </div> <div data-astro-cid-ekvggi4k> <h3 class="text-xl font-display font-medium" data-astro-cid-ekvggi4k>Solicitar Devolución</h3> <p class="text-sm text-primary-500 mt-1" data-astro-cid-ekvggi4k>Cuéntanos por qué deseas devolver este pedido</p> </div> </div> <form id="returnForm" class="space-y-4" data-astro-cid-ekvggi4k> <div data-astro-cid-ekvggi4k> <label for="returnReason" class="block text-sm font-medium text-primary-900 mb-2" data-astro-cid-ekvggi4k>
Motivo de la devolución
</label> <textarea id="returnReason" name="reason" required rows="4" placeholder="Cuéntanos el motivo (defecto, no corresponde, cambio de idea, etc.)" class="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm" data-astro-cid-ekvggi4k></textarea> </div> <div class="bg-blue-50 p-4 rounded-lg text-sm space-y-2 border border-blue-200" data-astro-cid-ekvggi4k> <p class="font-medium text-primary-900" data-astro-cid-ekvggi4k>¿Cómo funciona el proceso?</p> <ol class="list-decimal list-inside space-y-1 text-primary-600 text-xs" data-astro-cid-ekvggi4k> <li data-astro-cid-ekvggi4k>Revisaremos tu solicitud</li> <li data-astro-cid-ekvggi4k>Te enviaremos una etiqueta de devolución</li> <li data-astro-cid-ekvggi4k>Envías el artículo con la etiqueta</li> <li data-astro-cid-ekvggi4k>Confirmamos la recepción</li> <li data-astro-cid-ekvggi4k>Te devolvemos el dinero en 5-7 días hábiles</li> </ol> </div> <div class="space-y-2" data-astro-cid-ekvggi4k> <button type="submit" class="w-full bg-primary-900 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors font-medium" id="submitReturnBtn" data-astro-cid-ekvggi4k>
Solicitar Devolución
</button> <button type="button" class="w-full border border-primary-300 text-primary-600 py-3 rounded-lg hover:bg-primary-50 transition-colors text-sm" id="returnModalCloseBtn" data-astro-cid-ekvggi4k>
Cancelar
</button> </div> </form> <div id="returnSuccess" class="hidden text-center space-y-4" data-astro-cid-ekvggi4k> <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full" data-astro-cid-ekvggi4k> <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-ekvggi4k> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-astro-cid-ekvggi4k></path> </svg> </div> <div data-astro-cid-ekvggi4k> <p class="font-medium text-primary-900" data-astro-cid-ekvggi4k>Solicitud Recibida</p> <p class="text-sm text-primary-600 mt-1" data-astro-cid-ekvggi4k>Pronto te contactaremos con la etiqueta de devolución por email</p> </div> <button class="w-full bg-primary-900 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors font-medium" id="returnSuccessCloseBtn" data-astro-cid-ekvggi4k>
Cerrar
</button> </div> </div> </div>
¿Necesitas ayuda? Contacta aquí
` }));
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/pedidos/[orderNumber].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/pedidos/[orderNumber].astro";
const $$url = "/cuenta/pedidos/[orderNumber]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$orderNumber,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
