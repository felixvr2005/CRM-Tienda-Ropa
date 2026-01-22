/* empty css                              */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute, o as Fragment } from '../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../PublicLayout.D3A_txxX.mjs';
import { $ as $$ProductCard } from '../ProductCard.CWUmvDiI.mjs';
import { e as getFilteredProducts, f as getAvailableFilters, b as getCategories } from '../supabase.41eewI-c.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const url = new URL(Astro2.request.url);
  const categorySlug = url.searchParams.get("categoria") || void 0;
  const search = url.searchParams.get("q") || void 0;
  const minPrice = url.searchParams.get("min") ? Number(url.searchParams.get("min")) : void 0;
  const maxPrice = url.searchParams.get("max") ? Number(url.searchParams.get("max")) : void 0;
  const colorsParam = url.searchParams.get("colores");
  const sizesParam = url.searchParams.get("tallas");
  const onSale = url.searchParams.get("oferta") === "1";
  const sortBy = url.searchParams.get("orden") || "newest";
  const colors = colorsParam ? colorsParam.split(",") : [];
  const sizes = sizesParam ? sizesParam.split(",") : [];
  const products = await getFilteredProducts({
    category: categorySlug,
    search,
    minPrice,
    maxPrice,
    colors,
    sizes,
    onSale,
    sortBy
  });
  const availableFilters = await getAvailableFilters(categorySlug);
  const categories = await getCategories();
  const mainCategories = categories.filter((c) => !c.parent_id);
  const pageTitle = categorySlug ? categories.find((c) => c.slug === categorySlug)?.name || "Colecci\xF3n" : search ? `Resultados para "${search}"` : "Colecci\xF3n";
  const colorHex = {
    "Negro": "#000000",
    "Blanco": "#FFFFFF",
    "Beige": "#F5F5DC",
    "Burdeos": "#800020",
    "Azul Marino": "#1E3A5F",
    "Celeste": "#B0E0E6",
    "Rosa": "#FFB6C1",
    "Crema": "#FFFDD0",
    "Camel": "#C19A6B",
    "Marr\xF3n": "#8B4513"
  };
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": pageTitle }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-[1800px] mx-auto px-4 lg:px-8 py-8"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> ${categorySlug ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <a href="/productos" class="hover:text-primary-900">Colección</a> <span class="mx-2">/</span> <span class="text-primary-900">${pageTitle}</span> ` })}` : renderTemplate`<span class="text-primary-900">Colección</span>`} </nav> <!-- Header --> <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"> <div> <h1 class="font-display text-3xl md:text-4xl">${pageTitle}</h1> ${search && renderTemplate`<p class="text-primary-500 mt-1">Mostrando resultados para "${search}"</p>`} </div> <span class="text-sm text-primary-500">${products.length} productos</span> </div> <div class="flex gap-8"> <!-- Sidebar Filters --> <aside class="hidden lg:block w-64 flex-shrink-0"> <div class="sticky top-24 space-y-8"> <!-- Categories --> <div> <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-4">Categorías</h3> <ul class="space-y-2"> <li> <a href="/productos"${addAttribute(["text-sm", !categorySlug ? "text-primary-900 font-medium" : "text-primary-600 hover:text-primary-900"], "class:list")}>
Todos los productos
</a> </li> ${mainCategories.map((category) => renderTemplate`<li> <a${addAttribute("/productos?categoria=" + category.slug, "href")}${addAttribute(["text-sm", categorySlug === category.slug ? "text-primary-900 font-medium" : "text-primary-600 hover:text-primary-900"], "class:list")}> ${category.name} </a> </li>`)} </ul> </div> <!-- Ordenar --> <div> <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-3">Ordenar por</h3> <select id="sortSelect" class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"> <option value="newest"${addAttribute(sortBy === "newest", "selected")}>Más recientes</option> <option value="price-asc"${addAttribute(sortBy === "price-asc", "selected")}>Precio: menor a mayor</option> <option value="price-desc"${addAttribute(sortBy === "price-desc", "selected")}>Precio: mayor a menor</option> <option value="popular"${addAttribute(sortBy === "popular", "selected")}>Más populares</option> </select> </div> <!-- En oferta --> <div> <label class="flex items-center gap-3 cursor-pointer"> <input type="checkbox" id="saleFilter"${addAttribute(onSale, "checked")} class="w-5 h-5 accent-primary-900"> <span class="text-sm">Solo productos en oferta</span> </label> </div> <!-- Colores --> ${availableFilters.colors.length > 0 && renderTemplate`<div> <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-3">Color</h3> <div class="flex flex-wrap gap-2" id="colorFilters"> ${availableFilters.colors.map((color) => renderTemplate`<button${addAttribute(color, "data-color")}${addAttribute(["color-filter flex items-center gap-2 px-3 py-1.5 border text-sm transition-colors", colors.includes(color) ? "border-primary-900 bg-primary-900 text-white" : "border-primary-300 hover:border-primary-500"], "class:list")}${addAttribute(color, "title")}> <span class="w-4 h-4 rounded-full border border-primary-300"${addAttribute(`background-color: ${colorHex[color] || "#ccc"}`, "style")}></span> ${color} </button>`)} </div> </div>`} <!-- Tallas --> ${availableFilters.sizes.length > 0 && renderTemplate`<div> <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-3">Talla</h3> <div class="flex flex-wrap gap-2" id="sizeFilters"> ${availableFilters.sizes.map((size) => renderTemplate`<button${addAttribute(size, "data-size")}${addAttribute(["size-filter min-w-[40px] px-3 py-2 border text-sm transition-colors", sizes.includes(size) ? "border-primary-900 bg-primary-900 text-white" : "border-primary-300 hover:border-primary-500"], "class:list")}> ${size} </button>`)} </div> </div>`} <!-- Precio --> <div> <h3 class="text-xs uppercase tracking-wider text-primary-500 mb-3">Precio</h3> <div class="space-y-4"> <div class="flex items-center gap-4"> <div class="flex-1"> <label class="text-xs text-primary-400 mb-1 block">Mínimo</label> <input type="number" id="minPrice"${addAttribute(minPrice || availableFilters.priceRange.min, "value")}${addAttribute(availableFilters.priceRange.min, "min")} class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"> </div> <span class="text-primary-400 pt-4">-</span> <div class="flex-1"> <label class="text-xs text-primary-400 mb-1 block">Máximo</label> <input type="number" id="maxPrice"${addAttribute(maxPrice || availableFilters.priceRange.max, "value")}${addAttribute(availableFilters.priceRange.max, "max")} class="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"> </div> </div> <button id="applyPrice" class="w-full btn btn-outline text-sm py-2">
Aplicar precio
</button> </div> </div> <!-- Limpiar filtros --> ${(colors.length > 0 || sizes.length > 0 || onSale || minPrice || maxPrice) && renderTemplate`<div class="pt-4 border-t border-primary-200"> <a${addAttribute(categorySlug ? "/productos?categoria=" + categorySlug : "/productos", "href")} class="text-sm text-primary-600 hover:text-primary-900 underline">
Limpiar todos los filtros
</a> </div>`} </div> </aside> <!-- Mobile Filter Button --> <div class="lg:hidden fixed bottom-4 left-4 right-4 z-40"> <button id="mobileFilterBtn" class="w-full btn btn-primary py-3 flex items-center justify-center gap-2 shadow-lg"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path> </svg>
Filtros y Ordenar
${colors.length + sizes.length + (onSale ? 1 : 0) > 0 && renderTemplate`<span class="bg-white text-primary-900 text-xs px-2 py-0.5 rounded-full"> ${colors.length + sizes.length + (onSale ? 1 : 0)} </span>`} </button> </div> <!-- Product Grid --> <div class="flex-1"> ${products.length > 0 ? renderTemplate`<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"> ${products.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product })}`)} </div>` : renderTemplate`<div class="text-center py-20"> <svg class="w-20 h-20 mx-auto text-primary-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <h2 class="text-xl font-medium mb-2">No hay productos</h2> <p class="text-primary-500 mb-6">No encontramos productos con los filtros seleccionados</p> <a href="/productos" class="btn btn-primary">Ver todos los productos</a> </div>`} </div> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/productos/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/productos/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/productos/index.astro";
const $$url = "/productos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
