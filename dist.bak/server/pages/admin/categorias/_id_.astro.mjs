/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../AdminLayout.7POnspUO.mjs';
import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).single();
  if (!category) {
    return Astro2.redirect("/admin/categorias");
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Editar: ${category.name}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl"> <div class="mb-6"> <a href="/admin/categorias" class="text-primary-500 hover:text-primary-900 text-sm">
← Volver a categorías
</a> </div> <div class="bg-white border border-primary-200 p-6"> <h1 class="text-2xl font-display mb-6">Editar Categoría</h1> <form id="categoryForm" class="space-y-6"${addAttribute(category.id, "data-category-id")}> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Nombre *
</label> <input type="text" name="name" required${addAttribute(category.name, "value")} class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900"> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Slug *
</label> <input type="text" name="slug" required${addAttribute(category.slug, "value")} class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900 font-mono"> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Descripción
</label> <textarea name="description" rows="3" class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900">${category.description}</textarea> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
URL de imagen
</label> <input type="url" name="image_url"${addAttribute(category.image_url || "", "value")} class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900"> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">
Orden
</label> <input type="number" name="sort_order"${addAttribute(category.sort_order, "value")} class="w-full border border-primary-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-900"> </div> <div class="flex items-center gap-2"> <input type="checkbox" name="is_active" id="is_active"${addAttribute(category.is_active, "checked")} class="w-5 h-5 accent-primary-900"> <label for="is_active" class="text-sm">Categoría activa</label> </div> <div id="errorMessage" class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm hidden"></div> <div id="successMessage" class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm hidden"></div> <div class="flex gap-4"> <button type="submit" class="bg-primary-900 text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-primary-800 transition-colors">
Guardar cambios
</button> <a href="/admin/categorias" class="border border-primary-300 px-6 py-3 text-sm uppercase tracking-wider hover:border-primary-900 transition-colors">
Cancelar
</a> </div> </form> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/[id].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/[id].astro";
const $$url = "/admin/categorias/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
