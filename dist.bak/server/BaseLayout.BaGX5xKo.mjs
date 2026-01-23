import { e as createComponent, f as createAstro, r as renderTemplate, p as renderSlot, al as renderHead, h as addAttribute } from './astro/server._DgZez_d.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                      */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "Moda premium masculina. Descubre las \xFAltimas tendencias en ropa y accesorios.",
    image = "/images/og-image.jpg"
  } = Astro2.props;
  const siteUrl = Astro2.site || new URL("http://localhost:4321");
  const canonicalURL = new URL(Astro2.url.pathname, siteUrl);
  return renderTemplate(_a || (_a = __template(['<html lang="es" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="generator"', "><!-- SEO --><title>", ' | FASHION STORE</title><meta name="description"', '><link rel="canonical"', '><!-- Open Graph --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', '><!-- Fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg">', '</head> <body class="font-sans text-primary-900 antialiased"> ', " <script>\n  // Inicializar manejo de CSRF para formularios POST inmediatamente\n  function initFormHandler() {\n    document.addEventListener('submit', function(e) {\n      const form = e.target;\n      \n      // Interceptar formularios POST que NO sean a APIs\n      if (form.method && form.method.toUpperCase() === 'POST' && !form.action?.includes('/api/')) {\n        e.preventDefault();\n        \n        const formData = new FormData(form);\n        const data = {};\n        \n        // Convertir FormData a objeto\n        for (const [key, value] of formData.entries()) {\n          data[key] = value;\n        }\n        \n        console.log('[CSRF] Intercepting POST to:', form.action || window.location.pathname);\n        \n        fetch(form.action || window.location.pathname, {\n          method: 'POST',\n          headers: {\n            'Content-Type': 'application/json',\n            'X-Requested-With': 'XMLHttpRequest'\n          },\n          body: JSON.stringify(data)\n        }).then(response => {\n          if (response.ok) {\n            window.location.reload();\n          } else {\n            alert('Error: ' + response.statusText);\n          }\n        }).catch(error => {\n          alert('Error: ' + error.message);\n        });\n      }\n    }, true);\n  }\n  \n  // Ejecutar cuando el DOM est\xE9 listo\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', initFormHandler);\n  } else {\n    initFormHandler();\n  }\n<\/script> </body></html>"])), addAttribute(Astro2.generator, "content"), title, addAttribute(description, "content"), addAttribute(canonicalURL, "href"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(image, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(image, "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
