# ÍNDICE DE ARCHIVOS - FASHIONMARKET

## 📋 Estructura Completa del Proyecto

### 🔧 Configuración Principal
```
├── astro.config.mjs              ⭐ Configuración de Astro (hybrid mode)
├── tailwind.config.mjs           ⭐ Tema personalizado y colores
├── tsconfig.json                 ⭐ Configuración TypeScript con aliases
├── package.json                  ⭐ Dependencias y scripts
├── .env.example                  ⭐ Template de variables de entorno
├── .gitignore                    ⭐ Archivos a ignorar en Git
└── init.sh                       ⭐ Script de inicialización (bash)
```

### 📚 Documentación
```
├── README.md                     ⭐ Guía técnica completa del proyecto
├── SETUP.md                      ⭐ Pasos paso a paso para configurar
├── ENTREGABLES.md                ⭐ Resumen ejecutivo de entregables
├── EJEMPLOS.md                   ⭐ Ejemplos de código y casos de uso
└── FAQ.md                        ⭐ Preguntas frecuentes
```

### 🗄️ Base de Datos
```
└── database-schema.sql           ⭐ Script SQL completo con:
                                     - Crear tablas (6)
                                     - Índices
                                     - Políticas RLS
                                     - Datos de prueba
```

### 💻 Código Frontend - src/

#### Componentes React (Islas Interactivas)
```
src/components/
├── shop/                          Componentes de la tienda
│   ├── AddToCartButton.tsx        ⭐ Botón +añadir al carrito (isla)
│   ├── CartSidebar.tsx            ⭐ Panel lateral del carrito (isla)
│   ├── ProductCard.tsx            Card de producto
│   ├── ProductGallery.tsx         Galería de imágenes
│   └── ProductFilters.tsx         Filtros de productos
│
├── admin/                          Componentes del panel admin
│   ├── ProductForm.tsx            Formulario para crear/editar
│   ├── ImageUpload.tsx            Upload de imágenes drag & drop
│   ├── InventoryTable.tsx         Tabla de inventario
│   └── OrdersList.tsx             Listado de órdenes
│
└── common/                         Componentes compartidos
    ├── CartButton.tsx             ⭐ Botón flotante carrito (isla)
    ├── Navigation.tsx             Menú de navegación
    ├── Footer.tsx                 Footer del sitio
    └── Header.tsx                 Header principal
```

#### Layouts Astro
```
src/layouts/
├── BaseLayout.astro              ⭐ Layout base con HTML, head, body
├── ShopLayout.astro              ⭐ Layout tienda pública (con nav/footer)
└── AdminLayout.astro             ⭐ Layout panel admin (con sidebar)
```

#### Páginas Astro (Rutas)
```
src/pages/
├── index.astro                   ⭐ Home - Hero section
├── 404.astro                     Página no encontrada
│
├── shop/
│   ├── index.astro               ⭐ Catálogo de productos (SSG)
│   ├── [slug].astro              ⭐ Ficha de producto (SSG dinámico)
│   └── checkout.astro            ⭐ Checkout (SSR)
│
├── api/                          Rutas API (SSR)
│   ├── auth/
│   │   ├── login.ts              Login de admin
│   │   └── logout.ts             Logout
│   │
│   ├── products/
│   │   ├── index.ts              GET/POST productos
│   │   └── [id].ts               GET/PUT/DELETE producto
│   │
│   ├── cart/
│   │   └── checkout.ts           Crear orden
│   │
│   └── upload/
│       └── image.ts              Subir imagen
│
└── admin/                        Rutas admin (SSR protegido)
    ├── index.astro               ⭐ Dashboard
    ├── login.astro               Login admin
    └── products/
        ├── index.astro           Listado de productos
        ├── [id].astro            Editar producto
        └── new.astro             Nuevo producto
```

#### State Management (Nano Stores)
```
src/stores/
├── cart.ts                       ⭐ Tienda del carrito con persistencia
│   ├── cartStore                 Atom con items del carrito
│   ├── cartTotalsStore           Atom con totales
│   ├── addItemToCart()           Función para añadir
│   ├── removeItemFromCart()      Función para eliminar
│   ├── updateItemQuantity()      Función para actualizar cantidad
│   ├── clearCartStore()          Función para vaciar
│   └── getCartState()            Función para obtener estado
│
├── user.ts                       Tienda de usuario (futuro)
└── filters.ts                    Tienda de filtros (futuro)
```

#### Librerías y Utilidades
```
src/lib/
└── supabase/
    ├── client.ts                 ⭐ Cliente Supabase inicializado
    ├── queries.ts                ⭐ Funciones reutilizables:
    │   ├── getAllCategories()
    │   ├── getProducts()
    │   ├── getProductBySlug()
    │   ├── checkStock()
    │   ├── createOrder()
    │   └── searchProducts()
    │
    └── storage.ts                ⭐ Gestión de imágenes:
        ├── uploadProductImage()
        ├── uploadMultipleImages()
        ├── deleteProductImage()
        └── getPublicImageUrl()

src/utils/
├── cart.ts                       ⭐ Lógica del carrito:
│   ├── loadCart()
│   ├── saveCart()
│   ├── calculateCartTotals()
│   ├── addToCart()
│   ├── removeFromCart()
│   ├── updateCartItemQuantity()
│   ├── clearCart()
│   └── formatPrice()
│
└── validation.ts                 ⭐ Validación de datos:
    ├── validateProduct()
    ├── validateImageFile()
    ├── generateSlug()
    ├── isValidEmail()
    └── validateContactForm()

src/types/
├── database.ts                   ⭐ Interfaces TypeScript:
│   ├── CartItem
│   ├── CartState
│   ├── Product
│   ├── Category
│   ├── ProductVariant
│   ├── UserProfile
│   └── Order
│
└── api.ts                        Tipos para API

src/styles/
└── global.css                    ⭐ Estilos globales CSS
```

---

## 🎯 Archivos Clave por Funcionalidad

### Carrito de Compra
```
⭐ src/stores/cart.ts                    - Lógica y persistencia
⭐ src/utils/cart.ts                     - Funciones helper
⭐ src/components/shop/AddToCartButton.tsx - Botón interactivo
⭐ src/components/shop/CartSidebar.tsx   - Panel lateral
⭐ src/components/common/CartButton.tsx  - Botón en header
```

### Base de Datos
```
⭐ database-schema.sql                   - Esquema SQL
⭐ src/lib/supabase/queries.ts           - Queries reutilizables
⭐ src/types/database.ts                 - Interfaces de BD
```

### Productos y Catálogo
```
⭐ src/pages/shop/index.astro            - Listado de productos
⭐ src/pages/shop/[slug].astro           - Ficha individual
⭐ src/lib/supabase/queries.ts           - Consultas de productos
⭐ src/components/shop/ProductCard.tsx   - Componente de producto
```

### Admin y Gestión
```
⭐ src/layouts/AdminLayout.astro         - Layout admin
⭐ src/pages/admin/index.astro           - Dashboard
⭐ src/pages/admin/products/             - CRUD de productos
⭐ src/components/admin/ProductForm.tsx  - Formulario producto
⭐ src/lib/supabase/storage.ts           - Upload de imágenes
```

### Autenticación (Futuro)
```
src/pages/api/auth/login.ts      - Login endpoint
src/pages/api/auth/logout.ts     - Logout endpoint
src/stores/user.ts               - Tienda de usuario
```

### Estilos y Tema
```
⭐ tailwind.config.mjs                   - Configuración tema
⭐ src/styles/global.css                 - CSS global
⭐ Colores en tailwind (navy, charcoal, cream, accent)
```

---

## 📊 Estadísticas del Proyecto

### Archivos Creados: 35+
- Configuración: 6
- Documentación: 5
- BD/SQL: 1
- Componentes React: 6
- Layouts Astro: 3
- Páginas Astro: 8
- Librerías: 3
- Stores: 1
- Types: 1
- Utilidades: 2
- Estilos: 1
- Scripts: 1
- Otros: 1

### Líneas de Código Aproximadas
- SQL Schema: ~450 líneas
- React Components: ~400 líneas
- Astro Layouts: ~300 líneas
- Stores y Utils: ~350 líneas
- Documentación: ~2000 líneas

### Tecnologías Implementadas
- ✅ Astro 5.0 (hybrid mode)
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ React (islas)
- ✅ Nano Stores
- ✅ Supabase
- ✅ PostgreSQL schema
- ✅ RLS policies

---

## 🚀 Cómo Navegar el Proyecto

### Para Entender la Arquitectura
1. Leer README.md
2. Ver ENTREGABLES.md
3. Explorar astro.config.mjs
4. Ver tailwind.config.mjs

### Para Implementar Features
1. Ver EJEMPLOS.md para casos de uso
2. Consultar la estructura en src/
3. Usar tipos de src/types/database.ts
4. Reutilizar funciones de src/lib/

### Para Resolver Problemas
1. Ver FAQ.md primero
2. Revisar SETUP.md para configuración
3. Buscar en archivos con pattern
4. Consultar comentarios en código

### Para Desplegar
1. Seguir guía en SETUP.md
2. Ejecutar database-schema.sql
3. npm run build
4. Desplegar en Vercel/Netlify

---

## 🎯 Flujo de Desarrollo Recomendado

### Día 1: Setup
```
1. npm install
2. Crear cuenta Supabase
3. Ejecutar database-schema.sql
4. Crear .env.local
5. npm run dev
6. Verificar que home carga
```

### Día 2: Entender Arquitectura
```
1. Explorar estructura en src/
2. Leer README.md completo
3. Ver EJEMPLOS.md
4. Probar AddToCartButton
5. Revisar Nano Store
```

### Día 3-4: Primeras Features
```
1. Implementar autenticación admin
2. Crear formulario de producto
3. Conectar upload de imágenes
4. Crear CRUD en admin
5. Probar flujo completo
```

### Día 5+: Expansión
```
1. Integrar Stripe
2. Implementar checkout
3. Agregar búsqueda
4. Optimizar performance
5. Deploy en producción
```

---

## 📞 Referencia Rápida

### Comandos Útiles
```bash
npm run dev              # Iniciar desarrollo
npm run build            # Compilar
npm run preview          # Previsualizar build
npm install              # Instalar dependencias
```

### Archivos a Editar Frecuentemente
```
tailwind.config.mjs      - Para cambiar colores/tema
.env.local               - Para credenciales
src/pages/               - Para crear nuevas páginas
src/components/          - Para crear componentes
```

### Archivos de Referencia
```
README.md                - Documentación técnica
SETUP.md                 - Configuración inicial
EJEMPLOS.md              - Ejemplos de código
FAQ.md                   - Preguntas frecuentes
database-schema.sql      - Estructura BD
```

---

**Versión:** 1.0.0 - Fundacional
**Fecha:** 8 de enero de 2026
**Stack:** Astro 5.0 + Supabase + Tailwind CSS + Nano Stores
