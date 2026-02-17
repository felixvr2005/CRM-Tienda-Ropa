# 📋 PLAN DE IMPLEMENTACIÓN COMPLETO: Migración Astro → Flutter

**Documento Maestro de Tareas**  
**Generado:** 2024  
**Total Tareas:** 57 (6 críticas completadas + 51 pendientes)  
**Tiempo Estimado Total:** 8-10 semanas  
**Prioridad:** 🔴 CRÍTICA - Sin parar

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual ✅
- ✅ **T-ARCH-001:** Migración RLS - Creada (`supabase/migrations/002-fix-admin-rls-policies.sql`)
- ✅ **T-ARCH-002:** Tests RLS Admin - Creados (`tests/rls/admin-access.test.ts`)
- ✅ **T-ARCH-002b:** Tests RLS Customer - Creados (`tests/rls/customer-access.test.ts`)
- ✅ **T-ARCH-003:** Tests Concurrencia Stock - Creados (`tests/concurrency/stock-reserve.test.ts`)
- ✅ **T-ARCH-003b:** Migración RLS Faltantes - Creada (`supabase/migrations/003-add-missing-rls-policies.sql`)
- ✅ **T-ARCH-004:** Documentación Service Role - Creada (`DOCS/SECURITY-SERVICE-ROLE.md`)
- ✅ **T-ARCH-005:** OpenAPI Spec 3.0 - Creado (`docs/api-openapi.yaml`)
- ✅ **T-ARCH-006:** Scripts Generación Dart - Creados (`scripts/generate-dart-models.sh`, `scripts/openapi-dart-config.yaml`)

### 🔴 CRÍTICO - Próximas Acciones (Inicio Inmediato)
1. Validar migraciones SQL en base de datos local
2. Ejecutar suite de tests RLS y concurrencia
3. Generar modelos Dart desde OpenAPI
4. Crear validadores de endpoints (T-ARCH-007)

---

## 📊 CATEGORÍA 1: ARQUITECTURA & SEGURIDAD (Crítica)

### ✅ T-ARCH-001: Migración RLS - Políticas Admin Seguras
- **Estado:** ✅ COMPLETADO
- **Archivo:** `supabase/migrations/002-fix-admin-rls-policies.sql`
- **Alcance:** 
  - ✅ Reemplaza políticas inseguras `auth.role() = 'authenticated'`
  - ✅ Implementa `EXISTS (SELECT FROM admin_users)` check
  - ✅ Cubre 5 tablas: categories, products, variants, orders, coupons
  - ✅ Idempotente (DROP/CREATE seguro)
- **Verificación:** 
  - [ ] Ejecutar: `supabase migration up`
  - [ ] Validar: `SELECT * FROM pg_policies ORDER BY tablename`
  - [ ] Test: Non-admin no puede INSERT en products

---

### ✅ T-ARCH-002: Tests RLS - Validación de Acceso Admin
- **Estado:** ✅ COMPLETADO
- **Archivo:** `tests/rls/admin-access.test.ts`
- **Alcance:** 9 casos de test
  - ✅ Non-admin no puede INSERT en products (403)
  - ✅ Non-admin no puede UPDATE en products (403)
  - ✅ Admin SÍ puede INSERT en products
  - ✅ Público no ve productos inactivos
  - ✅ Cliente solo ve propios pedidos
  - ✅ Service role bypasa RLS
  - ✅ Stock reserve/restore sequencial
  - ✅ Error en reserve excesivo
  - ✅ Cleanup de usuarios test
- **Verificación:**
  - [ ] Ejecutar: `npm run test -- admin-access.test.ts`
  - [ ] Resultado esperado: 9/9 tests pasados ✅

---

### ✅ T-ARCH-002b: Tests RLS - Validación de Acceso Customer
- **Estado:** ✅ COMPLETADO
- **Archivo:** `tests/rls/customer-access.test.ts`
- **Alcance:** 8 casos de test
  - ✅ Customer INSERT en carrito propio
  - ✅ Customer NO ve carrito de otros (empty result)
  - ✅ Customer gestiona wishlist propia
  - ✅ Customer NO INSERT en wishlist ajena
  - ✅ Customer ve solo propios returns
  - ✅ Customer NO ve returns ajenos
  - ✅ Customer NO DELETE carrito ajeno
  - ✅ Cleanup de usuarios test
- **Verificación:**
  - [ ] Ejecutar: `npm run test -- customer-access.test.ts`
  - [ ] Resultado esperado: 8/8 tests pasados ✅

---

### ✅ T-ARCH-003: Tests Concurrencia - Stock Reservation
- **Estado:** ✅ COMPLETADO
- **Archivo:** `tests/concurrency/stock-reserve.test.ts`
- **Alcance:** 7 casos de test concurrencia
  - ✅ Reserve secuencial: stock disminuye correcto
  - ✅ Reserve > stock: falla (no oversell)
  - ✅ 10 concurrent requests en stock de 10: éxito
  - ✅ 11 concurrent requests en stock de 10: 1 falla
  - ✅ Restore stock: aumenta cantidad
  - ✅ 50 concurrent requests: atomicidad
  - ✅ Operaciones mixtas (reserve + restore)
- **Verificación:**
  - [ ] Ejecutar: `npm run test -- stock-reserve.test.ts`
  - [ ] Resultado esperado: 7/7 tests pasados ✅

---

### ✅ T-ARCH-003b: Migración RLS - Políticas Faltantes
- **Estado:** ✅ COMPLETADO
- **Archivo:** `supabase/migrations/003-add-missing-rls-policies.sql`
- **Alcance:** 6 tablas aseguradas
  - ✅ **order_items:** Admin select/insert/update, Customer solo lee propios
  - ✅ **wishlists:** Customer gestiona propios, Admin todo, Público lee
  - ✅ **returns:** Customer insert/select/update propios, Admin todo
  - ✅ **variant_images:** Público read, Admin insert/update/delete
  - ✅ **coupon_uses:** Admin + Service role solo
  - ✅ **admin_users:** Admin ve todos, Service role bypass
- **Verificación:**
  - [ ] Ejecutar: `supabase migration up`
  - [ ] Validar: `SELECT COUNT(*) FROM pg_policies WHERE tablename IN (...)`
  - [ ] Expected: 24+ policies aplicadas

---

### ✅ T-ARCH-004: Documentación Service Role & Auditoría
- **Estado:** ✅ COMPLETADO
- **Archivo:** `DOCS/SECURITY-SERVICE-ROLE.md` (~400 líneas)
- **Alcance:**
  - ✅ Qué es Service Role y cuándo usarlo
  - ✅ Patrones seguros (Validate→Operate)
  - ✅ Patrones inseguros (❌ ejemplos)
  - ✅ Auditoría & monitoring
  - ✅ Inventario de endpoints (5 endpoints catalogados)
  - ✅ Checklist de deployment
- **Verificación:**
  - [ ] Leer documento y validar todos endpoints cumplan
  - [ ] Implementar logging (T-ARCH-007)

---

### ✅ T-ARCH-005: OpenAPI 3.0 Spec Completa
- **Estado:** ✅ COMPLETADO
- **Archivo:** `docs/api-openapi.yaml` (~800 líneas)
- **Alcance:**
  - ✅ 30+ endpoints documentados (GET, POST, PATCH, DELETE)
  - ✅ 8 categorías (Products, Cart, Orders, Customers, Admin, Coupons, Returns)
  - ✅ 15+ schemas (Product, CartItem, Order, User, etc.)
  - ✅ Respuestas de error estándar (400, 401, 403, 404)
  - ✅ Parámetros de paginación
  - ✅ Autenticación JWT
- **Verificación:**
  - [ ] Validar spec: `openapi-generator validate -i docs/api-openapi.yaml`
  - [ ] Visualizar: Swagger Editor
  - [ ] Documentación: [http://localhost:3000/docs](http://localhost:3000/docs)

---

### ✅ T-ARCH-006: Scripts Generación Dart desde OpenAPI
- **Estado:** ✅ COMPLETADO
- **Archivos:** 
  - `scripts/generate-dart-models.sh` (ejecutable)
  - `scripts/openapi-dart-config.yaml` (config)
- **Alcance:**
  - ✅ Script automatizado que valida spec
  - ✅ Genera clientes Dart con openapi-generator
  - ✅ Estructura Flutter-ready (`flutter_client/lib/models`, `flutter_client/lib/api`)
  - ✅ Configuración: serializadores, type hints, doc generation
- **Verificación:**
  - [ ] Ejecutar: `bash scripts/generate-dart-models.sh`
  - [ ] Verificar directorio: `flutter_client/lib/models/` y `flutter_client/lib/api/`
  - [ ] Validar imports Flutter

---

## 📋 CATEGORÍA 2: VALIDACIÓN & TESTS (Crítica)

### ⏳ T-ARCH-007: Middleware de Validación de Endpoints
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA (depende de T-ARCH-005)
- **Estimado:** 1 día
- **Archivos a crear:**
  - `src/lib/validators/endpoints.ts` - Esquemas de validación Zod
  - `src/middleware/validate-request.ts` - Middleware Express
- **Tareas específicas:**
  1. Crear esquemas Zod para cada endpoint (POST /api/checkout/confirm, POST /api/webhooks/stripe, etc.)
  2. Validar body, query params, path params
  3. Aplicar middleware a todos endpoints `/api/**`
  4. Testear con datos inválidos (expect 400)
- **Aceptación:**
  - [ ] Todos endpoints POST/PATCH validan input
  - [ ] Request inválido retorna 400 + error details
  - [ ] Tests pass: `npm run test -- validators.test.ts`

---

### ⏳ T-ARCH-008: Logging & Auditoría Centralizada
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA
- **Estimado:** 2 días
- **Archivos a crear:**
  - `src/lib/logger.ts` - Logger centralizado
  - `supabase/migrations/004-create-audit-logs-table.sql` - Tabla de auditoría
- **Tareas específicas:**
  1. Implementar Winston logger con transports (file, console, Supabase)
  2. Crear tabla `audit_logs` con: operation, resource, user_id, timestamp, details
  3. Hook logging en service role operations (checkout, webhook, returns)
  4. Dashboard simple de auditoría en admin panel
- **Aceptación:**
  - [ ] Todos service role ops generan audit log
  - [ ] Logs visible en Supabase table
  - [ ] Admin puede filtrar por fecha/usuario

---

### ⏳ T-ARCH-009: Rate Limiting & DDoS Protection
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA
- **Estimado:** 1.5 días
- **Archivos a crear:**
  - `src/middleware/rate-limit.ts` - Rate limiter
- **Tareas específicas:**
  1. Instalar `express-rate-limit`
  2. Configurar limites por endpoint:
     - `/api/checkout/**` - 10 req/min por IP
     - `/api/webhooks/**` - 100 req/min por IP (webhooks Stripe)
     - `/api/auth/**` - 5 req/min por IP (prevenir brute force)
  3. Retornar 429 (Too Many Requests) cuando se excede
  4. Usar Redis para estado distribuido (o en-memory para staging)
- **Aceptación:**
  - [ ] Rate limiting activo en endpoints críticos
  - [ ] Test: Exceder límite retorna 429
  - [ ] Métricas en logs

---

## 🎨 CATEGORÍA 3: UI & UX MOBILE (Crítica)

### ⏳ T-UI-001: Dark Mode para Admin Panel
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA (usabilidad admin)
- **Estimado:** 1.5 días
- **Archivos a modificar:**
  - `tailwind.config.mjs` - Agregar dark mode config
  - `src/layouts/AdminLayout.astro` - Toggle dark mode
  - `src/components/islands/AdminDashboard.tsx` - Temas
- **Tareas específicas:**
  1. Activar `darkMode: 'class'` en Tailwind
  2. Crear contexto React para dark mode state
  3. Agregar toggle en navbar admin
  4. Aplicar clases `dark:bg-gray-900 dark:text-white` a componentes
- **Aceptación:**
  - [ ] Dark mode toggle funciona
  - [ ] Preferencia persiste en localStorage
  - [ ] Todos admin components soportan dark

---

### ⏳ T-UI-002: Accessibility Audit & Fixes
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA (compliance)
- **Estimado:** 3 días
- **Tareas específicas:**
  1. Ejecutar axe DevTools en todas páginas
  2. Corregir aria-labels faltantes
  3. Validar color contrast (WCAG AA)
  4. Testear con keyboard navigation (Tab, Enter, Esc)
  5. Testear con screen reader (NVDA)
- **Aceptación:**
  - [ ] axe-core: 0 violations críticas
  - [ ] WCAG AA compliant
  - [ ] Keyboard navigation funciona

---

### ⏳ T-UI-003: Internationalization (i18n) - Múltiples Idiomas
- **Estado:** NO INICIADO (parcial: solo español)
- **Prioridad:** 🟡 MEDIA (expansion mercados)
- **Estimado:** 4 días
- **Archivos a crear:**
  - `src/i18n/config.ts` - Config i18n
  - `src/i18n/locales/es.json` - Español (existente, reformatear)
  - `src/i18n/locales/en.json` - Inglés
  - `src/i18n/locales/pt.json` - Portugués
- **Tareas específicas:**
  1. Instalar `astro-i18n` o `lingui`
  2. Extraer strings de componentes a archivos JSON
  3. Crear keys estándar: `common.add_to_cart`, `product.price`, etc.
  4. Implementar switcher de idioma en navbar
  5. Persistir idioma en localStorage
- **Aceptación:**
  - [ ] 3 idiomas disponibles
  - [ ] Strings completos traducidos
  - [ ] URL respeta idioma (/es, /en, /pt)

---

## 💻 CATEGORÍA 4: LÓGICA & FEATURES (Media)

### ⏳ T-LOGIC-001: Validación Carrito Completa
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `src/lib/cart-validator.ts` - Validador Zod
  - `src/pages/api/cart/validate.ts` - Endpoint validación
- **Tareas específicas:**
  1. Validar que cada producto existe y está activo
  2. Validar stock suficiente para cantidad
  3. Validar variantes (colores, tallas) existen
  4. Calcular totales (subtotal, tax, discount)
  5. Tests: stock 0, producto inactivo, etc.
- **Aceptación:**
  - [ ] Carrito inválido rechazado antes de checkout
  - [ ] Stock validado en tiempo real
  - [ ] Totales calculados correctamente

---

### ⏳ T-LOGIC-002: Cálculo de Descuentos (Coupons)
- **Estado:** NO INICIADO (parcial: endpoint solo)
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `src/lib/coupon-calculator.ts` - Lógica descuentos
  - `tests/coupon-calculator.test.ts` - Tests
- **Tareas específicas:**
  1. Validar coupon: código existe, no expirado, no usado (max_uses)
  2. Calcular descuento (flat o percentage)
  3. Aplicar límite mínimo de orden
  4. Tests: coupon expirado, máximo uso alcanzado, etc.
- **Aceptación:**
  - [ ] Descuentos aplicados correctamente
  - [ ] Validaciones exhaustivas
  - [ ] Tests: 8/8 pasados

---

### ⏳ T-LOGIC-003: Manejo de Reintegros (Returns Flow)
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 3 días
- **Archivos:**
  - `src/pages/api/returns/create.ts` - Crear return request
  - `src/pages/api/returns/approve.ts` - Aprobar (admin)
  - `src/lib/returns-handler.ts` - Lógica
- **Tareas específicas:**
  1. Validar que order es del usuario
  2. Crear return request con razón
  3. Validar items a retornar están en orden
  4. Admin puede aprobar/rechazar
  5. Reintegro automático cuando se aprueba
  6. Restaurar stock cuando se aprueba
- **Aceptación:**
  - [ ] Return request creado
  - [ ] Admin puede aprobar
  - [ ] Stock restaurado automáticamente
  - [ ] Reintegro procesado

---

## 🗄️ CATEGORÍA 5: BASE DE DATOS (Media)

### ⏳ T-DB-001: Índices para Performance
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 1 día
- **Archivo:** `supabase/migrations/004-create-indexes.sql`
- **Tareas específicas:**
  1. Índice en `products.category_id` (queries filtradas)
  2. Índice en `orders.customer_id` (listar órdenes cliente)
  3. Índice en `cart_items.user_id` (carrito)
  4. Índice en `coupons.code` (lookup código)
  5. Índice en `orders.created_at DESC` (listados recientes)
- **Aceptación:**
  - [ ] Migración ejecuta sin errores
  - [ ] Queries filtradas son <100ms

---

### ⏳ T-DB-002: Funciones Almacenadas - Descontar/Restaurar Stock
- **Estado:** ⏳ PARCIAL (funciones existen, no verificadas)
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 1 día
- **Archivo:** `database-schema-complete.sql` (verificar/actualizar)
- **Tareas específicas:**
  1. Verificar función `descontar_stock` - validar stock > 0
  2. Verificar función `restaurar_stock` - validar no exceda max
  3. Agregar logging a funciones
  4. Tests de concurrencia (ya hechos en T-ARCH-003)
- **Aceptación:**
  - [ ] Funciones usan transacciones (atomicity)
  - [ ] No permiten stock negativo
  - [ ] Tests concurrencia pasan

---

### ⏳ T-DB-003: Triggers para Auditoría
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 1.5 días
- **Archivo:** `supabase/migrations/005-create-audit-triggers.sql`
- **Tareas específicas:**
  1. Trigger en `products` UPDATE → log cambios
  2. Trigger en `orders` UPDATE → log estado
  3. Trigger en `coupons` UPDATE → log desactivaciones
  4. Tabla `audit_logs` con: table_name, operation, old_values, new_values, timestamp
- **Aceptación:**
  - [ ] Cambios registrados en audit_logs
  - [ ] Admin puede ver historial

---

## 🛣️ CATEGORÍA 6: NAVEGACIÓN & ROUTING (Media)

### ⏳ T-NAV-001: Rutas Admin Completas
- **Estado:** ⏳ PARCIAL
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `src/pages/admin/dashboard.astro` - Existente, mejorar
  - `src/pages/admin/products/index.astro` - List
  - `src/pages/admin/products/[id]/edit.astro` - Edit
  - `src/pages/admin/orders.astro` - Todas órdenes
  - `src/pages/admin/returns.astro` - Requests de retorno
- **Tareas específicas:**
  1. Crear rutas de admin CRUD
  2. Implementar autenticación admin (redirect si no admin)
  3. Formularios para crear/editar productos
  4. Listados filtrados (estado orden, etc.)
- **Aceptación:**
  - [ ] Admin panel funcional
  - [ ] CRUD de productos completo
  - [ ] Protección de rutas admin

---

### ⏳ T-NAV-002: Deep Linking & URL Schemes (Flutter)
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `flutter_client/lib/navigation/deep_link_handler.dart`
  - `flutter_client/android/app/AndroidManifest.xml` - configuración Android
  - `flutter_client/ios/Runner/Info.plist` - configuración iOS
- **Tareas específicas:**
  1. Configurar app links (Android) + universal links (iOS)
  2. URL scheme: `crm-tienda://product/123`, `crm-tienda://orders/456`
  3. Handler para parsear rutas desde web
  4. Navegar a screen correspondiente en Flutter
- **Aceptación:**
  - [ ] Link desde web abre app si instalada
  - [ ] Deep link navega a screen correcto

---

## 🔌 CATEGORÍA 7: INTEGRACIONES (Media)

### ⏳ T-INT-001: Webhooks Stripe - Eventos Completos
- **Estado:** ⏳ PARCIAL (payment_intent.succeeded solo)
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivo:** `src/pages/api/webhooks/stripe.ts`
- **Tareas específicas:**
  1. Agregar handlers:
     - `payment_intent.succeeded` ✅ (existe)
     - `payment_intent.payment_failed` - Actualizar status
     - `charge.refunded` - Procesar reintegro
     - `customer.created` - Guardar customer ID
  2. Validar firma webhook
  3. Logging de eventos
  4. Tests webhook
- **Aceptación:**
  - [ ] Todos eventos procesados
  - [ ] Signature validation funciona
  - [ ] Tests webhook pass

---

### ⏳ T-INT-002: Email Transaccional con Templates
- **Estado:** ⏳ PARCIAL (Nodemailer existe, templates incompletos)
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `src/emails/templates/order-confirmation.html`
  - `src/emails/templates/return-approval.html`
  - `src/lib/email-service.ts` - Mejorar
- **Tareas específicas:**
  1. Crear templates HTML (confirmación orden, retorno aprobado, etc.)
  2. Usar variables template ({{orderNumber}}, {{returnReason}})
  3. Enviar emails asincronamente
  4. Logging email sent/failed
- **Aceptación:**
  - [ ] Email confirmación orden funciona
  - [ ] Templates formateados
  - [ ] Logging de envíos

---

### ⏳ T-INT-003: Notificaciones Push (Flutter)
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 3 días
- **Archivos:**
  - `flutter_client/lib/services/push_notification_service.dart`
  - `src/pages/api/notifications/send-push.ts` - Endpoint backend
- **Tareas específicas:**
  1. Integrar Firebase Cloud Messaging (FCM)
  2. Request user permission
  3. Store FCM token en Supabase `users.fcm_token`
  4. Backend endpoint para enviar pushes
  5. Casos: orden confirmada, retorno aprobado, etc.
- **Aceptación:**
  - [ ] FCM funcionando
  - [ ] Push notifications recibidas en app
  - [ ] Notificación abre deeplink correcto

---

## 🐛 CATEGORÍA 8: TESTS & QA (Crítica)

### ⏳ T-QA-001: E2E Checkout Flow (Playwright)
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA
- **Estimado:** 3 días
- **Archivo:** `e2e/checkout-flow.spec.ts`
- **Tareas específicas:**
  1. Test: Cliente agrega producto al carrito
  2. Test: Carrito muestra totales correctos
  3. Test: Cliente completa checkout con Stripe
  4. Test: Orden creada en DB
  5. Test: Email confirmación enviado
  6. Errores: Stock insuficiente, coupon inválido
- **Aceptación:**
  - [ ] Checkout flow completo funciona
  - [ ] E2E tests: 6/6 pasados

---

### ⏳ T-QA-002: Coverage de Tests a 80%+
- **Estado:** ⏳ PARCIAL (<70% current)
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 3 días
- **Tareas específicas:**
  1. Ejecutar: `npm run test:coverage`
  2. Identificar archivos <50% coverage
  3. Agregar tests para:
     - `src/lib/cart-validator.ts` (new)
     - `src/lib/coupon-calculator.ts` (new)
     - `src/lib/returns-handler.ts` (new)
     - Middleware validación
- **Aceptación:**
  - [ ] Coverage general ≥80%
  - [ ] Archivos críticos ≥90%

---

### ⏳ T-QA-003: Performance Testing (Lighthouse)
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Tareas específicas:**
  1. Ejecutar Lighthouse en todas páginas públicas
  2. Targets: Performance ≥90, Accessibility ≥95, SEO ≥95
  3. Optimizar:
     - Imágenes (lazy load, WebP)
     - JavaScript (code splitting)
     - CSS (purge unused)
  4. Tests Lighthouse en CI/CD
- **Aceptación:**
  - [ ] Lighthouse score: 90+ en 3 categorías
  - [ ] Métricas Core Web Vitals dentro de límite

---

## 📱 CATEGORÍA 9: FLUTTER APP (Crítica)

### ⏳ T-FLUTTER-001: Setup Project Inicial
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA (blocking)
- **Estimado:** 1 día
- **Archivos:**
  - `flutter_client/pubspec.yaml` - Dependencias
  - `flutter_client/lib/main.dart` - Entry point
  - `flutter_client/lib/screens/home_screen.dart`
  - `flutter_client/lib/screens/product_detail_screen.dart`
- **Tareas específicas:**
  1. `flutter create flutter_client --org com.crm-tienda-ropa`
  2. Agregar dependencias:
     - `riverpod` (state management)
     - `dio` (HTTP client)
     - `go_router` (navigation)
     - `flutter_stripe` (payments)
     - `supabase_flutter` (Supabase client)
  3. Estructura carpetas: screens, widgets, services, models, providers
- **Aceptación:**
  - [ ] Proyecto Flutter compila sin errores
  - [ ] `flutter run` funciona
  - [ ] Hot reload funciona

---

### ⏳ T-FLUTTER-002: Generación Modelos Dart desde OpenAPI
- **Estado:** ✅ Scripts listos (espera ejecutar)
- **Prioridad:** 🔴 CRÍTICA (depende de T-ARCH-005)
- **Estimado:** 1 día (ejecución + ajustes)
- **Tareas específicas:**
  1. Ejecutar: `bash scripts/generate-dart-models.sh`
  2. Validar modelos generados en `flutter_client/lib/models/`
  3. Agregar manualmente: `copyWith()`, `toJson()`, `fromJson()` (si no auto-generados)
  4. Integrar con API client autogenerado
  5. Tests: desserialización JSON
- **Aceptación:**
  - [ ] Modelos Dart generados
  - [ ] JSON desserialización funciona
  - [ ] Tests: 5/5 pasados

---

### ⏳ T-FLUTTER-003: Autenticación Supabase en Flutter
- **Estado:** NO INICIADO
- **Prioridad:** 🔴 CRÍTICA
- **Estimado:** 2 días
- **Archivos:**
  - `flutter_client/lib/services/auth_service.dart`
  - `flutter_client/lib/screens/login_screen.dart`
  - `flutter_client/lib/screens/register_screen.dart`
- **Tareas específicas:**
  1. Integrar `supabase_flutter`
  2. Login con email/password
  3. Registro de usuario
  4. Refresh token automático
  5. Logout
  6. Persistir sesión (SharedPreferences)
- **Aceptación:**
  - [ ] Login funciona
  - [ ] Token persiste entre app restarts
  - [ ] Logout borra sesión

---

### ⏳ T-FLUTTER-004: Catálogo de Productos
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `flutter_client/lib/screens/products_screen.dart`
  - `flutter_client/lib/widgets/product_card.dart`
  - `flutter_client/lib/providers/products_provider.dart` (Riverpod)
- **Tareas específicas:**
  1. Listado paginado de productos
  2. Filtrar por categoría
  3. Búsqueda
  4. Lazy loading de imágenes
  5. Tap abre detalle
- **Aceptación:**
  - [ ] Listado carga productos
  - [ ] Scroll performance fluido
  - [ ] Filtros funcionales

---

### ⏳ T-FLUTTER-005: Carrito & Checkout
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 3 días
- **Archivos:**
  - `flutter_client/lib/screens/cart_screen.dart`
  - `flutter_client/lib/screens/checkout_screen.dart`
  - `flutter_client/lib/providers/cart_provider.dart`
  - `flutter_client/lib/services/payment_service.dart`
- **Tareas específicas:**
  1. Pantalla carrito con add/remove items
  2. Aplicar coupon
  3. Pantalla checkout (dirección, email)
  4. Integración Stripe (flutter_stripe)
  5. Confirmación de orden
- **Aceptación:**
  - [ ] Carrito CRUD funciona
  - [ ] Checkout flujo completo
  - [ ] Pago Stripe funciona

---

### ⏳ T-FLUTTER-006: Mis Órdenes & Historial
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `flutter_client/lib/screens/orders_screen.dart`
  - `flutter_client/lib/screens/order_detail_screen.dart`
  - `flutter_client/lib/providers/orders_provider.dart`
- **Tareas específicas:**
  1. Listado órdenes cliente (RLS filtrado)
  2. Detalle orden con items
  3. Estado orden (pending, completed, etc.)
  4. Botón "Request Return"
  5. Tracking (si disponible)
- **Aceptación:**
  - [ ] Órdenes cliente visibles
  - [ ] Detalle orden completo
  - [ ] Request return funciona

---

## 📊 CATEGORÍA 10: DOCUMENTACIÓN & DEPLOYMENT

### ⏳ T-DOC-001: README Completo
- **Estado:** ⏳ PARCIAL
- **Prioridad:** 🟢 BAJA
- **Estimado:** 1 día
- **Archivo:** `README.md`
- **Tareas:**
  - Setup local (clone, install, env vars)
  - Estructura carpetas explicada
  - Comandos principales (dev, build, test)
  - Deployment instructions
  - Contacto/support

---

### ⏳ T-DOC-002: Architecture Diagram
- **Estado:** NO INICIADO
- **Prioridad:** 🟢 BAJA
- **Estimado:** 1 día
- **Archivos:**
  - `DOCS/ARCHITECTURE.md` con diagrama
  - ASCII art o link a miro/excalidraw
- **Tareas:**
  - Flujo Cliente (web/Flutter) → API → Supabase
  - Componentes: Astro, Node API, Stripe, Email, etc.

---

### ⏳ T-DEPLOY-001: Build & Deploy CI/CD (GitHub Actions)
- **Estado:** ⏳ PARCIAL
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 2 días
- **Archivos:**
  - `.github/workflows/test.yml` - Tests en cada push
  - `.github/workflows/deploy.yml` - Deploy automático
- **Tareas:**
  - Run tests on PR
  - Build Astro site
  - Deploy a Vercel/Netlify
  - Build & sign Flutter app
  - Upload a Play Store/App Store

---

### ⏳ T-DEPLOY-002: Staging Environment
- **Estado:** NO INICIADO
- **Prioridad:** 🟡 MEDIA
- **Estimado:** 1.5 días
- **Tareas:**
  - Clonar DB prod → staging
  - Instancia Stripe staging
  - Email testing (preview, no send)
  - URL staging: https://staging.crm-tienda-ropa.com

---

## 📈 RESUMEN DE PROGRESO

### Hitos

| Hito | Tasks | Status | % |
|------|-------|--------|---|
| **CRÍTICA-1: Seguridad & Arquitectura** | T-ARCH-001 a T-ARCH-006 | ✅ | 100% |
| **CRÍTICA-2: Tests & Validación** | T-ARCH-007 a T-ARCH-009 | ⏳ | 0% |
| **CRÍTICA-3: Flutter Base** | T-FLUTTER-001 a T-FLUTTER-006 | ⏳ | 0% |
| **MEDIA-1: UI/UX & Features** | T-UI-001 a T-LOGIC-003 | ⏳ | 0% |
| **MEDIA-2: Integraciones & DB** | T-DB-001 a T-INT-003 | ⏳ | 0% |
| **BAJA: Docs & Deployment** | T-DOC-001 a T-DEPLOY-002 | ⏳ | 0% |

---

## 🚀 PRÓXIMAS ACCIONES INMEDIATAS (Sin parar)

1. **AHORA:** Validar migraciones SQL en DB
   - `supabase migration up`
   - Verificar policías aplicadas
2. **AHORA:** Ejecutar tests RLS & concurrencia
   - `npm run test -- rls admin-access.test.ts`
   - Verificar 23/23 tests pasados
3. **HOY:** Generar modelos Dart
   - `bash scripts/generate-dart-models.sh`
   - Ajustar serialización
4. **HOY:** Iniciar T-ARCH-007 (validadores endpoints)
5. **MAÑANA:** T-ARCH-008 (logging centralizado)
6. **SEMANA:** T-FLUTTER-001 (setup Flutter)

---

**Estado Total:** 7/57 tareas completadas (12%)  
**Velocidad Objetivo:** 5 tareas/semana (críticas) + 3-4 tareas/semana (media)  
**Timeline:** 8-10 semanas hasta MVP completo  
**Próxima Revisión:** Fin de esta semana
