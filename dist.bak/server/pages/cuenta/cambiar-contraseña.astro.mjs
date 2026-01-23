/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../AccountLayout.BP0CPR-D.mjs';
import { s as supabase, a as supabaseAdmin } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$CambiarContrasea = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CambiarContrasea;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/cambiar-contrase\xF1a");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/cambiar-contrase\xF1a");
  }
  const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id, is_active").eq("auth_user_id", user.id).eq("is_active", true).single();
  if (adminUser) {
    return Astro2.redirect("/admin");
  }
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Cambiar Contrase\xF1a" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <h1 class="text-2xl font-bold text-primary-900">Cambiar Contraseña</h1> <div class="bg-white border border-primary-200 rounded-lg p-8 max-w-2xl"> <form id="changePasswordForm" class="space-y-6"> <div> <label for="currentPassword" class="block text-sm font-medium text-primary-900 mb-2">
Contraseña Actual *
</label> <input type="password" id="currentPassword" name="currentPassword" required class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900" placeholder="Ingresa tu contraseña actual"> </div> <div> <label for="newPassword" class="block text-sm font-medium text-primary-900 mb-2">
Nueva Contraseña *
</label> <input type="password" id="newPassword" name="newPassword" required class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900" placeholder="Ingresa tu nueva contraseña"> <p class="text-xs text-primary-500 mt-1">Mínimo 8 caracteres</p> </div> <div> <label for="confirmPassword" class="block text-sm font-medium text-primary-900 mb-2">
Confirmar Contraseña *
</label> <input type="password" id="confirmPassword" name="confirmPassword" required class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900" placeholder="Confirma tu nueva contraseña"> </div> <div id="message" class="p-4 rounded hidden"></div> <button type="submit" class="w-full py-3 bg-primary-900 text-white rounded hover:bg-primary-800 transition-colors">
Cambiar Contraseña
</button> </form> </div> </div> ` })}
Nueva Contraseña
<input type="password" id="newPassword" name="newPassword" required class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600" placeholder="Ingresa tu nueva contraseña"> <div class="mt-2 text-xs text-primary-500"> <p>La contraseña debe contener:</p> <ul class="list-disc list-inside space-y-1 mt-1"> <li id="lengthCheck">Al menos 8 caracteres</li> <li id="uppercaseCheck">Una letra mayúscula</li> <li id="lowercaseCheck">Una letra minúscula</li> <li id="numberCheck">Un número</li> </ul> </div> <div> <label for="confirmPassword" class="block text-sm font-medium text-primary-900 mb-2">
Confirmar Nueva Contraseña
</label> <input type="password" id="confirmPassword" name="confirmPassword" required class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600" placeholder="Confirma tu nueva contraseña"> <p id="matchError" class="text-xs text-red-600 mt-1 hidden">Las contraseñas no coinciden</p> <p id="matchSuccess" class="text-xs text-green-600 mt-1 hidden">Las contraseñas coinciden</p> </div> <button type="submit" class="w-full bg-primary-900 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors font-medium" id="submitBtn">
Cambiar Contraseña
</button> <a href="/cuenta" class="block text-center text-sm text-primary-600 hover:text-primary-900 underline">
Volver a Mi Cuenta
</a> <!-- Success Message --> <div id="successMessage" class="hidden bg-green-100 text-green-800 p-4 rounded-lg text-center"> <p class="font-medium">Contraseña actualizada correctamente</p> <p class="text-sm mt-1">Tu contraseña ha sido cambiada. Usa tu nueva contraseña para futuras sesiones.</p> </div> <!-- Error Message --> <div id="errorMessage" class="hidden bg-red-100 text-red-800 p-4 rounded-lg"></div> ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/cambiar-contrase\xF1a.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/cambiar-contrase\xF1a.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/cambiar-contraseña.astro";
const $$url = "/cuenta/cambiar-contraseña";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CambiarContrasea,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
