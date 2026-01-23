/* empty css                                    */
import { e as createComponent, k as renderComponent, r as renderTemplate, h as addAttribute, m as maybeRenderHead } from '../../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../../AdminLayout.7POnspUO.mjs';
import { I as ImageUploader } from '../../../ImageUploader.Bt3K-Iku.mjs';
import { s as supabase } from '../../../supabase.41eewI-c.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Nuevo = createComponent(async ($$result, $$props, $$slots) => {
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Nuevo Producto" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="max-w-4xl"> <!-- Header --> <div class="flex items-center gap-4 mb-8"> <a href="/admin/productos" class="text-primary-500 hover:text-primary-900"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <h1 class="text-2xl font-display">Nuevo Producto</h1> </div> <form id="productForm" class="space-y-6"> <!-- Basic Info --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Informaci\xF3n b\xE1sica</h2> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nNombre *\n</label> <input type="text" name="name" required class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> <p class="text-xs text-primary-400 mt-1">El SKU se generar\xE1 autom\xE1ticamente</p> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nDescripci\xF3n\n</label> <textarea name="description" rows="4" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"></textarea> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nCategor\xEDa\n</label> <select name="category_id" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> <option value="">Sin categor\xEDa</option> ', ' </select> </div> </div> <!-- Pricing --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Precio</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nPrecio *\n</label> <div class="relative"> <input type="number" name="price" required step="0.01" min="0" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900 pr-8"> <span class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400">\u20AC</span> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nDescuento (%)\n</label> <input type="number" name="discount_percentage" min="0" max="100" value="0" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> </div> </div> </div> <!-- Images --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Im\xE1genes</h2> ', ` <textarea id="imagesInput" name="images" rows="3" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900" placeholder="Las im\xE1genes aparecer\xE1n aqu\xED autom\xE1ticamente"></textarea> </div> <!-- Status --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Estado</h2> <div class="flex flex-wrap gap-6"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_active" checked class="w-4 h-4"> <span class="text-sm">Activo</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_featured" class="w-4 h-4"> <span class="text-sm">Destacado</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_new" class="w-4 h-4"> <span class="text-sm">Nuevo</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_flash_offer" class="w-4 h-4"> <span class="text-sm">Oferta flash</span> </label> </div> </div> <!-- Variants --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <div class="flex items-center justify-between mb-4"> <h2 class="font-medium">Variantes</h2> <button type="button" onclick="window.addVariant()" class="text-sm text-primary-600 hover:text-primary-900">
+ A\xF1adir variante
</button> </div> <div id="variantsContainer" class="space-y-4"> <!-- Variantes se a\xF1aden aqu\xED din\xE1micamente --> </div> <p class="text-xs text-primary-500">
A\xF1ade tallas y colores con su stock disponible
</p> </div> <!-- Error message --> <div id="errorMessage" class="text-red-600 text-sm hidden"></div> <!-- Actions --> <div class="flex items-center gap-4"> <button type="submit" class="bg-primary-900 text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors">
Crear producto
</button> <a href="/admin/productos" class="text-primary-500 hover:text-primary-900 text-sm">
Cancelar
</a> </div> </form> </div> <script>
    let variantIndex = 0;
    
    // Exponer funciones globalmente
    window.addVariant = function() {
      const container = document.getElementById('variantsContainer');
      const variantHtml = \`
        <div class="flex items-center gap-4 p-4 border border-primary-200" data-variant="\${variantIndex}">
          <div class="flex-1">
            <label class="block text-xs text-primary-500 mb-1">Talla</label>
            <select name="variants[\${variantIndex}][size]" class="w-full border border-primary-300 px-3 py-1.5 text-sm">
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M" selected>M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-primary-500 mb-1">Color</label>
            <input type="text" name="variants[\${variantIndex}][color]" class="w-full border border-primary-300 px-3 py-1.5 text-sm" placeholder="Negro" />
          </div>
          <div class="w-24">
            <label class="block text-xs text-primary-500 mb-1">Stock</label>
            <input type="number" name="variants[\${variantIndex}][stock]" min="0" value="0" class="w-full border border-primary-300 px-3 py-1.5 text-sm" />
          </div>
          <button type="button" onclick="window.removeVariant(\${variantIndex})" class="text-red-600 hover:text-red-800 mt-5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      \`;
      container.insertAdjacentHTML('beforeend', variantHtml);
      variantIndex++;
    };
    
    window.removeVariant = function(index) {
      const variant = document.querySelector(\`[data-variant="\${index}"]\`);
      if (variant) variant.remove();
    };
    
    // Add initial variant
    window.addVariant();
    
    // Store uploaded images from ImageUploader
    window.uploadedImages = [];
    
    // Function to be called by ImageUploader component
    window.handleImagesUpload = function(images) {
      console.log('Images uploaded to component:', images);
      window.uploadedImages = images.map(img => img.secure_url);
      // Update textarea with uploaded image URLs
      const imagesInput = document.getElementById('imagesInput');
      if (imagesInput) {
        imagesInput.value = window.uploadedImages.join('\\n');
      }
    };
    
    // Form submission
    const form = document.getElementById('productForm');
    const errorDiv = document.getElementById('errorMessage');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      
      const formData = new FormData(form);
      
      // Obtener im\xE1genes del textarea (que se actualiza autom\xE1ticamente por ImageUploader)
      const imagesTextarea = document.getElementById('imagesInput');
      let images = [];
      
      if (imagesTextarea && imagesTextarea.value.trim()) {
        images = imagesTextarea.value
          .split('\\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }
      
      console.log('Images from textarea:', images);
      
      // Parse form data
      const product = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        category_id: formData.get('category_id') || null,
        price: parseFloat(formData.get('price')),
        discount_percentage: parseInt(formData.get('discount_percentage')) || 0,
        ...(images.length > 0 && { images }),
        is_active: formData.get('is_active') === 'on',
        is_featured: formData.get('is_featured') === 'on',
        is_new: formData.get('is_new') === 'on',
        is_flash_offer: formData.get('is_flash_offer') === 'on',
      };
      
      // Parse variants
      const variants = [];
      const variantElements = document.querySelectorAll('[data-variant]');
      variantElements.forEach((el, i) => {
        const size = el.querySelector(\`[name*="[size]"]\`).value;
        const color = el.querySelector(\`[name*="[color]"]\`).value || '';
        const stock = parseInt(el.querySelector(\`[name*="[stock]"]\`).value) || 0;
        if (size) {
          variants.push({ size, color, stock });
        }
      });
      
      try {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product, variants }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.href = '/admin/productos';
        } else {
          errorDiv.textContent = data.error || 'Error al crear el producto';
          errorDiv.classList.remove('hidden');
        }
      } catch (error) {
        errorDiv.textContent = 'Error de conexi\xF3n';
        errorDiv.classList.remove('hidden');
      }
    });
  <\/script> `], [" ", '<div class="max-w-4xl"> <!-- Header --> <div class="flex items-center gap-4 mb-8"> <a href="/admin/productos" class="text-primary-500 hover:text-primary-900"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </a> <h1 class="text-2xl font-display">Nuevo Producto</h1> </div> <form id="productForm" class="space-y-6"> <!-- Basic Info --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Informaci\xF3n b\xE1sica</h2> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nNombre *\n</label> <input type="text" name="name" required class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> <p class="text-xs text-primary-400 mt-1">El SKU se generar\xE1 autom\xE1ticamente</p> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nDescripci\xF3n\n</label> <textarea name="description" rows="4" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"></textarea> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nCategor\xEDa\n</label> <select name="category_id" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> <option value="">Sin categor\xEDa</option> ', ' </select> </div> </div> <!-- Pricing --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Precio</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nPrecio *\n</label> <div class="relative"> <input type="number" name="price" required step="0.01" min="0" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900 pr-8"> <span class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400">\u20AC</span> </div> </div> <div> <label class="block text-xs uppercase tracking-wider text-primary-500 mb-2">\nDescuento (%)\n</label> <input type="number" name="discount_percentage" min="0" max="100" value="0" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900"> </div> </div> </div> <!-- Images --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Im\xE1genes</h2> ', ` <textarea id="imagesInput" name="images" rows="3" class="w-full border border-primary-300 px-4 py-2 text-sm focus:outline-none focus:border-primary-900" placeholder="Las im\xE1genes aparecer\xE1n aqu\xED autom\xE1ticamente"></textarea> </div> <!-- Status --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <h2 class="font-medium mb-4">Estado</h2> <div class="flex flex-wrap gap-6"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_active" checked class="w-4 h-4"> <span class="text-sm">Activo</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_featured" class="w-4 h-4"> <span class="text-sm">Destacado</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_new" class="w-4 h-4"> <span class="text-sm">Nuevo</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" name="is_flash_offer" class="w-4 h-4"> <span class="text-sm">Oferta flash</span> </label> </div> </div> <!-- Variants --> <div class="bg-white border border-primary-200 p-6 space-y-4"> <div class="flex items-center justify-between mb-4"> <h2 class="font-medium">Variantes</h2> <button type="button" onclick="window.addVariant()" class="text-sm text-primary-600 hover:text-primary-900">
+ A\xF1adir variante
</button> </div> <div id="variantsContainer" class="space-y-4"> <!-- Variantes se a\xF1aden aqu\xED din\xE1micamente --> </div> <p class="text-xs text-primary-500">
A\xF1ade tallas y colores con su stock disponible
</p> </div> <!-- Error message --> <div id="errorMessage" class="text-red-600 text-sm hidden"></div> <!-- Actions --> <div class="flex items-center gap-4"> <button type="submit" class="bg-primary-900 text-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-primary-800 transition-colors">
Crear producto
</button> <a href="/admin/productos" class="text-primary-500 hover:text-primary-900 text-sm">
Cancelar
</a> </div> </form> </div> <script>
    let variantIndex = 0;
    
    // Exponer funciones globalmente
    window.addVariant = function() {
      const container = document.getElementById('variantsContainer');
      const variantHtml = \\\`
        <div class="flex items-center gap-4 p-4 border border-primary-200" data-variant="\\\${variantIndex}">
          <div class="flex-1">
            <label class="block text-xs text-primary-500 mb-1">Talla</label>
            <select name="variants[\\\${variantIndex}][size]" class="w-full border border-primary-300 px-3 py-1.5 text-sm">
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M" selected>M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-primary-500 mb-1">Color</label>
            <input type="text" name="variants[\\\${variantIndex}][color]" class="w-full border border-primary-300 px-3 py-1.5 text-sm" placeholder="Negro" />
          </div>
          <div class="w-24">
            <label class="block text-xs text-primary-500 mb-1">Stock</label>
            <input type="number" name="variants[\\\${variantIndex}][stock]" min="0" value="0" class="w-full border border-primary-300 px-3 py-1.5 text-sm" />
          </div>
          <button type="button" onclick="window.removeVariant(\\\${variantIndex})" class="text-red-600 hover:text-red-800 mt-5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      \\\`;
      container.insertAdjacentHTML('beforeend', variantHtml);
      variantIndex++;
    };
    
    window.removeVariant = function(index) {
      const variant = document.querySelector(\\\`[data-variant="\\\${index}"]\\\`);
      if (variant) variant.remove();
    };
    
    // Add initial variant
    window.addVariant();
    
    // Store uploaded images from ImageUploader
    window.uploadedImages = [];
    
    // Function to be called by ImageUploader component
    window.handleImagesUpload = function(images) {
      console.log('Images uploaded to component:', images);
      window.uploadedImages = images.map(img => img.secure_url);
      // Update textarea with uploaded image URLs
      const imagesInput = document.getElementById('imagesInput');
      if (imagesInput) {
        imagesInput.value = window.uploadedImages.join('\\\\n');
      }
    };
    
    // Form submission
    const form = document.getElementById('productForm');
    const errorDiv = document.getElementById('errorMessage');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      
      const formData = new FormData(form);
      
      // Obtener im\xE1genes del textarea (que se actualiza autom\xE1ticamente por ImageUploader)
      const imagesTextarea = document.getElementById('imagesInput');
      let images = [];
      
      if (imagesTextarea && imagesTextarea.value.trim()) {
        images = imagesTextarea.value
          .split('\\\\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }
      
      console.log('Images from textarea:', images);
      
      // Parse form data
      const product = {
        name: formData.get('name'),
        description: formData.get('description') || null,
        category_id: formData.get('category_id') || null,
        price: parseFloat(formData.get('price')),
        discount_percentage: parseInt(formData.get('discount_percentage')) || 0,
        ...(images.length > 0 && { images }),
        is_active: formData.get('is_active') === 'on',
        is_featured: formData.get('is_featured') === 'on',
        is_new: formData.get('is_new') === 'on',
        is_flash_offer: formData.get('is_flash_offer') === 'on',
      };
      
      // Parse variants
      const variants = [];
      const variantElements = document.querySelectorAll('[data-variant]');
      variantElements.forEach((el, i) => {
        const size = el.querySelector(\\\`[name*="[size]"]\\\`).value;
        const color = el.querySelector(\\\`[name*="[color]"]\\\`).value || '';
        const stock = parseInt(el.querySelector(\\\`[name*="[stock]"]\\\`).value) || 0;
        if (size) {
          variants.push({ size, color, stock });
        }
      });
      
      try {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product, variants }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.href = '/admin/productos';
        } else {
          errorDiv.textContent = data.error || 'Error al crear el producto';
          errorDiv.classList.remove('hidden');
        }
      } catch (error) {
        errorDiv.textContent = 'Error de conexi\xF3n';
        errorDiv.classList.remove('hidden');
      }
    });
  <\/script> `])), maybeRenderHead(), categories?.map((cat) => renderTemplate`<option${addAttribute(cat.id, "value")}>${cat.name}</option>`), renderComponent($$result2, "ImageUploader", ImageUploader, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@components/islands/ImageUploader", "client:component-export": "default" })) })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/productos/nuevo.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/admin/productos/nuevo.astro";
const $$url = "/admin/productos/nuevo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Nuevo,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
