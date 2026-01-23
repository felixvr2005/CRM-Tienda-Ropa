/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../AdminLayout.7POnspUO.mjs';
import { s as supabase, a as supabaseAdmin } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$CreateEdit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CreateEdit;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/admin/login?redirect=/admin/productos/nuevo");
  }
  const [
    { data: categories },
    { data: productTypes }
  ] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("product_types").select("id, name, size_type, available_sizes").order("name")
  ]);
  const productId = Astro2.params.id;
  let product = null;
  let variants = [];
  if (productId) {
    const { data: productData } = await supabaseAdmin.from("products").select("*").eq("id", productId).single();
    if (productData) {
      product = productData;
      const { data: variantsData } = await supabaseAdmin.from("product_variants").select("*").eq("product_id", productId);
      variants = variantsData || [];
    }
  }
  const isEditing = !!product;
  const pageTitle = isEditing ? `Editar: ${product?.name}` : "Nuevo Producto";
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": pageTitle }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 py-8"> <!-- Header --> <div class="flex items-center gap-4 mb-8"> <a href="/admin/productos" class="text-primary-500 hover:text-primary-900"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <h1 class="text-3xl font-bold text-primary-900">${pageTitle}</h1> </div> <form id="productForm" class="space-y-6"> <!-- Información Básica --> <div class="bg-white border border-primary-200 rounded-lg p-6"> <h2 class="font-bold text-lg text-primary-900 mb-4">Información Básica</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="name" class="block text-sm font-medium text-primary-700 mb-2">
Nombre del Producto *
</label> <input type="text" id="name" name="name"${addAttribute(product?.name || "", "value")} required class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none" placeholder="ej: Camiseta básica"> </div> <div> <label for="product_type_id" class="block text-sm font-medium text-primary-700 mb-2">
Tipo de Producto * (define las tallas)
</label> <select id="product_type_id" name="product_type_id" required class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none"> <option value="">Selecciona un tipo...</option> ${productTypes?.map((type) => renderTemplate`<option${addAttribute(type.id, "value")}${addAttribute(product?.product_type_id === type.id, "selected")}> ${type.name} (${type.size_type === "standard" ? "S,M,L..." : type.size_type === "shoe" ? "35-46" : "\xDAnico"})
</option>`)} </select> <p class="text-xs text-primary-600 mt-1">
⚠️ Cambiar esto regenerará las variantes disponibles
</p> </div> </div> <div class="mt-4"> <label for="category_id" class="block text-sm font-medium text-primary-700 mb-2">
Categoría
</label> <select id="category_id" name="category_id" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none"> <option value="">Sin categoría</option> ${categories?.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}${addAttribute(product?.category_id === cat.id, "selected")}> ${cat.name} </option>`)} </select> </div> <div class="mt-4"> <label for="description" class="block text-sm font-medium text-primary-700 mb-2">
Descripción
</label> <textarea id="description" name="description" rows="4" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none" placeholder="Describe el producto...">${product?.description}</textarea> </div> </div> <!-- Precio --> <div class="bg-white border border-primary-200 rounded-lg p-6"> <h2 class="font-bold text-lg text-primary-900 mb-4">Precio</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label for="price" class="block text-sm font-medium text-primary-700 mb-2">
Precio Base € *
</label> <input type="number" id="price" name="price"${addAttribute(product?.price || "", "value")} required step="0.01" min="0" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none"> </div> <div> <label for="compare_at_price" class="block text-sm font-medium text-primary-700 mb-2">
Precio Original (Tachado)
</label> <input type="number" id="compare_at_price" name="compare_at_price"${addAttribute(product?.compare_at_price || "", "value")} step="0.01" min="0" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none"> </div> <div> <label for="discount_percentage" class="block text-sm font-medium text-primary-700 mb-2">
Descuento (%)
</label> <input type="number" id="discount_percentage" name="discount_percentage"${addAttribute(product?.discount_percentage || 0, "value")} min="0" max="100" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none"> </div> </div> </div> <!-- Detalles Adicionales --> <div class="bg-white border border-primary-200 rounded-lg p-6"> <h2 class="font-bold text-lg text-primary-900 mb-4">Detalles del Producto</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label for="brand" class="block text-sm font-medium text-primary-700 mb-2">
Marca
</label> <input type="text" id="brand" name="brand"${addAttribute(product?.brand || "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none" placeholder="ej: Nike, Adidas"> </div> <div> <label for="material" class="block text-sm font-medium text-primary-700 mb-2">
Material
</label> <input type="text" id="material" name="material"${addAttribute(product?.material || "", "value")} class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none" placeholder="ej: 100% algodón"> </div> </div> <div class="mt-4"> <label for="care_instructions" class="block text-sm font-medium text-primary-700 mb-2">
Instrucciones de Cuidado
</label> <textarea id="care_instructions" name="care_instructions" rows="3" class="w-full px-4 py-2 border border-primary-300 rounded-lg focus:border-primary-900 focus:outline-none" placeholder="Lavar a máquina a 30°...">${product?.care_instructions}</textarea> </div> <div class="grid grid-cols-2 gap-4 mt-4"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_featured"${addAttribute(product?.is_featured || false, "checked")} class="w-4 h-4"> <span class="text-sm text-primary-700">Destacado</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_new"${addAttribute(product?.is_new || false, "checked")} class="w-4 h-4"> <span class="text-sm text-primary-700">Nuevo</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_flash_offer"${addAttribute(product?.is_flash_offer || false, "checked")} class="w-4 h-4"> <span class="text-sm text-primary-700">Oferta Flash</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_active"${addAttribute(product?.is_active !== false, "checked")} class="w-4 h-4"> <span class="text-sm text-primary-700">Activo</span> </label> </div> </div> <!-- Variantes (solo en edición) --> ${isEditing && renderTemplate`<div class="bg-white border border-primary-200 rounded-lg p-6"> <h2 class="font-bold text-lg text-primary-900 mb-4">Variantes (Color + Talla)</h2> <div id="variantsContainer" class="space-y-4"> ${variants.map((variant) => renderTemplate`<div class="border border-primary-200 rounded-lg p-4"> <div class="flex justify-between items-start mb-3"> <h3 class="font-medium text-primary-900"> ${variant.color} / ${variant.size} </h3> <span${addAttribute(`text-sm px-2 py-1 rounded ${variant.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, "class")}>
Stock: ${variant.stock} </span> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3"> <div> <label class="text-xs text-primary-600 block mb-1">Stock</label> <input type="number"${addAttribute(variant.id, "data-variant-id")} data-field="stock"${addAttribute(variant.stock, "value")} class="w-full px-2 py-1 border border-primary-300 rounded text-sm"> </div> <div> <label class="text-xs text-primary-600 block mb-1">SKU</label> <input type="text"${addAttribute(variant.id, "data-variant-id")} data-field="sku"${addAttribute(variant.sku || "", "value")} class="w-full px-2 py-1 border border-primary-300 rounded text-sm"> </div> </div> <!-- Aquí iría el componente VariantImagesUploader --> <p class="text-sm text-primary-600 p-3 bg-primary-50 rounded">
🖼️ Sección de imágenes por variante (se carga en el navegador)
</p> </div>`)} </div> ${variants.length === 0 && renderTemplate`<p class="text-center text-primary-500 py-8">
Guarda el producto primero para crear variantes
</p>`} </div>`} <!-- Acciones --> <div class="flex gap-4"> <button type="submit" class="px-8 py-3 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"> ${isEditing ? "Guardar Cambios" : "Crear Producto"} </button> <a href="/admin/productos" class="px-8 py-3 border border-primary-300 text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors">
Cancelar
</a> </div> </form> </div> ${renderScript($$result2, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/productos/create-edit.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/productos/create-edit.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/productos/create-edit.astro";
const $$url = "/admin/productos/create-edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CreateEdit,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
