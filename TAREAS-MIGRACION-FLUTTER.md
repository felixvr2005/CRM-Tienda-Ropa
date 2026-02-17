# 📋 LISTA COMPLETA DE TAREAS - MIGRACIÓN ASTRO → FLUTTER
**Fecha de creación:** 2 de febrero de 2026  
**Estado:** En planificación  
**Responsable:** Equipo desarrollo  

---

## 🏗 ARQUITECTURA & SEGURIDAD

### SEGURIDAD - RLS (Row Level Security)

#### T-ARCH-001 🔴 CRÍTICO
**Reemplazar políticas RLS inseguras (auth.role() = 'authenticated')**
- **Descripción:** Auditar `supabase/schema.sql` y detectar todas las políticas que usan `auth.role() = 'authenticated'` para acceso admin. Esto otorga privilegios admin a cualquier usuario autenticado.
- **Archivos afectados:**
  - `supabase/schema.sql` (líneas con "Admin full access")
  - `supabase/product-types-migration.sql`
  - `supabase/fix-variant-images-rls.sql`
- **Tareas concretas:**
  - [ ] Crear migración SQL: `supabase/migrations/002-fix-admin-rls-policies.sql`
  - [ ] Reemplazar todas las políticas inseguras con: `USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true))`
  - [ ] Aplicar migración a BD local y staging
  - [ ] Escribir test que intente acceso admin con usuario no-admin y verifique denegación
- **Criterio de aceptación:**
  - [ ] Migración SQL aplicada sin errores
  - [ ] Test verifica no-admin no puede leer/escribir tablas protegidas
  - [ ] Test verifica admin puede realizar operaciones permitidas

---

#### T-ARCH-002 🔴 CRÍTICO
**Añadir tests automáticos RLS (unit + integration)**
- **Descripción:** Crear suite completa de tests que valide todas las políticas RLS.
- **Archivos a crear:**
  - `tests/rls/admin-access.test.ts`
  - `tests/rls/customer-access.test.ts`
  - `tests/rls/public-access.test.ts`
- **Tareas concretas:**
  - [ ] Test: non-admin NO puede escribir en `products` (expect 403)
  - [ ] Test: customer NO puede ver órdenes de otros (expect 0 rows)
  - [ ] Test: admin PUEDE ejecutar acciones admin
  - [ ] Test: service role PUEDE ejecutar operaciones sin RLS
  - [ ] Test: public PUEDE leer productos/categorías activos
  - [ ] Test: customer PUEDE ver/gestionar sus propios pedidos, favoritos
- **Criterio de aceptación:**
  - [ ] Todos los tests pasan
  - [ ] Cobertura >90% de políticas RLS
  - [ ] Tests añadidos a CI/CD pipeline

---

#### T-ARCH-003 🟡 MEDIA
**Auditar y completar RLS policies en todas las tablas**
- **Descripción:** Asegurar que TODAS las tablas (especialmente nuevas) tengan políticas RLS definidas y activas.
- **Tablas a auditar:**
  - [ ] `orders` → customer view own / admin all
  - [ ] `order_items` → customer view related / admin all
  - [ ] `wishlists` → customer manage own / public read if is_public
  - [ ] `cart_items` → customer manage own
  - [ ] `variant_images` → public SELECT / admin manage
  - [ ] `coupon_uses` → admin read / tracking
  - [ ] `returns` → customer create own / admin manage
  - [ ] `restock_notifications` → customer manage own / admin view
- **Tareas concretas:**
  - [ ] Crear migración SQL: `supabase/migrations/003-add-missing-rls-policies.sql`
  - [ ] Definir y aplicar políticas faltantes
  - [ ] Crear tests para cada política nueva
- **Criterio de aceptación:**
  - [ ] Todas las tablas tienen RLS habilitado
  - [ ] Políticas cubren casos: public, owner, admin

---

#### T-ARCH-004 🟡 MEDIA
**Documentar política de service role y endpoints que la usan**
- **Descripción:** Identificar todos los endpoints que usan `supabaseAdmin` (service role) y asegurar que sean server-side only.
- **Tareas concretas:**
  - [ ] Inventariar endpoints en `src/pages/api/**/*.ts` que usan `supabaseAdmin`
  - [ ] Crear documentación `DOCS/SECURITY-SERVICE-ROLE.md` listando cada endpoint
  - [ ] Verificar que NO exponen secrets o claves en responses
  - [ ] Añadir validación servidor-side (JWT check, IP whitelist si aplica)
  - [ ] Tests que verifiquen endpoints fallan sin auth válido
- **Criterio de aceptación:**
  - [ ] Documentación completada
  - [ ] Todos los endpoints service-role tienen validación
  - [ ] Tests de seguridad pasan

---

### ESPECIFICACIÓN API (OpenAPI)

#### T-ARCH-005 🔴 CRÍTICO
**Generar especificación OpenAPI 3.0 para endpoints públicos y admin**
- **Descripción:** Crear spec machine-readable de todos los endpoints, parámetros, responses y códigos de error.
- **Archivo a crear:** `docs/api-openapi.yaml`
- **Tareas concretas:**
  - [ ] Inventariar TODOS los endpoints en `src/pages/api/**/*.ts`
  - [ ] Para cada endpoint, documentar:
    - Método HTTP (GET, POST, PUT, DELETE)
    - Ruta exacta
    - Parámetros (query, body, path)
    - Response schemas
    - Códigos de error (400, 401, 403, 404, 409, 500)
    - Autenticación requerida
  - [ ] Endpoints principales a incluir:
    - `GET/POST /api/products`
    - `GET /api/products/{id}`
    - `POST /api/cart/add`
    - `POST /api/orders`
    - `POST /api/webhooks/stripe`
    - `GET /api/admin/products` (admin only)
    - `POST /api/admin/products` (admin only)
    - `GET /api/admin/orders` (admin only)
    - Etc.
  - [ ] Validar spec con `swagger-cli validate docs/api-openapi.yaml`
- **Criterio de aceptación:**
  - [ ] `docs/api-openapi.yaml` existe y es válido
  - [ ] Todos los endpoints documentados
  - [ ] Spec se puede abrir en Swagger UI

---

#### T-ARCH-006 🔴 CRÍTICO
**Generar modelos Dart desde OpenAPI spec**
- **Descripción:** Usar spec OpenAPI para generar automáticamente modelos Dart, API clients y tests.
- **Tareas concretas:**
  - [ ] Instalar `openapi-generator` o `swagger-dart-code-gen`
  - [ ] Crear script `scripts/generate-dart-models.sh` que ejecute generación
  - [ ] Generar a `flutter_client/lib/models/**` y `flutter_client/lib/api/**`
  - [ ] Revisar modelos generados y ajustar si es necesario
  - [ ] Añadir step a CI para regenerar si spec cambia
  - [ ] Crear tests que validen modelos (serialization round-trip)
- **Criterio de aceptación:**
  - [ ] Modelos Dart generados automáticamente
  - [ ] API client generado funciona con spec
  - [ ] Tests validan serialización JSON ↔ Dart

---

### ADAPTACIÓN STATE MANAGEMENT

#### T-ARCH-007 🟡 MEDIA
**Diseñar y documentar mapping Nano Stores → Riverpod**
- **Descripción:** Definir estrategia y contratos para migrar lógica de stores (Nano) a providers (Riverpod).
- **Tareas concretas:**
  - [ ] Analizar `src/stores/cart.ts` y extraer:
    - Estado (items, totales, cupones)
    - Acciones (add, remove, update, apply_coupon)
    - Persistencia (localStorage)
    - Timers/efectos
  - [ ] Crear documento `DOCS/STATE-MANAGEMENT-MAPPING.md` con:
    - Store web → Provider Flutter mapping
    - Contratos de interfaz (qué entradas/salidas)
    - Casos especiales (offline, sync, caché)
  - [ ] Crear interfaz Dart: `flutter_client/lib/domain/repositories/cart_repository.dart`
  - [ ] Crear tests unitarios que validen contrato antes de implementación
- **Criterio de aceptación:**
  - [ ] Documentación completa
  - [ ] Interfaz definida
  - [ ] Tests contrato creados

---

#### T-ARCH-008 🟡 MEDIA
**Definir estrategia offline + sync para Flutter**
- **Descripción:** Planificar cómo manejar acciones offline (carrito, órdenes) y reconciliar al conectar.
- **Tareas concretas:**
  - [ ] Crear documento `DOCS/OFFLINE-SYNC-STRATEGY.md` con:
    - Qué datos pueden guardarse locales (carrito, órdenes borradores)
    - Cómo detectar conflictos de sync
    - Política de resolución (server wins, client resend, merge)
  - [ ] Crear modelo: `flutter_client/lib/models/sync_queue.dart`
  - [ ] Tests que simulen offline → online y validen reconciliación
- **Criterio de aceptación:**
  - [ ] Estrategia documentada
  - [ ] Modelo de queue implementado
  - [ ] Tests pasan

---

---

## 🎨 INTERFAZ (UI)

### UX & ACCESIBILIDAD

#### T-UI-001 🔴 CRÍTICO
**Reemplazar todas las llamadas alert() por ToastProvider**
- **Descripción:** Eliminar `alert()` y normalizar errores/mensajes vía toasts localizables.
- **Tareas concretas:**
  - [ ] Buscar todas las referencias `alert(` en codebase: `grep -r "alert(" src/`
  - [ ] Para cada encontrada, reemplazar por `showToast()` o `ToastProvider.show()`
  - [ ] Crear/mejorar `src/components/ui/Toast.tsx` con estilos, animaciones y i18n
  - [ ] Ficheros probables a revisar:
    - `src/components/islands/AddToCartButton.tsx`
    - `src/components/islands/CartContent.tsx`
    - `src/pages/checkout/*.astro`
    - `src/pages/api/**/*.ts` (error responses)
  - [ ] Tests: verificar que no queda `alert(` en codebase
- **Criterio de aceptación:**
  - [ ] 0 referencias a `alert(` en código
  - [ ] Todos los errores muestran toasts
  - [ ] Toasts soportan i18n (ES/EN)

---

#### T-UI-002 🟡 MEDIA
**Auditoría de accesibilidad (a11y) y correcciones top-5**
- **Descripción:** Ejecutar herramientas de a11y, reportar problemas y corregir los 5 más críticos.
- **Tareas concretas:**
  - [ ] Correr `lighthouse --view` localmente en principales páginas
  - [ ] Correr `axe` CLI en componentes UI
  - [ ] Documentar problemas encontrados en `DOCS/A11Y-AUDIT.md`
  - [ ] Top issues probables:
    - [ ] Inputs sin label o aria-label
    - [ ] Botones sin accesible name
    - [ ] Contraste de color <4.5:1 (WCAG AA)
    - [ ] Focus states no visibles
    - [ ] Navegación por teclado rota
  - [ ] Corregir top-5 en archivos: `src/components/ui/**`, `src/layouts/**`
  - [ ] Tests a11y: `tests/a11y/*.test.ts`
- **Criterio de aceptación:**
  - [ ] Audit report completado
  - [ ] Top-5 problemas corregidos
  - [ ] Lighthouse a11y score >90

---

#### T-UI-003 🟡 MEDIA
**Implementar Dark Mode en Admin con persistencia**
- **Descripción:** Añadir toggle de Dark Mode en Admin, usar Tailwind dark: y persistir en localStorage.
- **Tareas concretas:**
  - [ ] Crear componente `src/components/ui/ThemeToggle.tsx`
  - [ ] En `src/layouts/AdminLayout.astro`:
    - [ ] Leer preferencia de localStorage on mount
    - [ ] Aplicar clase `dark` a `<html>` o wrapper
    - [ ] Renderizar toggle button que guarde preferencia
  - [ ] Actualizar `tailwind.config.mjs`:
    - [ ] Añadir `darkMode: 'class'`
    - [ ] Definir colores dark mode (basarse en paleta existente)
  - [ ] Archivos a actualizar:
    - `src/layouts/AdminLayout.astro`
    - `src/styles/globals.css`
    - `tailwind.config.mjs`
  - [ ] Tests: verificar toggle persiste y aplica estilos
- **Criterio de aceptación:**
  - [ ] Toggle Dark Mode funciona en Admin
  - [ ] Preferencia se guarda en localStorage
  - [ ] Colores legibles en dark mode

---

#### T-UI-004 🟡 MEDIA
**Internacionalización (i18n): extracción de strings y fallback ES/EN**
- **Descripción:** Externalizar todas las strings de UI a archivos de localización.
- **Tareas concretas:**
  - [ ] Crear estructura: `locales/es.json`, `locales/en.json`
  - [ ] Crear script `scripts/extract-i18n.js` que escanee archivos `.astro`, `.tsx` y extraiga strings
  - [ ] Ejecutar script y generar `locales/es.json` como source
  - [ ] Traducir a `locales/en.json` (o usar traducción automática)
  - [ ] Crear helper i18n: `src/lib/i18n.ts` o usar librería existente (p. ej. `i18next`)
  - [ ] Actualizar componentes para usar i18n:
    - Botones: "Agregar al carrito", "Comprar", etc.
    - Mensajes de error: "Email requerido", "Pago rechazado"
    - Labels de formularios
  - [ ] Archivos prioritarios:
    - `src/components/islands/**/*.tsx`
    - `src/pages/checkout/**`
    - `src/pages/api/**` (error messages)
  - [ ] Tests: verificar que strings se cargan en ambos idiomas
- **Criterio de aceptación:**
  - [ ] `locales/es.json` y `locales/en.json` completos
  - [ ] Script de extracción funciona
  - [ ] Componentes usan i18n en lugar de strings hardcoded

---

#### T-UI-005 🟢 BAJA
**Unificar empty states y placeholders en componentes reutilizables**
- **Descripción:** Crear componentes estándar para estados vacíos (cart vacío, no hay órdenes, etc.).
- **Tareas concretas:**
  - [ ] Crear directorio `src/components/ui/empty-states/`
  - [ ] Componentes a crear:
    - `EmptyCartState.tsx`
    - `EmptyWishlistState.tsx`
    - `EmptyOrdersState.tsx`
    - `EmptySearchState.tsx`
  - [ ] Cada componente debe incluir:
    - Icono consistente
    - Mensaje corto (i18n)
    - CTA button (si aplica)
  - [ ] Actualizar páginas para usarlos:
    - `src/pages/carrito.astro`
    - `src/pages/cuenta/favoritos.astro`
    - `src/pages/cuenta/pedidos.astro`
    - `src/components/islands/LiveSearch.tsx`
- **Criterio de aceptación:**
  - [ ] Componentes creados
  - [ ] Usados en todas las páginas relevantes
  - [ ] Consistencia visual validada

---

### MOBILE UX (Diseño para Flutter)

#### T-UI-006 🟡 MEDIA
**Diseñar y documentar UX móvil para Admin Panel**
- **Descripción:** Definir cómo traducir tablas complejas, bulk actions y CSV uploads a experiencia móvil intuitiva.
- **Tareas concretas:**
  - [ ] Crear documento `DOCS/ADMIN-MOBILE-UX.md` con:
    - Wireframes (Figma o descripción) de:
      - Admin Products List → mobile card view con actions en overlay
      - Bulk actions → bottom sheet o modal
      - Filtros → collapsible panel
      - CSV import → File picker + preview
    - Decisiones: relegar operaciones complejas a web admin si necesario
  - [ ] Documento debe incluir:
    - Problemas específicos (tablas anchas, drag-drop)
    - Soluciones propuestas (cards, bottom sheets, paginación)
    - Alternativas no implementadas en móvil (p. ej. CSV solo en web)
- **Criterio de aceptación:**
  - [ ] Documento completado
  - [ ] Wireframes clarificados
  - [ ] Decisiones validadas por UX team

---

---

## ⚙️ LÓGICA / FUNCIONALIDAD

### STOCK & CONCURRENCIA

#### T-LOGIC-001 🔴 CRÍTICO
**Pruebas de concurrencia para /api/stock/reserve**
- **Descripción:** Validar que la lógica de reserva de stock es atómica y no permite overbooking.
- **Tareas concretas:**
  - [ ] Crear prueba: `tests/concurrency/stock-reserve.test.ts`
  - [ ] Scenario 1: 10 usuarios intentan reservar último item simultáneamente
    - [ ] Verificar que solo 1 obtiene éxito
    - [ ] Otros reciben error 409 (Conflict)
  - [ ] Scenario 2: Reserva + liberación concurrente
    - [ ] Verificar que stock final es consistente
    - [ ] No hay duplicados ni pérdidas
  - [ ] Usar herramienta de carga (p. ej. `k6` o `artillery`)
  - [ ] Test debe pasar antes de migración a Flutter
- **Criterio de aceptación:**
  - [ ] Test corre y pasa
  - [ ] Stock final es correcto después de concurrencia
  - [ ] Errores 409 devueltos correctamente

---

#### T-LOGIC-002 🔴 CRÍTICO
**Añadir validaciones servidor-side en endpoints críticos**
- **Descripción:** Asegurar que stock, pedidos y cupones tienen validaciones completas y devuelven códigos de error claros.
- **Archivos a actualizar:**
  - `src/pages/api/stock/reserve.ts`
  - `src/pages/api/stock/release.ts`
  - `src/pages/api/orders.ts`
  - `src/pages/api/coupons/apply.ts`
- **Validaciones a añadir:**
  - [ ] Stock reserve:
    - [ ] Validar cantidad > 0
    - [ ] Validar producto existe
    - [ ] Validar variante (talla/color) existe
    - [ ] Validar stock disponible
    - [ ] Devolver `{success: false, code: "INSUFFICIENT_STOCK"}` si falla
  - [ ] Order creation:
    - [ ] Validar items no vacío
    - [ ] Validar direcciones válidas
    - [ ] Validar cupón válido (si aplica)
    - [ ] Validar autenticación
  - [ ] Coupon apply:
    - [ ] Validar código existe
    - [ ] Validar no expirado
    - [ ] Validar usos restantes
    - [ ] Validar monto mínimo de orden
- **Tareas concretas:**
  - [ ] Crear schema de validación (p. ej. Zod) para cada endpoint
  - [ ] Implementar validaciones
  - [ ] Tests unitarios para cada validación fallida
- **Criterio de aceptación:**
  - [ ] Todas las validaciones implementadas
  - [ ] Tests pasan
  - [ ] Response schemas consistentes

---

#### T-LOGIC-003 🟡 MEDIA
**Auditar y reforzar webhooks de Stripe**
- **Descripción:** Asegurar que webhook de Stripe verifica firma, rechaza eventos inválidos y maneja errores correctamente.
- **Archivo:** `src/pages/api/webhooks/stripe.ts`
- **Tareas concretas:**
  - [ ] Verificar que webhook:
    - [ ] Valida cabecera `stripe-signature`
    - [ ] Rechaza requests sin firma válida (401)
    - [ ] Maneja eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
    - [ ] Actualiza estado de orden correctamente
    - [ ] Envía email de confirmación
    - [ ] Registra eventos en audit log
  - [ ] Tests:
    - [ ] Mock Stripe webhook con firma válida → exitoso
    - [ ] Mock webhook con firma inválida → 401
    - [ ] Mock webhook evento desconocido → procesado sin error
  - [ ] Documentation en `DOCS/STRIPE-WEBHOOK.md`
- **Criterio de aceptación:**
  - [ ] Webhook verifica firma
  - [ ] Tests pasan
  - [ ] Audit log registra eventos

---

### NOTIFICACIONES & EMAIL

#### T-LOGIC-004 🟡 MEDIA
**Implementar servicio de notificaciones de restock**
- **Descripción:** Crear endpoint para suscribirse a notificaciones cuando producto sin stock vuelve disponible.
- **Tareas concretas:**
  - [ ] Crear tabla DB: `restock_notifications` (product_id, customer_email, status, created_at)
  - [ ] Endpoint: `POST /api/restock/notify`
    - [ ] Body: `{product_id, email, notify_sms?, phone?}`
    - [ ] Validar email/phone
    - [ ] Guardar en BD
    - [ ] Enviar email confirmación
  - [ ] Trigger DB en tabla `products`:
    - [ ] Si stock > 0 y es_restock_notif_pending:
    - [ ] Obtener todas las notificaciones para ese producto
    - [ ] Enviar email a cada: "¡Producto disponible de nuevo!"
    - [ ] Marcar notificación como enviada
    - [ ] Auto-delete después 30 días
  - [ ] SMS (opcional):
    - [ ] Integrar Twilio o similar
    - [ ] Enviar SMS si usuario eligió
  - [ ] Tests:
    - [ ] POST endpoint guarda notificación
    - [ ] Trigger manda emails cuando stock > 0
    - [ ] Unsubscribe link funciona
- **Criterio de aceptación:**
  - [ ] Endpoint implementado
  - [ ] Trigger DB funciona
  - [ ] Emails enviados correctamente
  - [ ] Tests pasan

---

#### T-LOGIC-005 🟢 BAJA
**Implementar wishlist public token flow**
- **Descripción:** Permitir que usuarios hagan pública su lista de favoritos con token único.
- **Tareas concretas:**
  - [ ] Endpoint: `POST /api/wishlists/make-public`
    - [ ] Body: `{wishlist_id}`
    - [ ] Generar token único (UUID)
    - [ ] Retornar: `{public_token, public_url, qr_code}`
  - [ ] Endpoint: `GET /api/wishlists/public/{token}`
    - [ ] Retornar wishlist público + productos
  - [ ] UI:
    - [ ] WishlistScreen con botón "Compartir"
    - [ ] Dialog con opciones: Copy link, QR, Social
    - [ ] Generar QR con `qr_code` package
  - [ ] Tests:
    - [ ] POST crea token y URL pública
    - [ ] GET token válido retorna wishlist
    - [ ] GET token inválido retorna 404
- **Criterio de aceptación:**
  - [ ] Endpoints implementados
  - [ ] UI con sharing options
  - [ ] QR generado correctamente

---

---

## 🗄 BASE DE DATOS / DATOS

### TABLA & TRIGGERS

#### T-DB-001 🔴 CRÍTICO
**Revisar y optimizar triggers de stock (descontar_stock, restaurar_stock)**
- **Descripción:** Asegurar que triggers son atómicos, tienen transacciones y tests.
- **Archivos:** `database-schema-complete.sql`, buscar `CREATE OR REPLACE FUNCTION`
- **Tareas concretas:**
  - [ ] Encontrar y revisar `descontar_stock()` y `restaurar_stock()`
  - [ ] Verificar que:
    - [ ] Usan transacciones (ATOMIC)
    - [ ] Validan stock disponible antes de descontar
    - [ ] Devuelven errores claros si fallan
    - [ ] Registran cambios en audit log (si existe)
  - [ ] Crear tests:
    - [ ] Test: descontar_stock() reduce stock
    - [ ] Test: descontar_stock() falla si stock insuficiente
    - [ ] Test: restaurar_stock() aumenta stock
    - [ ] Test: ambas son atómicas bajo concurrencia
  - [ ] Migration si hay cambios: `supabase/migrations/004-fix-stock-triggers.sql`
- **Criterio de aceptación:**
  - [ ] Triggers son atómicos
  - [ ] Tests pasan
  - [ ] Audit log (si aplica) funciona

---

#### T-DB-002 🟡 MEDIA
**Crear tabla restock_notifications y trigger**
- **Descripción:** Tabla nueva para suscripciones de restock + trigger que notifica cuando stock > 0.
- **Tareas concretas:**
  - [ ] Crear migración: `supabase/migrations/005-create-restock-notifications.sql`
  - [ ] Tabla schema:
    ```sql
    CREATE TABLE restock_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id),
      customer_email VARCHAR(255) NOT NULL,
      customer_id UUID REFERENCES customers(id),
      notify_sms BOOLEAN DEFAULT false,
      phone VARCHAR(20),
      status VARCHAR(20) DEFAULT 'active', -- active, sent, cancelled
      created_at TIMESTAMP DEFAULT now(),
      sent_at TIMESTAMP
    );
    ```
  - [ ] Trigger: cuando `products.stock` > 0, notificar y marcar como `sent`
  - [ ] RLS: customer read own, admin read all
  - [ ] Tests: trigger se ejecuta, emails se envían
- **Criterio de aceptación:**
  - [ ] Tabla creada
  - [ ] Trigger funciona
  - [ ] RLS políticas aplicadas

---

#### T-DB-003 🟡 MEDIA
**Añadir índices para consultas críticas**
- **Descripción:** Optimizar performance de queries frecuentes (listado productos, filtros, búsqueda).
- **Tareas concretas:**
  - [ ] Identificar queries lentas (usar EXPLAIN ANALYZE)
  - [ ] Queries a optimizar:
    - [ ] `SELECT * FROM products WHERE is_active = true` (índice: is_active)
    - [ ] `SELECT * FROM products WHERE category_id = $1` (índice: category_id)
    - [ ] `SELECT * FROM product_variants WHERE product_id = $1` (índice: product_id)
    - [ ] `SELECT * FROM orders WHERE customer_id = $1` (índice: customer_id)
    - [ ] Full text search: `WHERE name ILIKE '%query%'` (índice: GIN o GIST)
  - [ ] Migración: `supabase/migrations/006-add-indexes.sql`
  - [ ] Tests de performance antes/después
- **Criterio de aceptación:**
  - [ ] Índices creados
  - [ ] Query performance mejorado >50%
  - [ ] Sin queries N+1

---

### DATA INTEGRITY

#### T-DB-004 🟢 BAJA
**Añadir constraints y validaciones en BD**
- **Descripción:** Asegurar integridad de datos con constraints (UNIQUE, CHECK, FOREIGN KEY).
- **Tareas concretas:**
  - [ ] Revisar tablas por constraints faltantes
  - [ ] Probables:
    - [ ] `products.sku` UNIQUE
    - [ ] `products.price` > 0 (CHECK)
    - [ ] `orders.total_amount` >= 0 (CHECK)
    - [ ] `product_variants` (product_id, size, color) UNIQUE
  - [ ] Migración: `supabase/migrations/007-add-constraints.sql`
- **Criterio de aceptación:**
  - [ ] Constraints aplicadas
  - [ ] Inserts inválidos rechazados

---

---

## 🔄 NAVEGACIÓN & ROUTING

#### T-NAV-001 🟡 MEDIA
**Documentar y validar todas las rutas públicas**
- **Descripción:** Crear inventario completo de rutas, verificar que todas existen y tienen tests.
- **Archivo a crear:** `DOCS/ROUTES-INVENTORY.md`
- **Tareas concretas:**
  - [ ] Inventariar todas las rutas en `src/pages/`:
    - [ ] `/` → Home
    - [ ] `/productos` → Listado
    - [ ] `/productos/[slug]` → Detalle
    - [ ] `/categoria/[slug]` → Categoría
    - [ ] `/carrito` → Cart
    - [ ] `/checkout` → Checkout
    - [ ] `/checkout/success` → Confirmación
    - [ ] `/cuenta` → Dashboard
    - [ ] `/cuenta/perfil` → Profile
    - [ ] `/cuenta/pedidos` → Orders
    - [ ] `/cuenta/favoritos` → Wishlist
    - [ ] `/cuenta/devoluciones` → Returns
    - [ ] `/admin/**` → Admin routes (si existen en web)
    - [ ] Etc.
  - [ ] Crear tests Playwright para rutas principales:
    - [ ] `e2e/routes/public.spec.ts` (Home, productos, carrito, etc.)
    - [ ] `e2e/routes/protected.spec.ts` (cuenta, checkout)
  - [ ] Documento listando: ruta, archivo, datos que carga, auth requerida
- **Criterio de aceptación:**
  - [ ] Documentación completada
  - [ ] Tests Playwright pasan
  - [ ] Todas las rutas responden 200

---

#### T-NAV-002 🟡 MEDIA
**Implementar componente Breadcrumb reutilizable**
- **Descripción:** Crear breadcrumb navigation para ProductDetail y admin.
- **Tareas concretas:**
  - [ ] Crear: `src/components/ui/Breadcrumb.tsx`
  - [ ] Props:
    - [ ] `items: Array<{label, href?, active}>`
    - [ ] `separator: string` (default: ">")
  - [ ] Usar en:
    - [ ] ProductDetailScreen: Home > Categoría > Subcategoría > Producto
    - [ ] Admin ProductDetail: Admin > Productos > [Nombre]
  - [ ] Tests:
    - [ ] Renderiza items correctamente
    - [ ] Links clickables funcionan
    - [ ] Último item es no-clickable
  - [ ] Responsive:
    - [ ] Desktop: mostrar completo
    - [ ] Mobile: truncar o usar "..."
- **Criterio de aceptación:**
  - [ ] Componente funciona
  - [ ] Tests pasan
  - [ ] Usado en rutas principales

---

#### T-NAV-003 🟢 BAJA
**Definir deep-linking y universal links para Flutter**
- **Descripción:** Mapear rutas web a deep-links móviles para productos, órdenes, etc.
- **Archivo a crear:** `DOCS/DEEPLINKS-MAPPING.md`
- **Tareas concretas:**
  - [ ] Mappings:
    - [ ] `/productos/[slug]` → `fashionstore://products/{productId}`
    - [ ] `/categoria/[slug]` → `fashionstore://categories/{categoryId}`
    - [ ] `/cuenta/pedidos/[id]` → `fashionstore://orders/{orderId}`
    - [ ] `/cuenta/favoritos` → `fashionstore://wishlist`
    - [ ] Wishlist público: `/wishlist/{token}` → `fashionstore://wishlist/{token}`
  - [ ] Crear documento con estructura
  - [ ] Preparar esquema para Flutter (ios, android en pubspec.yaml)
- **Criterio de aceptación:**
  - [ ] Documentación completada
  - [ ] Esquema definido

---

---

## 🌐 INTEGRACIONES / APIs

### STRIPE & PAGOS

#### T-INT-001 🔴 CRÍTICO
**Validar flujo Stripe para móvil: PaymentIntent server-side + SCA**
- **Descripción:** Asegurar que el flujo de pago es seguro y compatible con mobile (SCA/3D Secure).
- **Tareas concretas:**
  - [ ] Revisar implementación actual en `src/pages/api/checkout.ts`
  - [ ] Asegurar que:
    - [ ] Se crea `PaymentIntent` en servidor (NO en cliente)
    - [ ] Cliente recibe solo `clientSecret` (no API key)
    - [ ] Stripe.js maneja 3D Secure automáticamente
    - [ ] Confirmación vía webhook (no client)
  - [ ] Para Flutter:
    - [ ] Documentar que flutter_stripe usará mismos endpoints
    - [ ] Tests: crear PaymentIntent, confirmar, webhook actualiza BD
    - [ ] Tests SCA: simular 3D Secure en test mode
  - [ ] Error handling:
    - [ ] `payment_intent.requires_payment_method`
    - [ ] `payment_intent.status == "requires_confirmation"`
    - [ ] `payment_intent.last_payment_error` → mostrar error amigable
  - [ ] Archivo: `DOCS/STRIPE-PAYMENT-FLOW.md`
- **Criterio de aceptación:**
  - [ ] PaymentIntent creado server-side
  - [ ] SCA tests pasan
  - [ ] Documentación clara

---

#### T-INT-002 🟡 MEDIA
**Crear contract tests (OpenAPI-driven) para endpoints**
- **Descripción:** Validar que responses del servidor coinciden con spec OpenAPI.
- **Tareas concretas:**
  - [ ] Usar librería como `dredd` o `schemathesis`
  - [ ] Tests de contrato:
    - [ ] GET /api/products → respuesta es array de productos
    - [ ] GET /api/products/{id} → respuesta es producto single
    - [ ] POST /api/orders → respuesta contiene order_id, status, etc.
  - [ ] Ejecutar en CI contra spec OpenAPI
  - [ ] Fallar si servidor devuelve response que no matches spec
- **Criterio de aceptación:**
  - [ ] Contract tests configurados
  - [ ] Tests pasan
  - [ ] Integrados en CI

---

### IMAGEN & CACHE

#### T-INT-003 🟡 MEDIA
**Asegurar Cloudinary transforms y cache headers**
- **Descripción:** Optimizar carga de imágenes con transformaciones automáticas y cachés correctos.
- **Tareas concretas:**
  - [ ] Revisar `src/lib/supabase.ts` y cómo se generan URLs de imagen
  - [ ] Asegurar que todas las URLs incluyen Cloudinary params:
    - [ ] `w=400` (ancho en listados)
    - [ ] `w=800` (ancho en detalle)
    - [ ] `q=auto` (quality automática)
    - [ ] `f=auto` (format automático: WebP, etc.)
    - [ ] `dpr=2` (para retina displays)
  - [ ] Comprobar headers cache:
    - [ ] Response tiene `Cache-Control: public, max-age=31536000` para imágenes
    - [ ] Browser cachea imágenes correctamente
  - [ ] Tests:
    - [ ] Imágenes tienen transforms
    - [ ] Cache headers presentes
    - [ ] WebP devuelto en browsers compatibles
- **Criterio de aceptación:**
  - [ ] URLs incluyen transforms
  - [ ] Cache headers correctos
  - [ ] Performance mejorado

---

#### T-INT-004 🟢 BAJA
**Implementar eventos de analytics/recommendations tracking**
- **Descripción:** Track eventos para analytics y motor de recomendaciones.
- **Tareas concretas:**
  - [ ] Eventos a trackear:
    - [ ] `product_viewed` (cuando se abre ProductDetail)
    - [ ] `product_added_to_cart`
    - [ ] `product_added_to_wishlist`
    - [ ] `recommendation_viewed`
    - [ ] `recommendation_clicked`
    - [ ] `order_completed`
  - [ ] Crear servicio: `src/lib/analytics.ts`
  - [ ] Enviar a backend: `POST /api/analytics/track`
  - [ ] Guardar en tabla `analytics_events` (product_id, event_type, user_id, timestamp)
  - [ ] Tests: eventos se envían correctamente
- **Criterio de aceptación:**
  - [ ] Eventos registrados
  - [ ] Table tiene data
  - [ ] Tests pasan

---

---

## 🐞 CORRECCIONES NECESARIAS (Bugs & Seguridad)

#### T-FIX-001 🔴 CRÍTICO
**Eliminar console.log y debug messages en producción**
- **Descripción:** Asegurar que no hay logs de debug en código.
- **Tareas concretas:**
  - [ ] Buscar: `grep -r "console\." src/`
  - [ ] Para cada encontrada:
    - [ ] Si es debug: remover o envolver con `if (isDev)`
    - [ ] Si es error logging: cambiar por logger service
  - [ ] Crear logger service: `src/lib/logger.ts` con niveles (debug, info, warn, error)
  - [ ] Logger solo envía errors a backend en producción
  - [ ] Tests: no hay console.log en build
- **Criterio de aceptación:**
  - [ ] 0 console.log en código
  - [ ] Logger service en lugar

---

#### T-FIX-002 🔴 CRÍTICO
**Crear suite completa de E2E tests para checkout**
- **Descripción:** Tests que cubran todo el flujo de compra.
- **Archivo:** `e2e/checkout-flow.spec.ts` (Playwright)
- **Tareas concretas:**
  - [ ] Scenario 1: Checkout como guest
    - [ ] Agregar producto al carrito
    - [ ] Ir a carrito
    - [ ] Proceed to checkout
    - [ ] Llenar shipping info
    - [ ] Llenar billing info
    - [ ] Mock Stripe (usar test card 4242...)
    - [ ] Completar pago
    - [ ] Ver confirmación
    - [ ] Verificar orden creada en BD
  - [ ] Scenario 2: Checkout como usuario logueado
    - [ ] Usar direcciones guardadas
    - [ ] Aplicar cupón válido
    - [ ] Verificar descuento
  - [ ] Scenario 3: Error handling
    - [ ] Tarjeta rechazada → mostrar error
    - [ ] Stock insuficiente → mensaje
  - [ ] Tests con mock Stripe (usar `stripe/stripe-mock`)
- **Criterio de aceptación:**
  - [ ] Tests pasan
  - [ ] Todos los scenarios cubiertos
  - [ ] Orden se crea correctamente

---

#### T-FIX-003 🟡 MEDIA
**Remover dependencias no usadas y fijar versiones críticas**
- **Descripción:** Limpieza de package.json y seguridad de versiones.
- **Tareas concretas:**
  - [ ] Correr `npm audit` y `npm outdated`
  - [ ] Remover paquetes no usados: `npm prune`
  - [ ] Fijar versiones de deps críticas en `package-lock.json`
  - [ ] Actualizar vulnerabilidades críticas
  - [ ] Documentar cambios en `CHANGELOG.md`
- **Criterio de aceptación:**
  - [ ] `npm audit` retorna 0 vulnerabilidades críticas
  - [ ] package-lock.json committed

---

---

## 🧱 TAREAS NECESARIAS NO CONTEMPLADAS (Extras)

#### T-EXTRA-001 🟡 MEDIA
**Crear DOCS/RELEASE.md con checklist Play Store / App Store**
- **Descripción:** Guía completa para publicar Flutter app en stores.
- **Contenido:**
  - [ ] Pre-flight checks (versión, build, tests)
  - [ ] Preparar assets (icons, screenshots, description)
  - [ ] Play Store: crear app, configurar, uploadAPK
  - [ ] App Store: crear app, configurar, upload IPA
  - [ ] Testing en stores
  - [ ] Release notes
  - [ ] Monitor crashes después de release
- **Criterio de aceptación:**
  - [ ] Documento completo
  - [ ] Pasos clarificados

---

#### T-EXTRA-002 🟡 MEDIA
**Implementar test coverage enforcement en CI**
- **Descripción:** Configurar CI para fallar si cobertura < 70%.
- **Tareas concretas:**
  - [ ] Configurar Jest/Coverage reporter
  - [ ] En `package.json` o `.github/workflows/`:
    - [ ] Añadir script: `npm test -- --coverage`
    - [ ] Configurar threshold: líneas >70%, branches >65%
  - [ ] CI job falla si threshold no se cumple
  - [ ] Crear badge de coverage en README
- **Criterio de aceptación:**
  - [ ] CI enforce coverage
  - [ ] Tests pasan con >70%

---

#### T-EXTRA-003 🟢 BAJA
**Implementar Backups regulares + Audit Log**
- **Descripción:** Configurar backups automáticos de BD y registro de acciones admin.
- **Tareas concretas:**
  - [ ] Backups:
    - [ ] Configurar Supabase backups (daily)
    - [ ] Documentar restore process
  - [ ] Audit log:
    - [ ] Tabla: `audit_logs` (user_id, action, table, record_id, timestamp)
    - [ ] Crear trigger que registre UPDATE/DELETE en tablas críticas
    - [ ] Tests: audit_logs se registran
- **Criterio de aceptación:**
  - [ ] Backups configurados
  - [ ] Audit log funciona

---

#### T-EXTRA-004 🟢 BAJA
**Crear DOCS/SECURITY-RLS.md documentando todas las políticas**
- **Descripción:** Documentación técnica de RLS para referencia futura.
- **Contenido:**
  - [ ] Para cada tabla:
    - [ ] Políticas definidas
    - [ ] Quién puede read/write/delete
    - [ ] Rationale
  - [ ] Ejemplos de queries y cómo RLS afecta
  - [ ] Cómo probar policies
- **Criterio de aceptación:**
  - [ ] Documento completo
  - [ ] Todos los tables documentados

---

---

## 📊 RESUMEN POR PRIORIDAD

### 🔴 CRÍTICO (14 tareas)
- T-ARCH-001, T-ARCH-002, T-ARCH-005, T-ARCH-006
- T-UI-001
- T-LOGIC-001, T-LOGIC-002
- T-DB-001
- T-FIX-001, T-FIX-002
- T-INT-001

**Tiempo estimado:** 4-5 semanas (depende de equipo)

### 🟡 MEDIA (18 tareas)
- T-ARCH-003, T-ARCH-004, T-ARCH-007, T-ARCH-008
- T-UI-002, T-UI-003, T-UI-004, T-UI-006
- T-LOGIC-003, T-LOGIC-004
- T-DB-002, T-DB-003
- T-NAV-001, T-NAV-002
- T-INT-002, T-INT-003
- T-FIX-003
- T-EXTRA-001, T-EXTRA-002

**Tiempo estimado:** 3-4 semanas

### 🟢 BAJA (10 tareas)
- T-UI-005
- T-LOGIC-005
- T-DB-004
- T-NAV-003
- T-INT-004
- T-EXTRA-003, T-EXTRA-004

**Tiempo estimado:** 2 semanas

---

## 🚀 ORDEN RECOMENDADO DE EJECUCIÓN

1. **Semana 1:** T-ARCH-001, T-ARCH-002 (RLS security)
2. **Semana 2:** T-ARCH-005, T-ARCH-006 (OpenAPI + Dart models)
3. **Semana 3:** T-UI-001, T-LOGIC-001, T-LOGIC-002 (UX + validaciones)
4. **Semana 4:** T-ARCH-003, T-DB-001, T-INT-001 (DB + Stripe)
5. **Semana 5+:** Media y baja prioridad

---

*Última actualización: 2 de febrero de 2026*
*Estado: Pendiente de asignación*
