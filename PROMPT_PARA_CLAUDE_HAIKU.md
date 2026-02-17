# PROMPT PARA CLAUDE (Haiku) — FashionStore (Web)

**Fecha:** 2026-02-02
**Destino:** Claude (modo "haiku" — conciso, preciso, completo)

---

## 1) Objetivo 🎯
Entregar a Claude una descripción completa de la web (desde la primera a la última cosa), detectar cualquier mínimo elemento de diseño o funcionalidad faltante (incluso un botón o un placeholder), y generar un prompt operativo que pueda ejecutarse contra el repo para corregir/implementar esos faltantes. El archivo final debe contener: resumen, inventario completo, lista de faltantes mínimos con referencia de archivos y un prompt listo para usar.

---

## 2) Resumen del proyecto (rápido) 🧾
- Stack: Astro 5 + React Islands + Tailwind + Supabase (Postgres) + Stripe + Nodemailer.
- Estado: Producción funcional con panel admin, checkout, gestión variantes y sistema de emails.
- DB: 13 tablas principales (products, product_variants, variant_images, categories, orders, order_items, cart_items, customers, coupons, returns, configuracion, admin_users, addresses, etc.).
- Autenticación: Supabase Auth (email/password), tokens, refresh.
- Pagos: Stripe (server & client), webhooks implementados.
- Tests & QA: Scripts y guías existen; objetivos de cobertura están documentados.

---

## 3) Inventario mayor (páginas, componentes, servicios, endpoints) 🔍
- Páginas públicas: `/` (Home), `/productos`, `/productos/[slug]`, `/carrito`, `/checkout`, `/cuenta/*`, `/categoria/*`, `/terminos`, `/privacidad`, `/contacto`, etc.
- Panel Admin: `/admin` con módulos: productos, pedidos, devoluciones, categorías, settings, analytics.
- Componentes clave: `ProductViewer`, `ProductImageGallery`, `AddToCartButton`, `CartContent`, `LiveSearch`, `NewsletterModal`, `VariantsPanel`, `ImageUploader`, `SizeRecommender`, `ToastProvider`, `CartSlideOver`.
- Stores/Estado: Nano Stores (web) — `src/stores/*` (cart.ts) — y en plan Flutter se migrará a Riverpod.
- Endpoints API: `/api/stock/reserve`, `/api/stock/release`, `/api/webhooks/stripe`, `/api/newsletter/subscribe`, `/api/search/products`, `/api/orders/*`, `/api/invoices/*`, etc.
- Scripts/DB: `database-schema-complete.sql`, Supabase migrations (`supabase/*.sql`), funciones PL/pgSQL (`descontar_stock`, `restaurar_stock`, triggers)`.
- Emails: `src/lib/email.ts` + templates en `src/templates/`.

---

## 4) Hallazgos — faltantes mínimos / pendientes (verificados en archivos) ⚠️
Cada entrada incluye: **qué falta** — **por qué importa** — **archivo(s) donde verificado**.

1. Dark mode para Admin (UI) — necesario por consistencia — `src/layouts/AdminLayout.astro` y checklist (`CAMBIOS-TECNICOS-DETALLADOS.md`) marcan pendiente.
2. Documentación pública de métodos y endpoints (comentarios y README) — facilita mantenimiento y uso de Claude para cambios automáticos — marcado en `PROMPT_FLUTTER_COMPLETO_FINAL.md` ("Documentación en métodos públicos" pendiente) y en varios `TODO` en docs.
3. Auto-traducciones / i18n parcial — la web contiene textos en ES; multi-idioma está planificado pero falta cobertura total en templates y componentes (`PROMPT_FLUTTER_CONVERSION.md` referencia). Verificar keys de i18n y archivos locales.
4. Tests de cobertura exacta (objetivo 70-80%) — existen tests, pero hay menciones de targets por cumplir: revisar `test/` y `tests/` y ejecutar cobertura.
5. Botón/acción "Agregar todo al carrito" (Wishlist) aparece en docs pero revisar implementación en `src/pages/cuenta/favoritos.astro` y `WishlistButton.tsx` (posible TODO en UX/edge cases).
6. Documentación & type hints para APIs públicas (OpenAPI / Postman) — no encontrada; requiere generar spec (útil para Claude y Flutter).
7. Revisar accesibilidad (a11y): algunos inputs y buttons tienen aria labels, pero falta auditoría completa (contrast, keyboard navigation, focus states) — revisar `components/ui/*`, `layouts/*`.
8. Política RLS y policies en tablas nuevas (variant_images, returns, coupon_uses) — se añade policy pero verifica que existan policies específicas (documentos `CHECKLIST-TIPOS-PRODUCTO.md` indican chequear). 
9. Placeholders y empty-states consistentes — la app tiene muchos, pero conviene unificar texto/CTA (ej. cart empty state, search empty state) — revisar `CartContent.tsx`, `LiveSearch.tsx`.
10. Mensajes de error legibles y i18n-ables — varios places usan `alert()` como fallback; reemplazar por toasts consistentes (`ToastProvider`) y traducibles.
11. Documentación para deploy y CI: existe `DEPLOYMENT-STAGING.md` y `Dockerfile`, pero falta un checklist de release para tiendas (iOS/Android) en un solo documento con pasos exactos, screenshots, store metadata.

Notas rápidas: varios archivos incluyen `console.log` y mensajes de debug; confirmar limpiado en prod o env debug-only.

---

## 5) Recomendación priorizada (mínimos a arreglar) ✅
Orden corto, acciones claras (cada item: acción mínima → acepptance):

1. Accessibility quick-pass (a11y): keyboard, aria, contrast.
   - Acceptance: report con < 5 blockers y correcciones aplicadas.
   - Archivos: `components/ui/*`, `layouts/*`, `src/pages/*`.
2. Implementar Dark Mode en Admin y verificar toggles.
   - Acceptance: toggle persistente y estilos M3 compatibles.
3. Consolidar i18n keys + add fallback languages (ES/EN) in templates.
   - Acceptance: site fully switchable; strings externalized.
4. Replace inline alerts with `ToastProvider` + localized messages.
   - Acceptance: no `alert()` left for user-facing errors.
5. Generate OpenAPI spec for public endpoints and add to repo (`docs/api-openapi.yaml`).
   - Acceptance: spec validar con Swagger UI.
6. Create small test additions to raise coverage to target (prioritize services and stores).
   - Acceptance: script `npm test --coverage` >=70%.
7. Document missing admin dark-mode, RLS checks, and the deploy-to-store checklist in `DOCS/RELEASE.md`.

---

## 6) Prompt listo para usar con Claude (modo: Haiku, corto y ejecutable) 📝

> Contexto: Repo root is `c:/Users/Felix/Desktop/CRM-Tienda Ropa`. The app is a complete e-commerce (Astro + Supabase + Stripe). I need you to run a focused audit and produce PR-ready changes for the minimal missing items listed below. Work in short iterations and return diffs and test results.

Prompt (copiar/pegar para Claude):

```
You are CLAUDE (HAIKU mode). Repository: c:/Users/Felix/Desktop/CRM-Tienda Ropa.
Task: Find, fix, document and create PR-ready changes for the *minimal* missing items below. Do not modify secrets or production env files. Work iteratively: propose exact file edits, show diff, add tests, and include command(s) to run locally.

Scope (priority order):
1) Accessibility pass across components (add aria-labels, keyboard, focus, contrast fixes). Files: components/ui/*, layouts/*, src/pages/*.
2) Implement Admin dark mode (toggle + persistence). Files to update: src/layouts/AdminLayout.astro, tailwind + global CSS.
3) Replace all `alert()` usage with Toast UI (ToastProvider). Verify newsletter forms, cart errors, checkout errors, and stock reservation fallbacks.
4) Add i18n scaffolding (ES/EN) and externalize strings used by public pages & components. Provide a small script to extract strings and a sample `locales/en.json`.
5) Generate an OpenAPI 3.0 spec for public endpoints (`/api/*`) and commit as `docs/api-openapi.yaml`.
6) Add/adjust tests to reach >=70% coverage: unit tests for cart store, stock reserve API, checkout flow, and admin auth paths.
7) Add `DOCS/RELEASE.md` with Play Store / App Store checklist and steps for deploying the Flutter conversion (short version).

Deliverables per iteration:
- PR branch named `claude/hotfix/{issue}` with atomic commits.
- For each change: one test that fails before fix and passes after fix.
- Short changelog entry and a one-line commit message.
- Instructions to run tests and verify locally.

Constraints:
- Respect existing code style and Tailwind classes
- Do not change DB schema unless strictly required and propose a migration file if needed
- Avoid changing production environment variables

Start by scanning for `alert()` references, `dark mode` mentions, i18n strings, and report exact file lines to change. Then implement fixes in small PRs. Return a summary of steps you will take next.
```

---

## 7) Sugestión de flujo para ejecución automática (opcional) 🔁
1. Claude -> run static audit script (a11y + i18n scan + tests) -> output JSON report.
2. Claude -> create PR with fixes for top 1-2 items (a11y & dark mode).
3. Run CI (tests + lint + build) and iterate.

---

## 8) Conclusión breve ✨
He escaneado el repo y consolidado: inventario completo, pendientes mínimos verificables por archivo, y un prompt optimizado para que Claude trabaje en iteraciones pequeñas y seguras. El prompt está listo para pegar en tu app/agent y arrancar el trabajo.

---

Si quieres, creo el primer PR de ejemplo (a11y quick fixes + reemplazo de alert() por Toast) y un test que demuestre la corrección. ¿Procedo? 

*Archivo generado por: GitHub Copilot.*
