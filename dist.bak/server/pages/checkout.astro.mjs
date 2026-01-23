/* empty css                              */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../PublicLayout.D3A_txxX.mjs';
import { s as supabase, a as supabaseAdmin } from '../supabase.41eewI-c.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  let user = null;
  let customer = null;
  let defaultAddress = null;
  if (accessToken) {
    const { data: { user: authUser } } = await supabase.auth.getUser(accessToken);
    user = authUser;
    if (user) {
      const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id, is_active").eq("auth_user_id", user.id).eq("is_active", true).single();
      if (adminUser) {
        return Astro2.redirect("/");
      }
      const { data: customerData } = await supabase.from("customers").select("*").eq("auth_user_id", user.id).single();
      customer = customerData;
      if (customer?.addresses && customer.addresses.length > 0) {
        defaultAddress = customer.addresses.find((a) => a.is_default) || customer.addresses[0];
      }
    }
  }
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
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Checkout | FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="max-w-7xl mx-auto px-4 py-8"> <!-- Breadcrumb --> <nav class="text-sm mb-6"> <ol class="flex items-center gap-2 text-primary-500"> <li><a href="/" class="hover:text-primary-900">Inicio</a></li> <li>/</li> <li><a href="/carrito" class="hover:text-primary-900">Carrito</a></li> <li>/</li> <li class="text-primary-900">Checkout</li> </ol> </nav> <h1 class="text-2xl font-light mb-8">FINALIZAR COMPRA</h1> <div class="grid lg:grid-cols-3 gap-8"> <!-- Checkout Form --> <div class="lg:col-span-2 space-y-6"> <!-- Login prompt for guests --> ${!user && renderTemplate`<div class="bg-primary-50 border border-primary-200 p-4 flex items-center justify-between"> <p class="text-sm">¿Ya tienes cuenta? Inicia sesión para un checkout más rápido</p> <a${addAttribute(`/cuenta/login?redirect=/checkout`, "href")} class="px-4 py-2 bg-primary-900 text-white text-sm hover:bg-primary-800 transition-colors">
INICIAR SESIÓN
</a> </div>`} <form id="checkoutForm" class="space-y-6"> <!-- Contact Information --> <section class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Información de contacto</h2> <div class="grid md:grid-cols-2 gap-4"> <div> <label for="email" class="block text-sm font-medium text-primary-700 mb-1">
Email *
</label> <input type="email" id="email" name="email"${addAttribute(user?.email || "", "value")} required class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div> <label for="phone" class="block text-sm font-medium text-primary-700 mb-1">
Teléfono *
</label> <input type="tel" id="phone" name="phone"${addAttribute(customer?.phone || "", "value")} required placeholder="+34 600 000 000" class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> </div> </section> <!-- Shipping Address --> <section class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Dirección de envío</h2> ${customer?.addresses && customer.addresses.length > 0 && renderTemplate`<div class="mb-6"> <label class="block text-sm font-medium text-primary-700 mb-2">
Usar dirección guardada
</label> <select id="savedAddress" class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> <option value="">Nueva dirección</option> ${customer.addresses.map((addr, i) => renderTemplate`<option${addAttribute(JSON.stringify(addr), "value")}${addAttribute(addr.is_default, "selected")}> ${addr.name} - ${addr.street}, ${addr.city} </option>`)} </select> </div>`} <div class="grid md:grid-cols-2 gap-4"> <div> <label for="firstName" class="block text-sm font-medium text-primary-700 mb-1">
Nombre *
</label> <input type="text" id="firstName" name="firstName"${addAttribute(defaultAddress?.name?.split(" ")[0] || customer?.first_name || "", "value")} required class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div> <label for="lastName" class="block text-sm font-medium text-primary-700 mb-1">
Apellidos *
</label> <input type="text" id="lastName" name="lastName"${addAttribute(defaultAddress?.name?.split(" ").slice(1).join(" ") || customer?.last_name || "", "value")} required class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div class="md:col-span-2"> <label for="street" class="block text-sm font-medium text-primary-700 mb-1">
Dirección *
</label> <input type="text" id="street" name="street"${addAttribute(defaultAddress?.street || "", "value")} required placeholder="Calle, número, piso, puerta" class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div class="md:col-span-2"> <label for="street2" class="block text-sm font-medium text-primary-700 mb-1">
Información adicional
</label> <input type="text" id="street2" name="street2"${addAttribute(defaultAddress?.street2 || "", "value")} placeholder="Escalera, bloque, urbanización..." class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div> <label for="postalCode" class="block text-sm font-medium text-primary-700 mb-1">
Código Postal *
</label> <input type="text" id="postalCode" name="postalCode"${addAttribute(defaultAddress?.postal_code || "", "value")} required pattern="[0-9]{5}" class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div> <label for="city" class="block text-sm font-medium text-primary-700 mb-1">
Ciudad *
</label> <input type="text" id="city" name="city"${addAttribute(defaultAddress?.city || "", "value")} required class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> </div> <div> <label for="province" class="block text-sm font-medium text-primary-700 mb-1">
Provincia *
</label> <select id="province" name="province" required class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> <option value="">Selecciona</option> ${provinces.map((p) => renderTemplate`<option${addAttribute(p, "value")}${addAttribute(defaultAddress?.province === p, "selected")}>${p}</option>`)} </select> </div> <div> <label for="country" class="block text-sm font-medium text-primary-700 mb-1">
País
</label> <select id="country" name="country" class="w-full px-4 py-2 border border-primary-300 focus:border-primary-900 focus:ring-0 outline-none"> <option value="España" selected>España</option> <option value="Portugal">Portugal</option> </select> </div> </div> ${user && renderTemplate`<label class="flex items-center gap-2 mt-4 cursor-pointer"> <input type="checkbox" id="saveAddress" name="saveAddress" class="w-4 h-4 border-primary-300 text-primary-900 focus:ring-primary-900"> <span class="text-sm">Guardar esta dirección para futuras compras</span> </label>`} </section> <!-- Shipping Method --> <section class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Método de envío</h2> <div class="space-y-3"> <label class="flex items-center gap-4 p-4 border border-primary-200 cursor-pointer hover:border-primary-400 transition-colors"> <input type="radio" name="shippingMethod" value="standard" checked class="w-4 h-4 text-primary-900 focus:ring-primary-900"> <div class="flex-1"> <p class="font-medium">Envío Estándar</p> <p class="text-sm text-primary-500">3-5 días laborables</p> </div> <span class="font-medium" id="standardPrice">4,95 €</span> </label> <label class="flex items-center gap-4 p-4 border border-primary-200 cursor-pointer hover:border-primary-400 transition-colors"> <input type="radio" name="shippingMethod" value="express" class="w-4 h-4 text-primary-900 focus:ring-primary-900"> <div class="flex-1"> <p class="font-medium">Envío Express</p> <p class="text-sm text-primary-500">24-48 horas</p> </div> <span class="font-medium">9,95 €</span> </label> <label class="flex items-center gap-4 p-4 border border-primary-200 cursor-pointer hover:border-primary-400 transition-colors"> <input type="radio" name="shippingMethod" value="store" class="w-4 h-4 text-primary-900 focus:ring-primary-900"> <div class="flex-1"> <p class="font-medium">Recogida en Tienda</p> <p class="text-sm text-primary-500">Disponible en 24 horas</p> </div> <span class="font-medium text-green-600">Gratis</span> </label> </div> </section> <!-- Payment Method --> <section class="bg-white border border-primary-200 p-6"> <h2 class="text-lg font-medium mb-4">Método de pago</h2> <div class="space-y-3"> <label class="flex items-center gap-4 p-4 border border-primary-200 cursor-pointer hover:border-primary-400 transition-colors"> <input type="radio" name="paymentMethod" value="card" checked class="w-4 h-4 text-primary-900 focus:ring-primary-900"> <div class="flex-1"> <p class="font-medium">Tarjeta de crédito/débito</p> <div class="flex gap-2 mt-1"> <span class="text-xs bg-primary-100 px-2 py-0.5 rounded">Visa</span> <span class="text-xs bg-primary-100 px-2 py-0.5 rounded">Mastercard</span> <span class="text-xs bg-primary-100 px-2 py-0.5 rounded">Amex</span> </div> </div> <span class="text-2xl">💳</span> </label> <label class="flex items-center gap-4 p-4 border border-primary-200 cursor-pointer hover:border-primary-400 transition-colors"> <input type="radio" name="paymentMethod" value="paypal" class="w-4 h-4 text-primary-900 focus:ring-primary-900"> <div class="flex-1"> <p class="font-medium">PayPal</p> <p class="text-sm text-primary-500">Paga de forma segura con PayPal</p> </div> <span class="text-2xl">🅿️</span> </label> </div> </section> <!-- Terms --> <div class="space-y-4"> <label class="flex items-start gap-3 cursor-pointer"> <input type="checkbox" id="terms" name="terms" required class="w-4 h-4 mt-0.5 border-primary-300 text-primary-900 focus:ring-primary-900"> <span class="text-sm text-primary-600">
He leído y acepto los <a href="/terminos" class="underline hover:text-primary-900">términos y condiciones</a>
y la <a href="/privacidad" class="underline hover:text-primary-900">política de privacidad</a> *
</span> </label> <label class="flex items-start gap-3 cursor-pointer"> <input type="checkbox" id="newsletter" name="newsletter" class="w-4 h-4 mt-0.5 border-primary-300 text-primary-900 focus:ring-primary-900"> <span class="text-sm text-primary-600">
Quiero recibir ofertas exclusivas y novedades por email
</span> </label> </div> <div id="errorMessage" class="hidden p-4 bg-red-50 border border-red-200 text-red-800 text-sm"></div> <button type="submit" id="submitBtn" class="w-full py-4 bg-primary-900 text-white text-lg hover:bg-primary-800 transition-colors disabled:opacity-50">
PAGAR AHORA
</button> <p class="text-xs text-primary-500 text-center">
🔒 Pago 100% seguro. Tus datos están protegidos.
</p> </form> </div> <!-- Order Summary --> <aside class="lg:col-span-1"> <div class="bg-white border border-primary-200 p-6 sticky top-4"> <h2 class="text-lg font-medium mb-4">Resumen del pedido</h2> <div id="cartSummary" class="space-y-4 mb-6"> <p class="text-primary-500 text-sm">Cargando productos...</p> </div> <div class="border-t border-primary-200 pt-4 space-y-2 text-sm"> <div class="flex justify-between"> <span class="text-primary-500">Subtotal</span> <span id="subtotal">0,00 €</span> </div> <div class="flex justify-between"> <span class="text-primary-500">Envío</span> <span id="shippingCost">4,95 €</span> </div> <div id="discountRow" class="hidden flex justify-between text-green-600"> <span>Descuento</span> <span id="discount">-0,00 €</span> </div> </div> <!-- Coupon --> <div class="border-t border-primary-200 mt-4 pt-4"> <div class="flex gap-2"> <input type="text" id="couponCode" placeholder="Código de descuento" class="flex-1 px-3 py-2 border border-primary-300 text-sm focus:border-primary-900 focus:ring-0 outline-none"> <button type="button" id="applyCoupon" class="px-4 py-2 border border-primary-900 text-primary-900 text-sm hover:bg-primary-900 hover:text-white transition-colors">
APLICAR
</button> </div> <p id="couponMessage" class="text-xs mt-2 hidden"></p> </div> <div class="border-t border-primary-200 mt-4 pt-4"> <div class="flex justify-between text-lg font-medium"> <span>Total</span> <span id="total">0,00 €</span> </div> <p class="text-xs text-primary-500 mt-1">IVA incluido</p> </div> </div> </aside> </div> </main> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/checkout/index.astro";
const $$url = "/checkout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
