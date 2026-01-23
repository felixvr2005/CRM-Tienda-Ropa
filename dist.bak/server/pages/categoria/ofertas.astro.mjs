/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../../PublicLayout.D3A_txxX.mjs';
import { $ as $$ProductCard } from '../../ProductCard.CWUmvDiI.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Ofertas = createComponent(async ($$result, $$props, $$slots) => {
  const { data: products } = await supabase.from("products").select(`
    *,
    category:categories(id, name, slug),
    variants:product_variants(id, size, color, color_hex, stock, price_modifier)
  `).eq("is_active", true).gt("discount_percentage", 0).order("discount_percentage", { ascending: false }).limit(48);
  const saleProducts = products || [];
  const maxDiscount = saleProducts.length > 0 ? Math.max(...saleProducts.map((p) => p.discount_percentage || 0)) : 0;
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Ofertas | FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-[1800px] mx-auto px-4 lg:px-8 py-8"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <span class="text-primary-900">Ofertas</span> </nav> <!-- Header --> <div class="text-center mb-12"> <h1 class="font-display text-4xl md:text-5xl mb-4">OFERTAS</h1> <p class="text-primary-600 max-w-2xl mx-auto">
Aprovecha nuestros descuentos exclusivos en prendas seleccionadas.
</p> </div> <!-- Sale Banner --> <div class="relative h-64 md:h-80 mb-12 overflow-hidden bg-red-600"> <div class="absolute inset-0 flex items-center justify-center"> <div class="text-center text-white"> <span class="text-6xl md:text-8xl font-display">SALE</span> ${maxDiscount > 0 && renderTemplate`<p class="text-2xl md:text-3xl mt-2">Hasta -${maxDiscount}%</p>`} <p class="text-lg opacity-90 mt-4">Ofertas por tiempo limitado</p> </div> </div> <!-- Decorative elements --> <div class="absolute top-4 left-4 text-white/20 text-6xl font-display">%</div> <div class="absolute bottom-4 right-4 text-white/20 text-6xl font-display">%</div> </div> <!-- Filter by discount --> ${saleProducts.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 justify-center mb-8"> <span class="px-4 py-2 bg-red-600 text-white text-sm"> ${saleProducts.length} productos en oferta
</span> </div>`} <!-- Products Grid --> ${saleProducts.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"> ${saleProducts.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product, "showQuickAdd": true })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <svg class="w-16 h-16 mx-auto mb-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"></path> </svg> <p class="text-primary-500 mb-4">No hay ofertas disponibles en este momento</p> <a href="/productos" class="inline-block bg-primary-900 text-white px-8 py-3 hover:bg-primary-800 transition-colors">
VER COLECCIÓN
</a> </div>`} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/categoria/ofertas.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/categoria/ofertas.astro";
const $$url = "/categoria/ofertas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ofertas,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
