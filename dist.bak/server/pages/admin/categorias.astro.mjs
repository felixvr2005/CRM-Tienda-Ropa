/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../AdminLayout.7POnspUO.mjs';
import { s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categor\xEDas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <div class="flex items-center justify-between"> <div> <h1 class="text-2xl font-display">Categorías</h1> <p class="text-primary-500">Gestiona las categorías de productos</p> </div> <a href="/admin/categorias/nueva" class="bg-primary-900 text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-primary-800 transition-colors">
Nueva categoría
</a> </div> <div class="bg-white border border-primary-200 overflow-hidden"> <table class="w-full"> <thead class="bg-primary-50"> <tr> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Nombre</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Slug</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Estado</th> <th class="text-left text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Orden</th> <th class="text-right text-xs uppercase tracking-wider text-primary-500 px-6 py-4">Acciones</th> </tr> </thead> <tbody class="divide-y divide-primary-100"> ${categories && categories.length > 0 ? categories.map((category) => renderTemplate`<tr class="hover:bg-primary-50 transition-colors"> <td class="px-6 py-4"> <div class="flex items-center gap-3"> ${category.image_url && renderTemplate`<img${addAttribute(category.image_url, "src")}${addAttribute(category.name, "alt")} class="w-10 h-10 object-cover rounded">`} <span class="font-medium">${category.name}</span> </div> </td> <td class="px-6 py-4 text-sm text-primary-500 font-mono"> ${category.slug} </td> <td class="px-6 py-4"> <span${addAttribute(`inline-flex px-2 py-1 text-xs rounded-full ${category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, "class")}> ${category.is_active ? "Activa" : "Inactiva"} </span> </td> <td class="px-6 py-4 text-sm"> ${category.sort_order} </td> <td class="px-6 py-4 text-right space-x-3"> <a${addAttribute(`/admin/categorias/${category.id}`, "href")} class="text-primary-600 hover:text-primary-900 text-sm">
Editar
</a> <button${addAttribute(category.id, "data-delete-category")} class="text-red-600 hover:text-red-900 text-sm">
Eliminar
</button> </td> </tr>`) : renderTemplate`<tr> <td colspan="5" class="px-6 py-12 text-center text-primary-500">
No hay categorías todavía
</td> </tr>`} </tbody> </table> </div> </div> ` })} ${renderScript($$result, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/categorias/index.astro";
const $$url = "/admin/categorias";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
