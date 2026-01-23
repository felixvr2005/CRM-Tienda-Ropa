/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, h as addAttribute, l as renderScript, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../AccountLayout.BP0CPR-D.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Perfil = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Perfil;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/perfil");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/perfil");
  }
  let successMessage = "";
  let errorMessage = "";
  if (Astro2.request.method === "POST") {
    try {
      let data = {};
      const contentType = Astro2.request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await Astro2.request.json();
      } else {
        const formData = await Astro2.request.formData();
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
      }
      const firstName = data.firstName;
      const lastName = data.lastName;
      const phone = data.phone;
      const birthDate = data.birthDate;
      const newsletter = data.newsletter === "on" || data.newsletter === true;
      console.log("Actualizando perfil para user.id:", user.id);
      console.log("Datos a actualizar:", { firstName, lastName, phone, birthDate, newsletter });
      const { data: existingCustomer, error: selectError } = await supabase.from("customers").select("id").eq("auth_user_id", user.id).single();
      if (selectError && selectError.code === "PGRST116") {
        console.log("Cliente no existe, creando nuevo registro");
        const { error: insertError } = await supabase.from("customers").insert({
          auth_user_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          birth_date: birthDate || null,
          newsletter_subscribed: newsletter
        });
        if (insertError) throw insertError;
      } else if (existingCustomer) {
        console.log("Cliente existe, actualizando ID:", existingCustomer.id);
        const { error: updateError } = await supabase.from("customers").update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          birth_date: birthDate || null,
          newsletter_subscribed: newsletter,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", existingCustomer.id);
        if (updateError) throw updateError;
      }
      successMessage = "Perfil actualizado correctamente";
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      errorMessage = err.message || "Error al actualizar el perfil";
    }
  }
  const { data: updatedCustomer } = await supabase.from("customers").select("*").eq("auth_user_id", user.id).single();
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Mi Perfil" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> ${successMessage && renderTemplate`<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"> ${successMessage} </div>`} ${errorMessage && renderTemplate`<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"> ${errorMessage} </div>`} <h1 class="text-2xl font-bold text-primary-900">Mi Perfil</h1> <div class="bg-white border border-primary-200 rounded-lg p-6"> <form method="POST" class="space-y-6"> <div class="grid md:grid-cols-2 gap-6"> <div> <label for="firstName" class="block text-sm font-medium text-primary-900 mb-2">
Nombre
</label> <input type="text" id="firstName" name="firstName"${addAttribute(updatedCustomer?.first_name || "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900"> </div> <div> <label for="lastName" class="block text-sm font-medium text-primary-900 mb-2">
Apellido
</label> <input type="text" id="lastName" name="lastName"${addAttribute(updatedCustomer?.last_name || "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900"> </div> </div> <div> <label for="email" class="block text-sm font-medium text-primary-900 mb-2">
Correo Electrónico
</label> <input type="email" id="email"${addAttribute(user.email, "value")} disabled class="w-full px-4 py-2 border border-primary-300 rounded bg-primary-50"> </div> <div class="grid md:grid-cols-2 gap-6"> <div> <label for="phone" class="block text-sm font-medium text-primary-900 mb-2">
Teléfono
</label> <input type="tel" id="phone" name="phone"${addAttribute(updatedCustomer?.phone || "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900"> </div> <div> <label for="birthDate" class="block text-sm font-medium text-primary-900 mb-2">
Fecha de Nacimiento
</label> <input type="date" id="birthDate" name="birthDate"${addAttribute(updatedCustomer?.birth_date ? updatedCustomer.birth_date.split("T")[0] : "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:border-primary-900"> </div> </div> <div class="flex items-center gap-2"> <input type="checkbox" id="newsletter" name="newsletter"${addAttribute(updatedCustomer?.newsletter_opt_in, "checked")} class="w-4 h-4"> <label for="newsletter" class="text-sm text-primary-900">
Deseo recibir información sobre nuevos productos y promociones
</label> </div> <button type="submit" class="w-full py-3 bg-primary-900 text-white rounded hover:bg-primary-800 transition-colors">
Guardar Cambios
</button> </form> </div> </div> ` })} <!-- Main Content --> <div class="lg:col-span-3"> <h1 class="text-2xl font-light mb-6">MI PERFIL</h1> ${successMessage && renderTemplate`<div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-800"> ${successMessage} </div>`} ${errorMessage && renderTemplate`<div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-800"> ${errorMessage} </div>`} <div class="space-y-6"> <!-- Profile Form --> <form method="POST" class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-6">Información Personal</h2> <div class="grid md:grid-cols-2 gap-6"> <div> <label for="firstName" class="block text-sm font-medium text-primary-700 mb-2">
Nombre *
</label> <input type="text" id="firstName" name="firstName"${addAttribute(updatedCustomer?.first_name || "", "value")} required class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> </div> <div> <label for="lastName" class="block text-sm font-medium text-primary-700 mb-2">
Apellidos *
</label> <input type="text" id="lastName" name="lastName"${addAttribute(updatedCustomer?.last_name || "", "value")} required class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> </div> <div> <label for="email" class="block text-sm font-medium text-primary-700 mb-2">
Email
</label> <input type="email" id="email"${addAttribute(user.email, "value")} disabled class="w-full px-4 py-3 border border-primary-200 bg-primary-50 text-primary-500 cursor-not-allowed"> <p class="text-xs text-primary-500 mt-1">El email no se puede cambiar</p> </div> <div> <label for="phone" class="block text-sm font-medium text-primary-700 mb-2">
Teléfono
</label> <input type="tel" id="phone" name="phone"${addAttribute(updatedCustomer?.phone || "", "value")} placeholder="+34 600 000 000" class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> </div> <div> <label for="birthDate" class="block text-sm font-medium text-primary-700 mb-2">
Fecha de Nacimiento
</label> <input type="date" id="birthDate" name="birthDate"${addAttribute(updatedCustomer?.birth_date || "", "value")} class="w-full px-4 py-3 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none transition-colors"> <p class="text-xs text-primary-500 mt-1">Recibe un descuento especial en tu cumpleaños</p> </div> <div class="flex items-center"> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" name="newsletter"${addAttribute(updatedCustomer?.newsletter_subscribed, "checked")} class="w-5 h-5 border-primary-300 text-primary-900 focus:ring-primary-900"> <span class="text-sm">
Quiero recibir novedades y ofertas exclusivas por email
</span> </label> </div> </div> <div class="mt-6 pt-6 border-t border-primary-200"> <button type="submit" class="px-8 py-3 bg-primary-900 text-white hover:bg-primary-800 transition-colors">
GUARDAR CAMBIOS
</button> </div> </form> <!-- Change Password --> <div class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Cambiar Contraseña</h2> <p class="text-primary-500 mb-4">
Para cambiar tu contraseña, te enviaremos un enlace a tu email.
</p> <button id="resetPasswordBtn" type="button" class="px-6 py-2 border border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white transition-colors">
SOLICITAR CAMBIO DE CONTRASEÑA
</button> </div> <!-- Delete Account --> <div class="bg-white border border-red-200 p-6"> <h2 class="text-lg font-medium mb-4 text-red-600">Eliminar Cuenta</h2> <p class="text-primary-500 mb-4">
Al eliminar tu cuenta, se borrarán todos tus datos personales. Esta acción no se puede deshacer.
              Tus pedidos anteriores se conservarán por motivos legales.
</p> <button id="deleteAccountBtn" type="button" class="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
ELIMINAR MI CUENTA
</button> </div> </div> </div> ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/perfil.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/perfil.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/perfil.astro";
const $$url = "/cuenta/perfil";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Perfil,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
