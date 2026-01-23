/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../../PublicLayout.D3A_txxX.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$NuevaPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Nueva Contrase\xF1a | FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-md mx-auto px-4 py-16"> <div class="bg-white border border-primary-200 p-8"> <h1 class="text-2xl font-light text-center mb-2">NUEVA CONTRASEÑA</h1> <p class="text-primary-500 text-center mb-8">Introduce tu nueva contraseña</p> <form id="resetForm" class="space-y-6"> <div> <label for="password" class="block text-sm font-medium text-primary-700 mb-2">
Nueva contraseña
</label> <input type="password" id="password" name="password" required minlength="8" placeholder="Mínimo 8 caracteres" class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> </div> <div> <label for="confirmPassword" class="block text-sm font-medium text-primary-700 mb-2">
Confirmar contraseña
</label> <input type="password" id="confirmPassword" name="confirmPassword" required minlength="8" placeholder="Repite la contraseña" class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> </div> <div id="errorMessage" class="hidden p-4 bg-red-50 border border-red-200 text-red-800 text-sm"></div> <div id="successMessage" class="hidden p-4 bg-green-50 border border-green-200 text-green-800 text-sm"></div> <button type="submit" id="submitBtn" class="w-full py-3 bg-primary-900 text-white hover:bg-primary-800 transition-colors disabled:opacity-50">
ACTUALIZAR CONTRASEÑA
</button> </form> <div class="mt-6 text-center"> <a href="/cuenta/login" class="text-sm text-primary-600 hover:text-primary-900">
← Volver al inicio de sesión
</a> </div> </div> </main> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/nueva-password.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/nueva-password.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/nueva-password.astro";
const $$url = "/cuenta/nueva-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$NuevaPassword,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
