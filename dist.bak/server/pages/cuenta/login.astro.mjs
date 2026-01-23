/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../BaseLayout.BaGX5xKo.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const isAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return Astro2.redirect("/cuenta");
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Iniciar Sesi\xF3n | FashionStore", "description": "Accede a tu cuenta de FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4"> <div class="w-full max-w-md"> <div class="bg-white p-8 shadow-lg rounded-lg"> <div class="text-center mb-8"> <a href="/" class="font-display text-2xl tracking-wider inline-block mb-2">
FASHION<span class="font-light">STORE</span> </a> <div class="flex items-center justify-center gap-2 mt-2"> <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> <p class="text-primary-600 text-sm font-medium">Bienvenido de nuevo</p> </div> </div> <form id="loginForm" class="space-y-6"> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Email
</label> <div class="relative"> <input type="email" name="email" id="email" required autocomplete="email" class="w-full border border-primary-300 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="tu@email.com"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path> </svg> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Contraseña
</label> <div class="relative"> <input type="password" name="password" id="password" required autocomplete="current-password" class="w-full border border-primary-300 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="••••••••"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"> <svg id="eyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> </div> <div class="flex items-center justify-between"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="remember" class="w-4 h-4 accent-primary-900 rounded"> <span class="text-xs text-primary-600">Recordarme</span> </label> <a href="/cuenta/nueva-password" class="text-xs text-primary-600 hover:text-primary-900 underline">
¿Olvidaste tu contraseña?
</a> </div> <div id="errorMessage" class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm hidden rounded"></div> <div id="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm hidden rounded"></div> <button type="submit" id="submitBtn" class="w-full bg-primary-900 text-white py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors rounded flex items-center justify-center gap-2"> <span id="btnText">Iniciar sesión</span> <svg id="btnSpinner" class="hidden animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </button> </form> <!-- Separador --> <div class="my-6 flex items-center gap-4"> <div class="flex-1 h-px bg-primary-200"></div> <span class="text-xs text-primary-400 uppercase tracking-wider">o continúa con</span> <div class="flex-1 h-px bg-primary-200"></div> </div> <!-- Social Login --> <button type="button" id="googleLogin" class="w-full border border-primary-300 py-3 text-sm flex items-center justify-center gap-3 hover:bg-primary-50 transition-colors rounded"> <svg class="w-5 h-5" viewBox="0 0 24 24"> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path> </svg>
Continuar con Google
</button> <!-- Registro --> <p class="mt-6 text-center text-sm text-primary-600">
¿No tienes cuenta?
<a href="/cuenta/registro" class="font-medium text-primary-900 hover:underline">
Regístrate gratis
</a> </p> </div> <!-- Nota para administradores --> <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded"> <strong>¿Eres administrador?</strong> <a href="/admin/login" class="underline font-medium hover:text-yellow-900 ml-1">Accede al panel de administración aquí</a> </div> <p class="text-center text-xs text-primary-400 mt-6"> <a href="/" class="hover:text-primary-900 flex items-center justify-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Volver a la tienda
</a> </p> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/login.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/login.astro";
const $$url = "/cuenta/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
