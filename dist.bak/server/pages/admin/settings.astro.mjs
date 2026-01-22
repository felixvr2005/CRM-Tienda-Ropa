/* empty css                                 */
import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = false;
const $$Settings = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Settings;
  let successMessage = "";
  let errorMessage = "";
  if (Astro2.request.method === "POST") {
    try {
      let data = {};
      const contentType = Astro2.request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await Astro2.request.json();
      } else {
        const formData2 = await Astro2.request.formData();
        for (const [key, value] of formData2.entries()) {
          data[key] = value;
        }
      }
      const action = data.action;
      if (action === "updateOfertasFlash") {
        const ofertasActivas2 = data.ofertas_activas === "on" || data.ofertas_activas === true;
        const { error } = await supabase.from("configuracion").upsert({
          clave: "ofertas_activas",
          valor: ofertasActivas2 ? "true" : "false",
          tipo: "boolean",
          descripcion: "Activa/desactiva la secci\xF3n de ofertas flash en la home",
          categoria: "ofertas"
        }, {
          onConflict: "clave"
        });
        if (error) throw error;
        successMessage = ofertasActivas2 ? "Ofertas Flash ACTIVADAS" : "Ofertas Flash DESACTIVADAS";
      }
      if (action === "updateGeneral") {
        const siteName = data.site_name;
        const siteDescription = data.site_description;
        const contactEmail = data.contact_email;
        const contactPhone = data.contact_phone;
        const configs2 = [
          { clave: "site_name", valor: siteName, tipo: "string", descripcion: "Nombre del sitio", categoria: "general" },
          { clave: "site_description", valor: siteDescription, tipo: "string", descripcion: "Descripci\xF3n del sitio", categoria: "general" },
          { clave: "contact_email", valor: contactEmail, tipo: "string", descripcion: "Email de contacto", categoria: "general" },
          { clave: "contact_phone", valor: contactPhone, tipo: "string", descripcion: "Tel\xE9fono de contacto", categoria: "general" }
        ];
        for (const config of configs2) {
          const { error } = await supabase.from("configuracion").upsert(config, { onConflict: "clave" });
          if (error) throw error;
        }
        successMessage = "Configuraci\xF3n general actualizada";
      }
      if (action === "updateShipping") {
        const freeShippingThreshold = formData.get("free_shipping_threshold");
        const standardShippingCost = formData.get("standard_shipping_cost");
        const expressShippingCost = formData.get("express_shipping_cost");
        const configs2 = [
          { clave: "free_shipping_threshold", valor: freeShippingThreshold, tipo: "number", descripcion: "Umbral para env\xEDo gratis (\u20AC)", categoria: "shipping" },
          { clave: "standard_shipping_cost", valor: standardShippingCost, tipo: "number", descripcion: "Coste env\xEDo est\xE1ndar (\u20AC)", categoria: "shipping" },
          { clave: "express_shipping_cost", valor: expressShippingCost, tipo: "number", descripcion: "Coste env\xEDo express (\u20AC)", categoria: "shipping" }
        ];
        for (const config of configs2) {
          const { error } = await supabase.from("configuracion").upsert(config, { onConflict: "clave" });
          if (error) throw error;
        }
        successMessage = "Configuraci\xF3n de env\xEDo actualizada";
      }
    } catch (err) {
      console.error("Error updating config:", err);
      errorMessage = err.message || "Error al actualizar la configuraci\xF3n";
    }
  }
  const { data: configs } = await supabase.from("configuracion").select("*").order("categoria");
  function getConfig(key, defaultValue = "") {
    const config = configs?.find((c) => c.clave === key);
    return config?.valor || defaultValue;
  }
  const ofertasActivas = getConfig("ofertas_activas", "false") === "true";
  return renderTemplate(_a || (_a = __template(["", " <script>\n  // Handler para sincronizaci\xF3n de Stripe\n  const syncBtn = document.getElementById('syncStripeBtn');\n  const syncResult = document.getElementById('syncResult');\n\n  if (syncBtn) {\n    syncBtn.addEventListener('click', async () => {\n      const originalText = syncBtn.textContent;\n      syncBtn.disabled = true;\n      syncBtn.textContent = 'Sincronizando...';\n      \n      if (syncResult) syncResult.className = 'mt-4 hidden p-4 rounded border';\n\n      try {\n        const response = await fetch('/api/admin/products/sync-stripe-prices', {\n          method: 'PUT',\n          headers: {\n            'Content-Type': 'application/json',\n            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`\n          }\n        });\n\n        const data = await response.json();\n\n        if (response.ok) {\n          syncResult.innerHTML = `\n            <div class=\"space-y-2\">\n              <p class=\"font-medium text-green-800\">\u2705 ${data.message}</p>\n              <p class=\"text-sm text-green-700\">Sincronizados: ${data.results.synced}/${data.results.total}</p>\n              ${data.results.errors.length > 0 ? `\n                <details class=\"mt-2\">\n                  <summary class=\"cursor-pointer text-sm font-medium text-yellow-700\">Errores (${data.results.errors.length})</summary>\n                  <ul class=\"mt-2 text-xs text-yellow-600 space-y-1\">\n                    ${data.results.errors.map(e => `<li>\u2022 ${e}</li>`).join('')}\n                  </ul>\n                </details>\n              ` : ''}\n              ${data.results.details.length > 0 ? `\n                <details class=\"mt-2\">\n                  <summary class=\"cursor-pointer text-sm font-medium\">Detalles (${data.results.details.length})</summary>\n                  <div class=\"mt-2 text-xs space-y-1 max-h-64 overflow-y-auto\">\n                    ${data.results.details.map(d => `\n                      <div class=\"p-1 bg-gray-50 rounded\">\n                        <strong>${d.product}</strong>\n                        ${d.variant ? `<div class=\"text-gray-600\">${d.variant}</div>` : ''}\n                        ${d.price ? `<div class=\"text-green-600\">${d.price}</div>` : ''}\n                        ${d.oldPrice ? `<div class=\"text-red-600\">${d.oldPrice}</div>` : ''}\n                        ${d.newPrice ? `<div class=\"text-green-600\">${d.newPrice}</div>` : ''}\n                        <div class=\"text-gray-500\">${d.status}</div>\n                      </div>\n                    `).join('')}\n                  </div>\n                </details>\n              ` : ''}\n            </div>\n          `;\n          syncResult.className = 'mt-4 p-4 rounded border bg-green-50 border-green-200';\n        } else {\n          syncResult.innerHTML = `\n            <p class=\"font-medium text-red-800\">\u274C Error: ${data.error}</p>\n          `;\n          syncResult.className = 'mt-4 p-4 rounded border bg-red-50 border-red-200';\n        }\n\n        if (syncResult) syncResult.classList.remove('hidden');\n      } catch (error: any) {\n        syncResult.innerHTML = `<p class=\"font-medium text-red-800\">\u274C Error: ${error.message}</p>`;\n        syncResult.className = 'mt-4 p-4 rounded border bg-red-50 border-red-200';\n        if (syncResult) syncResult.classList.remove('hidden');\n      } finally {\n        syncBtn.disabled = false;\n        syncBtn.textContent = originalText;\n      }\n    });\n  }\n<\/script>"], ["", " <script>\n  // Handler para sincronizaci\xF3n de Stripe\n  const syncBtn = document.getElementById('syncStripeBtn');\n  const syncResult = document.getElementById('syncResult');\n\n  if (syncBtn) {\n    syncBtn.addEventListener('click', async () => {\n      const originalText = syncBtn.textContent;\n      syncBtn.disabled = true;\n      syncBtn.textContent = 'Sincronizando...';\n      \n      if (syncResult) syncResult.className = 'mt-4 hidden p-4 rounded border';\n\n      try {\n        const response = await fetch('/api/admin/products/sync-stripe-prices', {\n          method: 'PUT',\n          headers: {\n            'Content-Type': 'application/json',\n            'Authorization': \\`Bearer \\${localStorage.getItem('token') || ''}\\`\n          }\n        });\n\n        const data = await response.json();\n\n        if (response.ok) {\n          syncResult.innerHTML = \\`\n            <div class=\"space-y-2\">\n              <p class=\"font-medium text-green-800\">\u2705 \\${data.message}</p>\n              <p class=\"text-sm text-green-700\">Sincronizados: \\${data.results.synced}/\\${data.results.total}</p>\n              \\${data.results.errors.length > 0 ? \\`\n                <details class=\"mt-2\">\n                  <summary class=\"cursor-pointer text-sm font-medium text-yellow-700\">Errores (\\${data.results.errors.length})</summary>\n                  <ul class=\"mt-2 text-xs text-yellow-600 space-y-1\">\n                    \\${data.results.errors.map(e => \\`<li>\u2022 \\${e}</li>\\`).join('')}\n                  </ul>\n                </details>\n              \\` : ''}\n              \\${data.results.details.length > 0 ? \\`\n                <details class=\"mt-2\">\n                  <summary class=\"cursor-pointer text-sm font-medium\">Detalles (\\${data.results.details.length})</summary>\n                  <div class=\"mt-2 text-xs space-y-1 max-h-64 overflow-y-auto\">\n                    \\${data.results.details.map(d => \\`\n                      <div class=\"p-1 bg-gray-50 rounded\">\n                        <strong>\\${d.product}</strong>\n                        \\${d.variant ? \\`<div class=\"text-gray-600\">\\${d.variant}</div>\\` : ''}\n                        \\${d.price ? \\`<div class=\"text-green-600\">\\${d.price}</div>\\` : ''}\n                        \\${d.oldPrice ? \\`<div class=\"text-red-600\">\\${d.oldPrice}</div>\\` : ''}\n                        \\${d.newPrice ? \\`<div class=\"text-green-600\">\\${d.newPrice}</div>\\` : ''}\n                        <div class=\"text-gray-500\">\\${d.status}</div>\n                      </div>\n                    \\`).join('')}\n                  </div>\n                </details>\n              \\` : ''}\n            </div>\n          \\`;\n          syncResult.className = 'mt-4 p-4 rounded border bg-green-50 border-green-200';\n        } else {\n          syncResult.innerHTML = \\`\n            <p class=\"font-medium text-red-800\">\u274C Error: \\${data.error}</p>\n          \\`;\n          syncResult.className = 'mt-4 p-4 rounded border bg-red-50 border-red-200';\n        }\n\n        if (syncResult) syncResult.classList.remove('hidden');\n      } catch (error: any) {\n        syncResult.innerHTML = \\`<p class=\"font-medium text-red-800\">\u274C Error: \\${error.message}</p>\\`;\n        syncResult.className = 'mt-4 p-4 rounded border bg-red-50 border-red-200';\n        if (syncResult) syncResult.classList.remove('hidden');\n      } finally {\n        syncBtn.disabled = false;\n        syncBtn.textContent = originalText;\n      }\n    });\n  }\n<\/script>"])), renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Configuraci\xF3n" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto space-y-8"> <div> <h1 class="text-2xl font-display">Configuración</h1> <p class="text-primary-500">Gestiona la configuración del sistema</p> </div> ${successMessage && renderTemplate`<div class="p-4 bg-green-50 border border-green-200 text-green-800 flex items-center gap-3"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> ${successMessage} </div>`} ${errorMessage && renderTemplate`<div class="p-4 bg-red-50 border border-red-200 text-red-800 flex items-center gap-3"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> ${errorMessage} </div>`} <!-- Ofertas Flash Toggle --> <div class="bg-white border border-primary-200 p-6"> <div class="flex items-start justify-between"> <div> <h2 class="text-lg font-medium flex items-center gap-2"> <span class="text-2xl">⚡</span>
Ofertas Flash
</h2> <p class="text-sm text-primary-500 mt-1">
Activa o desactiva la sección de ofertas flash en la página principal
</p> </div> <form method="POST" id="ofertasForm"> <input type="hidden" name="action" value="updateOfertasFlash"> <label class="relative inline-flex items-center cursor-pointer"> <input type="checkbox" name="ofertas_activas"${addAttribute(ofertasActivas, "checked")} class="sr-only peer" onchange="this.form.submit()"> <div class="w-14 h-7 bg-primary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-primary-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div> <span class="ml-3 text-sm font-medium text-primary-700"> ${ofertasActivas ? "Activado" : "Desactivado"} </span> </label> </form> </div> <div${addAttribute(`mt-4 p-4 rounded-lg ${ofertasActivas ? "bg-green-50 border border-green-200" : "bg-primary-50 border border-primary-200"}`, "class")}> <div class="flex items-center gap-2"> <span${addAttribute(`w-3 h-3 rounded-full ${ofertasActivas ? "bg-green-500 animate-pulse" : "bg-primary-300"}`, "class")}></span> <span class="text-sm font-medium"> ${ofertasActivas ? "Las ofertas flash se est\xE1n mostrando en la p\xE1gina principal" : "Las ofertas flash est\xE1n ocultas en la p\xE1gina principal"} </span> </div> </div> </div> <!-- Configuración General --> <div class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Configuración General</h2> <form method="POST" class="space-y-4"> <input type="hidden" name="action" value="updateGeneral"> <div class="grid md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Nombre del sitio
</label> <input type="text" name="site_name"${addAttribute(getConfig("site_name", "FashionStore"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> </div> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Email de contacto
</label> <input type="email" name="contact_email"${addAttribute(getConfig("contact_email", "hola@fashionstore.com"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> </div> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Teléfono de contacto
</label> <input type="tel" name="contact_phone"${addAttribute(getConfig("contact_phone", "+34 900 123 456"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> </div> <div class="md:col-span-2"> <label class="block text-sm font-medium text-primary-700 mb-1">
Descripción del sitio
</label> <textarea name="site_description" rows="2" class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900">${getConfig("site_description", "Tu tienda de moda masculina premium")}</textarea> </div> </div> <button type="submit" class="bg-primary-900 text-white px-6 py-2 text-sm hover:bg-primary-800 transition-colors">
Guardar cambios
</button> </form> </div> <!-- Configuración de Envío --> <div class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Configuración de Envío</h2> <form method="POST" class="space-y-4"> <input type="hidden" name="action" value="updateShipping"> <div class="grid md:grid-cols-3 gap-4"> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Envío gratis desde (€)
</label> <input type="number" name="free_shipping_threshold" step="0.01" min="0"${addAttribute(getConfig("free_shipping_threshold", "100"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> <p class="text-xs text-primary-500 mt-1">0 = siempre gratis</p> </div> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Envío estándar (€)
</label> <input type="number" name="standard_shipping_cost" step="0.01" min="0"${addAttribute(getConfig("standard_shipping_cost", "4.95"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> </div> <div> <label class="block text-sm font-medium text-primary-700 mb-1">
Envío express (€)
</label> <input type="number" name="express_shipping_cost" step="0.01" min="0"${addAttribute(getConfig("express_shipping_cost", "9.95"), "value")} class="w-full border border-primary-300 px-4 py-2 focus:outline-none focus:border-primary-900"> </div> </div> <button type="submit" class="bg-primary-900 text-white px-6 py-2 text-sm hover:bg-primary-800 transition-colors">
Guardar cambios
</button> </form> </div> <!-- Sincronización de precios Stripe --> <div class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-2">Sincronización de Stripe</h2> <p class="text-sm text-primary-500 mb-4">
Sincroniza los precios de los productos con Stripe. Si los precios no coinciden, se actualizarán automáticamente.
</p> <button id="syncStripeBtn" type="button" class="bg-indigo-600 text-white px-6 py-2 text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
Sincronizar precios con Stripe
</button> <div id="syncResult" class="mt-4 hidden p-4 rounded border"></div> </div> <!-- Estado de configuraciones --> <div class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Todas las configuraciones</h2> <div class="overflow-x-auto"> <table class="w-full text-sm"> <thead> <tr class="border-b border-primary-200"> <th class="text-left py-2 px-4 font-medium">Clave</th> <th class="text-left py-2 px-4 font-medium">Valor</th> <th class="text-left py-2 px-4 font-medium">Tipo</th> <th class="text-left py-2 px-4 font-medium">Categoría</th> </tr> </thead> <tbody> ${configs && configs.length > 0 ? configs.map((config) => renderTemplate`<tr class="border-b border-primary-100 hover:bg-primary-50"> <td class="py-2 px-4 font-mono text-xs">${config.clave}</td> <td class="py-2 px-4"> ${config.tipo === "boolean" ? renderTemplate`<span${addAttribute(`px-2 py-0.5 rounded text-xs ${config.valor === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, "class")}> ${config.valor === "true" ? "S\xED" : "No"} </span>` : config.valor} </td> <td class="py-2 px-4 text-primary-500">${config.tipo}</td> <td class="py-2 px-4 text-primary-500">${config.categoria}</td> </tr>`) : renderTemplate`<tr> <td colspan="4" class="py-8 text-center text-primary-500">
No hay configuraciones guardadas
</td> </tr>`} </tbody> </table> </div> </div> </div> ` }));
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/settings.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/settings.astro";
const $$url = "/admin/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
