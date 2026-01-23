/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../BaseLayout.BaGX5xKo.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Registro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Registro;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const isAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return Astro2.redirect("/cuenta");
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Crear Cuenta | FashionStore", "description": "Crea tu cuenta en FashionStore y disfruta de beneficios exclusivos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4 py-12"> <div class="w-full max-w-md"> <div class="bg-white p-8 shadow-lg rounded-lg"> <div class="text-center mb-6"> <a href="/" class="font-display text-2xl tracking-wider inline-block mb-2">
FASHION<span class="font-light">STORE</span> </a> <div class="flex items-center justify-center gap-2 mt-2"> <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path> </svg> <p class="text-primary-600 text-sm font-medium">Crea tu cuenta</p> </div> </div> <!-- Beneficios --> <div class="bg-green-50 border border-green-200 p-3 mb-6 rounded text-xs"> <p class="text-green-800 font-medium mb-2">Al registrarte obtendrás:</p> <ul class="text-green-700 space-y-1"> <li class="flex items-center gap-2"> <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Seguimiento de tus pedidos en tiempo real
</li> <li class="flex items-center gap-2"> <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Guardar productos en favoritos
</li> <li class="flex items-center gap-2"> <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg>
Ofertas exclusivas solo para miembros
</li> </ul> </div> <form id="registerForm" class="space-y-4"> <div class="grid grid-cols-2 gap-4"> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Nombre <span class="text-red-500">*</span> </label> <div class="relative"> <input type="text" name="firstName" id="firstName" required autocomplete="given-name" class="w-full border border-primary-300 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="Tu nombre"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Apellidos
</label> <input type="text" name="lastName" id="lastName" autocomplete="family-name" class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="Tus apellidos"> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Email <span class="text-red-500">*</span> </label> <div class="relative"> <input type="email" name="email" id="email" required autocomplete="email" class="w-full border border-primary-300 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="tu@email.com"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path> </svg> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Contraseña <span class="text-red-500">*</span> </label> <div class="relative"> <input type="password" name="password" id="password" required minlength="8" autocomplete="new-password" class="w-full border border-primary-300 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="Mínimo 8 caracteres"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"> <svg id="eyeIcon1" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> <!-- Password strength indicator --> <div class="mt-2"> <div id="passwordStrength" class="h-1 bg-primary-200 rounded overflow-hidden"> <div id="strengthBar" class="h-full w-0 transition-all duration-300"></div> </div> <p id="strengthText" class="mt-1 text-xs text-primary-400">Mínimo 8 caracteres</p> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Confirmar Contraseña <span class="text-red-500">*</span> </label> <div class="relative"> <input type="password" name="confirmPassword" id="confirmPassword" required autocomplete="new-password" class="w-full border border-primary-300 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="Repite tu contraseña"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> <button type="button" id="toggleConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"> <svg id="eyeIcon2" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> <p id="passwordMatch" class="mt-1 text-xs hidden"></p> </div> <div class="space-y-3 pt-2"> <label class="flex items-start gap-3 cursor-pointer"> <input type="checkbox" name="newsletter" class="w-4 h-4 mt-0.5 accent-primary-900 rounded"> <span class="text-xs text-primary-600">
Quiero recibir ofertas exclusivas y novedades por email
</span> </label> <label class="flex items-start gap-3 cursor-pointer"> <input type="checkbox" name="terms" required class="w-4 h-4 mt-0.5 accent-primary-900 rounded"> <span class="text-xs text-primary-600">
Acepto los <a href="/terminos" class="underline hover:text-primary-900">términos y condiciones</a> y la <a href="/privacidad" class="underline hover:text-primary-900">política de privacidad</a> <span class="text-red-500">*</span> </span> </label> </div> <div id="errorMessage" class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm hidden rounded"></div> <div id="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm hidden rounded"></div> <button type="submit" id="submitBtn" class="w-full bg-primary-900 text-white py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors rounded flex items-center justify-center gap-2"> <span id="btnText">Crear cuenta</span> <svg id="btnSpinner" class="hidden animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </button> </form> <!-- Login --> <p class="mt-6 text-center text-sm text-primary-600">
¿Ya tienes cuenta?
<a href="/cuenta/login" class="font-medium text-primary-900 hover:underline">
Inicia sesión
</a> </p> </div> <!-- Nota para administradores --> <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded"> <strong>¿Eres administrador?</strong> <a href="/admin/login" class="underline font-medium hover:text-yellow-900 ml-1">Accede al panel de administración aquí</a> </div> <p class="text-center text-xs text-primary-400 mt-6"> <a href="/" class="hover:text-primary-900 flex items-center justify-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Volver a la tienda
</a> </p> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/registro.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/registro.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/registro.astro";
const $$url = "/cuenta/registro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Registro,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
