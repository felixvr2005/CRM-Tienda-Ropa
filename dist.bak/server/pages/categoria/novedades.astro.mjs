/* empty css                                 */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../../PublicLayout.D3A_txxX.mjs';
import { $ as $$ProductCard } from '../../ProductCard.CWUmvDiI.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Novedades = createComponent(async ($$result, $$props, $$slots) => {
  const { data: products } = await supabase.from("products").select(`
    *,
    category:categories(id, name, slug),
    variants:product_variants(id, size, color, color_hex, stock, price_modifier)
  `).eq("is_active", true).eq("is_new", true).order("created_at", { ascending: false }).limit(48);
  const newProducts = products || [];
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Novedades | FashionStore" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-[1800px] mx-auto px-4 lg:px-8 py-8"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <span class="text-primary-900">Novedades</span> </nav> <!-- Header --> <div class="text-center mb-12"> <h1 class="font-display text-4xl md:text-5xl mb-4">NOVEDADES</h1> <p class="text-primary-600 max-w-2xl mx-auto">
Descubre las últimas incorporaciones a nuestra colección. Prendas frescas y tendencias actuales.
</p> </div> <!-- Banner --> <div class="relative h-64 md:h-80 mb-12 overflow-hidden bg-primary-100"> <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80" alt="Nueva colección" class="w-full h-full object-cover"> <div class="absolute inset-0 bg-black/30 flex items-center justify-center"> <div class="text-center text-white"> <span class="text-sm tracking-[0.3em] uppercase mb-2 block">Nueva Temporada</span> <h2 class="font-display text-3xl md:text-5xl mb-4">Colección 2026</h2> <p class="text-lg opacity-90">Descubre lo último en tendencias</p> </div> </div> </div> <!-- Products Grid --> ${newProducts.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"> ${newProducts.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product, "showQuickAdd": true })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <svg class="w-16 h-16 mx-auto mb-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> <p class="text-primary-500 mb-4">Próximamente nuevos productos</p> <a href="/productos" class="inline-block bg-primary-900 text-white px-8 py-3 hover:bg-primary-800 transition-colors">
VER COLECCIÓN
</a> </div>`} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/categoria/novedades.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/categoria/novedades.astro";
const $$url = "/categoria/novedades";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Novedades,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
