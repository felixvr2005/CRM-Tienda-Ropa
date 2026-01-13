# 🎯 PLAN COMPLETO DE IMPLEMENTACIÓN - FASHIONSTORE

## 📊 ANÁLISIS DE BRECHAS (Estado Actual vs. Requisitos)

### ✅ YA IMPLEMENTADO
| Componente | Estado | Detalles |
|------------|--------|----------|
| Estructura de carpetas | ✅ Completo | Arquitectura Astro bien organizada |
| Esquema BD básico | ✅ Completo | 6 tablas principales creadas |
| Políticas RLS | ✅ Completo | Seguridad a nivel de fila |
| Nano Store carrito | ✅ Completo | Persistencia localStorage |
| AddToCartButton | ✅ Completo | Componente isla interactivo |
| CartSidebar | ✅ Completo | Panel deslizante funcional |
| Layouts base | ✅ Completo | Shop + Admin layouts |
| Páginas básicas | ✅ Completo | Home, Shop, Admin Dashboard |
| Configuración Tailwind | ✅ Completo | Tema personalizado |
| Cliente Supabase | ✅ Completo | Conexión configurada |

### ❌ PENDIENTE DE IMPLEMENTAR
| Componente | Prioridad | Requisito del Informe |
|------------|-----------|----------------------|
| Tabla `configuracion` | 🔴 Alta | Ofertas Flash (8.1) |
| Login Admin funcional | 🔴 Alta | Autenticación (5.2) |
| CRUD Productos completo | 🔴 Alta | Panel Admin (11.1) |
| Integración Stripe | 🔴 Alta | Pasarela de pago (7) |
| Página Checkout | 🔴 Alta | Checkout funcional (11.1) |
| Control stock atómico | 🔴 Alta | Atomicidad (6.1) |
| Sección Ofertas Flash | 🟡 Media | Ofertas activas (8) |
| Webhooks Stripe | 🟡 Media | Confirmación pagos (7.2) |
| Ficha producto dinámica | 🟡 Media | Catálogo (11.1) |
| Gestión de pedidos | 🟡 Media | Admin pedidos (11.2) |
| Docker/Coolify config | 🟢 Baja | Despliegue (10) |

---

## 📋 PASOS DETALLADOS PARA COMPLETAR EL PROYECTO

### FASE 1: BASE DE DATOS COMPLETA (30 min)

#### Paso 1.1: Añadir tabla `configuracion`
```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  descripcion TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
  ('ofertas_activas', 'false', 'boolean', 'Activa/desactiva sección de ofertas flash'),
  ('nombre_tienda', 'FashionStore', 'string', 'Nombre de la tienda'),
  ('moneda', 'EUR', 'string', 'Moneda principal'),
  ('envio_gratis_desde', '15000', 'integer', 'Envío gratis desde X céntimos'),
  ('iva_porcentaje', '21', 'integer', 'Porcentaje de IVA'),
  ('stripe_mode', 'test', 'string', 'Modo de Stripe: test o live');

-- Políticas RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config is publicly readable"
  ON configuracion FOR SELECT USING (true);

CREATE POLICY "Only admins can update config"
  ON configuracion FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin'));
```

#### Paso 1.2: Añadir campo `precio_oferta` a productos
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_oferta INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS es_oferta BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS oferta_desde TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS oferta_hasta TIMESTAMP WITH TIME ZONE;
```

#### Paso 1.3: Crear tabla `stripe_payments`
```sql
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments"
  ON stripe_payments FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
```

---

### FASE 2: AUTENTICACIÓN ADMIN (1 hora)

#### Paso 2.1: Crear página de login
**Archivo:** `src/pages/admin/login.astro`

#### Paso 2.2: Crear componente LoginForm
**Archivo:** `src/components/admin/LoginForm.tsx`

#### Paso 2.3: Crear middleware de autenticación
**Archivo:** `src/middleware.ts`

#### Paso 2.4: Crear primer usuario admin en Supabase
1. Ir a Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: tu-email@ejemplo.com
4. Password: tu-contraseña-segura
5. Copiar el UUID del usuario
6. Ejecutar en SQL Editor:
```sql
INSERT INTO user_profiles (id, email, full_name, role)
VALUES ('UUID-DEL-USUARIO', 'tu-email@ejemplo.com', 'Admin Principal', 'admin');
```

---

### FASE 3: CRUD PRODUCTOS ADMIN (2 horas)

#### Paso 3.1: Crear página listado productos
**Archivo:** `src/pages/admin/products/index.astro`

#### Paso 3.2: Crear página nuevo producto
**Archivo:** `src/pages/admin/products/new.astro`

#### Paso 3.3: Crear componente ProductForm
**Archivo:** `src/components/admin/ProductForm.tsx`

#### Paso 3.4: Crear componente ImageUpload
**Archivo:** `src/components/admin/ImageUpload.tsx`

---

### FASE 4: INTEGRACIÓN STRIPE (2 horas)

#### Paso 4.1: Configurar cuenta Stripe
1. Registrarse en https://stripe.com
2. Activar modo Test
3. Obtener claves API (Dashboard → Developers → API Keys):
   - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
   - `STRIPE_SECRET_KEY` (sk_test_...)
4. Añadir a `.env.local`:
```env
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### Paso 4.2: Instalar Stripe
```bash
npm install stripe @stripe/stripe-js
```

#### Paso 4.3: Crear cliente Stripe
**Archivo:** `src/lib/stripe/client.ts`

#### Paso 4.4: Crear API de checkout
**Archivo:** `src/pages/api/checkout/create-session.ts`

#### Paso 4.5: Crear webhook
**Archivo:** `src/pages/api/webhooks/stripe.ts`

---

### FASE 5: PÁGINA CHECKOUT (1.5 horas)

#### Paso 5.1: Crear página checkout
**Archivo:** `src/pages/checkout/index.astro`

#### Paso 5.2: Crear componente CheckoutForm
**Archivo:** `src/components/shop/CheckoutForm.tsx`

#### Paso 5.3: Crear páginas de resultado
**Archivos:**
- `src/pages/checkout/success.astro`
- `src/pages/checkout/cancel.astro`

---

### FASE 6: CONTROL DE STOCK ATÓMICO (1 hora)

#### Paso 6.1: Crear función SQL para descuento atómico
```sql
-- Función para descontar stock de forma atómica
CREATE OR REPLACE FUNCTION descontar_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_size VARCHAR DEFAULT NULL,
  p_color VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stock_actual INTEGER;
  v_resultado BOOLEAN := FALSE;
BEGIN
  -- Si hay variante específica
  IF p_size IS NOT NULL AND p_color IS NOT NULL THEN
    -- Bloquear fila para actualización
    SELECT stock INTO v_stock_actual
    FROM product_variants
    WHERE product_id = p_product_id 
      AND size = p_size 
      AND color = p_color
    FOR UPDATE;
    
    IF v_stock_actual >= p_quantity THEN
      UPDATE product_variants
      SET stock = stock - p_quantity
      WHERE product_id = p_product_id 
        AND size = p_size 
        AND color = p_color;
      v_resultado := TRUE;
    END IF;
  ELSE
    -- Stock general del producto
    SELECT stock INTO v_stock_actual
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    IF v_stock_actual >= p_quantity THEN
      UPDATE products
      SET stock = stock - p_quantity
      WHERE id = p_product_id;
      v_resultado := TRUE;
    END IF;
  END IF;
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar stock (en caso de cancelación)
CREATE OR REPLACE FUNCTION restaurar_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_size VARCHAR DEFAULT NULL,
  p_color VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_size IS NOT NULL AND p_color IS NOT NULL THEN
    UPDATE product_variants
    SET stock = stock + p_quantity
    WHERE product_id = p_product_id 
      AND size = p_size 
      AND color = p_color;
  ELSE
    UPDATE products
    SET stock = stock + p_quantity
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

### FASE 7: OFERTAS FLASH (45 min)

#### Paso 7.1: Crear componente OfertasFlash
**Archivo:** `src/components/shop/OfertasFlash.tsx`

#### Paso 7.2: Añadir sección en home
Modificar `src/pages/index.astro` para incluir ofertas

#### Paso 7.3: Control desde admin
**Archivo:** `src/pages/admin/settings.astro`

---

### FASE 8: FICHA DE PRODUCTO DINÁMICA (1 hora)

#### Paso 8.1: Crear página dinámica
**Archivo:** `src/pages/shop/[slug].astro`

#### Paso 8.2: Crear galería de imágenes
**Archivo:** `src/components/shop/ProductGallery.tsx`

---

### FASE 9: DOCKER Y COOLIFY (30 min)

#### Paso 9.1: Crear Dockerfile
**Archivo:** `Dockerfile`

#### Paso 9.2: Crear docker-compose
**Archivo:** `docker-compose.yml`

#### Paso 9.3: Configuración Coolify
Instrucciones detalladas para despliegue

---

## 🔄 FLUJO COMPLETO DE LA APLICACIÓN

### Flujo del Cliente (Compra)
```
1. Cliente visita HOME
   ↓
2. Navega por CATÁLOGO (filtros por categoría)
   ↓
3. Selecciona PRODUCTO → Ficha detallada
   ↓
4. Elige talla/color → AÑADIR AL CARRITO
   ↓
5. Revisa CARRITO (CartSidebar)
   ↓
6. Procede al CHECKOUT
   ↓
7. Completa datos de envío
   ↓
8. PAGO con Stripe
   ↓
9. Webhook confirma pago
   ↓
10. STOCK se descuenta (atómico)
    ↓
11. PEDIDO creado en BD
    ↓
12. Cliente recibe confirmación
```

### Flujo del Administrador
```
1. Admin visita /admin/login
   ↓
2. Introduce credenciales (Supabase Auth)
   ↓
3. Accede al DASHBOARD
   ↓
4. Puede gestionar:
   ├─ PRODUCTOS (CRUD completo)
   ├─ CATEGORÍAS
   ├─ PEDIDOS (ver, actualizar estado)
   ├─ OFERTAS FLASH (activar/desactivar)
   └─ CONFIGURACIÓN (ajustes generales)
```

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

### Base de Datos
- [ ] Tabla `categories` con datos
- [ ] Tabla `products` con productos de prueba
- [ ] Tabla `configuracion` configurada
- [ ] Tabla `orders` funcional
- [ ] Tabla `stripe_payments` creada
- [ ] Políticas RLS activas
- [ ] Funciones de stock creadas
- [ ] Índices optimizados

### Autenticación
- [ ] Usuario admin creado en Supabase Auth
- [ ] Perfil admin en `user_profiles`
- [ ] Login funcional
- [ ] Rutas /admin protegidas
- [ ] Logout funcional

### Tienda Pública
- [ ] Home con hero section
- [ ] Catálogo con filtros
- [ ] Ficha de producto dinámica
- [ ] Carrito persistente
- [ ] Selector de talla/color
- [ ] Indicador de stock
- [ ] Ofertas Flash (cuando activas)

### Checkout y Pagos
- [ ] Formulario de checkout
- [ ] Integración Stripe
- [ ] Modo test funcionando
- [ ] Webhook recibe eventos
- [ ] Stock se descuenta
- [ ] Pedido se crea
- [ ] Página de éxito
- [ ] Página de cancelación

### Panel Admin
- [ ] Dashboard con estadísticas
- [ ] Listado de productos
- [ ] Crear producto
- [ ] Editar producto
- [ ] Eliminar producto
- [ ] Subir imágenes
- [ ] Gestión de pedidos
- [ ] Activar/desactivar ofertas
- [ ] Configuración general

### Despliegue
- [ ] Dockerfile creado
- [ ] docker-compose.yml configurado
- [ ] Variables de entorno documentadas
- [ ] Guía de Coolify

---

## 📁 ARCHIVOS A CREAR (Lista Completa)

### Base de Datos
```
database-schema-complete.sql  ← SQL actualizado con todo
```

### Autenticación
```
src/pages/admin/login.astro
src/components/admin/LoginForm.tsx
src/lib/auth.ts
src/middleware.ts
```

### CRUD Admin
```
src/pages/admin/products/index.astro
src/pages/admin/products/new.astro
src/pages/admin/products/[id].astro
src/pages/admin/categories/index.astro
src/pages/admin/orders/index.astro
src/pages/admin/settings.astro
src/components/admin/ProductForm.tsx
src/components/admin/ImageUpload.tsx
src/components/admin/ProductsTable.tsx
src/components/admin/OrdersTable.tsx
```

### Stripe
```
src/lib/stripe/client.ts
src/lib/stripe/server.ts
src/pages/api/checkout/create-session.ts
src/pages/api/webhooks/stripe.ts
```

### Checkout
```
src/pages/checkout/index.astro
src/pages/checkout/success.astro
src/pages/checkout/cancel.astro
src/components/shop/CheckoutForm.tsx
```

### Producto
```
src/pages/shop/[slug].astro
src/components/shop/ProductGallery.tsx
src/components/shop/OfertasFlash.tsx
src/components/shop/ProductFilters.tsx
```

### Despliegue
```
Dockerfile
docker-compose.yml
.dockerignore
coolify-guide.md
```

---

## ⏱️ ESTIMACIÓN DE TIEMPO TOTAL

| Fase | Tiempo Estimado |
|------|-----------------|
| Fase 1: BD Completa | 30 min |
| Fase 2: Auth Admin | 1 hora |
| Fase 3: CRUD Productos | 2 horas |
| Fase 4: Stripe | 2 horas |
| Fase 5: Checkout | 1.5 horas |
| Fase 6: Stock Atómico | 1 hora |
| Fase 7: Ofertas Flash | 45 min |
| Fase 8: Ficha Producto | 1 hora |
| Fase 9: Docker/Coolify | 30 min |
| **TOTAL** | **~10 horas** |

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

1. **Hoy:** Fase 1 (BD) + Fase 2 (Auth)
2. **Mañana:** Fase 3 (CRUD) + Fase 4 (Stripe)
3. **Día 3:** Fase 5 (Checkout) + Fase 6 (Stock)
4. **Día 4:** Fase 7 (Ofertas) + Fase 8 (Ficha)
5. **Día 5:** Fase 9 (Docker) + Testing final

---

**Versión:** 1.0
**Fecha:** 8 de enero de 2026
