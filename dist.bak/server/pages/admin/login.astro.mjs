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
    if (isAdmin) {
      return Astro2.redirect("/admin");
    }
    const { data: adminUser } = await supabase.from("admin_users").select("id").eq("auth_user_id", user.id).eq("is_active", true).single();
    if (adminUser) {
      return Astro2.redirect("/admin");
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Admin Login | FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4"> <div class="w-full max-w-md"> <div class="bg-white p-8 shadow-lg rounded-lg"> <div class="text-center mb-8"> <a href="/" class="font-display text-2xl tracking-wider inline-block mb-2">
FASHION<span class="font-light">STORE</span> </a> <div class="flex items-center justify-center gap-2 mt-2"> <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> </svg> <p class="text-primary-600 text-sm font-medium">Panel de Administración</p> </div> </div> <form id="loginForm" class="space-y-6"> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Email
</label> <div class="relative"> <input type="email" name="email" required class="w-full border border-primary-300 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="admin@fashionstore.com"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path> </svg> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Contraseña
</label> <div class="relative"> <input type="password" name="password" id="password" required class="w-full border border-primary-300 px-4 py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary-900 focus:ring-1 focus:ring-primary-900 rounded" placeholder="••••••••"> <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path> </svg> <button type="button" id="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"> <svg id="eyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> </svg> </button> </div> </div> <div id="errorMessage" class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm hidden rounded"></div> <div id="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm hidden rounded"></div> <button type="submit" id="submitBtn" class="w-full bg-primary-900 text-white py-3 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors rounded flex items-center justify-center gap-2"> <span id="btnText">Iniciar sesión</span> <svg id="btnSpinner" class="hidden animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> </button> </form> <!-- Nota para clientes --> <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded"> <strong>Nota:</strong> Este acceso es solo para administradores autorizados. 
          Si eres cliente, <a href="/cuenta/login" class="underline font-medium hover:text-yellow-900">inicia sesión aquí</a>.
</div> <p class="text-center text-xs text-primary-400 mt-6"> <a href="/" class="hover:text-primary-900 flex items-center justify-center gap-2"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
Volver a la tienda
</a> </p> </div> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/login.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
