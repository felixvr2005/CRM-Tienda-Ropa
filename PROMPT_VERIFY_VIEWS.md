# PROMPT: Verificación de Vistas (Pages) — FashionStore

**Fecha:** 2026-02-02
**Destino:** Claude (modo "verifier")

---

## 1) Objetivo
Generar un documento que liste todas las vistas (páginas) del proyecto, describa las verificaciones necesarias por vista (render, datos, forms, permisos), proponga tests automatizados (unit/e2e) y entregue un prompt operativo para que Claude ejecute la verificación, reporte fallos y genere PRs con fixes y tests.

---

## 2) Alcance: páginas detectadas (Resumen)
Estas vistas están en `src/pages/` y subcarpetas. Verificar que cada ruta exista y cargue correctamente (SSR/SSG o client):

- Home: `src/pages/index.astro`
- Categorías: `src/pages/categoria/[slug].astro`, `src/pages/categoria/novedades.astro`, `src/pages/categoria/ofertas.astro`
- Productos listing: `src/pages/productos/index.astro`
- Producto detail: `src/pages/productos/[slug].astro`
- Carrito: `src/pages/carrito.astro`
- Checkout: `src/pages/checkout/index.astro`, `src/pages/checkout/success.astro`
- Cuenta (customer): `src/pages/cuenta/index.astro`, `registro.astro`, `login.astro`, `cambiar-contraseña.astro`, `nueva-password.astro`, `direcciones.astro`, `pedidos/*`, `favoritos.astro`, `perfil.astro`, `devoluciones.astro`
- Admin: `src/pages/admin/index.astro`, `src/pages/admin/login.astro`, `src/pages/admin/productos/*` (index, create-edit, [id]), `src/pages/admin/pedidos/*`, `src/pages/admin/devoluciones/*`, `src/pages/admin/categorias/*`, `src/pages/admin/settings.astro`, `src/pages/admin/analytics/*`
- Legal & info: `src/pages/terminos.astro`, `src/pages/privacidad.astro`, `src/pages/envios.astro`, `src/pages/contacto.astro`, `src/pages/sobre-nosotros.astro`, `src/pages/unsubscribe.astro`
- Newsletter / misc: `src/components/NewsletterModal.astro` (modal used on home)

> Nota: además revisar `src/components/*` que proveen UI embebida en vistas (ProductViewer, CartContent, LiveSearch, etc.).

---

## 3) Checklist de verificación (por página)
Para cada vista, ejecutar las siguientes comprobaciones (aceptance criteria):

1. RENDERS
   - La ruta responde con HTTP 200 en entornos SSG/SSR (cuando aplica).
   - No hay errores en consola ni excepciones servidor-side al cargar la página.

2. DATOS
   - Data fetchs usados en la página (ej. `getProducts`, `getProductBySlug`, `supabase` queries) devuelven datos correctos y se muestran.
   - Estado de error manejado (mostrar error state y botón retry).
   - Empty states presentes y amigables.

3. INTERACCIONES / FORMULARIOS
   - Todos los forms tienen validación (client + server) y mensajes de error claros.
   - Botones importantes (submit, cancelar, enlaces principales) funcionan y tienen aria-labels cuando corresponde.
   - Confirmaciones (e.g., delete product, cancel order) muestran modal de confirm y previenen acción accidental.

4. AUTENTICACIÓN Y PERMISOS
   - Rutas protegidas requieren sesión (ej. `/cuenta`, `/checkout` según config).
   - Admin pages validan `admin_users` (no dejar acceso a cualquier usuario autenticado).

5. ACCESSIBILIDAD (a11y)
   - Inputs y botones tienen labels/aria.
   - Focus states visibles; navegación con teclado posible.
   - Contraste de color mínimo AA.

6. E2E FLOW SÍNTETICO
   - End-to-end tests para flujos clave: add-to-cart, checkout (guest & logged), login/register, admin login + view protected pages, product create/edit flow in admin.

7. PERFORMANCE / IMAGENES
   - Lazy loading en listas (product images) y placeholders en fallbacks.

---

## 4) Pruebas automáticas sugeridas
- Unit tests:
  - Data fetch helpers (`src/lib/supabase.ts`): simulate success/error and ensure page handles each state.
  - Stores (`src/stores/cart.ts`): addToCart, updateQuantity, clearCart, expiration timer.
- Integration tests (Playwright):
  - Home loads and Newsletter modal shows (and subscribe form works).
  - Product list loads, filter applies, product detail opens and variant selector works.
  - Cart workflow: add item, open cart, update qty, go to checkout, simulate payment flow (mock stripe), check order created.
  - Account flows: register, login, view orders, add address.
  - Admin flows (with seeded admin user): login admin, create product, upload images, create variant, check product visible in public listing.
- API tests:
  - `/api/stock/reserve` and `/api/stock/release` (concurrency test: reserve more than stock). Ensure server returns proper errors.
  - `/api/newsletter/subscribe` returns 200 and stores email.

---

## 5) Defectos comunes a buscar (heurísticos)
- Campos required no marcados o con checks JS faltantes.
- `alert()` o `console.error` usados como UX fallback.
- Formularios que no previenen doble submit (debounce/disabled state).
- Links internos que devuelven 404 (ej. dynamic slug mismatch).
- Server-side exceptions swallowed and no user feedback.

---

## 6) Prompt listo para Claude (verificación y fixes)

```
You are CLAUDE (Verifier mode). Repo: c:/Users/Felix/Desktop/CRM-Tienda Ropa.
Task: Verify that *all* views (pages) exist, load properly, and pass a checklist of render, data fetch, forms, permissions, and accessibility. For each failing check: create a PR that fixes the issue, add tests, and provide a short changelog.

Steps:
1) Enumerate all pages in `src/pages` (including nested admin paths) and output a table: route, file path, SSR/SSG, data endpoints used.
2) For each page run automated checks (prefer Playwright or headless server-side render tests): render success (200), main data present, error states displayed when backend returns error, forms validated, auth enforced for protected pages, and a11y quick checks.
3) Report: list of pages passing, failing (with exact failure reasons and file lines), and tests to add.
4) Create PRs for fixes in small batches (one PR per group of pages or per failure type). Each PR must contain:
   - Code fix
   - Test that fails before change and passes after change
   - One-line changelog and instructions to run the tests
   - Branch name: `claude/verify-views-{area}`

Constraints:
- Do not change production keys/secrets.
- Do not alter DB schema unless strictly necessary; propose migration files separately.
- Keep changes minimal and focused per PR.

Return:
- A STEP-BY-STEP plan for the first 5 failing pages to fix (file diffs, tests, commands). Then implement the first PR and show CI results.
```

---

## 7) Entregables esperados
- `DOCS/VIEWS_REPORT.md` generated by Claude with the pass/fail matrix and logs.
- Playwright test suite under `e2e/` or `playwright/` covering flows above.
- For every failing page: PR with fix + test + short description.

---

¿Deseas que comience con un escaneo inicial y genere el informe `DOCS/VIEWS_REPORT.md` y el primer PR con los fixes prioritarios (ej. checkout errors o admin page permisos)?

*Archivo generado por: GitHub Copilot.*
