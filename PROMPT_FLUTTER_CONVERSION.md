# 🎯 PROMPT COMPLETO PARA CONVERSIÓN A FLUTTER - FASHIONMARKET

**Fecha:** 31 de enero de 2026  
**Destinatario:** Claude Opus 4.5  
**Proyecto:** FashionStore - E-commerce de Ropa Premium  
**Objetivo:** Convertir aplicación Astro web a aplicación Flutter multiplataforma (iOS, Android, Web)

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General y Contexto](#visión-general)
2. [Arquitectura Actual Web](#arquitectura-actual)
3. [Mapeo de Características](#mapeo-características)
4. [Base de Datos y APIs](#base-datos)
5. [Diseño y Estilos](#diseño)
6. [Plan de Implementación](#plan-implementación)
7. [Recomendaciones de Implementación](#recomendaciones)

---

## 🌍 VISIÓN GENERAL Y CONTEXTO

### Descripción del Proyecto Actual

**FashionStore** es una tienda online de ropa premium (estilo Zara, Mango, JD Sport) construida con:

- **Frontend:** Astro 5.0 (SSR/SSG híbrido)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript
- **Estado del Cliente:** Nano Stores
- **Pagos:** Stripe
- **Email:** Nodemailer

### Nivel de Madurez

✅ **Completamente funcional con todas las características:**
- Catálogo de productos (900+ SKUs)
- Carrito persistente
- Checkout con Stripe
- Panel de administración
- Gestión de variantes (talla x color x imagen)
- Emails transaccionales
- Wishlist
- Sistema de pedidos
- Analytics de descuentos
- Devoluciones
- Reportes

---

## 🏗️ ARQUITECTURA ACTUAL - MAPEO A FLUTTER

### Stack Actual

```
┌─────────────────────────────────────────────────────────┐
│                    WEB (Astro 5.0)                      │
├─────────────────────────────────────────────────────────┤
│  Frontend: Astro + React (Islas Interactivas)           │
│  Estado: Nano Stores                                    │
│  Estilos: Tailwind CSS (Paleta Custom)                  │
├─────────────────────────────────────────────────────────┤
│  APIs REST: /api/* (Node.js)                            │
├─────────────────────────────────────────────────────────┤
│ Backend: Supabase (PostgreSQL + PostgREST)              │
│ Auth: Supabase Auth + JWT                               │
│ Storage: Supabase Storage (Cloudinary)                  │
│ RLS: Políticas de fila activadas                        │
└─────────────────────────────────────────────────────────┘
```

### Stack Destino Flutter

```
┌─────────────────────────────────────────────────────────┐
│                  FLUTTER MULTIPLATFORM                  │
├─────────────────────────────────────────────────────────┤
│  iOS / Android / Web                                    │
│  State Management: Riverpod / BLoC / GetX               │
│  UI Framework: Flutter + Material 3 / Cupertino         │
├─────────────────────────────────────────────────────────┤
│  APIs REST: http / dio (mismos endpoints Supabase)      │
├─────────────────────────────────────────────────────────┤
│ Backend: Supabase IGUAL (sin cambios)                   │
│ Auth: supabase_flutter package                          │
│ Storage: supabase_flutter package                       │
│ Pagos: flutter_stripe / pay (PKG)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 MAPEO DETALLADO DE CARACTERÍSTICAS

### 1. TIENDA (Customer-Facing)

#### 1.1 Home / Landing Page
**Web:** `src/pages/index.astro`
**Elementos:**
- Hero banner con imagen de fondo
- Sección de ofertas flash
- Grid de categorías destacadas
- Testimonios
- Newsletter signup
- Footer con enlaces

**Flutter:**
- `lib/screens/home_screen.dart`
- `lib/widgets/hero_banner.dart`
- `lib/widgets/product_grid.dart`
- `lib/widgets/category_carousel.dart`
- `lib/widgets/newsletter_signup.dart`

**Especificaciones de Diseño:**
- Paleta: Azul marino (#0B1929), Dorado mate (#D4A574)
- Tipografía: Playfair Display (títulos), Inter (cuerpo)
- Responsive: 0px - 480px (móvil), 481px - 768px (tablet), 769px+ (desktop)

---

#### 1.2 Catálogo de Productos
**Web:** `src/pages/productos/index.astro`
**Características:**
- Listado paginado (12 productos por página)
- Filtros: Categoría, Precio, Talla, Color, Disponibilidad
- Búsqueda en tiempo real
- Ordenamiento: Nuevo, Precio (asc/desc), Popular, Rating
- Imágenes responsive con lazy loading

**Flutter:**
- `lib/screens/products_screen.dart`
- `lib/widgets/product_filter_panel.dart`
- `lib/widgets/product_card.dart`
- `lib/providers/products_provider.dart` (Riverpod)
- `lib/services/product_service.dart`

**Endpoints Supabase:**
```
GET /rest/v1/products?select=*,category:categories(*)
GET /rest/v1/product_variants?select=*
GET /rest/v1/products?select=*&category_id=eq.{id}
```

---

#### 1.3 Ficha de Producto
**Web:** `src/pages/productos/[slug].astro`
**Elementos:**
- Galería de imágenes (4-8 imágenes)
- Información del producto (descripción, material, cuidado)
- Selector de variantes interactivo (talla, color con color picker RGB)
- Stock en tiempo real
- Precio, precio de oferta, porcentaje descuento
- Reviews y ratings (1-5 estrellas)
- Botón "Añadir al carrito"
- Botón "Añadir a favoritos"
- Productos relacionados (carrusel)
- Especificaciones técnicas

**Flutter:**
- `lib/screens/product_detail_screen.dart`
- `lib/widgets/image_gallery.dart`
- `lib/widgets/variant_selector.dart`
- `lib/widgets/product_specs.dart`
- `lib/widgets/reviews_section.dart`
- `lib/widgets/related_products.dart`

**Datos Clave del Producto:**
```typescript
{
  id: UUID
  name: string
  slug: string
  description: string
  long_description: string
  price: number (céntimos)
  precio_oferta: number | null
  es_oferta: boolean
  porcentaje_descuento: number
  stock: number
  category_id: UUID
  images: string[] (URLs)
  sizes: string[] (XS, S, M, L, XL, XXL)
  colors: string[] (nombre)
  color_hex: string[] (valores RGB hex)
  material: string
  care_instructions: string
  rating: decimal (3,2)
  reviews_count: number
  is_featured: boolean
  is_new: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

---

#### 1.4 Carrito de Compras
**Web:** 
- Local: `src/stores/cart.ts` (Nano Store)
- Componente: `src/components/shop/CartSidebar.tsx`
- Página: `src/pages/carrito.astro`

**Características:**
- Persistencia en localStorage
- Sincronización con sesión del servidor
- Añadir/Quitar/Modificar cantidad
- Cálculo automático de totales
- IVA (21%)
- Envío (gratis desde €150 o €4.99)
- Cupones de descuento
- Estimación de envío

**Flutter:**
- `lib/screens/cart_screen.dart`
- `lib/providers/cart_provider.dart` (Riverpod con persistencia)
- `lib/services/cart_service.dart`
- `lib/widgets/cart_item_card.dart`

**Estructura del Carrito:**
```typescript
{
  id: string (UUID)
  session_id: string
  customer_id: string | null
  product_id: UUID
  quantity: number
  size: string
  color: string
  product: Product (relación)
  variant: ProductVariant (relación)
  created_at: timestamp
}

Totales:
- Subtotal (sin impuestos)
- IVA (21%)
- Envío (€0 o €4.99)
- Cupón descuento (si aplica)
- TOTAL
```

---

#### 1.5 Checkout y Pago
**Web:** `src/pages/checkout/index.astro`
**Flujo:**
1. Resumen del carrito
2. Datos de envío (nombre, dirección, ciudad, código postal)
3. Datos de facturación (igual a envío o diferente)
4. Opción de crear cuenta
5. Formulario de pago Stripe (integrado)
6. Confirmación de pedido
7. Redirección a página de éxito

**Flutter:**
- `lib/screens/checkout_screen.dart`
- `lib/screens/shipping_info_screen.dart`
- `lib/screens/payment_screen.dart`
- `lib/screens/order_confirmation_screen.dart`
- `lib/providers/checkout_provider.dart`
- `lib/services/stripe_service.dart`

**Integración Stripe:**
- Public Key: Desde env
- Cliente Stripe: flutter_stripe package
- Método de pago: Card Present
- Moneda: EUR
- Webhook para confirmación de pago

**Estructura de Orden:**
```typescript
{
  id: UUID
  order_number: string (generado automáticamente)
  customer_id: UUID | null
  user_id: UUID | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded'
  total_amount: number (céntimos)
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  coupon_code: string | null
  
  // Dirección de envío
  shipping_address: {
    full_name: string
    email: string
    phone: string
    street: string
    city: string
    postal_code: string
    country: string
  }
  
  // Dirección de facturación
  billing_address: {
    ... (igual estructura)
  }
  
  items: OrderItem[] (relación)
  stripe_payment_id: string | null
  paid_at: timestamp | null
  shipped_at: timestamp | null
  delivered_at: timestamp | null
  created_at: timestamp
  updated_at: timestamp
}

OrderItem:
{
  id: UUID
  order_id: UUID
  product_id: UUID
  product_name: string
  price: number (precio al momento)
  quantity: number
  size: string
  color: string
}
```

---

#### 1.6 Cuenta de Usuario
**Web:** `src/pages/cuenta/` (múltiples archivos)
**Rutas:**
- `/cuenta` - Dashboard
- `/cuenta/perfil` - Editar perfil
- `/cuenta/pedidos` - Historial de pedidos
- `/cuenta/favoritos` - Wishlist
- `/cuenta/direcciones` - Gestionar direcciones guardadas
- `/cuenta/devoluciones` - Ver solicitudes de devolución

**Flutter:**
- `lib/screens/account_screen.dart`
- `lib/screens/profile_edit_screen.dart`
- `lib/screens/orders_history_screen.dart`
- `lib/screens/wishlist_screen.dart`
- `lib/screens/saved_addresses_screen.dart`
- `lib/screens/returns_screen.dart`

**Autenticación:**
- Supabase Auth (email/contraseña)
- JWT tokens
- Refresh tokens

---

#### 1.7 Wishlist (Favoritos)
**Web:** `src/pages/cuenta/favoritos.astro`
**Características:**
- Agregar/quitar favoritos
- Persistencia en BD por usuario
- Wishlist pública o privada (opción)
- Compartir wishlist
- Notificación de cambio de precio
- "Añadir todo al carrito"

**Flutter:**
- `lib/screens/wishlist_screen.dart`
- `lib/providers/wishlist_provider.dart`
- `lib/services/wishlist_service.dart`

**Tabla Wishlist:**
```typescript
{
  id: UUID
  customer_id: UUID
  product_id: UUID
  product_variant_id: UUID | null
  is_public: boolean
  notification_price_change: boolean
  created_at: timestamp
}
```

---

#### 1.8 Búsqueda
**Web:** Componente `LiveSearch` en header
**Características:**
- Búsqueda en tiempo real (debounce 300ms)
- Búsqueda por nombre, descripción, categoría
- Sugerencias mientras escribes
- Historial de búsquedas
- Búsqueda por voz (opcional)

**Flutter:**
- `lib/screens/search_screen.dart`
- `lib/widgets/search_bar.dart`
- `lib/services/search_service.dart`

---

### 2. PANEL DE ADMINISTRACIÓN

#### 2.1 Login Admin
**Web:** `src/pages/admin/login.astro`
**Flujo:**
- Email
- Contraseña
- Recordar sesión
- Recuperar contraseña

**Flutter:**
- `lib/screens/admin_login_screen.dart`
- `lib/services/auth_service.dart`

---

#### 2.2 Dashboard Admin
**Web:** `src/pages/admin/index.astro`
**Widgets:**
- Stats: Total productos, órdenes, ingresos, clientes
- Gráficos: Ventas por día/mes, categoría más vendida
- Órdenes recientes
- Productos con bajo stock (< 5 unidades)
- Tareas pendientes
- Activity feed

**Flutter:**
- `lib/screens/admin_dashboard_screen.dart`
- `lib/widgets/stats_card.dart`
- `lib/widgets/chart_widget.dart`
- `lib/providers/admin_provider.dart`

---

#### 2.3 Gestión de Productos
**Web:** `src/pages/admin/productos/`

**2.3.1 Listado de Productos**
- Tabla con columnas: Imagen, Nombre, Categoría, Precio, Stock, Acciones
- Filtros: Categoría, Rango de precio, Disponibilidad
- Búsqueda
- Acciones: Editar, Duplicar, Eliminar, Ver en tienda
- Bulk actions: Cambiar categoría, Cambiar precio, Eliminar múltiples

**2.3.2 Crear/Editar Producto**
- Campos:
  - Nombre
  - Slug (auto-generado)
  - Descripción corta
  - Descripción larga
  - Categoría (dropdown)
  - Precio (en euros)
  - Precio de oferta (opcional)
  - Stock
  - Material
  - Instrucciones de cuidado
  - Tags/Keywords SEO
  
- Imágenes:
  - Drag & drop
  - Reordenar
  - Crop/Zoom
  - Alt text
  - Subida a Supabase Storage
  
- Variantes:
  - Tabla de talla x color
  - Stock por variante
  - Precio adicional por variante (opcional)
  - Color picker RGB

**Flutter:**
- `lib/screens/admin_products_list_screen.dart`
- `lib/screens/admin_product_form_screen.dart`
- `lib/screens/admin_variants_panel_screen.dart`
- `lib/widgets/image_upload_widget.dart`
- `lib/widgets/variant_form_widget.dart`

---

#### 2.4 Gestión de Categorías
**Web:** `src/pages/admin/categorias/`
**Características:**
- CRUD: Crear, Leer, Editar, Eliminar
- Campos: Nombre, Slug, Descripción, Imagen, Orden de visualización
- Categorías padre-hijo (subcategorías)
- Reordenar con drag & drop

**Flutter:**
- `lib/screens/admin_categories_screen.dart`
- `lib/screens/admin_category_form_screen.dart`

---

#### 2.5 Gestión de Pedidos
**Web:** `src/pages/admin/pedidos/`
**Características:**
- Listado de pedidos (paginado, últimos primero)
- Filtros: Estado, Rango de fechas, Monto, Cliente
- Búsqueda por número de pedido
- Detalle de pedido:
  - Datos del cliente
  - Items del pedido
  - Datos de envío
  - Datos de facturación
  - Método de pago
  - Cambiar estado (pendiente → pagado → enviado → entregado)
  - Generar etiqueta de envío
  - Enviar email al cliente
  - Notas internas
- Historial de eventos del pedido

**Flutter:**
- `lib/screens/admin_orders_list_screen.dart`
- `lib/screens/admin_order_detail_screen.dart`
- `lib/providers/admin_orders_provider.dart`

---

#### 2.6 Gestión de Devoluciones
**Web:** `src/pages/admin/devoluciones/`
**Características:**
- Listado de solicitudes de devolución
- Estados: Solicitada, Aprobada, Rechazada, Recibida, Reembolsada
- Cambiar estado de devolución
- Motivo de devolución
- Enviar email de aprobación/rechazo
- Generar nota de crédito

**Flutter:**
- `lib/screens/admin_returns_screen.dart`
- `lib/screens/admin_return_detail_screen.dart`

---

#### 2.7 Gestión de Descuentos/Cupones
**Web:** Sección en Settings
**Características:**
- CRUD de cupones
- Campos: Código, Descripción, Descuento (%), Límite de uso, Fecha inicio/fin
- Estadísticas de cupón (usos, descuento total generado)

**Flutter:**
- `lib/screens/admin_coupons_screen.dart`

---

#### 2.8 Configuración de la Tienda
**Web:** `src/pages/admin/settings/`
**Opciones:**
- Nombre de la tienda
- Email de contacto
- Teléfono
- Dirección
- Redes sociales
- Configuración de envío (costo, gratis desde)
- IVA
- Modo de Stripe (test/live)
- Ofertas activas (sí/no)
- Logo
- Favicon

**Flutter:**
- `lib/screens/admin_settings_screen.dart`

---

#### 2.9 Analytics/Reportes
**Web:** `src/pages/admin/analytics/`
**Gráficos y Métricas:**
- Ingresos por período
- Productos más vendidos
- Categorías más vendidas
- Tasa de conversión
- Carrito abandonado
- Métodos de pago más usados
- Regiones con más ventas
- Clientes recurrentes vs nuevos

**Flutter:**
- `lib/screens/admin_analytics_screen.dart`
- `lib/widgets/analytics_chart_widget.dart`

---

### 3. EMAILS TRANSACCIONALES

**Web:** `src/emails/` (templates)
**Sistema:** Nodemailer

**Emails a Replicar:**
1. **Confirmación de Pedido**
   - Número de pedido
   - Items
   - Total
   - Datos de envío
   - Seguimiento

2. **Pago Recibido**
   - Confirmación de pago
   - Método de pago
   - Comprobante

3. **Pedido Enviado**
   - Número de seguimiento
   - Transportista
   - Enlace de rastreo

4. **Pedido Entregado**
   - Confirmación de entrega
   - Enlace a review

5. **Devolución Aprobada**
   - Instrucciones de devolución
   - Etiqueta de envío

6. **Devolución Rechazada**
   - Motivo del rechazo

7. **Newsletter**
   - Suscripción confirmada
   - Últimas ofertas
   - Desuscripción

**Flutter:**
- Las notificaciones se enviarán desde backend (Supabase functions o API Node)
- Flutter solo consumirá eventos vía webhooks/polling
- Notificaciones push locales basadas en eventos
- `lib/services/notification_service.dart`

---

### 4. INFORMACIÓN ADICIONAL Y CONFIGURACIÓN

#### Colores Principales
```
- Azul Marino: #0B1929 (títulos, botones primarios)
- Gris Carbón: #262626 (textos, elementos secundarios)
- Blanco Roto: #F5F5F0 (fondos, espacios)
- Dorado Mate: #D4A574 (acentos, CTA)
- Cobre: #A0743D (acentos secundarios)
- Rojo (estado): #E74C3C (errores, avisos)
- Verde (estado): #27AE60 (éxito)
- Gris (disabled): #BDC3C7
```

#### Tipografías
- **Titles:** Playfair Display (serif, bold, 32px-48px)
- **Subtitles:** Playfair Display (serif, regular, 20px-24px)
- **Body:** Inter (sans-serif, regular, 14px-16px)
- **Small:** Inter (sans-serif, regular, 12px)

#### Breakpoints
```
- Mobile: 0px - 480px
- Tablet: 481px - 768px
- Desktop: 769px+
```

---

## 💾 BASE DE DATOS Y APIs

### Tablas Principales

```sql
-- 1. CATEGORÍAS
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID (subcategorías),
  sort_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 2. PRODUCTOS
products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  long_description TEXT,
  price INTEGER (céntimos),
  precio_oferta INTEGER,
  es_oferta BOOLEAN,
  porcentaje_descuento INTEGER,
  stock INTEGER,
  stock_minimo INTEGER,
  category_id UUID FK,
  images TEXT[] (array de URLs),
  image_alt TEXT[],
  sizes VARCHAR(10)[],
  colors VARCHAR(50)[],
  material VARCHAR(100),
  care_instructions TEXT,
  rating DECIMAL(3,2),
  reviews_count INTEGER,
  sku VARCHAR(50),
  is_featured BOOLEAN,
  is_new BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 3. VARIANTES DE PRODUCTO
product_variants (
  id UUID PRIMARY KEY,
  product_id UUID FK,
  size VARCHAR(10),
  color VARCHAR(50),
  color_hex VARCHAR(7),
  stock INTEGER,
  sku VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP
)

-- 4. USUARIOS / CLIENTES
customers (
  id UUID PRIMARY KEY,
  auth_user_id UUID FK (auth.users),
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 5. USUARIOS ADMIN
admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR (bcrypt),
  role VARCHAR(50) (admin, editor),
  is_active BOOLEAN,
  last_login TIMESTAMP,
  created_at TIMESTAMP
)

-- 6. CARRITO
cart_items (
  id UUID PRIMARY KEY,
  session_id VARCHAR,
  customer_id UUID FK,
  product_id UUID FK,
  quantity INTEGER,
  size VARCHAR(10),
  color VARCHAR(50),
  created_at TIMESTAMP
)

-- 7. PEDIDOS
orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR UNIQUE,
  customer_id UUID FK,
  user_id UUID FK,
  status VARCHAR (pending, paid, shipped, delivered),
  total_amount INTEGER (céntimos),
  subtotal INTEGER,
  tax_amount INTEGER,
  shipping_amount INTEGER,
  discount_amount INTEGER,
  coupon_code VARCHAR,
  shipping_address JSONB,
  billing_address JSONB,
  stripe_payment_id VARCHAR,
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 8. ITEMS DE PEDIDO
order_items (
  id UUID PRIMARY KEY,
  order_id UUID FK,
  product_id UUID FK,
  product_name VARCHAR,
  price INTEGER,
  quantity INTEGER,
  size VARCHAR,
  color VARCHAR
)

-- 9. DESEOS (WISHLIST)
wishlists (
  id UUID PRIMARY KEY,
  customer_id UUID FK,
  product_id UUID FK,
  created_at TIMESTAMP
)

-- 10. CUPONES
coupons (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE,
  description TEXT,
  discount_percentage INTEGER,
  discount_amount INTEGER,
  max_uses INTEGER,
  uses_count INTEGER,
  min_order_amount INTEGER,
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN,
  created_at TIMESTAMP
)

-- 11. CONFIGURACIÓN GLOBAL
configuracion (
  id UUID PRIMARY KEY,
  clave VARCHAR(100) UNIQUE,
  valor TEXT,
  tipo VARCHAR(50) (string, integer, boolean, json),
  categoria VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 12. DEVOLUCIONES
returns (
  id UUID PRIMARY KEY,
  order_id UUID FK,
  order_item_id UUID FK,
  reason VARCHAR,
  status VARCHAR (requested, approved, rejected, received, refunded),
  refund_amount INTEGER,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 13. DIRECCIONES GUARDADAS
saved_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID FK,
  full_name VARCHAR,
  phone VARCHAR,
  street VARCHAR,
  city VARCHAR,
  postal_code VARCHAR,
  country VARCHAR,
  is_default BOOLEAN,
  is_shipping BOOLEAN,
  is_billing BOOLEAN,
  created_at TIMESTAMP
)
```

### Endpoints Supabase REST API (usar en Flutter)

```
-- PRODUCTOS
GET  /rest/v1/products?select=*&is_active=eq.true
GET  /rest/v1/products?slug=eq.{slug}
GET  /rest/v1/products?category_id=eq.{id}
POST /rest/v1/products (admin)
PUT  /rest/v1/products (admin)
DEL  /rest/v1/products (admin)

-- VARIANTES
GET  /rest/v1/product_variants?product_id=eq.{id}
GET  /rest/v1/product_variants?size=eq.{size}&color=eq.{color}

-- CATEGORÍAS
GET  /rest/v1/categories?select=*&is_active=eq.true

-- CARRITO (session-based)
GET  /rest/v1/cart_items?session_id=eq.{sessionId}
POST /rest/v1/cart_items
PUT  /rest/v1/cart_items/{id}
DEL  /rest/v1/cart_items/{id}

-- PEDIDOS
GET  /rest/v1/orders?customer_id=eq.{customerId}
GET  /rest/v1/orders/{orderId}
POST /rest/v1/orders
PUT  /rest/v1/orders/{id} (admin)

-- ITEMS DE PEDIDO
GET  /rest/v1/order_items?order_id=eq.{orderId}

-- WISHLIST
GET  /rest/v1/wishlists?customer_id=eq.{customerId}
POST /rest/v1/wishlists
DEL  /rest/v1/wishlists/{id}

-- CUPONES
GET  /rest/v1/coupons?code=eq.{code}&is_active=eq.true

-- BÚSQUEDA
GET  /rest/v1/products?or=(name.ilike.%{query}%,description.ilike.%{query}%)

-- CONFIGURACIÓN
GET  /rest/v1/configuracion?clave=eq.{key}
GET  /rest/v1/configuracion?select=*

-- AUTENTICACIÓN
POST /auth/v1/signup
POST /auth/v1/signin
POST /auth/v1/logout
POST /auth/v1/token?grant_type=refresh_token
POST /auth/v1/user
```

---

## 🎨 DISEÑO Y ESTILOS

### Sistema de Diseño

**Material 3 + Custom Branding**
- Usar Material Design 3 como base
- Personalizar colores con la paleta de FashionStore
- Tipografías: Google Fonts (Playfair Display, Inter)
- Espaciado: 8px grid system
- Bordes redondeados: 8px - 12px

### Componentes Clave

1. **BottomNavigationBar** (Mobile)
   - Inicio
   - Explorar
   - Carrito
   - Favoritos
   - Cuenta

2. **AppBar** (Android) / CupertinoNavigationBar (iOS)
   - Logo/Nombre tienda
   - Search icon
   - Cart icon (con badge)
   - Menu (profile/settings)

3. **ProductCard**
   - Imagen con efecto hover
   - Nombre truncado
   - Precio (con descuento si aplica)
   - Rating (estrellas)
   - Botón Quick Add (flotante en hover)

4. **CartItem**
   - Imagen pequeña
   - Nombre, talla, color
   - Precio unitario
   - Cantidad (con +/-)
   - Total del item
   - Botón eliminar

5. **CheckoutForm**
   - Form steps: Shipping → Billing → Payment
   - Validación en tiempo real
   - Error messages
   - Progress indicator

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: SETUP Y CONFIGURACIÓN (Semana 1)

**Tareas:**
1. [ ] Crear proyecto Flutter con `flutter create fashionstore`
2. [ ] Configurar pubspec.yaml con dependencias
3. [ ] Crear estructura de carpetas (screens, widgets, models, services, providers)
4. [ ] Configurar Riverpod y providers
5. [ ] Configurar Firebase/Supabase para auth
6. [ ] Crear modelos (Product, Category, Order, etc.)
7. [ ] Crear constantes (colores, tipografías, endpoints)
8. [ ] Configurar temas Material 3

**Dependencias Clave:**
```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.0
  
  # Estado
  riverpod: ^2.0.0
  flutter_riverpod: ^2.0.0
  riverpod_generator: ^2.0.0
  
  # HTTP
  dio: ^5.0.0
  http: ^1.0.0
  
  # Supabase
  supabase_flutter: ^1.10.0
  
  # Pagos
  flutter_stripe: ^10.0.0
  pay: ^1.0.0
  
  # Storage/ImageCaching
  cached_network_image: ^3.3.0
  image_picker: ^1.0.0
  image_cropper: ^5.0.0
  
  # UI
  flutter_svg: ^2.0.0
  shimmer: ^3.0.0
  carousel_slider: ^4.2.0
  
  # Localización
  intl: ^0.19.0
  
  # Persistencia local
  shared_preferences: ^2.0.0
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  
  # Notificaciones
  flutter_local_notifications: ^14.0.0
  
  # Utilidades
  uuid: ^4.0.0
  logger: ^2.0.0
  connectivity_plus: ^5.0.0
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  riverpod_generator: ^2.0.0
  build_runner: ^2.4.0
```

---

### FASE 2: AUTENTICACIÓN Y ESTRUCTURA BASE (Semana 1-2)

**Tareas:**
1. [ ] Implementar Supabase Auth (email/contraseña)
2. [ ] Crear AuthProvider (Riverpod)
3. [ ] Crear login screen
4. [ ] Crear signup screen
5. [ ] Crear password recovery screen
6. [ ] Implementar protección de rutas
7. [ ] Crear splash screen
8. [ ] Crear navigation shell (BottomNav)
9. [ ] Crear bottom navigation bar
10. [ ] Crear app bar personalizado

**Archivos a Crear:**
```
lib/
├── services/
│   ├── auth_service.dart
│   └── supabase_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── user_provider.dart
│   └── app_router_provider.dart
├── screens/
│   ├── splash_screen.dart
│   ├── auth_login_screen.dart
│   ├── auth_signup_screen.dart
│   ├── auth_recovery_screen.dart
│   └── shell_screen.dart
├── widgets/
│   ├── app_bar.dart
│   ├── bottom_nav_bar.dart
│   └── custom_text_field.dart
└── constants/
    ├── colors.dart
    ├── typography.dart
    └── endpoints.dart
```

---

### FASE 3: TIENDA PÚBLICA - PRODUCTOS (Semana 2-3)

**Tareas:**
1. [ ] Implementar ProductsProvider (Riverpod)
2. [ ] Crear home screen con ofertas
3. [ ] Crear products list screen con paginación
4. [ ] Crear product detail screen
5. [ ] Crear variant selector component
6. [ ] Crear image gallery component
7. [ ] Crear filtros y búsqueda
8. [ ] Implementar lazy loading de imágenes
9. [ ] Crear related products carousel
10. [ ] Implementar navegación entre pantallas

**Archivos a Crear:**
```
lib/
├── models/
│   ├── product_model.dart
│   ├── category_model.dart
│   ├── variant_model.dart
│   └── search_result_model.dart
├── providers/
│   ├── products_provider.dart
│   ├── categories_provider.dart
│   ├── search_provider.dart
│   └── filters_provider.dart
├── services/
│   ├── product_service.dart
│   └── search_service.dart
├── screens/
│   ├── home_screen.dart
│   ├── products_screen.dart
│   ├── product_detail_screen.dart
│   └── search_screen.dart
└── widgets/
    ├── product_card.dart
    ├── product_grid.dart
    ├── image_gallery.dart
    ├── variant_selector.dart
    ├── filter_panel.dart
    ├── category_carousel.dart
    └── hero_banner.dart
```

---

### FASE 4: CARRITO Y CHECKOUT (Semana 3-4)

**Tareas:**
1. [ ] Crear CartProvider (Riverpod con persistencia)
2. [ ] Crear cart service
3. [ ] Crear cart screen
4. [ ] Crear cart item component
5. [ ] Implementar lógica de agregar/remover
6. [ ] Crear checkout screen (multi-step)
7. [ ] Crear shipping info form
8. [ ] Crear billing address form
9. [ ] Integrar Stripe Flutter
10. [ ] Crear order confirmation screen
11. [ ] Implementar webhooks para sincronización

**Archivos a Crear:**
```
lib/
├── models/
│   ├── cart_item_model.dart
│   ├── order_model.dart
│   ├── shipping_address_model.dart
│   └── payment_model.dart
├── providers/
│   ├── cart_provider.dart
│   ├── checkout_provider.dart
│   └── orders_provider.dart
├── services/
│   ├── cart_service.dart
│   ├── checkout_service.dart
│   ├── stripe_service.dart
│   └── order_service.dart
├── screens/
│   ├── cart_screen.dart
│   ├── checkout_screen.dart
│   ├── shipping_info_screen.dart
│   ├── billing_info_screen.dart
│   ├── payment_screen.dart
│   └── order_confirmation_screen.dart
└── widgets/
    ├── cart_item_card.dart
    ├── checkout_step_indicator.dart
    ├── address_form.dart
    └── payment_form.dart
```

---

### FASE 5: CUENTA DE USUARIO Y WISHLIST (Semana 4-5)

**Tareas:**
1. [ ] Crear account screen
2. [ ] Crear profile edit screen
3. [ ] Crear orders history screen
4. [ ] Crear order detail screen (con rastreo)
5. [ ] Crear wishlist screen
6. [ ] Implementar add/remove de wishlist
7. [ ] Crear saved addresses screen
8. [ ] Crear returns screen
9. [ ] Crear address management
10. [ ] Sincronizar datos con BD

**Archivos a Crear:**
```
lib/
├── models/
│   ├── user_profile_model.dart
│   ├── wishlist_model.dart
│   ├── saved_address_model.dart
│   └── return_model.dart
├── providers/
│   ├── user_provider.dart
│   ├── wishlist_provider.dart
│   ├── orders_history_provider.dart
│   └── returns_provider.dart
├── services/
│   ├── user_service.dart
│   ├── wishlist_service.dart
│   ├── address_service.dart
│   └── returns_service.dart
├── screens/
│   ├── account_screen.dart
│   ├── profile_edit_screen.dart
│   ├── orders_history_screen.dart
│   ├── order_detail_screen.dart
│   ├── wishlist_screen.dart
│   ├── saved_addresses_screen.dart
│   ├── address_form_screen.dart
│   └── returns_screen.dart
└── widgets/
    ├── user_info_card.dart
    ├── order_card.dart
    ├── wishlist_item_card.dart
    └── address_card.dart
```

---

### FASE 6: PANEL DE ADMINISTRACIÓN (Semana 5-6)

**Tareas:**
1. [ ] Crear admin login screen
2. [ ] Crear admin dashboard
3. [ ] Crear admin products list
4. [ ] Crear admin product form
5. [ ] Crear admin variants panel
6. [ ] Crear admin orders list
7. [ ] Crear admin order detail
8. [ ] Crear admin categories management
9. [ ] Crear admin returns management
10. [ ] Crear admin settings
11. [ ] Implementar permisos y roles

**Archivos a Crear:**
```
lib/
├── models/
│   ├── admin_user_model.dart
│   ├── admin_stats_model.dart
│   └── admin_dashboard_model.dart
├── providers/
│   ├── admin_auth_provider.dart
│   ├── admin_products_provider.dart
│   ├── admin_orders_provider.dart
│   ├── admin_categories_provider.dart
│   ├── admin_returns_provider.dart
│   └── admin_analytics_provider.dart
├── services/
│   ├── admin_auth_service.dart
│   ├── admin_product_service.dart
│   ├── admin_order_service.dart
│   ├── admin_category_service.dart
│   ├── admin_image_service.dart
│   └── admin_analytics_service.dart
├── screens/admin/
│   ├── admin_login_screen.dart
│   ├── admin_dashboard_screen.dart
│   ├── admin_products_list_screen.dart
│   ├── admin_product_form_screen.dart
│   ├── admin_variants_panel_screen.dart
│   ├── admin_orders_list_screen.dart
│   ├── admin_order_detail_screen.dart
│   ├── admin_categories_screen.dart
│   ├── admin_category_form_screen.dart
│   ├── admin_returns_screen.dart
│   ├── admin_settings_screen.dart
│   └── admin_analytics_screen.dart
└── widgets/admin/
    ├── dashboard_stats_card.dart
    ├── products_table_item.dart
    ├── orders_table_item.dart
    ├── image_upload_widget.dart
    ├── variant_form_widget.dart
    ├── color_picker_widget.dart
    └── analytics_chart_widget.dart
```

---

### FASE 7: CARACTERÍSTICAS AVANZADAS (Semana 6-7)

**Tareas:**
1. [ ] Implementar push notifications
2. [ ] Implementar offline mode (Hive)
3. [ ] Crear analytics tracking
4. [ ] Implementar dark mode
5. [ ] Crear settings screen
6. [ ] Implementar multi-idioma (español/inglés)
7. [ ] Crear reviews y ratings
8. [ ] Implementar búsqueda por voz
9. [ ] Crear share functionality
10. [ ] Implementar deep linking

---

### FASE 8: TESTING Y DEPLOYMENT (Semana 7-8)

**Tareas:**
1. [ ] Unit tests (servicios, providers)
2. [ ] Widget tests (componentes)
3. [ ] Integration tests (flujos clave)
4. [ ] Performance testing
5. [ ] Configurar CI/CD (GitHub Actions)
6. [ ] Build APK para Android
7. [ ] Build IPA para iOS
8. [ ] Build web
9. [ ] Testing en dispositivos reales
10. [ ] Deploy a Play Store / App Store
11. [ ] Deploy web a hosting

---

## 📋 PLAN DE TAREAS ORDENADO POR PRIORIDAD

### ✅ CRÍTICO (Hacer primero - Semanas 1-2)

1. **Setup inicial del proyecto**
   - Crear proyecto Flutter
   - Configurar pubspec.yaml
   - Crear estructura de carpetas
   - Configurar constantes y temas

2. **Autenticación**
   - Supabase Auth (email/contraseña)
   - AuthProvider (Riverpod)
   - Login screen
   - Auth flow protection

3. **Navegación básica**
   - BottomNavigationBar (mobile)
   - Navigation shell
   - Route management

4. **Listado de productos**
   - Producto model
   - ProductsProvider
   - Home screen (con ofertas)
   - Products list screen
   - Paginación

---

### ⭐ ALTO (Hacer segundo - Semanas 2-3)

5. **Detalle de producto**
   - Product detail screen
   - Image gallery
   - Variant selector
   - Related products

6. **Carrito de compras**
   - CartProvider (persistencia)
   - Cart screen
   - Add to cart functionality
   - Cart totals calculation

7. **Checkout y pagos**
   - Multi-step checkout
   - Stripe integration
   - Order creation
   - Order confirmation

---

### 🔷 MEDIO (Hacer tercero - Semanas 4-5)

8. **Cuenta de usuario**
   - Profile screen
   - Edit profile
   - Orders history
   - Saved addresses

9. **Wishlist**
   - Wishlist provider
   - Wishlist screen
   - Add/remove favorites

10. **Búsqueda y filtros**
    - Search screen
    - Advanced filters
    - Filter application

---

### 🔹 BAJO (Hacer después - Semanas 5-8)

11. **Panel de administración**
    - Admin auth
    - Admin dashboard
    - Products CRUD
    - Orders management
    - Returns management

12. **Funcionalidades avanzadas**
    - Push notifications
    - Offline mode
    - Reviews and ratings
    - Dark mode
    - Multi-language

13. **Testing y deployment**
    - Unit/widget tests
    - Integration tests
    - CI/CD setup
    - Store submissions

---

## 💡 RECOMENDACIONES DE IMPLEMENTACIÓN

### Para Claude Opus 4.5

#### Instrucciones de Contexto

1. **Proporciona el archivo `PROMPT_FLUTTER_CONVERSION.md` completo**
   - Claude tendrá toda la información en una sola consulta
   - Evita contexto fragmentado

2. **Estructura las peticiones por fases**
   - No pidas todo de una vez
   - Pide fase por fase (Setup → Auth → Productos → etc)
   - Esto permite iteración y correcciones

3. **Proporciona ejemplos de modelos**
   - Dale ejemplos de cómo estructurar los modelos Dart
   - Muestra ejemplos de providers con Riverpod
   - Proporciona ejemplos de servicios HTTP

4. **Requiere validación de código**
   - Pide a Claude que valide cada componente
   - Requiere tests básicos
   - Verifica que compile sin errores

#### Prompts Recomendados por Fase

**FASE 1:**
```
"Usando el documento PROMPT_FLUTTER_CONVERSION.md, genera el setup 
completo de Flutter para FashionStore. Incluye:
1. Estructura de carpetas
2. pubspec.yaml con todas las dependencias
3. Archivo de constantes (colores, tipografías, endpoints)
4. Tema Material 3 personalizado
5. Estructura base de modelos

Asegúrate de que todo compile sin errores."
```

**FASE 2:**
```
"Implementa el sistema de autenticación con Supabase para FashionStore 
usando Riverpod. Incluye:
1. AuthService (login, signup, logout, recovery)
2. AuthProvider (Riverpod)
3. LoginScreen con validación
4. SignupScreen con términos
5. PasswordRecoveryScreen
6. Protección de rutas

Usa el documento PROMPT_FLUTTER_CONVERSION.md como referencia."
```

**FASE 3:**
```
"Implementa el sistema de productos usando el patrón MVVM con Riverpod.
Incluye:
1. ProductModel y CategoryModel
2. ProductService (GET productos, filtros, búsqueda)
3. ProductsProvider (Riverpod con paginación)
4. HomeScreen con hero banner y ofertas
5. ProductsListScreen con filtros y búsqueda
6. ProductDetailScreen con galería e info

Referencia: PROMPT_FLUTTER_CONVERSION.md"
```

#### Qué Puedes Hacer Para Mejorar la Comunicación

1. **Revisa el documento antes de pedir cambios**
   - Si algo no está claro, señala la línea específica del documento
   - Proporciona el contexto exacto de qué no entiendes

2. **Valida el código localmente**
   - Copia el código en tu proyecto
   - Ejecuta `flutter pub get`
   - Verifica que compile: `flutter analyze`
   - Prueba en emulador

3. **Si hay errores, proporciona el error completo**
   - No solo "no funciona"
   - Dale a Claude el stack trace completo
   - Proporciona línea de código problemática

4. **Iteraciones claras**
   - "Esto está bien, pero cambia X por Y"
   - "Añade validación de email"
   - "Cambia el color del botón a dorado mate"
   - Sé específico

5. **Testing mientras desarrollas**
   - Crea tests mientras avanzas
   - Esto asegura que funcione
   - Facilita refactoring futuro

#### Estructura de Peticiones Óptima

```
[CONTEXTO]
Basándome en el documento PROMPT_FLUTTER_CONVERSION.md, 
específicamente en la sección [SECCIÓN], necesito:

[OBJETIVO]
Implementar [CARACTERÍSTICA] que debe:
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

[DETALLES TÉCNICOS]
Usando:
- Riverpod para estado
- Dio para HTTP
- Supabase Auth para autenticación
- Material Design 3

[REFERENCIAS]
Del documento:
- Tabla/Modelo: [REFERENCIA ESPECÍFICA]
- Endpoint: [ENDPOINT ESPECÍFICO]
- Estructura: [ESTRUCTURA ESPECÍFICA]

[ENTREGABLES]
Necesito:
1. Archivo A con clase X
2. Archivo B con provider Y
3. Archivo C con screen Z

Por favor valida que compile sin errores.
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN FINAL

Antes de considerar "LISTO":

- [ ] Toda la tienda pública funciona (productos, carrito, checkout)
- [ ] Autenticación completa (login, signup, recovery)
- [ ] Cuenta de usuario con pedidos y favoritos
- [ ] Panel de administración funcional
- [ ] Pagos con Stripe integrados
- [ ] Emails enviándose desde backend
- [ ] Wishlist/Favoritos sincronizado
- [ ] Búsqueda funcionando
- [ ] Filtros aplicándose correctamente
- [ ] Variantes (talla x color) funcionando
- [ ] Stock actualizado en tiempo real
- [ ] Offline mode implementado
- [ ] Push notifications activas
- [ ] Dark mode funcionando
- [ ] Responsive en todos los tamaños
- [ ] Tests pasando (80%+ coverage)
- [ ] Performance optimizada
- [ ] Crashes cero en testing
- [ ] Builds para iOS, Android y Web listos
- [ ] Documentación interna completada

---

## 📞 SOPORTE Y REFERENCIAS

### Documentación útil:
- Flutter Docs: https://flutter.dev/docs
- Riverpod: https://riverpod.dev
- Supabase Flutter: https://supabase.com/docs/reference/dart
- Stripe Flutter: https://stripe.com/docs/stripe-js/flutter
- Material Design 3: https://m3.material.io

### El código web que usas como referencia está en:
```
c:\Users\Felix\Desktop\CRM-Tienda Ropa\src\
```

Archivos más relevantes:
- `src/lib/supabase.ts` - Configuración Supabase
- `src/stores/cart.ts` - Lógica del carrito
- `src/components/shop/` - Componentes UI
- `src/pages/api/` - Endpoints API
- `database-schema-complete.sql` - Esquema BD

---

**ÚLTIMA ACTUALIZACIÓN:** 31 de enero de 2026  
**VERSIÓN:** 1.0 - Completa y validada  
**ESTADO:** ✅ Listo para pasar a Claude Opus 4.5
