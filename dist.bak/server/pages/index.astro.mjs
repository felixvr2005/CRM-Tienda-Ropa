/* empty css                              */
import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, p as renderSlot, r as renderTemplate, k as renderComponent } from '../astro/server._DgZez_d.mjs';
import 'piccolore';
import { a as $$PublicLayout } from '../PublicLayout.D3A_txxX.mjs';
import { $ as $$ProductCard } from '../ProductCard.CWUmvDiI.mjs';
import 'clsx';
import { h as getFeaturedProducts, b as getCategories, i as getFlashOffers } from '../supabase.41eewI-c.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Button;
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    href,
    type = "button",
    disabled = false,
    class: className = ""
  } = Astro2.props;
  const baseStyles = "inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary-900 text-white hover:bg-primary-800 active:bg-primary-950",
    secondary: "bg-white text-primary-900 border border-primary-900 hover:bg-primary-900 hover:text-white",
    outline: "bg-transparent text-primary-900 border border-primary-300 hover:border-primary-900",
    ghost: "bg-transparent text-primary-900 hover:bg-primary-100"
  };
  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-sm px-8 py-4"
  };
  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  ].filter(Boolean).join(" ");
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(classes, "class")}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(type, "type")}${addAttribute(disabled, "disabled")}${addAttribute(classes, "class")}>${renderSlot($$result, $$slots["default"])}</button>`}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/components/ui/Button.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$NewsletterModal = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$NewsletterModal;
  const { id = "newsletterModal", showOnLoad = true } = Astro2.props;
  return renderTemplate(_a || (_a = __template(["", `<script is:client>
  function setupNewsletterModal() {
    const modal = document.getElementById('newsletterModal');
    const form = document.getElementById('newsletterForm');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const spinner = document.getElementById('loadingSpinner');
    const codeContainer = document.getElementById('discountCodeContainer');
    const discountCode = document.getElementById('discountCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const closeBtn = document.getElementById('closeNewsletterBtn');

    if (!modal || !form) {
      console.error('Newsletter modal elements not found');
      return;
    }

    console.log('\u2705 Newsletter modal setup started (solo clientes nuevos/visitantes)');

    // Mostrar modal despu\xE9s de 2 segundos
    setTimeout(() => {
      modal.classList.remove('hidden');
      console.log('\u2705 Newsletter modal shown after 2s');
    }, 2000);

    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        console.log('Closed newsletter modal (click outside)');
      }
    });

    // Bot\xF3n cerrar
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.add('hidden');
        console.log('Closed newsletter modal (close button)');
      });
    }

    // Submit formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[name="email"]');
      const email = emailInput ? emailInput.value : '';
      
      if (!email) {
        alert('Por favor ingresa un email v\xE1lido');
        return;
      }

      if (subscribeBtn) subscribeBtn.disabled = true;
      if (spinner) spinner.classList.remove('hidden');

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          form.classList.add('hidden');
          if (spinner) spinner.classList.add('hidden');
          if (codeContainer) codeContainer.classList.remove('hidden');
          if (discountCode) discountCode.textContent = data.code || 'WELCOME20';
          console.log('\u2705 Newsletter subscription successful, email sent');

          // Bot\xF3n copiar c\xF3digo
          if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
              const code = discountCode ? discountCode.textContent : '';
              if (code && navigator.clipboard) {
                navigator.clipboard.writeText(code).then(() => {
                  alert('C\xF3digo copiado al portapapeles');
                });
              }
            });
          }
        } else {
          if (spinner) spinner.classList.add('hidden');
          alert(data.message || 'Error al suscribirse');
          if (subscribeBtn) subscribeBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        if (spinner) spinner.classList.add('hidden');
        alert('Error al suscribirse');
        if (subscribeBtn) subscribeBtn.disabled = false;
      }
    });
  }

  // Ejecutar cuando el DOM est\xE9 listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNewsletterModal);
  } else {
    setupNewsletterModal();
  }

  // Tambi\xE9n ejecutar cuando hay navegaci\xF3n (Astro View Transitions)
  document.addEventListener('astro:page-load', setupNewsletterModal);
<\/script>`])), renderTemplate`${maybeRenderHead()}<div${addAttribute(id, "id")} class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div class="bg-white rounded-lg max-w-md w-full mx-4 p-8 shadow-xl relative"><!-- Botón cerrar --><button id="closeNewsletterBtn" class="absolute top-4 right-4 text-primary-500 hover:text-primary-900 transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><!-- Contenido --><div class="text-center mb-6"><div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4"><svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg></div><h2 class="text-2xl font-display font-medium mb-2">¡Bienvenido!</h2><p class="text-primary-600 text-sm">
Suscríbete a nuestro newsletter y obtén un código de descuento exclusivo
</p></div><form id="newsletterForm" class="space-y-4"><div><input type="email" name="email" placeholder="Tu correo electrónico" required class="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"></div><div class="flex items-center gap-2"><input type="checkbox" id="terms" name="terms" required class="w-4 h-4 rounded border-primary-300 cursor-pointer"><label for="terms" class="text-xs text-primary-600 cursor-pointer flex-1">
Acepto recibir promociones y actualizaciones por correo electrónico
</label></div><button type="submit" class="w-full bg-primary-900 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors font-medium text-sm" id="subscribeBtn">
Obtener mi código descuento
</button></form><!-- Código descuento generado --><div id="discountCodeContainer" class="hidden text-center mt-6 pt-6 border-t border-primary-200"><p class="text-sm text-primary-600 mb-2">Tu código de descuento:</p><div class="bg-primary-100 p-4 rounded-lg mb-4"><code id="discountCode" class="text-2xl font-bold text-primary-900">WELCOME20</code></div><button id="copyCodeBtn" class="w-full bg-primary-100 text-primary-900 py-2 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium">
Copiar código
</button><p class="text-xs text-primary-500 mt-3">
Este código te da un <strong>20% de descuento</strong> en tu próxima compra. No caduca.
</p><p class="text-xs text-primary-500 mt-2">
✅ Un correo de confirmación ha sido enviado a tu cuenta
</p></div><!-- Spinner --><div id="loadingSpinner" class="hidden text-center"><div class="inline-block animate-spin"><svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div></div></div></div>`);
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/components/NewsletterModal.astro", void 0);

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const featuredProducts = await getFeaturedProducts();
  await getCategories();
  const flashOffers = await getFlashOffers();
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "Inicio" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative h-[85vh] min-h-[600px] overflow-hidden"> <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&q=80" alt="Nueva Colección" class="absolute inset-0 w-full h-full object-cover"> <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div> <div class="relative h-full max-w-[1800px] mx-auto px-4 lg:px-8 flex items-center"> <div class="max-w-xl"> <p class="text-white/80 text-sm tracking-[0.3em] uppercase mb-4 animate-fade-in">
Nueva temporada
</p> <h1 class="font-display text-display-lg md:text-display-xl text-white mb-6 animate-slide-up">
Colección<br>Primavera 2026
</h1> <p class="text-white/90 text-lg mb-8 animate-slide-up" style="animation-delay: 100ms">
Descubre las últimas tendencias en moda masculina premium
</p> <div class="flex gap-4 animate-slide-up" style="animation-delay: 200ms"> ${renderComponent($$result2, "Button", $$Button, { "href": "/productos", "variant": "secondary", "size": "lg" }, { "default": async ($$result3) => renderTemplate`
Ver colección
` })} </div> </div> </div> </section>  <section class="max-w-[1800px] mx-auto px-4 lg:px-8 py-16"> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> <a href="/categoria/camisas" class="group relative aspect-[4/5] overflow-hidden bg-primary-100"> <img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80" alt="Camisas" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"> <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div> <div class="absolute bottom-8 left-8"> <h3 class="font-display text-2xl text-white mb-2">Camisas</h3> <span class="text-white/90 text-sm tracking-wider uppercase border-b border-white/50 pb-1 group-hover:border-white transition-colors">
Ver todo
</span> </div> </a> <a href="/categoria/pantalones" class="group relative aspect-[4/5] overflow-hidden bg-primary-100"> <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80" alt="Pantalones" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"> <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div> <div class="absolute bottom-8 left-8"> <h3 class="font-display text-2xl text-white mb-2">Pantalones</h3> <span class="text-white/90 text-sm tracking-wider uppercase border-b border-white/50 pb-1 group-hover:border-white transition-colors">
Ver todo
</span> </div> </a> <a href="/categoria/accesorios" class="group relative aspect-[4/5] overflow-hidden bg-primary-100"> <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" alt="Accesorios" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"> <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div> <div class="absolute bottom-8 left-8"> <h3 class="font-display text-2xl text-white mb-2">Accesorios</h3> <span class="text-white/90 text-sm tracking-wider uppercase border-b border-white/50 pb-1 group-hover:border-white transition-colors">
Ver todo
</span> </div> </a> </div> </section>  ${flashOffers.length > 0 && renderTemplate`<section class="bg-primary-950 py-16"> <div class="max-w-[1800px] mx-auto px-4 lg:px-8"> <div class="flex items-center justify-between mb-8"> <div> <span class="text-red-500 text-sm tracking-widest uppercase mb-2 block">⚡ Tiempo limitado</span> <h2 class="font-display text-3xl text-white">Ofertas Flash</h2> </div> ${renderComponent($$result2, "Button", $$Button, { "href": "/categoria/ofertas", "variant": "outline", "class": "border-white text-white hover:bg-white hover:text-primary-900" }, { "default": async ($$result3) => renderTemplate`
Ver todas
` })} </div> <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"> ${flashOffers.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product })}`)} </div> </div> </section>`} <section class="max-w-[1800px] mx-auto px-4 lg:px-8 py-16"> <div class="flex items-center justify-between mb-8"> <h2 class="font-display text-3xl">Lo más vendido</h2> ${renderComponent($$result2, "Button", $$Button, { "href": "/productos", "variant": "ghost" }, { "default": async ($$result3) => renderTemplate`
Ver todo →
` })} </div> <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"> ${featuredProducts.map((product) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": product, "showQuickAdd": true })}`)} </div> </section>  <section class="relative py-24 overflow-hidden"> <div class="absolute inset-0 bg-primary-100"></div> <div class="relative max-w-[1800px] mx-auto px-4 lg:px-8 text-center"> <h2 class="font-display text-4xl md:text-5xl mb-6">Calidad sin compromiso</h2> <p class="text-primary-600 max-w-2xl mx-auto mb-8 text-lg">
Cada prenda está diseñada con los mejores materiales y fabricada con atención al detalle. 
        Porque creemos que la verdadera elegancia está en la calidad.
</p> ${renderComponent($$result2, "Button", $$Button, { "href": "/productos", "variant": "secondary" }, { "default": async ($$result3) => renderTemplate`
Descubrir más
` })} </div> </section>  <section class="max-w-[1800px] mx-auto px-4 lg:px-8 py-16"> <h2 class="font-display text-3xl text-center mb-8">@fashionstore</h2> <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2"> ${[1, 2, 3, 4, 5, 6].map((i) => renderTemplate`<a href="#" class="aspect-square overflow-hidden bg-primary-100 group"> <img${addAttribute(`https://images.unsplash.com/photo-${16e11 + i * 1e5}?w=400&q=80`, "src")}${addAttribute(`Instagram post ${i}`, "alt")} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'"> </a>`)} </div> </section> ` })} ${renderComponent($$result, "NewsletterModal", $$NewsletterModal, {})}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/index.astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
