# PROMPT: Admin, Consultas y RLS — FashionStore

**Fecha:** 2026-02-02
**Destino:** Claude (modo técnico, ejecutar auditoría y correcciones en RLS, permisos y panel admin)

---

## 1) Objetivo 🎯
Crear un documento y prompt operable que describa TODO lo relacionado con: consultas de datos (queries), permisos, Row Level Security (RLS), roles admin, endpoints administrativos y todo lo que use el panel de administración. Debe listar políticas actuales, identificar huecos o políticas peligrosas (ej. demasiado permisivas), proponer correcciones, añadir tests y generar PRs con pequeñas iteraciones.

---

## 2) Resumen técnico (lo esencial) 🧩
- DB: PostgreSQL (Supabase). RLS activado en tablas clave (productos, orders, cart_items, wishlists, coupons, etc.). Varios scripts en `supabase/` definen tablas y políticas (`schema.sql`, `product-types-migration.sql`, `fix-variant-images-rls.sql`, `create-return-request-items-table.sql`, etc.).
- Admin: `src/pages/admin/*` (AdminLayout, dashboard, productos, pedidos, devoluciones, categorias, settings, analytics). Páginas server-side verifican `admin_users` mediante `supabaseAdmin` y cookies sb-access-token (ej. `src/pages/admin/index.astro`).
- Server role: `supabaseAdmin` client (service role) usado para tareas admin y creación de datos/consultas con privilegios elevados.
- Endpoints admin: operaciones POST/PUT/DELETE sobre `/api/*` (e.g., products, orders, returns) requieren checks adicionales; muchas rutas usan `supabaseAdmin` on server.

---

## 3) Políticas RLS & Scripts detectados ✅
(Archivos relevantes: `supabase/schema.sql`, `supabase/complete-schema.sql`, `supabase/*.sql`)

- Public read categories
  - File: `supabase/schema.sql`
  - Policy: SELECT allowed WHERE is_active = true
- Public read products
  - File: `supabase/schema.sql`
  - Policy: SELECT allowed WHERE is_active = true
- Public read variants
  - File: `supabase/schema.sql`
  - Policy: SELECT true
- Public read coupons (active + not expired)
  - File: `supabase/schema.sql`
- Admin full access (categories/products/variants/orders/customers)
  - File: `supabase/schema.sql`
  - Policy currently: USING (auth.role() = 'authenticated')  ← *POSIBLE BUG* (ver sección Riesgos)
- Variant images: public read + admin manage
  - Files: `supabase/product-types-migration.sql`, `supabase/fix-variant-images-rls.sql`
- Returns: customer read own & admin manage
  - Files: `supabase/create-return-request-items-table.sql`, `supabase/fix-return-requests-rls.sql`
- `create-credit-notes-table.sql` references `admin_users` check for auth_user_id = auth.uid()

Además hay múltiples SQL que usan `SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true` como verificación dentro de policies (good practice).

---

## 4) Riesgos detectados (críticos / altos) ⚠️
- Policy "Admin full access ... USING (auth.role() = 'authenticated')": `authenticated` es cualquier usuario logueado en Supabase, NO necesariamente admin. Esto *otorga privilegios de admin a cualquier usuario autenticado* y es un riesgo grave. Archivo: `supabase/schema.sql` (líneas: Admin full access categories/products/variants/orders/customers).

- Políticas de lectura pública correctas (productos/categorías) pero falta uniformidad en otras tablas nuevas (ej. `variant_images`, `coupon_uses`) — confirmar que tienen POLICY y RLS activa.

- Falta una política clara de "service role" para operaciones backend que necesitan saltarse RLS (se usa `supabaseAdmin` fair), pero debemos asegurar que webhooks y backend functions usan service key sólo servidor-side y no exponen endpoints públicos sin verificación.

- Falta tests automatizados que intenten acceder con user sin permisos y confirmar `403`/no rows; estos tests deben cubrir: Read/write orders by others, admin actions by non-admin, wishlist operations, variant_images manage by non-admin.

---

## 5) Cobertura del panel admin vs. permisos (qué usa qué) 🧭
- AdminDashboard: queries sobre `products`, `orders`, `product_variants`, `admin_users` — debe usar `supabaseAdmin` o policies que permitan lectura a admins.
- AdminProducts pages (create/edit/delete): POST/PUT/DELETE a `products` y `product_variants` — policies: admin only (revisar condiciones)
- AdminOrders pages: ver / editar `orders`, `order_items`, generar facturas — admin only plus logs; webhooks/stripe sync should be server-only.
- AdminReturns pages: create/approve/reject returns — checks implemented in `create-return-request-items-table.sql` referencing `admin_users`.
- AdminSettings: config updates stored in `configuracion` table — require 'admin' only.

---

## 6) Tests sugeridos (esenciales) ✅
Crear tests automáticos (preferible en `tests/` o e2e):
1. Non-admin cannot perform write on `products` (expect 403 / empty effect)
2. Non-owner customer cannot view other customer's orders (expect 0 rows)
3. Admin user (admin_users auth_user_id) can perform admin actions
4. Service role endpoints (webhooks) succeed when signed, fail otherwise
5. Variant images: public can SELECT, admin can INSERT/UPDATE/DELETE
6. Returns: customer can create request but only admin can approve/reject

---

## 7) Plan de correcciones prioritarias (3 sprints cortos) 🛠️
Sprint 1 (crítico, 1-2 PRs):
- Replace policies that use `auth.role() = 'authenticated'` for admin access with checks against `admin_users` table (e.g., USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true))). Add tests.
- Add missing RLS policies for orders/wishlists (customers view own orders & manage own wishlists) if absent.

Sprint 2 (seguimiento):
- Audit all tables (variant_images, coupon_uses, returns, coupon_uses) to ensure RLS + correct policies (public read vs admin manage vs owner). Add or tighten policies where needed.
- Add server-side verification for endpoints that bypass RLS (webhooks) to ensure they use service role key and validate payloads.

Sprint 3 (hardening + docs):
- Add tests for all cases, add a `TESTS/RLS.md` describing tests and expected behaviors.
- Add `DOCS/SECURITY-RLS.md` documenting policies per table and the rationale.

---

## 8) Prompt listo para Claude (auditoría + PRs) ⛏️

```
You are CLAUDE (Security/RLS specialist). Repo: c:/Users/Felix/Desktop/CRM-Tienda Ropa.
Goal: Audit and fix database RLS policies, queries and admin permissions; create small PRs with tests ensuring proper enforcement.

Tasks (priority):
1) Locate policies that grant "admin" privileges using `auth.role() = 'authenticated'` and replace them with secure checks using `admin_users` table: e.g. `USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true))`.
2) Ensure customers can only view/manage their own `orders`, `wishlists`, `cart_items` (create policies like "customers_view_own_orders", "customers_manage_own_wishlists").
3) For variant_images and new tables (returns, coupon_uses) ensure appropriate policies exist: public SELECT where needed, admin FOR ALL, owner restrictions where appropriate.
4) Add tests for each policy change: attempt access as non-admin and as admin; verify correct HTTP status (API) or no rows returned (direct DB query via anon client).
5) Scan code for any endpoints that bypass RLS (use `supabaseAdmin`) and ensure they are server-side only and/or protected by token checks (webhooks verify signature).
6) Produce a `DOCS/SECURITY-RLS.md` mapping each table → policies → test scenarios.

Deliverables per PR:
- Branch: `claude/rls-fix-{table}`
- SQL migration file with updated policies (idempotent: DROP POLICY IF EXISTS + CREATE POLICY)
- Unit/e2e tests demonstrating fix
- Short changelog + one-line commit message
- Instructions to run tests locally

Constraints:
- Do not change service role keys or expose secrets
- Ensure migrations are reversible and tested on a local Supabase instance

Return:
- A step-by-step plan for the first PR (file diffs and test to add)
- Then implement the PRs iteratively
```

---

## 9) Conclusión & Siguiente paso ✅
He listado políticas actuales, riesgos críticos (poli. admin permissive), tests necesarios y un prompt listo para ejecutar con Claude para producir PRs seguros e iterativos.

¿Quieres que empiece con el **Sprint 1** (reemplazar policies peligrosas en `supabase/schema.sql` por checks contra `admin_users` y añadir tests) y prepare el primer PR de ejemplo? 

*Archivo generado por: GitHub Copilot.*
