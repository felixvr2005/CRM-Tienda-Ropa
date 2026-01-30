# FashionMarket - Documentación Técnica

## 🎉 NUEVO: Panel Unificado de Variantes

**¡Se ha agregado un Panel Unificado para personalizar variantes de productos!**

### ⚡ Acceso Rápido
```
/admin/productos → Selecciona un producto → "✎ Editar Variantes"
```

### ✨ Características
- ✅ Color picker RGB integrado
- ✅ Drag & drop para imágenes
- ✅ Galería responsive
- ✅ Auto-salvado
- ✅ Mensajes de feedback

### 📚 Documentación
- **Para usuarios:** [INICIO-RAPIDO.md](INICIO-RAPIDO.md) (2 min)

[![E2E staging](https://github.com/felixvr2005/CRM-Tienda-Ropa/actions/workflows/e2e-staging.yml/badge.svg)](https://github.com/felixvr2005/CRM-Tienda-Ropa/actions/workflows/e2e-staging.yml)
- **Para guía completa:** [GUIA-PANEL-UNIFICADO.md](GUIA-PANEL-UNIFICADO.md)
- **Para técnica:** [DOCUMENTACION-VARIANTS-PANEL.md](DOCUMENTACION-VARIANTS-PANEL.md)
- **Para índice:** [INDICE-DOCUMENTACION.md](INDICE-DOCUMENTACION.md)

### 📍 Archivo Principal
- `/src/components/islands/VariantsPanel.tsx` (650+ líneas)

---

## 📋 Introducción

**FashionMarket** es una tienda online de moda masculina premium construida con:
- **Frontend:** Astro 5.0 (modo Híbrido)
- **Estilos:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estado del Cliente:** Nano Stores
- **Estética:** Minimalismo Sofisticado

---

## 🎨 Paleta de Colores y Tipografías

### Colores
- **Azul Marino:** `#0B1929` (títulos, botones primarios)
- **Gris Carbón:** `#262626` (textos, elementos secundarios)
- **Blanco Roto:** `#F5F5F0` (fondos, espacios)
- **Dorado Mate:** `#D4A574` (acentos, CTA)
- **Cobre:** `#A0743D` (acentos secundarios)

### Tipografías
- **Serif (Títulos):** Playfair Display
- **Sans (Cuerpo):** Inter

---

## 🏗️ Estructura de Carpetas

```
CRM-Tienda Ropa/
├── src/
│   ├── components/
│   │   ├── admin/              # Componentes del panel admin
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── InventoryTable.tsx
│   │   ├── shop/               # Componentes de la tienda
│   │   │   ├── AddToCartButton.tsx    # ⭐ Isla interactiva
│   │   │   ├── CartSidebar.tsx        # ⭐ Isla interactiva
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductGallery.tsx
│   │   └── common/             # Componentes compartidos
│   │       ├── CartButton.tsx         # ⭐ Isla interactiva
│   │       ├── Navigation.tsx
│   │       └── Footer.tsx
│   │
│   ├── layouts/                # Layouts de Astro
│   │   ├── BaseLayout.astro
│   │   ├── ShopLayout.astro    # Layout para tienda pública
│   │   └── AdminLayout.astro   # Layout para panel admin
│   │
│   ├── pages/                  # Rutas de Astro
│   │   ├── index.astro         # Home (SSG)
│   │   ├── shop/
│   │   │   ├── index.astro     # Catálogo (SSG)
│   │   │   ├── [slug].astro    # Ficha de producto (SSG)
│   │   │   └── checkout.astro  # Checkout (SSR)
│   │   ├── admin/              # Rutas protegidas (SSR)
│   │   │   ├── index.astro     # Dashboard
│   │   │   ├── products/
│   │   │   │   ├── index.astro # Listado de productos
│   │   │   │   ├── [id].astro  # Editar producto
│   │   │   │   └── new.astro   # Nuevo producto
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   └── inventory.astro
│   │   └── api/                # Rutas API (SSR)
│   │       ├── auth/
│   │       │   ├── login.ts
│   │       │   └── logout.ts
│   │       ├── products/
│   │       │   ├── index.ts    # GET/POST
│   │       │   └── [id].ts     # GET/PUT/DELETE
│   │       ├── cart/
│   │       │   └── checkout.ts
│   │       └── upload/
│   │           └── image.ts
│   │
│   ├── stores/                 # Nano Stores (estado del cliente)
│   │   ├── cart.ts             # ⭐ Carrito persistente
│   │   ├── user.ts
│   │   └── filters.ts
│   │
│   ├── lib/                    # Librerías y utilidades
│   │   ├── supabase/
│   │   │   ├── client.ts       # Cliente Supabase
│   │   │   └── admin.ts        # Cliente admin (servidor)
│   │   ├── auth.ts
│   │   └── stripe.ts           # (Fase posterior)
│   │
│   ├── types/                  # Tipos TypeScript
│   │   ├── database.ts         # ⭐ Interfaces BD
│   │   └── api.ts
│   │
│   ├── utils/                  # Funciones utilitarias
│   │   ├── cart.ts             # ⭐ Lógica del carrito
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   └── styles/
│       └── global.css          # Estilos globales
│
├── public/                     # Archivos estáticos
│   ├── favicon.svg
│   └── images/
│
├── astro.config.mjs            # Configuración Astro
├── tailwind.config.mjs         # Configuración Tailwind
├── tsconfig.json
├── package.json
├── .env.example                # Variables de entorno
└── database-schema.sql         # ⭐ Esquema SQL
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### 1. **categories** - Categorías de Productos
```sql
id (UUID) | name (VARCHAR) | slug (VARCHAR) | description (TEXT) | image_url (TEXT)
```

#### 2. **products** - Productos
```sql
id (UUID) | name | slug | description | price (INTEGER - céntimos) | stock 
category_id (FK) | images (TEXT[]) | sizes (VARCHAR[]) | colors (VARCHAR[]) 
material | is_active | is_featured | created_at | updated_at
```

#### 3. **product_variants** - Variantes (Talla x Color)
```sql
id (UUID) | product_id (FK) | size | color | stock | sku
```

#### 4. **user_profiles** - Perfiles de Usuarios (Admin)
```sql
id (UUID-FK:auth.users) | email | full_name | role | is_active | created_at
```

#### 5. **orders** - Órdenes (Estructura Base)
```sql
id (UUID) | user_id (FK) | status | total_amount | items (JSONB) 
customer_email | customer_name | shipping_address | created_at
```

#### 6. **cart_items** - Ítems de Carrito (Persistencia Temporal)
```sql
id (UUID) | session_id | product_id (FK) | quantity | size | color | added_at | expires_at
```

### Políticas RLS (Row Level Security)

- ✅ **Lectura pública:** Todos ven productos activos y categorías
- 🔒 **Escritura:** Solo admins pueden crear/actualizar/eliminar
- 👤 **Perfiles:** Solo admin puede crear perfiles de usuario
- 📦 **Órdenes:** Usuarios ven sus propias órdenes, admins ven todas

---

## 🔐 Configuración de Supabase Storage

### Crear Bucket "products-images"

1. Ve a **Supabase Dashboard** → **Storage**
2. Click en **New Bucket**
3. Nombre: `products-images`
4. Privado: **Desactivado** (público para lectura)
5. Crear

### Políticas de Storage

```sql
-- Permitir lectura pública
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products-images');

-- Permitir upload solo para admin (por JWT)
CREATE POLICY "Admin Can Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products-images' 
    AND (auth.jwt() ->> 'role' = 'authenticated')
  );
```

---

## 🛒 Nano Store del Carrito

### Archivo: `src/stores/cart.ts`

```typescript
// Crear/actualizar items
export function addItemToCart(product, quantity, size, color)

// Eliminar items
export function removeItemFromCart(itemId)

// Actualizar cantidad
export function updateItemQuantity(itemId, quantity)

// Vaciar carrito
export function clearCartStore()

// Obtener estado
export function getCartState() // { items, totalItems, totalPrice }
```

### Persistencia

- ✅ Datos guardados en `localStorage`
- ⏰ Expiración automática a los 7 días
- 🔄 Cargados automáticamente al inicializar la tienda

---

## ⭐ Componentes "Isla" (Islas de Astro)

### 1. AddToCartButton.tsx

**Ubicación:** `src/components/shop/AddToCartButton.tsx`

```jsx
<AddToCartButton
  productId="uuid"
  productName="Camisa Premium"
  price={15990}  // céntimos
  productImage="/image.jpg"
  stock={5}
  sizes={['XS', 'S', 'M', 'L', 'XL']}
  colors={['Azul', 'Negro', 'Blanco']}
/>
```

**Funcionalidades:**
- Selector de talla y color
- Selector de cantidad
- Validación de stock
- Feedback visual
- Integración con Nano Store

---

### 2. CartSidebar.tsx

**Ubicación:** `src/components/shop/CartSidebar.tsx`

**Funcionalidades:**
- Panel deslizante (slide-over)
- Listado de ítems con imagen
- Actualizar cantidad
- Eliminar ítems
- Resumen de totales
- Botón de checkout
- Información de envíos

---

### 3. CartButton.tsx

**Ubicación:** `src/components/common/CartButton.tsx`

**Funcionalidades:**
- Botón flotante en header
- Badge con cantidad de ítems
- Abre/cierra CartSidebar
- Reactivo en tiempo real

---

## 🚀 Cómo Usar en Páginas Astro

```astro
---
// src/pages/shop/[slug].astro
import ShopLayout from '@layouts/ShopLayout.astro';
import AddToCartButton from '@components/shop/AddToCartButton';

const product = {
  id: '123',
  name: 'Camisa',
  price: 15990,
  stock: 5,
  sizes: ['S', 'M', 'L'],
  colors: ['Azul', 'Negro'],
};
---

<ShopLayout title="Producto">
  <!-- Contenido estático SSG -->
  <h1>{product.name}</h1>
  
  <!-- Isla interactiva (SSR cuando es necesario) -->
  <AddToCartButton
    client:load
    productId={product.id}
    productName={product.name}
    price={product.price}
    stock={product.stock}
    sizes={product.sizes}
    colors={product.colors}
  />
</ShopLayout>
```

---

## 🔑 Variables de Entorno

Crear archivo `.env.local`:

```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...xxxxx
```

---

## 📦 Instalación y Setup

### 1. Clonar/Crear Proyecto
```bash
npm create astro@latest fashionmarket
cd fashionmarket
```

### 2. Instalar Dependencias
```bash
npm install
npm install nanostores @supabase/supabase-js
npm install -D @astrojs/tailwind @astrojs/react @astrojs/vue
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar SQL del archivo `database-schema.sql`
3. Copiar URL y claves al archivo `.env.local`
4. Crear bucket `products-images`

### 4. Iniciar Desarrollo
```bash
npm run dev
# El sitio estará en http://localhost:3000
```

### 5. Compilar Producción
```bash
npm run build
npm run preview
```

---

## 🎯 Roadmap de Funcionalidades Completadas ✅

- [x] Estructura base Astro híbrido
- [x] Configuración Tailwind CSS
- [x] Esquema SQL de base de datos
- [x] Nano Store del carrito
- [x] Componentes interactivos (AddToCartButton, CartSidebar)
- [x] Layouts base (Shop, Admin)
- [x] Páginas iniciales (Home, Catalog, Admin Dashboard)

## 🔮 Próximas Fases

- [ ] Integración con Stripe para pagos
- [ ] Sistema de autenticación y JWT en Supabase
- [ ] CRUD completo en panel admin
- [ ] Subida de imágenes con Supabase Storage
- [ ] Búsqueda y filtrado dinámico de productos
- [ ] Sistema de reviews y ratings
- [ ] Notificaciones por email
- [ ] SEO metadatos dinámicos
- [ ] Optimización de imágenes

---

## 📚 Recursos Útiles

- [Documentación Astro](https://docs.astro.build)
- [Documentación Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nano Stores](https://github.com/nanostores/nanostores)
- [Stripe Integration](https://stripe.com/docs)

---

**Creado:** 8 de enero de 2026
**Versión:** 1.0.0 - Arquitectura Fundacional
