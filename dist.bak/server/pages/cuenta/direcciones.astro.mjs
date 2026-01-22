/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AccountLayout } from '../../AccountLayout.BP0CPR-D.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Direcciones = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Direcciones;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/direcciones");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    Astro2.cookies.delete("sb-access-token", { path: "/" });
    Astro2.cookies.delete("sb-refresh-token", { path: "/" });
    return Astro2.redirect("/cuenta/login?redirect=/cuenta/direcciones");
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
      const action = data.action;
      const { data: currentCustomer } = await supabase.from("customers").select("id, addresses").eq("auth_user_id", user.id).single();
      let currentAddresses2 = currentCustomer?.addresses || [];
      if (action === "add" || action === "edit") {
        const addressData = {
          id: action === "edit" ? data.addressId : crypto.randomUUID(),
          name: data.name,
          street: data.street,
          street2: data.street2 || "",
          city: data.city,
          province: data.province,
          postal_code: data.postalCode,
          country: data.country || "Espa\xF1a",
          phone: data.phone || "",
          is_default: data.isDefault === "on" || data.isDefault === true
        };
        let newAddresses = [...currentAddresses2];
        if (action === "edit") {
          const index = newAddresses.findIndex((a) => a.id === addressData.id);
          if (index !== -1) {
            newAddresses[index] = addressData;
          }
        } else {
          newAddresses.push(addressData);
        }
        if (addressData.is_default) {
          newAddresses = newAddresses.map((a) => ({
            ...a,
            is_default: a.id === addressData.id
          }));
        }
        const { error } = await supabase.from("customers").update({ addresses: newAddresses }).eq("auth_user_id", user.id);
        if (error) throw error;
        successMessage = action === "edit" ? "Direcci\xF3n actualizada correctamente" : "Direcci\xF3n a\xF1adida correctamente";
      }
      if (action === "delete") {
        const addressId = data.addressId;
        const newAddresses = currentAddresses2.filter((a) => a.id !== addressId);
        const { error } = await supabase.from("customers").update({ addresses: newAddresses }).eq("auth_user_id", user.id);
        if (error) throw error;
        successMessage = "Direcci\xF3n eliminada correctamente";
      }
      if (action === "setDefault") {
        const addressId = data.addressId;
        const newAddresses = currentAddresses2.map((a) => ({
          ...a,
          is_default: a.id === addressId
        }));
        const { error } = await supabase.from("customers").update({ addresses: newAddresses }).eq("auth_user_id", user.id);
        if (error) throw error;
        successMessage = "Direcci\xF3n predeterminada actualizada";
      }
    } catch (err) {
      console.error("Error en direcciones:", err);
      errorMessage = err.message || "Error al procesar la solicitud";
    }
  }
  const { data: customer } = await supabase.from("customers").select("id, addresses").eq("auth_user_id", user.id).single();
  const currentAddresses = customer?.addresses || [];
  const provinces = [
    "A Coru\xF1a",
    "\xC1lava",
    "Albacete",
    "Alicante",
    "Almer\xEDa",
    "Asturias",
    "\xC1vila",
    "Badajoz",
    "Barcelona",
    "Burgos",
    "C\xE1ceres",
    "C\xE1diz",
    "Cantabria",
    "Castell\xF3n",
    "Ciudad Real",
    "C\xF3rdoba",
    "Cuenca",
    "Girona",
    "Granada",
    "Guadalajara",
    "Guip\xFAzcoa",
    "Huelva",
    "Huesca",
    "Illes Balears",
    "Ja\xE9n",
    "La Rioja",
    "Las Palmas",
    "Le\xF3n",
    "Lleida",
    "Lugo",
    "Madrid",
    "M\xE1laga",
    "Murcia",
    "Navarra",
    "Ourense",
    "Palencia",
    "Pontevedra",
    "Salamanca",
    "Santa Cruz de Tenerife",
    "Segovia",
    "Sevilla",
    "Soria",
    "Tarragona",
    "Teruel",
    "Toledo",
    "Valencia",
    "Valladolid",
    "Vizcaya",
    "Zamora",
    "Zaragoza",
    "Ceuta",
    "Melilla"
  ];
  return renderTemplate`${renderComponent($$result, "AccountLayout", $$AccountLayout, { "title": "Mis Direcciones" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> ${successMessage && renderTemplate`<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"> ${successMessage} </div>`} ${errorMessage && renderTemplate`<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"> ${errorMessage} </div>`} <div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-bold text-primary-900">Mis Direcciones</h1> <button id="addAddressBtn" class="px-4 py-2 bg-primary-900 text-white rounded hover:bg-primary-800 transition-colors">
+ Añadir Dirección
</button> </div> <!-- Addresses List --> ${currentAddresses && currentAddresses.length > 0 ? renderTemplate`<div class="space-y-4"> ${currentAddresses.map((address) => renderTemplate`<div class="bg-white border border-primary-200 rounded-lg p-6"> <div class="flex justify-between items-start mb-3"> <div> <h3 class="font-semibold text-primary-900">${address.name}</h3> ${address.is_default && renderTemplate`<span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">Dirección principal</span>`} </div> <div class="flex gap-2"> <button class="edit-address-btn text-sm text-primary-600 hover:text-primary-900"${addAttribute(address.id, "data-address-id")}>
Editar
</button> <button class="delete-address-btn text-sm text-red-600 hover:text-red-900"${addAttribute(address.id, "data-address-id")}>
Eliminar
</button> </div> </div> <p class="text-sm text-primary-700"> ${address.street} ${address.street2 && `, ${address.street2}`} </p> <p class="text-sm text-primary-700"> ${address.postal_code} ${address.city}, ${address.province} </p> <p class="text-sm text-primary-700">${address.country}</p> ${address.phone && renderTemplate`<p class="text-sm text-primary-700">${address.phone}</p>`} ${!address.is_default && renderTemplate`<button class="setdefault-address-btn text-xs text-primary-500 hover:text-primary-700 mt-3"${addAttribute(address.id, "data-address-id")}>
Establecer como predeterminada
</button>`} </div>`)} </div>` : renderTemplate`<div class="bg-white border border-primary-200 rounded-lg p-12 text-center"> <p class="text-primary-500 mb-6">No tienes direcciones guardadas</p> <button id="addAddressBtn2" class="px-4 py-2 bg-primary-900 text-white rounded hover:bg-primary-800 transition-colors">
Añadir Dirección
</button> </div>`} <!-- Modal Dirección --> <div id="addressModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"> <div class="bg-white rounded-lg p-8 w-full max-w-2xl mx-4"> <div class="flex justify-between items-center mb-6"> <h2 id="modalTitle" class="text-2xl font-bold text-primary-900">Añadir Dirección</h2> <button id="closeModalBtn" class="text-gray-500 hover:text-gray-700">
✕
</button> </div> <form id="addressForm" class="space-y-4"> <input type="hidden" name="addressId" id="addressIdInput"> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Nombre de dirección</label> <input type="text" name="name" placeholder="Mi casa, Oficina, etc." required class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Teléfono</label> <input type="tel" name="phone" placeholder="+34 600 000 000" class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> </div> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Calle y número</label> <input type="text" name="street" placeholder="Calle Principal 123" required class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Piso, bloque, puerta (opcional)</label> <input type="text" name="street2" placeholder="Apt 4B" class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Código postal</label> <input type="text" name="postalCode" placeholder="28001" required class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Ciudad</label> <input type="text" name="city" placeholder="Madrid" required class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> </div> <div> <label class="block text-sm font-medium text-primary-900 mb-1">Provincia</label> <select name="province" required class="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"> <option value="">Seleccionar</option> ${provinces.map((province) => renderTemplate`<option${addAttribute(province, "value")}>${province}</option>`)} </select> </div> </div> <div class="flex items-center gap-2"> <input type="checkbox" name="isDefault" id="isDefault" class="rounded border-primary-200"> <label for="isDefault" class="text-sm text-primary-900">Usar como dirección predeterminada</label> </div> <div class="flex gap-3 pt-4"> <button type="submit" id="submitBtn" class="flex-1 px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors font-medium">
Añadir Dirección
</button> <button type="button" onclick="document.getElementById('addressModal').classList.add('hidden')" class="flex-1 px-4 py-2 border border-primary-200 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors font-medium">
Cancelar
</button> </div> </form> </div> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/direcciones.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/direcciones.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/cuenta/direcciones.astro";
const $$url = "/cuenta/direcciones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Direcciones,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
