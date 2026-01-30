/**
 * SETUP GUIDE - FASHIONMARKET
 * 
 * Guía paso a paso para configurar el proyecto
 */

# 🚀 GUÍA DE CONFIGURACIÓN INICIAL - FashionMarket

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta en Supabase (gratuita en https://supabase.com)
- (Opcional) Git configurado

---

## PASO 1: Clonar/Crear el Proyecto

Si estás partiendo del código base:

```bash
# Copiar estructura a tu máquina
# O clonar si está en un repo

cd "CRM-Tienda Ropa"
npm install
```

---

## PASO 2: Configurar Supabase

### A. Crear Proyecto en Supabase

1. Ir a https://supabase.com/dashboard
2. Click en "New Project"
3. Seleccionar organización
4. Nombre: `fashionmarket`
5. Database password: Guardar en lugar seguro
6. Region: Seleccionar la más cercana
7. Click "Create New Project" y esperar ~2 minutos

### B. Obtener Credenciales

1. Una vez creado el proyecto, ir a **Settings** → **API**
2. Copiar:
   - `URL` (Project URL)
   - `public` (Anon Public Key)
   - `secret` (Service Role Key)

### C. Ejecutar Esquema SQL

1. En el Dashboard, ir a **SQL Editor**
2. Click en "New Query"
3. Copiar todo el contenido de `database-schema.sql`
4. Pegar en el editor
5. Click en "Run"
6. ✅ Verificar que no hay errores

### D. Crear Bucket de Storage

1. Ir a **Storage** en el sidebar
2. Click en "New Bucket"
3. Nombre: `products-images`
4. Desmarcar "Private bucket" (hacerlo público)
5. Click "Create Bucket"

---

## PASO 3: Configurar Variables de Entorno

1. Crear archivo `.env.local` (copiar de `.env.example`):

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

2. Editar `.env.local` con tus credenciales de Supabase:

```env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...xxxxx
```

3. **IMPORTANTE:** Nunca compartir `.env.local` ❌

---

## PASO 4: Instalar Dependencias

```bash
npm install

# O si usas yarn
yarn install
```

Esto instalará:
- Astro 5.0
- Tailwind CSS
- Supabase SDK
- Nano Stores
- React & Vue

---

## PASO 5: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Output esperado:
```
  🚀 Astro v5.0.0 ready in 0.89s
  ➜ Local    http://localhost:3000/
  ➜ Network  http://your.ip.address:3000/
```

### Desarrollo local — checks rápidos

- Instalar dependencias: `npm ci`
- Habilitar hooks de git (primera vez): `npm run prepare`
- Validar secrets localmente (muestra faltantes pero permite seguir con --allow-missing):
  - `npm run validate:env -- --allow-missing`
- Ejecutar pruebas:
  - Unit tests: `npm test`
  - E2E locales (usa mocks/fallbacks): `npm run e2e:local`

Consejo: si quieres replicar el comportamiento de CI usa `npm run ci:staging` (requiere secrets en entorno).

Abrir en navegador: **http://localhost:3000**

---

## PASO 6: Verificar Configuración

### Home Page (SSG)
✅ Visitar http://localhost:3000
- Debe mostrar hero section con FashionMarket
- Layout con navegación

### Shop Page (SSG)
✅ Visitar http://localhost:3000/shop
- Debe mostrar catálogo
- Filtros de categoría

### Admin Dashboard (SSR)
⚠️ Visitar http://localhost:3000/admin
- Por ahora sin autenticación
- Solo estructura base

### Cart Interactivo
✅ Click en icono del carrito en el header
- CartButton debe mostrarse
- Hacer click debe abrir CartSidebar

---

## PASO 7: Próximos Pasos

### Crear Datos de Prueba en Supabase

En **SQL Editor**, ejecutar:

```sql
-- Insertar un producto de prueba
INSERT INTO products (
  id, name, slug, description, price, stock, 
  category_id, images, sizes, colors, is_active
) VALUES (
  gen_random_uuid(),
  'Camisa Premium Azul',
  'camisa-premium-azul',
  'Camisa de algodón 100% orgánico con diseño minimalista',
  15990,  -- €159.90 en céntimos
  10,
  (SELECT id FROM categories LIMIT 1),
  ARRAY['https://via.placeholder.com/500'],
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['Azul', 'Negro', 'Blanco'],
  true
);
```

---

## PASO 8: Compilar para Producción

```bash
npm run build
```

Output:
```
✓ Building...
✓ Built in 3.21s

16 pages built in 45ms
```

Para previsualizar build:
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Error: "PUBLIC_SUPABASE_URL is missing"
- ✅ Verificar que `.env.local` existe
- ✅ Verificar que tienen los valores correctos
- ✅ Reiniciar servidor (`npm run dev`)

### Error: "CORS policy"
- ✅ En Supabase, ir a **Settings** → **API**
- ✅ Añadir `http://localhost:3000` a URL Configuration

### Carrito no persiste
- ✅ Verificar que localStorage está habilitado en navegador
- ✅ Abrir DevTools → Application → Local Storage
- ✅ Buscar `fashionmarket_cart`

### Imágenes no cargan en Storage
- ✅ Verificar que bucket `products-images` es público
- ✅ Verificar permisos en **Storage** → **Policies**

---

## 📊 Estructura de Datos Inicial

Después de ejecutar `database-schema.sql`, tendrás:

### Tablas
- ✅ `categories` - Categorías (Camisas, Pantalones, Trajes)
- ✅ `products` - Productos
- ✅ `product_variants` - Variantes (talla x color)
- ✅ `user_profiles` - Perfiles de admin
- ✅ `orders` - Órdenes (estructura base)
- ✅ `cart_items` - Items de carrito temporal

### Políticas RLS
- ✅ Lectura pública para productos/categorías
- ✅ Escritura solo para admin
- ✅ Protección de datos de usuario

---

## 📚 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `astro.config.mjs` | Configuración de Astro |
| `tailwind.config.mjs` | Tema y colores |
| `tsconfig.json` | TypeScript paths |
| `src/stores/cart.ts` | Nano Store del carrito |
| `src/lib/supabase/client.ts` | Cliente Supabase |
| `src/components/shop/AddToCartButton.tsx` | Botón interactivo |
| `database-schema.sql` | Esquema SQL |
| `.env.example` | Plantilla de variables |

---

## 🎯 Siguientes Features a Implementar

1. **Autenticación Admin**
   - Login en `/admin`
   - Protección de rutas
   - JWT con Supabase Auth

2. **CRUD de Productos**
   - Crear producto nuevo
   - Editar producto
   - Eliminar producto
   - Subir imágenes

3. **Integración Stripe**
   - Checkout de pago
   - Webhook para confirmar órdenes
   - Email de confirmación

4. **Búsqueda y Filtros**
   - Búsqueda de productos
   - Filtros por precio, talla, color
   - Ordenamiento

---

## 💬 Soporte

- Documentación completa: Ver `README.md`
- Issues: Crear en repositorio
- Supabase Docs: https://supabase.com/docs

---

**¡Listo para comenzar!** 🎉
