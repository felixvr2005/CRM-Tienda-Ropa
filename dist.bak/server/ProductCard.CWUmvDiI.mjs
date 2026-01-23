import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, r as renderTemplate } from './astro/server._DgZez_d.mjs';
import 'piccolore';
import 'clsx';
import { c as calculateDiscountedPrice, g as getTotalStock, f as formatPrice } from './utils.Ceah_axf.mjs';

const $$Astro = createAstro();
const $$ProductCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ProductCard;
  const { product, showQuickAdd = false } = Astro2.props;
  const finalPrice = calculateDiscountedPrice(product.price, product.discount_percentage);
  const hasDiscount = product.discount_percentage > 0;
  const stock = getTotalStock(product.variants || []);
  const isLowStock = stock > 0 && stock <= 5;
  return renderTemplate`${maybeRenderHead()}<article class="group relative"> <!-- Image Container --> <a${addAttribute(`/productos/${product.slug}`, "href")} class="block aspect-[3/4] overflow-hidden bg-primary-100"> <img${addAttribute(product.images && product.images.length > 0 ? product.images[0] : "/images/products/placeholder.jpg", "src")}${addAttribute(product.name, "alt")} loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"> <!-- Badges --> <div class="absolute top-3 left-3 flex flex-col gap-2"> ${product.is_new && renderTemplate`<span class="bg-primary-900 text-white text-2xs tracking-widest uppercase px-2 py-1">
Nuevo
</span>`} ${hasDiscount && renderTemplate`<span class="bg-red-600 text-white text-2xs tracking-widest uppercase px-2 py-1">
-${product.discount_percentage}%
</span>`} ${isLowStock && renderTemplate`<span class="bg-amber-500 text-white text-2xs tracking-widest uppercase px-2 py-1">
Últimas unidades
</span>`} </div> <!-- Quick Add Button (opcional) --> ${showQuickAdd && stock > 0 && renderTemplate`<div class="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"> <button class="w-full bg-white/95 backdrop-blur text-primary-900 text-xs tracking-widest uppercase py-3 hover:bg-primary-900 hover:text-white transition-colors"${addAttribute(product.id, "data-product-id")}>
Añadir rápido
</button> </div>`} </a> <!-- Product Info --> <div class="mt-4 space-y-1"> <a${addAttribute(`/productos/${product.slug}`, "href")} class="block"> <h3 class="text-sm font-medium text-primary-900 line-clamp-1 group-hover:underline"> ${product.name} </h3> </a> ${product.category && renderTemplate`<p class="text-xs text-primary-500 uppercase tracking-wider"> ${product.category.name} </p>`} <div class="flex items-center gap-2"> <span${addAttribute(`text-sm ${hasDiscount ? "text-red-600 font-medium" : "text-primary-900"}`, "class")}> ${formatPrice(finalPrice)} </span> ${hasDiscount && renderTemplate`<span class="text-sm text-primary-400 line-through"> ${formatPrice(product.price)} </span>`} </div> <!-- Color Swatches Preview --> ${product.variants && product.variants.length > 0 && renderTemplate`<div class="flex items-center gap-1 pt-1"> ${[...new Set(product.variants.map((v) => v.color_hex).filter(Boolean))].slice(0, 4).map((color) => renderTemplate`<span class="w-3 h-3 rounded-full border border-primary-200"${addAttribute(`background-color: ${color}`, "style")}${addAttribute(product.variants?.find((v) => v.color_hex === color)?.color, "title")}></span>`)} ${[...new Set(product.variants.map((v) => v.color_hex))].length > 4 && renderTemplate`<span class="text-2xs text-primary-400">
+${[...new Set(product.variants.map((v) => v.color_hex))].length - 4} </span>`} </div>`} </div> </article>`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/components/product/ProductCard.astro", void 0);

export { $$ProductCard as $ };
