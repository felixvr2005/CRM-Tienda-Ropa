# 🚀 PROMPT COMPLETO FINAL - CONVERSIÓN FASHIONSTORE A FLUTTER
## Incluyendo TODO lo que falta + Admin Panel Completo + Seguridad

**Fecha:** 1 de febrero de 2026  
**Destinatario:** Claude Opus 4.5  
**Proyecto:** FashionStore - E-commerce de Ropa Premium  
**Alcance:** CONVERSIÓN TOTAL WEB → FLUTTER (iOS, Android, Web)  

---

## 📋 TABLA DE CONTENIDOS MAESTRA

1. [Contexto General](#contexto-general)
2. [Arquitectura Completa](#arquitectura-completa)
3. [Fases 1-8 (Resumen Ejecutivo)](#fases-resumen)
4. [Fase 9: Admin Panel Completo](#fase-9-admin)
5. [Fase 10: Características Avanzadas](#fase-10-avanzadas)
6. [Fase 11: Integraciones Externas](#fase-11-integraciones)
7. [Fase 12: Optimización & Deployment](#fase-12-deployment)
8. [Sistema de Seguridad Completo](#seguridad)
9. [Lista Maestra de 100+ Tareas](#lista-tareas)
10. [Guía de Implementación Profesional](#guia-implementacion)

---

## 🌍 CONTEXTO GENERAL

### Proyecto Actual (Web - Astro)
```
Stack: Astro 5.0 + React + Tailwind + Supabase + Stripe
Estado: 100% funcional con todas las características
BD: PostgreSQL con 13 tablas principales
Auth: Supabase Auth + JWT
Pagos: Stripe integrado
Emails: Nodemailer
Usuarios: 1000+ productos en catálogo, múltiples variantes
```

### Objetivo
Convertir COMPLETAMENTE a Flutter con:
- ✅ Tienda pública 100% funcional (iOS, Android, Web)
- ✅ Panel admin 100% funcional (iOS, Android, Web)
- ✅ Paridad de características con web
- ✅ Seguridad enterprise-grade
- ✅ Performance optimizado
- ✅ Deployment a Play Store + App Store

### Timeline
- **Semanas 1-2:** Setup + Auth + Productos (Fases 1-3)
- **Semanas 3-4:** Carrito + Checkout (Fase 4)
- **Semanas 5-6:** Cuenta + Wishlist (Fase 5)
- **Semanas 7-8:** Admin básico (Fase 6)
- **Semanas 9-10:** Admin completo (Fase 9)
- **Semanas 11-12:** Avanzadas + Deploy (Fases 10-12)
- **Total: 12 semanas** (3 meses intensivos)

---

## 🏗️ ARQUITECTURA COMPLETA

### Estructura de Capas

```
┌──────────────────────────────────────────────────┐
│        PRESENTATION LAYER (UI/UX)               │
│  Screens, Widgets, Navigation, Themes           │
├──────────────────────────────────────────────────┤
│        DOMAIN LAYER (Lógica de Negocio)         │
│  Use Cases, Entities, Interfaces                │
├──────────────────────────────────────────────────┤
│        DATA LAYER (Fuentes de Datos)            │
│  Repositories, Data Sources, Models             │
├──────────────────────────────────────────────────┤
│        CORE LAYER (Servicios Comunes)           │
│  Auth, Config, Logger, Validators, Themes      │
├──────────────────────────────────────────────────┤
│        EXTERNAL LAYER (Integraciones)           │
│  Supabase, Stripe, Firebase, Cloudinary        │
└──────────────────────────────────────────────────┘
```

### State Management (Riverpod)

```
App Level:
├─ authProvider (AsyncValue<User?>)
├─ appConfigProvider (AppConfig)
├─ themeProvider (ThemeMode)
└─ localeProvider (Locale)

Shop Level:
├─ productsProvider (AsyncValue<List<Product>>)
├─ cartProvider (CartState)
├─ wishlistProvider (List<Wishlist>)
└─ checkoutProvider (CheckoutState)

Admin Level:
├─ adminAuthProvider (AsyncValue<AdminUser?>)
├─ dashboardDataProvider (DashboardData)
├─ adminProductsProvider (List<Product>)
└─ ordersProvider (List<Order>)
```

### Base de Datos (Supabase PostgreSQL)

```
Tablas Core (13):
├─ categories
├─ products
├─ product_variants
├─ customers
├─ orders
├─ order_items
├─ cart_items
├─ wishlists
├─ returns
├─ coupons
├─ reviews
├─ admin_users
└─ configuracion

Políticas RLS:
├─ Pública: Lectura productos/categorías
├─ Autenticada: CRUD órdenes/favoritos propios
├─ Admin: Acceso total
└─ Service Role: Backend operations
```

---

## 📝 FASES 1-8 (RESUMEN EJECUTIVO)

### FASE 1: Setup (1 semana)
- ✅ Estructura de carpetas completa
- ✅ pubspec.yaml con 25+ dependencias
- ✅ Tema Material 3 personalizado
- ✅ Constantes (colores, tipografías, dimens)
- ✅ main.dart ejecutable

**Deliverables:** Proyecto Flutter compilable, estructura MVVM lista

### FASE 2: Autenticación (1 semana)
- ✅ AuthService (Supabase)
- ✅ AuthProvider (Riverpod)
- ✅ SplashScreen + LoginScreen + SignupScreen
- ✅ Password recovery
- ✅ Token persistence

**Deliverables:** Flujo auth completo 100% funcional

### FASE 3: Productos (1 semana)
- ✅ ProductService con Supabase
- ✅ HomeScreen con ofertas
- ✅ ProductsListScreen con paginación
- ✅ ProductDetailScreen con galería
- ✅ VariantSelector (talla x color)
- ✅ Búsqueda y filtros

**Deliverables:** Catálogo 100% funcional, 900+ productos navegables

### FASE 4: Carrito & Checkout (1.5 semana)
- ✅ CartProvider (Riverpod + Hive)
- ✅ CartScreen con gestos
- ✅ CheckoutScreen (4 pasos)
- ✅ Stripe integrado
- ✅ OrderConfirmation
- ✅ Cupones

**Deliverables:** Flujo compra completo + pago procesado

### FASE 5: Cuenta & Favoritos (1.5 semana)
- ✅ AccountScreen (dashboard)
- ✅ ProfileEditScreen
- ✅ OrdersHistoryScreen
- ✅ OrderDetailScreen con rastreo
- ✅ WishlistScreen
- ✅ SavedAddresses
- ✅ ReturnsScreen

**Deliverables:** Gestión usuario 100% completa

### FASE 6: Admin Básico (1.5 semana)
- ✅ AdminLoginScreen
- ✅ AdminDashboardScreen
- ✅ AdminProductsListScreen
- ✅ AdminProductFormScreen
- ✅ AdminVariantsPanel
- ✅ AdminOrdersScreen

**Deliverables:** Admin básico funcional

### FASE 7: Características Avanzadas (1 semana)
- ✅ Push notifications
- ✅ Offline mode
- ✅ Dark mode
- ✅ Multi-idioma
- ✅ Reviews y ratings
- ✅ Share y deep linking

**Deliverables:** Funcionalidades premium implementadas

### FASE 8: Testing & Deployment (1 semana)
- ✅ Unit tests (70%+ coverage)
- ✅ Widget tests (60%+ coverage)
- ✅ Integration tests
- ✅ Build APK/IPA
- ✅ Play Store submission
- ✅ App Store submission

**Deliverables:** App en stores, tests pasando

---

## 🔒 FASE 9: ADMIN PANEL COMPLETO

### 9.1 Dashboard Admin Avanzado

**AdminDashboardScreen - Enhanced:**
```dart
Widgets incluidos:
├─ Stats Cards (4):
│  ├─ Total productos
│  ├─ Órdenes (mes actual)
│  ├─ Ingresos (mes)
│  └─ Clientes nuevos
│
├─ Gráficos (4):
│  ├─ Ventas últimos 30 días (LineChart)
│  ├─ Top 5 productos (BarChart)
│  ├─ Distribución categorías (PieChart)
│  └─ Métodos pago (DonutChart)
│
├─ Widgets Rápidos:
│  ├─ Órdenes recientes (tabla scrollable)
│  ├─ Productos bajo stock
│  ├─ Tareas pendientes (lista)
│  └─ Notificaciones urgentes
│
└─ Filtros:
   ├─ Date range (últimos 7/30/90 días, custom)
   ├─ Comparación vs período anterior
   └─ Export datos (CSV, PDF)

Características:
✅ Real-time updates (Socket.io o WebSocket)
✅ Refresh automático cada 5 minutos
✅ Drag-to-refresh manual
✅ Responsive grid (1 col mobile, 2 tablet, 4 desktop)
✅ Loading skeleton durante fetch
✅ Error states con retry
✅ Empty states amigables
```

### 9.2 Gestión Completa de Productos

**AdminProductsListScreen - Table View:**
```dart
Columnas:
├─ Imagen (thumbnail 40x40)
├─ Nombre (truncado, click → detalle)
├─ SKU
├─ Categoría (badge)
├─ Precio (en euros formateado)
├─ Stock (rojo <5, naranja <20, verde >=20)
├─ Estado (Activo/Inactivo - toggle)
├─ Acciones (Edit, Duplicate, Delete, View)

Filtros Avanzados:
├─ Categoría (multi-select dropdown)
├─ Rango precio (dual slider)
├─ Stock:
│  ├─ En stock
│  ├─ Bajo stock (<20)
│  ├─ Sin stock (=0)
│  └─ Todos
├─ Estado (Activo, Inactivo)
├─ Fechas (desde/hasta creación)
├─ Ofertas (con oferta, sin oferta)
└─ Búsqueda (nombre, SKU, descripción)

Sorting:
├─ Nombre (A-Z, Z-A)
├─ Precio (menor, mayor)
├─ Stock (menor, mayor)
├─ Fecha creación (nueva, antigua)
├─ Fecha actualización
└─ Más vendido

Bulk Actions:
├─ Delete múltiples (con confirmación)
├─ Cambiar categoría a múltiples
├─ Cambiar precio a múltiples (+%, +€, -%)
├─ Activar/desactivar múltiples
├─ Exportar seleccionados (CSV)
└─ Cambiar estado oferta múltiples

Paginación:
├─ Mostrar X items por página (10, 25, 50, 100)
├─ Ir a página específica
├─ Total items visible
└─ Infinite scroll opcional

Performance:
✅ Virtual scrolling para 1000+ items
✅ Lazy load imágenes
✅ Caching de filas
```

**AdminProductFormScreen - Create/Edit:**
```dart
Sección 1: Información Básica
├─ Nombre* (text field, required)
├─ Slug (auto-generated, editable)
├─ Descripción corta (500 chars, contador)
├─ Descripción larga (rich text editor):
│  ├─ Bold, Italic, Underline
│  ├─ Headers (H1-H3)
│  ├─ Listas (bullet, numbered)
│  ├─ Links
│  └─ Imágenes
├─ Categoría* (dropdown searchable)
└─ SKU* (unique validation)

Sección 2: Precios y Descuentos
├─ Precio base* (euros, decimales)
├─ ¿En oferta? (switch toggle)
│  └─ Si activo:
│     ├─ Precio oferta (euros)
│     ├─ Descuento calculado automático (%)
│     ├─ Fecha inicio oferta (date picker)
│     └─ Fecha fin oferta (date picker)
├─ Mostrar antes/después (preview)
└─ Validación: precio_oferta < precio_base

Sección 3: Stock
├─ Stock actual* (número)
├─ Stock mínimo* (número, para alertas)
├─ Mostrar indicador stock en tienda:
│  ├─ "En stock"
│  ├─ "Pocas unidades"
│  └─ "Sin stock"
└─ Auto-reorder si < stock_minimo (checkbox)

Sección 4: Imágenes
├─ Upload area (drag & drop + file picker)
│  ├─ Aceptar JPG, PNG, WebP
│  ├─ Max 5MB por imagen, max 8 imágenes
│  ├─ Progress bar de upload
│  ├─ Preview inmediato
│  └─ Error si formato/tamaño inválido
├─ Reordenar (drag handle)
├─ Para cada imagen:
│  ├─ Alt text (para SEO/a11y)
│  ├─ Crop tool (simple, 1:1, 4:3, 16:9)
│  ├─ Zoom slider
│  ├─ Delete button
│  └─ Set as primary (checkbox)
├─ Subidas a Supabase Storage
└─ URLs transformadas con Cloudinary

Sección 5: Información Adicional
├─ Material (text field)
├─ Instrucciones de cuidado (text area)
├─ Peso (gramos)
├─ Dimensiones (largo x ancho x alto cm)
├─ Tags/Keywords (multi-input, separated by commas)
└─ Garantía (text)

Sección 6: Variantes (Talla x Color)
├─ Botón "Editar variantes"
│  └─ Abre AdminVariantsPanel (modal)
├─ Resumen visual:
│  └─ Tabla simple (talla, color, stock)
└─ Quick add botón (+)

Sección 7: Meta SEO
├─ Meta title (70 chars max, contador)
├─ Meta description (160 chars max, contador)
├─ Slug final (preview)
└─ Genera URL preview: /productos/mi-slug

Sección 8: Estado del Producto
├─ ¿Activo? (toggle - default true)
├─ ¿Destacado? (toggle)
├─ ¿Nuevo? (toggle - auto remove después 30 días)
├─ ¿Es oferta? (toggle - redundante con sección 2)
└─ Fecha publicación (datetime picker)

Acciones Bottom:
├─ "Guardar cambios" (primary button)
├─ "Guardar y crear otro" (secondary)
├─ "Guardar como borrador" (secondary)
├─ "Cancelar" (tertiary)
└─ "Eliminar" (danger button rojo si edit)

Validación en Tiempo Real:
✅ Campo requerido: Nombre, Precio, Stock, Categoría
✅ Unique: SKU, Slug
✅ Format: Precio (decimales), Stock (número)
✅ Range: Precio > 0, Stock >= 0
✅ Mostrar errores inline con icono ⚠️
✅ Disable submit si hay errores

Comportamiento:
✅ Auto-save borrador cada 30s (sin guardar)
✅ Warning si salir sin guardar
✅ Loading state durante guardado
✅ Success toast después de guardar
✅ Error toast si falla
✅ Redirect a listado después de crear
✅ Mantener en form después de "guardar otro"

Performance:
✅ Lazy load rich text editor
✅ Debounce en búsqueda categoría
✅ Optimistic updates para campos simples
```

**AdminVariantsPanel - Gestión de Variantes:**
```dart
Tabla Principal:
Columnas: Talla | Color | Color Hex | Stock | SKU | Precio Adj. | Imagen | Acciones

Features:
├─ Añadir variante (botón + en toolbar)
├─ Editar variante (click en fila)
├─ Eliminar variante (icon trash, confirmación)
├─ Reordenar (drag handle)
├─ Bulk upload CSV:
│  ├─ Formato: size,color,color_hex,stock,sku,price_adjustment
│  ├─ Preview antes de importar
│  ├─ Validar duplicados
│  └─ Importar todos
├─ Export tabla a CSV
├─ Search/filter por talla o color
└─ Sort por cualquier columna

Modal Añadir/Editar Variante:
├─ Talla (dropdown: XS, S, M, L, XL, XXL)
├─ Color (text field + color picker RGB visual)
│  ├─ Muestra cuadro con color seleccionado
│  ├─ Ingresa hex o RGB
│  └─ Preview del color
├─ Stock (número requerido)
├─ SKU (opcional, unique validation)
├─ Precio ajuste (opcional, pode ser negativo)
├─ Imagen (upload o seleccionar de existentes)
├─ Buttons: Guardar / Cancelar
└─ Validación: Talla + Color = UNIQUE pair

Performance:
✅ Virtual scrolling si >100 variantes
✅ Cached color picker
✅ Lazy load imagen preview
```

### 9.3 Gestión de Categorías

**AdminCategoriesScreen:**
```dart
Elementos:
├─ Botón "Nueva categoría"
├─ Tabla:
│  ├─ Orden (drag handle)
│  ├─ Imagen (thumbnail)
│  ├─ Nombre
│  ├─ Slug
│  ├─ Cantidad productos
│  ├─ Estado (Activo/Inactivo - toggle)
│  └─ Acciones (Edit, Delete)
├─ Filtros:
│  ├─ Búsqueda por nombre
│  └─ Estado (Todas, Activas, Inactivas)
├─ Ordenamiento por:
│  ├─ Nombre (A-Z, Z-A)
│  ├─ Cantidad productos
│  └─ Fecha creación
└─ Botón "Guardar orden" (después drag)

AdminCategoryFormScreen:
├─ Nombre* (text field)
├─ Slug* (auto-generate, editable)
├─ Descripción (text area)
├─ Imagen (upload)
├─ Categoría padre (dropdown para subcategorías)
├─ Orden (número)
├─ ¿Activa? (toggle)
├─ Buttons: Guardar / Cancelar
└─ Si edit: Botón Eliminar (con confirmación)

Validación:
✅ Nombre requerido
✅ Slug único
✅ No permitir eliminar si tiene productos
✅ No permitir loops (subcategoría no puede ser padre de sí misma)
```

### 9.4 Gestión de Órdenes (Enhanced)

**AdminOrdersListScreen - Advanced:**
```dart
Tabla Avanzada:
├─ Número orden (link → detalle)
├─ Cliente (nombre - link → perfil cliente)
├─ Fecha creación (formato DD/MM/YYYY HH:MM)
├─ Estado (badge colored):
│  ├─ Pendiente (gris)
│  ├─ Pagado (verde)
│  ├─ Enviado (azul)
│  ├─ Entregado (verde oscuro)
│  ├─ Cancelado (rojo)
│  └─ Reembolsado (naranja)
├─ Monto total (€ formateado)
├─ Items (cantidad)
├─ Método pago (Stripe badge)
└─ Acciones (Ver, Editar estado, Enviar email, Más)

Filtros Avanzados:
├─ Rango fechas (from/to date picker)
├─ Estado (multi-select)
├─ Rango monto (dual slider)
├─ Cliente (búsqueda + dropdown)
├─ Método pago (multi-select)
├─ Enviado a (country dropdown)
└─ Con devolución (sí/no toggle)

Búsqueda:
├─ Por número orden (starts with)
├─ Por email cliente
├─ Por nombre cliente
└─ Por dirección

Sorting:
├─ Fecha (más nuevo, más antiguo)
├─ Monto (mayor, menor)
├─ Estado
└─ Cliente

Bulk Actions:
├─ Cambiar estado múltiples órdenes
├─ Enviar email notificación
├─ Exportar múltiples (CSV, PDF)
└─ Marcar revisado

Paginación:
├─ Items por página (10, 25, 50)
├─ Ir a página
└─ Total de órdenes

AdminOrderDetailScreen - Full Management:
├─ Header:
│  ├─ Número orden (copiable al clipboard)
│  ├─ Estado actual (badge)
│  ├─ Fecha creación
│  ├─ Fecha pagado (si aplica)
│  └─ Botones quick actions
│
├─ Sección 1: Cliente
│  ├─ Nombre, email, teléfono
│  ├─ Historial compras (link → cliente perfil)
│  └─ Link "Contactar cliente" (open email)
│
├─ Sección 2: Items Ordered
│  ├─ Tabla:
│  │  ├─ Imagen producto
│  │  ├─ Nombre (link → producto)
│  │  ├─ Talla, Color
│  │  ├─ Precio unitario
│  │  ├─ Cantidad
│  │  └─ Subtotal
│  └─ Carrito editable:
│     ├─ Cambiar cantidad
│     ├─ Eliminar item
│     └─ Recalcular totales
│
├─ Sección 3: Totales
│  ├─ Subtotal
│  ├─ IVA (21%)
│  ├─ Envío (monto)
│  ├─ Cupón (descuento)
│  └─ TOTAL (grande, bold)
│
├─ Sección 4: Dirección de Envío
│  ├─ Nombre, dirección, ciudad, CP, país
│  ├─ Botón "Editar" (abre modal)
│  └─ Botón "Generar etiqueta envío"
│
├─ Sección 5: Dirección de Facturación
│  ├─ Igual a envío (checkbox)
│  └─ Si diferente: mostrar dirección
│
├─ Sección 6: Pago
│  ├─ Método: Stripe
│  ├─ Stripe Payment ID
│  ├─ Status: Pagado/No pagado
│  ├─ Botón "Retry pago" (si falló)
│  └─ Botón "Generar factura PDF"
│
├─ Sección 7: Rastreo (Timeline)
│  ├─ Step 1: Orden recibida (timestamp)
│  ├─ Step 2: Pago procesado (timestamp)
│  ├─ Step 3: Pedido enviado:
│  │  ├─ Timestamp
│  │  ├─ Número seguimiento (link externo)
│  │  └─ Transportista (link → tracking)
│  ├─ Step 4: En tránsito (timestamp si info disponible)
│  └─ Step 5: Entregado (timestamp)
│
├─ Sección 8: Gestión Estado
│  ├─ Dropdown estado actual
│  ├─ Cambiar a nuevo estado (con confirmación)
│  ├─ Notas internas (text area)
│  ├─ Historial cambios:
│  │  ├─ Quién cambió
│  │  ├─ Cuándo
│  │  ├─ De estado a estado
│  │  └─ Notas asociadas
│  └─ Botón "Guardar cambios"
│
├─ Sección 9: Acciones Admin
│  ├─ "Enviar email cliente" (dropdown templates):
│  │  ├─ Confirmación pago
│  │  ├─ Notificación envío
│  │  ├─ Recordatorio entrega
│  │  ├─ Solicitar review
│  │  └─ Custom (text area)
│  ├─ "Generar etiqueta envío" (PDF download)
│  ├─ "Generar factura" (PDF download)
│  ├─ "Marcar como revisado" (checkbox)
│  ├─ "Ver en tienda pública" (link)
│  └─ "Eliminar orden" (danger, confirmación)
│
├─ Sección 10: Devoluciones
│  ├─ Si no hay devolución:
│  │  └─ Botón "Crear solicitud devolución"
│  └─ Si existe:
│     ├─ Estado devolución (badge)
│     ├─ Motivo
│     ├─ Items a devolver
│     ├─ Monto reembolso
│     └─ Botones acciones según estado
│
└─ Sección 11: Activity Log
   ├─ Timeline de todos los eventos
   ├─ Quién, qué, cuándo
   └─ Auto-scroll al evento más reciente

Acciones Inline:
✅ Click estado → cambiar (modal confirmación)
✅ Click cliente → ir a perfil
✅ Click producto → ir a detalle
✅ Click dirección → copiar al clipboard
✅ Click teléfono → call (si iOS) o abrir dialer
✅ Click email → abrir cliente email
```

### 9.5 Gestión de Devoluciones

**AdminReturnsScreen:**
```dart
Elementos:
├─ Estadísticas (cards):
│  ├─ Total devoluciones
│  ├─ Pendientes
│  ├─ Aprobadas
│  ├─ Rechazadas
│  ├─ Recibidas
│  └─ Monto total reembolsos
│
├─ Tabla devoluciones:
│  ├─ ID devolución
│  ├─ Número orden (link)
│  ├─ Cliente (link)
│  ├─ Producto (nombre truncado)
│  ├─ Motivo devolución
│  ├─ Cantidad
│  ├─ Monto solicitud
│  ├─ Estado (badge colored):
│  │  ├─ Solicitada (gris)
│  │  ├─ Aprobada (verde)
│  │  ├─ Rechazada (rojo)
│  │  ├─ Recibida (azul)
│  │  └─ Reembolsada (verde oscuro)
│  ├─ Fecha solicitud
│  └─ Acciones (Ver detalle, Cambiar estado)
│
├─ Filtros:
│  ├─ Estado (multi-select)
│  ├─ Rango fechas
│  ├─ Monto (range)
│  └─ Motivo (multi-select)
│
└─ Sort:
   ├─ Fecha (nuevo, antiguo)
   ├─ Monto (mayor, menor)
   ├─ Estado
   └─ Cliente

AdminReturnDetailScreen:
├─ Header con ID y estado
├─ Información orden original
├─ Información cliente
├─ Item a devolver
├─ Motivo devolución (expandable)
├─ Notas cliente (si incluidas)
├─ Fotos adjuntas (si existen, galería)
├─ Dirección devolución (si aprobada)
├─ Número seguimiento devolución
├─ Gestión estado:
│  ├─ Aprobar (genera etiqueta, envía email)
│  ├─ Rechazar (requiere motivo)
│  ├─ Marcar recibida (cuando vuelve)
│  ├─ Procesar reembolso (manual o automático)
│  └─ Cancelar devolución
├─ Monto reembolso (auto-calculado, editable)
├─ Histórico de cambios
└─ Botones acciones principales
```

### 9.6 Gestión de Cupones/Descuentos

**AdminCouponsScreen:**
```dart
Tabla:
├─ Código (uppercase badge)
├─ Descripción (truncada)
├─ Tipo descuento (% o €)
├─ Valor descuento
├─ Monto mínimo orden (si aplica)
├─ Uso: X/Y (usado / límite)
├─ Fecha inicio - fin
├─ Estado (Activo/Inactivo toggle)
├─ Creado por (admin)
├─ Fecha creación
└─ Acciones (Edit, Duplicate, Delete)

Filtros:
├─ Estado (Activos, Inactivos, Expirados)
├─ Tipo (Porcentaje, Cantidad fija)
├─ Código (búsqueda)
├─ Rango fechas
└─ Mostrar solo casi agotados

Stats cards:
├─ Total cupones activos
├─ Cupones usados (mes)
├─ Descuento total generado (mes)
└─ Cupón más popular

AdminCouponFormScreen:
├─ Código* (uppercase auto)
├─ Descripción (text area)
├─ Tipo descuento (radio: % o €)
├─ Valor descuento* (número)
├─ Máximo descuento (si % y quieres limitar)
├─ Monto mínimo orden (opcional)
├─ Máximo usos (optional, 0 = ilimitado)
├─ Máximo usos por cliente (optional)
├─ Fechas:
│  ├─ Inicio (date/time picker)
│  ├─ Fin (date/time picker)
│  └─ Duración automática calculada
├─ Productos aplicables:
│  ├─ Todos (radio)
│  ├─ Categoría específica (dropdown)
│  └─ Productos específicos (multi-select)
├─ Clientes aplicables:
│  ├─ Todos (radio)
│  ├─ Email específicos (multi-input)
│  └─ Solo nuevos clientes (checkbox)
├─ Activo* (toggle)
├─ Botones: Guardar / Cancelar
└─ Si edit: Botón Eliminar

Validación:
✅ Código único
✅ Valor > 0
✅ Fecha fin > fecha inicio
✅ Máximo usos >= 0
```

### 9.7 Configuración de Tienda

**AdminSettingsScreen:**
```dart
Tabs/Acordeones:

TAB 1: Información Tienda
├─ Logo (upload, preview)
├─ Favicon (upload, preview)
├─ Nombre tienda
├─ Slogan/tagline
├─ Email contacto
├─ Teléfono
├─ Dirección (multiline)
├─ Redes sociales (links):
│  ├─ Instagram URL
│  ├─ Facebook URL
│  ├─ Twitter/X URL
│  ├─ TikTok URL
│  └─ YouTube URL
└─ Horario atención (text)

TAB 2: Configuración Tienda
├─ Moneda (dropdown: EUR, USD, GBP, etc)
├─ Símbolo moneda (auto o manual)
├─ Zona horaria (dropdown)
├─ Idioma por defecto (dropdown)
├─ Idiomas soportados (multi-select)
├─ Oferta activa (toggle)
├─ Modo mantenimiento (toggle):
│  ├─ Mensaje mantenimiento (text area)
│  └─ Solo admins pueden ver tienda
└─ Modo demo (toggle)

TAB 3: Configuración Envío
├─ Costo envío estándar (€)
├─ Envío gratis desde (€)
├─ Empresas transporte (multi-select):
│  ├─ Correos (checkbox)
│  ├─ MRW (checkbox)
│  ├─ DHL (checkbox)
│  └─ Otras...
├─ Días procesamiento (número)
├─ Destinos envío (table):
│  ├─ País
│  ├─ Costo
│  ├─ Días estimados
│  └─ Acciones (Edit, Delete)
│  └─ Botón "Añadir destino"
└─ Peso máximo pedido (kg)

TAB 4: Impuestos & Precios
├─ IVA (%)
├─ Aplicar IVA en:
│  ├─ Precios mostrados (inclusive - radio)
│  └─ Sumar al final (exclusive - radio)
├─ Mostrar precios en tienda (radio):
│  ├─ Con IVA
│  └─ Sin IVA
├─ Redondeo precio:
│  ├─ Al céntimo
│  ├─ A 0.10€
│  ├─ A 0.50€
│  └─ A 1.00€
└─ Margen beneficio mínimo (%)

TAB 5: Pagos (Stripe)
├─ Stripe mode:
│  ├─ Modo test (radio)
│  └─ Modo live (radio)
├─ Stripe Public Key (display ●●●●)
├─ Stripe Secret Key (display ●●●●)
├─ Webhooks status (green/red indicator)
├─ Últimas transacciones:
│  └─ Tabla últimas 10 transacciones
└─ Test transaction botón

TAB 6: Emails
├─ Email remitente (from address)
├─ Nombre remitente
├─ Responder a (reply-to)
├─ SMTP Settings:
│  ├─ Host
│  ├─ Puerto
│  ├─ Usar TLS/SSL (checkbox)
│  ├─ Usuario
│  └─ Contraseña (no mostrar)
├─ Templates:
│  ├─ Email confirmación orden
│  ├─ Email envío realizado
│  ├─ Email entrega
│  ├─ Email devolución aprobada
│  ├─ Email devolución rechazada
│  └─ Para cada: Editar template (rich editor)
├─ Test email (botón + campo email)
└─ Envío automático (toggle para cada tipo)

TAB 7: Políticas
├─ Términos servicio (rich editor)
├─ Política privacidad (rich editor)
├─ Política devoluciones (rich editor)
├─ Días devolución (número)
├─ Costo devolución (€)
└─ Preguntas frecuentes (FAQ):
   ├─ Lista Q&A
   ├─ Botón "Añadir pregunta"
   └─ Para cada: Edit, Delete

TAB 8: SEO Global
├─ Meta title default (70 chars, contador)
├─ Meta description default (160 chars, contador)
├─ Meta keywords (comma separated)
├─ Google Analytics ID
├─ Google Search Console verification
├─ Robots.txt (editable textarea)
├─ Sitemap.xml (link generado)
└─ Open Graph image (upload)

TAB 9: Notificaciones
├─ Email notificaciones admin (multi-input):
│  ├─ Nueva orden
│  ├─ Nuevo cliente
│  ├─ Stock bajo
│  ├─ Contacto form
│  └─ Error crítico
├─ SMS notificaciones (checkbox + Twilio config):
│  ├─ Número recibir SMSs
│  ├─ Eventos notificación
│  └─ Test SMS botón
├─ Push notifications (toggle)
└─ Webhook settings:
   ├─ URL webhook (text field)
   ├─ Events a triggear (multi-select)
   └─ Test webhook botón

TAB 10: Seguridad
├─ 2FA admin (toggle)
├─ Backup automático (toggle):
│  ├─ Frecuencia (diaria, semanal, mensual)
│  └─ Mantener backups (número de días)
├─ Expiración sesión admin (minutos)
├─ Intentos login fallidos (número antes de bloqueo)
├─ Bloqueo IP after (número intentos)
├─ Listar IPs bloqueadas (table + botón desbloquear)
├─ Regenerar API keys (botón danger)
├─ Audit log (ver últimas acciones admins)
└─ GDPR:
   ├─ Permitir delete datos cliente (checkbox)
   ├─ Retención datos (meses)
   └─ Botón export datos cliente

Validación & Saving:
✅ Validación formato email, URLs, etc
✅ Confirmar antes de cambiar modo (test ↔ live)
✅ Confirmar antes de cambiar 2FA
✅ Loading durante guardado
✅ Success toast
✅ Auto-save borrador cada 30s
✅ Warning si salir sin guardar
```

### 9.8 Analytics Avanzado

**AdminAnalyticsScreen:**
```dart
Top Section:
├─ Date range selector (7d, 30d, 90d, custom)
├─ Comparar vs período anterior (toggle)
├─ Export buttons (CSV, PDF, Excel)
└─ Refresh button

Stats Cards (4):
├─ Ingresos totales (con % vs anterior)
├─ Número órdenes (con % vs anterior)
├─ Ticket promedio (con % vs anterior)
└─ Tasa conversión (con % vs anterior)

Section 1: Gráficos Principales
├─ Ingresos por día (LineChart):
│  ├─ Dos líneas: Ingresos y Órdenes
│  ├─ Tooltip on hover
│  └─ Exportable
├─ Top 10 productos (BarChart):
│  ├─ Por ingresos generados
│  ├─ Sort descendente
│  └─ Click → ir a producto
├─ Distribución categorías (PieChart):
│  ├─ Por cantidad vendida
│  └─ Mostrar % y cantidad
├─ Métodos pago (DonutChart):
│  ├─ Stripe vs otros
│  ├─ % de cada uno
│  └─ Cantidad transacciones

Section 2: Tablas Detalladas
├─ Top 20 clientes (por gasto):
│  ├─ Nombre, Email
│  ├─ Total gastado
│  ├─ Órdenes
│  ├─ Última compra
│  └─ Click → ir a perfil
│
├─ Top 20 productos (por ingresos):
│  ├─ Nombre, SKU
│  ├─ Cantidad vendida
│  ├─ Ingresos
│  ├─ Rating promedio
│  └─ Click → ir a producto
│
├─ Reporte por categoría:
│  ├─ Categoría, Cantidad vendida
│  ├─ Ingresos, Ticket promedio
│  ├─ % del total
│  └─ Click → filtrar productos
│
└─ Reporte por región (si data disponible):
   ├─ País, Ciudad
   ├─ Cantidad órdenes
   ├─ Ingresos totales
   └─ Ticket promedio

Section 3: Métricas Operacionales
├─ Órdenes por estado (stacked bar):
│  ├─ Pendiente, Pagado, Enviado, Entregado
│  ├─ Colores por estado
│  └─ Timeline de hoy, semana, mes
│
├─ Tiempo promedio entrega:
│  ├─ Desde pago → envío
│  ├─ Desde envío → entrega
│  └─ Total orden a entrega
│
├─ Tasa devoluciones:
│  ├─ % de devoluciones
│  ├─ Motivos más comunes (pie)
│  └─ Tendencia en tiempo
│
└─ Carrito abandonado:
   ├─ % abandono
   ├─ Valor promedio carrito
   ├─ Recuperación (emails enviados)
   └─ Tasa conversión recovery

Section 4: SEO & Traffic
├─ Top keywords (si Google Analytics)
├─ Tráfico referrer (de dónde vienen usuarios)
├─ Dispositivos más usados
├─ Browsers más usados
└─ Sistema operativo más usado

Section 5: Reportes Personalizados
├─ Crear reporte personalizado:
│  ├─ Seleccionar métricas (multi-select)
│  ├─ Seleccionar dimensiones (multi-select)
│  ├─ Seleccionar fecha range
│  ├─ Guardar como favorito (checkbox)
│  └─ Botón "Generar reporte"
└─ Mis reportes (lista guardados)

Export Options:
├─ CSV (para Excel)
├─ PDF (con gráficos)
├─ Excel (.xlsx con múltiples sheets)
└─ Email reporte (field email + send botón)

Responsiveness:
✅ Mobile: Gráficos en scroll horizontal
✅ Tablet: 2 columnas de gráficos
✅ Desktop: 4 columnas de gráficos
```

---

## 🎯 FASE 10: CARACTERÍSTICAS AVANZADAS

### 10.1 Sistema de Notificaciones Completo

**Push Notifications:**
```dart
flutter_local_notifications configurado
├─ Canales (Android):
│  ├─ Órdenes (urgency: default)
│  ├─ Ofertas (urgency: low)
│  ├─ Sistema (urgency: high)
│  └─ Admin (urgency: max)
│
├─ Eventos que disparan:
│  ├─ Pago confirmado
│  ├─ Pedido enviado (+ número seguimiento)
│  ├─ Pedido próximo a entregar
│  ├─ Devolución aprobada/rechazada
│  ├─ Nueva oferta (si suscrito)
│  ├─ Reabastecimiento producto favorito
│  └─ Admin: Nueva orden urgente
│
├─ Customización:
│  ├─ Soporte emoji en títulos
│  ├─ Icono custom (app icon)
│  ├─ Color accent
│  ├─ Sound custom (opcional)
│  ├─ Vibración pattern
│  └─ LED color (Android)
│
├─ Interacción:
│  ├─ Tap notification → navega a pantalla relevant
│  ├─ Swipe dismiss
│  ├─ Acciones rápidas (if supported):
│  │  ├─ Ver orden
│  │  ├─ Rastrear envío
│  │  └─ Contactar soporte
│  └─ Deep linking: fashionstore://orders/{id}
│
└─ Preferencias usuario:
   ├─ Enable/disable por tipo
   ├─ Horario silencioso (desde/hasta)
   ├─ Sonido on/off
   ├─ Vibración on/off
   └─ Mostrar preview (on/off si contenido sensible)

In-App Notifications:
├─ Toast corto (2-3 segs):
│  ├─ "Producto añadido al carrito"
│  ├─ "Error al procesar pago"
│  └─ Animación slide-up
│
├─ Snackbar (5 segs, dismisible):
│  ├─ Con acciones (Deshacer, Cerrar)
│  └─ Posición bottom
│
└─ Dialog crítico (requiere interacción):
   ├─ Stock agotado
   ├─ Sesión expirada
   └─ Error crítico

NotificationCenter:
├─ Listado de notificaciones leídas/no leídas
├─ Filtros (por tipo, fecha)
├─ Mark as read individual
├─ Mark all read
└─ Clear all (con confirmación)
```

### 10.2 Búsqueda Avanzada

**SearchScreen Advanced:**
```dart
Búsqueda por voz:
├─ Botón micrófono en search bar
├─ Transcripción real-time
├─ Soporte idiomas: ES, EN
├─ Fallback a texto si voz falla

Búsqueda por imagen:
├─ Botón cámara en search bar
├─ Tomar foto o seleccionar galería
├─ Subir a backend para image recognition
├─ Mostrar productos similares

Historial búsquedas:
├─ Últimas 15 búsquedas
├─ Timestamps
├─ Eliminar individual o todo
├─ Quick access desde history

Sugerencias automáticas:
├─ Mientras escribes (debounce 300ms)
├─ Búsquedas populares
├─ Categorías sugeridas
├─ Productos by trending

Filtros inline:
├─ Categoría (buttons o dropdown)
├─ Precio (range slider)
├─ Talla (buttons multi-select)
├─ Color (color picker visual)
├─ Ordenar (popular, nuevo, precio)
└─ En stock only (checkbox)

Resultados:
├─ Grid 2 cols mobile, 3 tablet, 4 desktop
├─ Infinite scroll al final
├─ Mostrar total resultados
├─ Alternancia resultado + anuncio (opcional)
├─ Empty state si sin resultados

Advanced Search:
├─ Expandible advanced options
├─ Búsqueda por:
│  ├─ Material específico
│  ├─ Rango precio exacto
│  ├─ Fechas (nuevo desde)
│  ├─ Rating mínimo
│  ├─ Solo con reviews
│  ├─ En oferta
│  ├─ Envío gratis
│  └─ Combinaciones (AND/OR)
└─ Guardar búsquedas frecuentes
```

### 10.3 Reviews y Ratings

**Reviews System:**
```dart
Mostrar Reviews (ProductDetailScreen):
├─ Rating promedio (estrellas grandes)
├─ Cantidad reviews (link → abrir reviews)
├─ Distribution:
│  ├─ 5⭐ (X%)
│  ├─ 4⭐ (X%)
│  ├─ 3⭐ (X%)
│  ├─ 2⭐ (X%)
│  └─ 1⭐ (X%)
├─ Ordenar reviews (más útil, más nuevo, mejor rating)
├─ Filtro rating (mostrar solo 5⭐, solo 1⭐, etc)
├─ Cada review:
│  ├─ Nombre cliente (o Anonymous)
│  ├─ Rating (estrellas)
│  ├─ Título
│  ├─ Descripción
│  ├─ Fotos (si adjuntó)
│  ├─ Fecha
│  ├─ "Útil" contador + botón
│  ├─ Respuesta admin (si existe)
│  └─ Report review (spam/offensive)
├─ Lazy load más reviews al scroll
└─ Botón "Escribir reseña"

Create Review (post-purchase):
├─ Solo si usuario compró el producto
├─ Solo después de X días de compra
├─ Rating (1-5 estrellas interactivo)
├─ Título (50 chars max, contador)
├─ Descripción (1000 chars max, contador)
├─ Upload fotos (max 3, max 5MB cada)
├─ Checkbox "Producto comprado verificado"
├─ Botón enviar
├─ Success message + redirect product detail

Review Management (Admin):
├─ AdminReviewsScreen:
│  ├─ Tabla con reviews:
│  │  ├─ Producto (link)
│  │  ├─ Cliente (link)
│  │  ├─ Rating
│  │  ├─ Título (truncado)
│  │  ├─ Fecha
│  │  ├─ Estado (Publicada/Pendiente/Rechazada)
│  │  └─ Acciones (Ver, Responder, Aprobar, Rechazar)
│  ├─ Filtros:
│  │  ├─ Estado
│  │  ├─ Rating
│  │  ├─ Producto
│  │  └─ Fecha range
│  └─ Bulk approve/reject
│
└─ AdminReviewDetailScreen:
   ├─ Review completa
   ├─ Fotos adjuntas (galería)
   ├─ Cliente info
   ├─ Respuesta admin (si existe):
   │  ├─ Mostrar respuesta
   │  ├─ Botón editar
   │  └─ Botón eliminar
   ├─ Area nueva respuesta:
   │  ├─ Text editor
   │  ├─ Botón responder
   │  └─ Botón cancelar
   ├─ Aprobar/Rechazar review
   ├─ Marcar como útil/spam (admin)
   └─ Delete option (danger)
```

### 10.4 Subscripción a Ofertas

**Newsletter System:**
```dart
Signup Form (HomeScreen):
├─ Email field (required)
├─ Checkbox términos privacidad
├─ Botón suscribir
├─ Success: "Confirmación enviada a tu email"

Preference Center (AccountScreen):
├─ Newsletter suscripción (toggle)
├─ Si suscrito:
│  ├─ Email registrado (no editable, solo mostrarlo)
│  ├─ Frecuencia (semanal, bi-semanal, mensual - radio)
│  ├─ Categorías preferidas (multi-select):
│  │  ├─ Todas las categorías
│  │  └─ Seleccionar específicas
│  ├─ Tipo de emails (multi-checkbox):
│  │  ├─ Nuevas colecciones
│  │  ├─ Ofertas flash
│  │  ├─ Recomendaciones personalizadas
│  │  ├─ Noticias blog
│  │  └─ Eventos especiales
│  └─ Botones: Guardar / Desuscribir

Admin Newsletter:
├─ AdminNewsletterScreen:
│  ├─ Stats:
│  │  ├─ Total suscriptores
│  │  ├─ Activos
│  │  ├─ Inactivos
│  │  ├─ Tasa apertura (última campaña)
│  │  └─ Tasa click (última campaña)
│  ├─ Lista suscriptores (tabla):
│  │  ├─ Email
│  │  ├─ Estado (Activo/Inactivo)
│  │  ├─ Preferencias
│  │  ├─ Fecha suscripción
│  │  ├─ Última apertura
│  │  └─ Acciones (Ver, Editar, Eliminar)
│  ├─ Crear campaña botón
│  └─ Historial campañas enviadas
│
└─ AdminNewsletter EditorScreen:
   ├─ Nombre campaña
   ├─ Asunto email
   ├─ Email body (rich editor):
   │  ├─ Imágenes
   │  ├─ Links
   │  ├─ Personalizaciones {{nombre}}, {{email}}
   │  └─ Botones CTA
   ├─ Destinatarios:
   │  ├─ Todos suscriptores (radio)
   │  ├─ Categoría específica (radio)
   │  └─ Segmento personalizado (radio)
   ├─ Programar envío:
   │  ├─ Enviar ahora (checkbox)
   │  └─ Si no: fecha/hora programada
   ├─ Preview email (botón)
   ├─ Test send to email (field + botón)
   └─ Botones: Enviar / Borrador / Cancelar
```

### 10.5 Sistema de Chat/Soporte

**Customer Support:**
```dart
Support Widget (FloatingActionButton):
├─ FAB button esquina inferior derecha
├─ Badge si hay mensajes no leídos
├─ Al tap: abre ChatScreen

ChatScreen:
├─ Header:
│  ├─ "Soporte FashionStore"
│  ├─ Status online/offline
│  └─ Botón cerrar
├─ FAQ Quick Links (top):
│  ├─ "¿Dónde está mi pedido?"
│  ├─ "¿Cómo devolver?"
│  ├─ "Cambios y tallas"
│  └─ "Contactar directamente"
├─ Mensajes (chat bubble style):
│  ├─ Mensajes usuario (derecha, azul)
│  ├─ Mensajes bot/admin (izquierda, gris)
│  ├─ Timestamps
│  ├─ Typing indicator si escribiendo
│  └─ Read receipts
├─ Input area (bottom):
│  ├─ Text field (multiline)
│  ├─ Attachment button (imágenes)
│  ├─ Send button
│  ├─ Emoji picker (opcional)
│  └─ Voice message (opcional)
└─ Session info:
   ├─ ID chat
   ├─ Duración sesión
   └─ Opción cerrar chat

Chatbot Básico:
├─ NLU (Natural Language Understanding):
│  ├─ Detectar intención: tracking, returns, sizes, etc
│  ├─ Extraer entidades: order_id, email, etc
│  └─ Match contra FAQ
├─ Respuestas automáticas para:
│  ├─ "¿Dónde está mi pedido?" → Pedir order ID → Mostrar tracking
│  ├─ "¿Cómo devuelvo?" → Link a política + link generar solicitud
│  ├─ "¿Qué talla me va?" → Link guía tallas
│  ├─ "¿Cuál es el precio?" → Pedir nombre producto → Mostrar precio
│  └─ Fallback: "Conectando con agente..."
├─ Escalar a humano:
│  └─ Si usuario dice "agente" o bot no entiende
│
└─ Admin Chat Dashboard:
   ├─ Listado chats activos (tabla):
   │  ├─ Cliente
   │  ├─ Última actividad
   │  ├─ Mensajes sin leer
   │  └─ Botón responder
   ├─ Responder chat:
   │  ├─ Historial conversación
   │  ├─ Input message + send
   │  ├─ Canned responses (templates)
   │  └─ Button "Cerrar chat"
   └─ Chat analytics:
      ├─ Tiempo respuesta promedio
      ├─ Chats resueltos
      └─ Satisfacción cliente (rating)

WhatsApp Integration (Opcional):
├─ Button "Chat por WhatsApp"
├─ Pre-filled message (envía a business number)
├─ Redirect a WhatsApp app o web
```

### 10.6 Programa de Lealtad (Future - Bonus)

**Loyalty Program:**
```dart
Customer Earn Points:
├─ 1 punto por cada € gastado
├─ Bonus points en:
│  ├─ Primera compra (+100)
│  ├─ Referral exitoso (+50)
│  ├─ Review producto (+10)
│  └─ Cumpleaños (+50)

Loyalty Screen (AccountScreen):
├─ Points balance (grande, destacado)
├─ Next reward countdown (X puntos falta)
├─ Listado rewards available:
│  ├─ 500 pts → Descuento €10
│  ├─ 1000 pts → Descuento €25
│  ├─ 2000 pts → Descuento €60
│  └─ Botón redeem
├─ Historial transacciones:
│  ├─ Fecha
│  ├─ Descripción (compra, referral, etc)
│  ├─ Puntos ganados/gastados
│  └─ Balance después transacción

Admin Loyalty Management:
├─ Ver puntos por cliente
├─ Ajustar manualmente (+/-)
├─ Ver historial
├─ Crear promoción "Bonus points"
```

---

## 🔌 FASE 11: INTEGRACIONES EXTERNAS

### 11.1 Integración Google Maps (Tracking)

**OrderTrackingMap:**
```dart
Mostrar:
├─ Ubicación actual paquete (si disponible)
├─ Ruta desde almacén a destino
├─ Marker:
│  ├─ Almacén (pin verde)
│  ├─ Ubicación actual (pin rojo animado)
│  ├─ Destino (pin azul)
│  └─ Stops intermedios (pin naranja)
├─ Zoom automático al ruta
├─ Botón "Abrir en Google Maps"
└─ Estimación tiempo llegada

MapScreen (Admin):
├─ Ver todas órdenes en mapa (en tiempo real)
├─ Filtros:
│  ├─ Estado (Enviado, En tránsito, etc)
│  ├─ Transportista
│  └─ Rango fechas
├─ Clusters (si muchas órdenes)
├─ Tap orden → mostrar detalles popup
└─ Heatmap de entregas
```

### 11.2 Firebase Analytics

**Analytics Tracking:**
```dart
Events principales:
├─ app_open
├─ screen_view (automático)
├─ product_view:
│  ├─ product_id
│  ├─ product_name
│  ├─ category
│  └─ price
├─ add_to_cart:
│  ├─ product_id
│  ├─ quantity
│  └─ price
├─ begin_checkout:
│  ├─ value (total)
│  ├─ currency
│  ├─ items (cantidad)
│  └─ coupon (si aplica)
├─ purchase:
│  ├─ transaction_id
│  ├─ value
│  ├─ currency
│  ├─ items
│  ├─ tax
│  └─ shipping
├─ search
├─ view_item_list
├─ login
├─ sign_up
├─ user_engagement (timing)
└─ exception (crashes/errors)

Dashboard:
├─ User acquistion (daily active users)
├─ Retention (day 1, 7, 30)
├─ Conversion funnel
├─ Revenue metrics
└─ Audience segmentation
```

### 11.3 Sentry Error Tracking

**Error Logging:**
```dart
Configuración:
├─ Capturar exceptions no manejadas
├─ Capturar network errors
├─ Capturar crashes
├─ Breadcrumbs de user actions
├─ Device info (model, OS version, etc)

Dashboard Sentry:
├─ Trending issues (crashes más frecuentes)
├─ Error stats
├─ Stack traces
├─ Affected users
├─ Alertas por email
└─ Release tracking (ver en qué versión salió)

Error Handling:
├─ Try-catch blocks en critical sections
├─ Graceful error messages al usuario
├─ Log pero no bloquear
├─ Retry automático si posible
```

### 11.4 Mixpanel (Product Analytics)

**User Behavior Tracking:**
```dart
Events:
├─ User retention
├─ Feature usage (qué botones tocan)
├─ Conversion funnel (browse → cart → checkout → purchase)
├─ Funnel analysis (dónde abandonan)
├─ User cohorts
├─ A/B testing (si implementas variantes)

Dashboards:
├─ Daily active users
├─ Feature adoption
├─ Churn rate
├─ LTV (lifetime value por usuario)
├─ Comparación demo vs real users
```

---

## 🚀 FASE 12: OPTIMIZACIÓN & DEPLOYMENT

### 12.1 Performance Optimization

**Métricas Target:**
```
Startup: < 3 segundos
Scroll: 60 FPS (constant)
Load imágenes: < 2 segundos visible
Build APK: < 2 minutos
Build IPA: < 5 minutos
App size: < 100MB (APK), < 150MB (IPA)
```

**Optimizaciones:**
```dart
1. Image Optimization
   ├─ Lazy load en listas
   ├─ Compress (JPEG 80%, WebP si soporta)
   ├─ Cache en disco (100MB max)
   ├─ Placeholder mientras carga
   └─ Error image si falla

2. Code Splitting
   ├─ Lazy load admin screens
   ├─ Deferred loading para analytics
   ├─ Tree shaking de unused code
   └─ Remove debug symbols en release

3. Memory Management
   ├─ Dispose streams/listeners
   ├─ Clear caches al logout
   ├─ Usar weak references donde apropie
   └─ Profile con DevTools

4. Network Optimization
   ├─ HTTP/2 en backend
   ├─ Gzip compression
   ├─ CDN para imágenes (Cloudinary)
   ├─ Batch API calls cuando posible
   └─ Cache responses (ETag, 304 Not Modified)

5. Storage Optimization
   ├─ Limit Hive database size
   ├─ Archive old data
   ├─ Compress datos locales
   └─ SQLite query optimization

6. Build Optimization
   ├─ Minify/obfuscate código
   ├─ Strip symbols
   ├─ ProGuard (Android)
   ├─ Bitcode (iOS)
   └─ Size analysis (flutter pub global run devtools)
```

### 12.2 Testing Completo

**Test Coverage:**
```dart
Unit Tests (70%+ target):
├─ Models (serialization)
├─ Services (API calls mocked)
├─ Providers (state management)
├─ Validators (email, precio, etc)
├─ Formatters (moneda, fecha)
└─ Utilities (helpers)

Widget Tests (60%+ target):
├─ ProductCard rendering
├─ CartItem interactions
├─ LoginForm validation
├─ FilterPanel functionality
├─ BottomNav switching
└─ Button states

Integration Tests:
├─ Login → Home → Products → Cart flow
├─ Browse → Search → Filter → Detail flow
├─ Checkout flujo completo
├─ Admin CRUD flow
├─ Dark mode toggle
└─ Offline behavior

Golden Tests (Screenshots):
├─ ProductCard en diferentes states
├─ ProductDetailScreen layout
├─ LoginScreen responsive
└─ AdminDashboard layout

Performance Tests:
├─ List scroll performance
├─ Image loading performance
├─ Animation smoothness
├─ Memory profiling
└─ CPU usage profiling

E2E Tests (si hay presupuesto):
├─ Real device testing (Firebase Test Lab)
├─ Different OS versions
├─ Different screen sizes
└─ Network conditions (slow 3G, offline)
```

### 12.3 Build & Signing

**Android Build:**
```bash
# Generar keystore
keytool -genkey -v -keystore ~/fashionstore.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias fashionstore

# Release APK
flutter build apk --release

# App Bundle (recomendado para Play Store)
flutter build appbundle --release

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 -keystore ~/fashionstore.keystore \
  build/app/outputs/apk/release/app-release.apk \
  fashionstore

# Verify signing
jarsigner -verify -verbose build/app/outputs/apk/release/app-release.apk

# Size analysis
flutter analyze-size --target-platform android-arm64 \
  --format=json --output=build/apk-size.json
```

**iOS Build:**
```bash
# Build IPA
flutter build ipa --release

# Build for simulator
flutter build ios --release --no-codesign

# Archive in Xcode
cd ios
xcodebuild -workspace Runner.xcworkspace \
  -scheme Runner -configuration Release \
  -derivedDataPath build -arch arm64 \
  -sdk iphoneos archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/Runner.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

### 12.4 App Store Submission

**Play Store:**
```
Requerimientos:
✅ Target API 34+ (Android 14)
✅ Build keystore generado
✅ App Bundle firmado
✅ Versión code incremental
✅ Screenshots (mínimo 2 en cada orientación)
✅ Feature graphic (1024x500)
✅ Short description (80 chars max)
✅ Full description (4000 chars)
✅ Privacy policy URL
✅ Contact email
✅ Content rating questionnaire completado
✅ Pricing (gratuita)

Pasos:
1. Crear/acceder Google Play Console
2. Crear nueva aplicación
3. Completar store listing
4. Carguar App Bundle
5. Crear release a closed track (testing)
6. Test en internal testers
7. Move a beta track (2-3 semanas testing mínimo)
8. Move a production (review 2-4 horas)
9. Monitorear crashes/ratings

Versiones:
- Internal: 1.0.0+1 (testing)
- Alpha: 1.0.0+10 (pre-release)
- Beta: 1.0.0+20 (wider testing)
- Production: 1.0.0+100 (public release)
```

**App Store:**
```
Requerimientos:
✅ Apple Developer Account ($99/año)
✅ Bundle ID único (com.fashionstore.app)
✅ Provisioning profile generado
✅ Certificates (Developer, Distribution)
✅ IPA firmada correctamente
✅ Build number incremental
✅ 6 screenshots en en_US (mínimo)
✅ App preview video (15-30 segs, opcional)
✅ Description (mínimo 10 chars)
✅ Tagline (30 chars max)
✅ Categoría
✅ Keywords (100 chars)
✅ Support URL
✅ Privacy policy URL
✅ Age Rating
✅ Usar método pago permitido (no Stripe directo si USD)

Pasos:
1. Crear App ID en Apple Developer
2. Crear provisioning profile
3. Crear distribution certificate
4. Build IPA con signing
5. Subir a TestFlight (interno)
6. Invite testers, recopilar feedback
7. Esperar 24h+ de testing
8. Submit to App Store for Review
9. Apple review (1-3 días típico)
10. Approved → Auto-published

Consideraciones:
- Apple rechaza apps con:
  - Crash rates > 1.5%
  - Performance issues
  - Missing privacy policy
  - Payments no usando In-App Purchases
  - Baja calidad screenshots
- Resubmit si rechaza (con cambios + explanation)
```

### 12.5 Post-Launch Monitoring

**Crashlytics Dashboard:**
```
Real-time Monitoring:
├─ Crash rate
├─ Affected users
├─ Top crashes
├─ Top devices/OS versions affected
└─ Tren (trending up/down)

Alerting:
├─ Email si crash rate > 5%
├─ SMS si critical issue
├─ Slack notification (optional)

Response:
├─ Hotfix en 24h si critical
├─ Patch en 3 días si non-critical
├─ Release schedule (weekly típico)
```

**User Feedback:**
```
Channels:
├─ In-app rating prompt (después compra exitosa)
├─ App Store reviews monitoring
├─ Play Store reviews monitoring
├─ Support email
├─ Social media mentions
├─ Crash reports con feedback

Analysis:
├─ Sentiment analysis (positive/negative/neutral)
├─ Common issues (clustering)
├─ Feature requests
└─ Bugs vs feature requests ratio
```

---

## 🔐 SISTEMA DE SEGURIDAD COMPLETO

### Seguridad en Código

**AppConfig & SecureStorage:**
```dart
// ✅ NUNCA en código
// ❌ const apiUrl = "https://backend.com";

// ✅ SIEMPRE dinámico
final config = AppConfig();
final apiUrl = config.baseApiUrl;

// ✅ SIEMPRE en SecureStorage
await SecureStorageService.saveAccessToken(token);
final token = await SecureStorageService.getAccessToken();
```

**Validación de Input:**
```dart
// ✅ SIEMPRE validar
if (!EmailValidator.validate(email)) {
  throw ValidationException('Email inválido');
}

// ✅ SIEMPRE sanitizar
final cleanedName = name.trim().replaceAll(RegExp(r'<[^>]*>'), '');

// ✅ SIEMPRE limitar
if (password.length < 8) {
  throw ValidationException('Password muy corto');
}
```

**HTTPS Only:**
```dart
// ✅ SIEMPRE HTTPS
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.fashionstore.com', // No HTTP
));

// ✅ Verificar certificados
dio.httpClientAdapter = _createHttpClientAdapter();

HttpClientAdapter _createHttpClientAdapter() {
  // Pinning certificado si es crítico
  // O al menos verificar validez
}
```

**Token Management:**
```dart
// ✅ SIEMPRE en secure storage (no SharedPref)
await _secureStorage.write(key: 'access_token', value: token);

// ✅ SIEMPRE verificar expiración
if (token.expiresAt.isBefore(DateTime.now())) {
  await refreshToken(); // Auto-refresh
}

// ✅ SIEMPRE limpiar al logout
await _secureStorage.deleteAll();
```

### Seguridad en API

**Backend Validation:**
```javascript
// ✅ Validar TODO en backend (no confiar frontend)
app.post('/api/orders', authenticate, (req, res) => {
  const { items, total } = req.body;
  
  // Validar cantidad items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Sin items' });
  }
  
  // Validar cada item existe y precio correcto
  for (const item of items) {
    const product = db.products.get(item.productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no existe' });
    }
    if (item.price !== product.price) {
      return res.status(400).json({ error: 'Precio incorrecto' });
    }
  }
  
  // Validar total
  const calculatedTotal = items.reduce(...);
  if (total !== calculatedTotal) {
    return res.status(400).json({ error: 'Total incorrecto' });
  }
  
  // Recalcular IVA, envío, etc en backend
  const finalTotal = recalculateTotal(items);
  
  // Crear orden
  const order = createOrder(finalTotal);
});
```

**RLS Policies (Supabase):**
```sql
-- ✅ Órdenes: Solo ver/editar propias (customer) o todas (admin)
CREATE POLICY "customers_view_own_orders"
  ON orders FOR SELECT
  USING (
    customer_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- ✅ Favoritos: Solo ver/editar propios
CREATE POLICY "customers_manage_own_wishlists"
  ON wishlists FOR ALL
  USING (customer_id = auth.uid());

-- ✅ Carrito: Solo admin puede ver todos
CREATE POLICY "admin_view_all_carts"
  ON cart_items FOR SELECT
  USING (
    session_id = current_session_id()
    OR customer_id = auth.uid()
    OR is_admin(auth.uid())
  );
```

**Rate Limiting:**
```javascript
// ✅ Limitar requests por IP
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests max
  message: 'Demasiados intentos, intenta después'
});

app.post('/api/auth/login', limiter, (req, res) => {
  // ...
});

// ✅ Limitar por usuario
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 intentos max
  keyGenerator: (req) => req.user?.id || req.ip,
});

app.post('/api/orders', userLimiter, (req, res) => {
  // ...
});
```

---

## 📋 LISTA MAESTRA DE 100+ TAREAS

### Fase 1: Setup (15 tareas)
- [ ] Crear proyecto Flutter
- [ ] Configurar pubspec.yaml
- [ ] Crear estructura de carpetas
- [ ] Configurar colores y tipografías
- [ ] Crear temas Material 3
- [ ] Configurar constantes
- [ ] Crear main.dart base
- [ ] Configurar material icons
- [ ] Setup Firebase (analytics, crashlytics)
- [ ] Configurar env variables
- [ ] Git initial commit
- [ ] CI/CD GitHub Actions setup
- [ ] Linter configuration (.dartanalyzer)
- [ ] Pre-commit hooks
- [ ] Documentation README.md

### Fase 2: Autenticación (12 tareas)
- [ ] AuthService (Supabase integration)
- [ ] AuthProvider (Riverpod)
- [ ] SplashScreen implementation
- [ ] LoginScreen UI + logic
- [ ] SignupScreen UI + logic
- [ ] PasswordRecoveryScreen
- [ ] EmailVerification screen
- [ ] SecureStorageService
- [ ] Token refresh logic
- [ ] Logout functionality
- [ ] Protected routes middleware
- [ ] Tests for auth flow

### Fase 3: Productos (18 tareas)
- [ ] ProductModel + serialization
- [ ] CategoryModel + serialization
- [ ] VariantModel + serialization
- [ ] ProductService (Supabase queries)
- [ ] ProductProvider (Riverpod)
- [ ] CategoriesProvider
- [ ] HomeScreen implementation
- [ ] ProductsListScreen con paginación
- [ ] ProductDetailScreen
- [ ] ImageGallery component
- [ ] VariantSelector component
- [ ] ProductCard component
- [ ] SearchScreen implementation
- [ ] FilterPanel widget
- [ ] Lazy loading imágenes
- [ ] Caching strategy
- [ ] Tests product screens
- [ ] Performance optimization

### Fase 4: Carrito & Checkout (16 tareas)
- [ ] CartProvider con Hive persistencia
- [ ] CartService
- [ ] CartScreen implementation
- [ ] Cart totals calculation
- [ ] IVA y envío logic
- [ ] CouponsService
- [ ] ApplyCoupon functionality
- [ ] CheckoutProvider
- [ ] CheckoutScreen (4 steps)
- [ ] ShippingForm validation
- [ ] BillingForm handling
- [ ] StripeService integration
- [ ] PaymentScreen
- [ ] OrderModel + serialization
- [ ] OrderConfirmationScreen
- [ ] Tests checkout flow

### Fase 5: Cuenta & Favoritos (14 tareas)
- [ ] AccountScreen (dashboard)
- [ ] ProfileEditScreen
- [ ] Avatar upload functionality
- [ ] OrdersHistoryScreen
- [ ] OrderDetailScreen
- [ ] OrderTracking UI
- [ ] WishlistProvider
- [ ] WishlistScreen implementation
- [ ] SavedAddressesScreen
- [ ] AddressManagement CRUD
- [ ] ReturnsScreen
- [ ] ReturnRequest functionality
- [ ] UserProfileModel
- [ ] Tests account flows

### Fase 6: Admin Básico (12 tareas)
- [ ] AdminAuthService
- [ ] AdminLoginScreen
- [ ] AdminDashboardScreen
- [ ] AdminProductsListScreen
- [ ] AdminProductFormScreen
- [ ] AdminVariantsPanel
- [ ] AdminOrdersScreen (lista)
- [ ] AdminOrderDetailScreen
- [ ] AdminCategoriesScreen
- [ ] AdminCategoryForm
- [ ] Admin navigation routing
- [ ] Tests admin flows

### Fase 9: Admin Completo (20 tareas)
- [ ] Dashboard con gráficos (charts library)
- [ ] Stats cards con cálculos
- [ ] Real-time updates via WebSocket
- [ ] Advanced filters en products
- [ ] Bulk actions functionality
- [ ] AdminReturnsScreen completa
- [ ] AdminCouponsScreen & management
- [ ] AdminSettingsScreen (10 tabs)
- [ ] AdminAnalyticsScreen avanzado
- [ ] Reportes customizados
- [ ] Export funcionalidad (CSV, PDF)
- [ ] Table virtualization para 1000+ items
- [ ] Admin audit log
- [ ] Admin user management
- [ ] Permissions & roles system
- [ ] Admin notifications
- [ ] Backup & restore functionality
- [ ] System health monitoring
- [ ] Activity logging en todas las acciones
- [ ] Tests admin screens

### Fase 10: Características Avanzadas (18 tareas)
- [ ] Push notifications setup
- [ ] NotificationService implementation
- [ ] In-app notifications/toasts
- [ ] Offline mode implementation (Hive caching)
- [ ] Connectivity detection
- [ ] Data sync when online
- [ ] Dark mode implementation
- [ ] ThemeProvider setup
- [ ] Multi-idioma (i18n/l10n)
- [ ] LocalizationProvider
- [ ] Translation files (ES, EN, PT)
- [ ] Reviews system backend integration
- [ ] ReviewsScreen implementation
- [ ] ReviewForm & submission
- [ ] Reviews admin moderation
- [ ] Search por voz (speech_to_text)
- [ ] Search por imagen (Google Vision)
- [ ] Share functionality (share_plus)
- [ ] Deep linking configuration

### Fase 11: Integraciones (12 tareas)
- [ ] Google Maps integration
- [ ] MapScreen para tracking
- [ ] Firebase Analytics setup
- [ ] Event tracking implementation
- [ ] Sentry error tracking
- [ ] Mixpanel product analytics
- [ ] Stripe webhook handling (backend)
- [ ] Email service (backend: SendGrid/Mailgun)
- [ ] SMS notifications (Twilio)
- [ ] Cloudinary image transforms
- [ ] Third-party API error handling
- [ ] Fallbacks para external services

### Fase 12: Optimización & Deployment (20 tareas)
- [ ] Performance profiling
- [ ] Image optimization & lazy loading
- [ ] Code splitting & tree shaking
- [ ] Memory leak detection
- [ ] APK size optimization
- [ ] IPA size optimization
- [ ] Compilation time optimization
- [ ] Unit tests (70%+ coverage)
- [ ] Widget tests (60%+ coverage)
- [ ] Integration tests
- [ ] Golden tests
- [ ] Performance testing
- [ ] Android build & signing
- [ ] iOS build & signing
- [ ] Play Store submission
- [ ] App Store submission
- [ ] Post-launch monitoring setup
- [ ] Crash reporting dashboard
- [ ] User feedback system
- [ ] Release notes generation

---

## 📖 GUÍA DE IMPLEMENTACIÓN PROFESIONAL

### Cómo Trabajar con Claude Opus

**1. Presentación Inicial:**
```
Pega ESTE PROMPT COMPLETO en Claude Opus 4.5
Claude responderá: "✅ ENTENDIDO. INICIANDO ANÁLISIS..."
```

**2. Génesis del Plan:**
```
Claude generará:
├─ ✅ Resumen de todas las fases
├─ ✅ Lista de 100+ tareas con prioridades
├─ ✅ Timeline realista (semana a semana)
├─ ✅ Riesgos y mitigaciones
└─ ✅ Dependencias de tareas
```

**3. Implementación por Fases:**
```
TÚ: "Procede con Fase 1: Setup & Configuración"
CLAUDE: 
├─ Genera todos los archivos necesarios
├─ Proporciona código 100% compilable
├─ Incluye verificaciones paso a paso
└─ Confirma cuando termina fase

TÚ: Validas en tu IDE
├─ flutter pub get
├─ flutter analyze
├─ flutter run
└─ Reportas resultado

TÚ: "OK, Fase 1 completada. Siguiente: Fase 2"
(Repite)
```

**4. Patrones de Petición:**

**Para iniciar nueva fase:**
```
"Basándome en el PROMPT_FLUTTER_COMPLETO_FINAL.md,
procede con FASE X: [NOMBRE].

Deliverables:
✅ Todos los archivos necesarios
✅ Código 100% funcional y compilable
✅ Verificación de cada componente
✅ Tests básicos si aplica

Validación:
✅ flutter analyze - ZERO ERRORS
✅ flutter pub get - OK
✅ Código formateado con 'dart format'
✅ Checklist de fase completado"
```

**Para arreglar issues:**
```
"Error en [ARCHIVO] línea [X]:
[PEGA ERROR COMPLETO]

Contexto: Trabajando en [CARACTERÍSTICA]
Backend: [Si es llamada API, incluir endpoint]

¿Cómo solucionamos?"
```

**Para refinar pantalla:**
```
"En [SCREEN]:
- Cambiar color botón a [COLOR]
- Añadir validación [TIPO]
- Mejorar layout en [TAMAÑO] dispositivo
- Agregar funcionalidad [DESCRIPCIÓN]"
```

### Estructura de Commits Git

```bash
# Fase 1: Setup
git commit -m "chore(setup): project structure and dependencies

- Create folder structure (lib/src, assets, etc)
- Configure pubspec.yaml with 25 dependencies
- Create theme and color constants
- Setup Material 3 with custom palettes
- Initialize main.dart with ProviderScope
- Add Flutter linter configuration

Closes #1"

# Fase 2: Auth
git commit -m "feat(auth): complete authentication system

- Implement Supabase AuthService
- Create AuthProvider with Riverpod
- Add LoginScreen with validation
- Add SignupScreen with password strength
- Implement token refresh logic
- Add SecureStorage for token persistence

Closes #2"

# Fase 3: Products
git commit -m "feat(shop): products catalog implementation

- Create ProductModel and CategoryModel
- Implement ProductService with Supabase queries
- Add HomeScreen with hero and offers sections
- Add ProductsListScreen with paginación
- Add ProductDetailScreen with image gallery
- Add variant selector (size x color)
- Implement search and filters

Closes #3"
```

### Testing While Building

```dart
// SIEMPRE incluir tests básicos

// test/unit/models/product_model_test.dart
void main() {
  group('ProductModel', () {
    test('serialization', () {
      final json = {
        'id': 'uuid',
        'name': 'Test Product',
        'price': 15990,
      };
      final product = ProductModel.fromJson(json);
      expect(product.name, 'Test Product');
      expect(product.price, 15990);
    });
  });
}

// test/widget/product_card_test.dart
void main() {
  testWidgets('ProductCard renders correctly', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ProductCard(product: mockProduct),
      ),
    );
    expect(find.byType(ProductCard), findsOneWidget);
    expect(find.text('Mock Product'), findsOneWidget);
  });
}
```

### Code Review Checklist

```
ANTES DE PUSHAR:

Calidad:
[ ] flutter analyze → ZERO warnings
[ ] dart format lib/ → Formateado
[ ] Imports organizados (dart/flutter primero, paquetes, relatives)
[ ] No console.log o print() statements (excepto logging)
[ ] Documentación en métodos públicos
[ ] No hardcoded strings (usar constants o l10n)

Seguridad:
[ ] No API keys hardcodeadas
[ ] No tokens en logs
[ ] Validación de inputs
[ ] RLS policies verificadas (Supabase)
[ ] HTTPS only para APIs

Performance:
[ ] Lazy loading images
[ ] No rebuild innecesarios (const constructors)
[ ] Streams dispose correctamente
[ ] Memory leaks checked

Tests:
[ ] Tests pasan (flutter test)
[ ] New code tiene tests
[ ] Coverage >= 60%

Git:
[ ] Commit message descriptivo
[ ] Relacionado a issue (#XX)
[ ] Branch limpio (sin conflictos)
[ ] Squash commits innecesarios
```

---

## 📞 SOPORTE & TROUBLESHOOTING

### Problemas Comunes

**"Build tarda demasiado"**
```bash
# Solución: Clean + incrementa memoria heap
flutter clean
export GRADLE_OPTS="-Xmx4096m"
flutter build apk --release
```

**"Out of memory durante build"**
```bash
# Aumentar límite Dart
dart --define=DART_MAX_MEMORY=4096 pub global run devtools
```

**"Supabase connection timeout"**
```dart
// Aumentar timeout
final dio = Dio(
  BaseOptions(
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
  ),
);
```

**"Stripe public key error"**
```dart
// Verificar que esté configurada ANTES de usarla
if (AppConfig().stripePublicKey.isEmpty) {
  throw Exception('Stripe not initialized');
}
```

### Debugging Tips

```bash
# Ver logs en tiempo real
flutter logs

# Debugear en dispositivo
flutter run -v  # Verbose mode

# Profiling
flutter run --profile
# Luego abrir DevTools: flutter pub global run devtools

# Check device info
flutter doctor -v

# Build size analysis
flutter build apk --analyze-size
```

---

## ✅ INDICADORES DE ÉXITO FINAL

**FASE 1:**
✅ Proyecto compila sin errores
✅ main.dart ejecutable
✅ Estructura limpia y visible

**FASE 2:**
✅ Login funciona con Supabase real
✅ Tokens persisten entre app restarts
✅ Logout limpia completamente

**FASE 3:**
✅ Productos cargan desde Supabase
✅ Búsqueda funciona en tiempo real
✅ Galería de imágenes swipea

**FASE 4:**
✅ Carrito persiste localmente
✅ Checkout flujo completo
✅ Pago procesa en modo test Stripe
✅ Orden se crea en BD

**FASE 5:**
✅ Cuenta usuario muestra datos
✅ Órdenes históricas cargables
✅ Wishlist añade/quita favoritos

**FASE 6:**
✅ Admin login funciona
✅ CRUD productos completo
✅ Órdenes editables

**FASE 9:**
✅ Dashboard con gráficos y stats
✅ Admin products table con 1000+ items sin lag
✅ Variantes CRUD funciona
✅ Returns manejables
✅ Settings guardables
✅ Analytics muestra datos

**FASE 10:**
✅ Notificaciones llegan
✅ Dark mode toggle funciona
✅ Multi-idioma cambia todo
✅ Reviews creables y editables

**FASE 12:**
✅ Tests: 70%+ coverage
✅ APK: < 100MB
✅ Startup: < 3 segundos
✅ Scroll: 60 FPS constante
✅ Play Store: Listado visible
✅ App Store: Listado visible

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Copia ESTE PROMPT COMPLETO**
2. **Pégalo en Claude Opus 4.5**
3. **Espera respuesta: "✅ ENTENDIDO..."**
4. **Confirma: "Procede con Fase 1"**
5. **Claude generará todo código necesario**
6. **Tú validas en tu IDE:**
   ```bash
   flutter pub get
   flutter analyze
   flutter run
   ```
7. **Reporta result a Claude**
8. **Repite Fase 2, 3, 4... hasta 12**
9. **AL FINAL: App en stores** 🎉

---

**VERSIÓN:** 2.0 - Completo + Admin Panel + Seguridad  
**FECHA:** 1 de febrero de 2026  
**ESTADO:** ✅ LISTO PARA IMPLEMENTACIÓN COMPLETA  
**TIMELINE:** 12 semanas intensivas (3 meses)  

**¡COMIENZA AHORA!** 🚀
