# 📚 GUÍA COMPLETA DE SUPABASE
## Toda la configuración, funciones, claves y integración para FashionStore

---

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║                    DOCUMENTACIÓN OFICIAL DE SUPABASE                       ║
# ║                    Para el proyecto: CRM-Tienda Ropa                      ║
# ║                                                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

---

# TABLA DE CONTENIDOS

1. [Introducción a Supabase](#introduccion)
2. [Configuración Inicial](#configuracion)
3. [Autenticación](#autenticacion)
4. [Database (PostgreSQL)](#database)
5. [Storage (Archivos)](#storage)
6. [Realtime](#realtime)
7. [Edge Functions](#edge-functions)
8. [Vector / Embeddings](#vector)
9. [Claves API y Variables](#claves)
10. [Troubleshooting](#troubleshooting)
11. [Links Útiles](#links)

---

# 1️⃣ INTRODUCCIÓN A SUPABASE
## ¿Qué es Supabase?

```
Supabase = Firebase Open Source Alternative + PostgreSQL + Realtime

┌────────────────────────────────────────────────────────────────────┐
│                         SUPABASE STACK                             │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      SUPABASE CLOUD                          │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │ PostgreSQL  │  │  Auth       │  │  Realtime   │          │ │
│  │  │  Database   │  │  (JWT)      │  │  (Websocket)│          │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │ Storage     │  │  Edge       │  │  Vector DB  │          │ │
│  │  │ (S3)        │  │  Functions  │  │  (pgvector) │          │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Construido sobre: PostgreSQL, PostgREST, GoTrue, Realtime       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

VENTAJAS:
✅ Base de datos PostgreSQL completa (no NoSQL)
✅ Autenticación integrada con JWT
✅ Realtime subscriptions via WebSocket
✅ Storage de archivos tipo S3
✅ Edge Functions (Deno runtime)
✅ Vector embeddings para IA
✅ Auto-generated REST API
✅ Row Level Security (RLS)
✅ Open source y auto-hosteable
```

---

# 2️⃣ CONFIGURACIÓN INICIAL
## Setup de Supabase para FashionStore

### Paso 1: Crear cuenta en Supabase

```
URL: https://supabase.com

1. Ir a https://app.supabase.com
2. Registrarse con GitHub / Google / Email
3. Crear organización: "FashionStore"
4. Crear proyecto: "fashionstore-prod"
   - Región: EU-CENTRAL-1 (Frankfurt) ✅
   - Plan: Pro ($25/mes) para producción
```

### Paso 2: Copiar credenciales iniciales

```javascript
// En Supabase Dashboard → Settings → API

SUPABASE_URL = "https://xyzabc.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// NUNCA exponer SERVICE_KEY en cliente - solo en servidor
```

### Paso 3: Instalar cliente Supabase

```bash
# Para Node.js/Express backend
npm install @supabase/supabase-js

# Para Flutter (Dart)
flutter pub add supabase flutter_appauth

# Para React (admin panel)
npm install @supabase/supabase-js
```

### Paso 4: Inicializar cliente

```javascript
// backend/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // En backend usamos SERVICE_KEY
);

module.exports = supabase;
```

```dart
// flutter/lib/config/supabase_config.dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> initSupabase() async {
  await Supabase.initialize(
    url: 'https://xyzabc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  );
}

final supabase = Supabase.instance.client;
```

---

# 3️⃣ AUTENTICACIÓN CON SUPABASE
## JWT, Users y Auth Flow

### 3.1 CONFIGURACIÓN DE AUTENTICACIÓN

```
Dashboard → Authentication → Providers

CONFIGURAR:
✅ Email/Password       - Habilitado
✅ Google OAuth         - Client ID + Secret
✅ GitHub OAuth         - Client ID + Secret
✅ Magic Links (email)  - Habilitado
✅ Phone (SMS)          - Twilio config
```

### 3.2 TABLA DE USUARIOS (automática)

```sql
-- Supabase crea automáticamente en auth.users
-- NO MODIFICAR MANUALMENTE

CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  phone text,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean DEFAULT false,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  email_confirmed_at timestamp,
  phone_confirmed_at timestamp,
  last_sign_in_at timestamp,
  ...
);

-- Datos personalizados en tabla pública
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name varchar(100),
  last_name varchar(100),
  avatar_url text,
  phone varchar(20),
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor', 'support')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### 3.3 FUNCIONES DE AUTENTICACIÓN

#### Registro

```javascript
// backend/src/controllers/auth.controller.js
// USAR SUPABASE AUTH O JWT PROPIO?
// Recomendación: Usar ambos en conjunto

// Opción 1: Supabase Auth completo
const registerWithSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'User',
        role: 'customer'
      }
    }
  });
  
  if (error) throw error;
  return data.user;
};

// Opción 2: Registro + crear perfil
const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) throw authError;
    
    // 2. Crear perfil en tabla public
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'customer'
      });
    
    if (profileError) throw profileError;
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, registerWithSupabase };
```

#### Login

```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Opción 1: Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // data contiene:
    // - user: usuario
    // - session: { access_token, refresh_token, etc }
    
    res.json({
      success: true,
      user: data.user,
      session: data.session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
    
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
```

#### Social OAuth

```javascript
// Google
const signInWithGoogle = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://app.fashionstore.com/auth/callback'
    }
  });
  
  if (error) throw error;
  res.json({ url: data.url });
};

// GitHub
const signInWithGithub = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'https://app.fashionstore.com/auth/callback'
    }
  });
  
  if (error) throw error;
  res.json({ url: data.url });
};
```

#### Refresh Token

```javascript
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
    
    if (error) throw error;
    
    res.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
```

#### Logout

```javascript
const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
  res.json({ success: true });
};
```

#### Reset Password

```javascript
// Enviar email
const resetPassword = async (req, res) => {
  const { email } = req.body;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://app.fashionstore.com/reset-password'
  });
  
  if (error) throw error;
  res.json({ success: true, message: 'Email enviado' });
};

// Actualizar contraseña (con token)
const updatePassword = async (req, res) => {
  const { password, token } = req.body;
  
  const { error } = await supabase.auth.updateUser({
    password
  }, { token });
  
  if (error) throw error;
  res.json({ success: true });
};
```

#### Verificar Token

```javascript
// Middleware
const verifySupabaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifySupabaseToken };
```

---

# 4️⃣ DATABASE - POSTGRESQL EN SUPABASE
## Tablas, Queries y RLS

### 4.1 CREAR TABLAS

```sql
-- ═══════════════════════════════════════════════════════════════
-- TABLAS PRINCIPALES PARA FASHIONSTORE
-- ═══════════════════════════════════════════════════════════════

-- 1. CATEGORÍAS
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. PRODUCTOS
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  sku varchar(100) UNIQUE NOT NULL,
  description text,
  short_description varchar(500),
  category_id uuid REFERENCES categories(id),
  brand varchar(100),
  price decimal(10, 2),
  compare_at_price decimal(10, 2),
  discount_percentage integer,
  rating_average decimal(3, 2),
  rating_count integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Índices para búsqueda
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- 3. VARIANTES DE PRODUCTO
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size varchar(20),
  color varchar(50),
  color_hex varchar(7),
  sku_variant varchar(100) UNIQUE,
  stock integer DEFAULT 0,
  stock_reserved integer DEFAULT 0,
  price_modifier decimal(10, 2) DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku_variant);

-- 4. IMÁGENES DE PRODUCTO
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  alt_text varchar(255),
  is_primary boolean DEFAULT false,
  display_order integer,
  created_at timestamp DEFAULT now()
);

-- 5. CARRITO
CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- 6. ITEMS DEL CARRITO
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL,
  price_at_time decimal(10, 2),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 7. CUPONES
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) UNIQUE NOT NULL,
  description text,
  discount_type varchar(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10, 2),
  max_uses integer,
  uses_count integer DEFAULT 0,
  min_purchase decimal(10, 2),
  valid_from timestamp,
  valid_until timestamp,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 8. PEDIDOS
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  order_number varchar(50) UNIQUE NOT NULL,
  status varchar(50) DEFAULT 'pending',
  payment_status varchar(50) DEFAULT 'pending',
  subtotal decimal(10, 2),
  discount_amount decimal(10, 2) DEFAULT 0,
  shipping_cost decimal(10, 2) DEFAULT 0,
  tax_amount decimal(10, 2),
  total_amount decimal(10, 2),
  coupon_id uuid REFERENCES coupons(id),
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- 9. ITEMS DEL PEDIDO
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer,
  price_per_unit decimal(10, 2),
  discount_per_unit decimal(10, 2) DEFAULT 0,
  line_total decimal(10, 2),
  product_snapshot jsonb,
  created_at timestamp DEFAULT now()
);

-- 10. DIRECCIONES
CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(20) CHECK (type IN ('shipping', 'billing')),
  recipient_name varchar(200),
  street_address varchar(255),
  apartment_number varchar(50),
  city varchar(100),
  state_province varchar(100),
  postal_code varchar(20),
  country varchar(100),
  phone varchar(20),
  is_primary boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 11. ENVÍOS
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  tracking_number varchar(100),
  carrier varchar(50),
  status varchar(50),
  shipped_at timestamp,
  delivered_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 12. TICKETS DE SOPORTE
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  order_id uuid REFERENCES orders(id),
  title varchar(255) NOT NULL,
  description text,
  category varchar(50),
  priority varchar(20) DEFAULT 'medium',
  status varchar(50) DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 13. RESPUESTAS DE SOPORTE
CREATE TABLE ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- 14. RESEÑAS/RATINGS
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  user_id uuid REFERENCES auth.users(id),
  order_item_id uuid REFERENCES order_items(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title varchar(255),
  comment text,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 15. WISHLIST / FAVORITOS
CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

### 4.2 ROW LEVEL SECURITY (RLS)

```sql
-- ═══════════════════════════════════════════════════════════════
-- POLÍTICAS DE SEGURIDAD
-- ═══════════════════════════════════════════════════════════════

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTOS: Todos pueden ver activos, solo admin puede ver todos
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can view all products"
ON products FOR SELECT
TO authenticated
USING (auth.jwt_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can create products"
ON products FOR INSERT
TO authenticated
WITH CHECK (auth.jwt_has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════════════════════════════════════
-- PEDIDOS: Solo ver propios pedidos o ser admin
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR auth.jwt_has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- PERFILES: Solo ver propio perfil o ser admin
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- DIRECCIONES: Solo acceder a propias direcciones
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- WISHLIST: Solo acceder a propia wishlist
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Users can manage own wishlist"
ON wishlist_items FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### 4.3 QUERIES CON JAVASCRIPT/TYPESCRIPT

#### SELECT (Leer datos)

```javascript
// backend/src/services/supabase.service.js

// ═══════════════════════════════════════════════════════════════
// SELECT - LEER DATOS
// ═══════════════════════════════════════════════════════════════

// Obtener un producto
const getProduct = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      variants:product_variants(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
};

// Listar productos con filtros y paginación
const listProducts = async (options = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    category = null,
    minPrice = null,
    maxPrice = null,
    search = null,
    sortBy = 'created_at'
  } = options;
  
  let query = supabase
    .from('products')
    .select('*, category:categories(name)', { count: 'exact' });
  
  // Filtros
  if (category) query = query.eq('category_id', category);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (search) query = query.ilike('name', `%${search}%`);
  
  // Paginación
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  
  // Ordenamiento
  const descending = sortBy.startsWith('-');
  const column = descending ? sortBy.slice(1) : sortBy;
  query = query.order(column, { ascending: !descending });
  
  const { data, count, error } = await query;
  
  if (error) throw error;
  
  return {
    products: data,
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page
  };
};

// Obtener todos los pedidos del usuario
const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(id, name, slug)
      ),
      shipment:shipments(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Búsqueda full-text (requiere GIN index)
const searchProducts = async (query) => {
  const { data, error } = await supabase
    .from('products')
    .select()
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
};

// Obtener con condiciones complejas
const getOrdersWithFilters = async (filters = {}) => {
  let query = supabase.from('orders').select('*');
  
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
  if (filters.minAmount) query = query.gte('total_amount', filters.minAmount);
  if (filters.maxAmount) query = query.lte('total_amount', filters.maxAmount);
  
  // Rango de fechas
  if (filters.dateFrom) {
    query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
  }
  if (filters.dateTo) {
    query = query.lte('created_at', new Date(filters.dateTo).toISOString());
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};
```

#### INSERT (Crear datos)

```javascript
// ═══════════════════════════════════════════════════════════════
// INSERT - CREAR DATOS
// ═══════════════════════════════════════════════════════════════

// Crear producto simple
const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      slug: productData.slug,
      sku: productData.sku,
      description: productData.description,
      price: productData.price,
      category_id: productData.categoryId,
      created_by: productData.userId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Crear producto con variantes
const createProductWithVariants = async (productData, variants) => {
  // 1. Crear producto
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      slug: productData.slug,
      sku: productData.sku,
      price: productData.price,
      category_id: productData.categoryId
    })
    .select()
    .single();
  
  if (productError) throw productError;
  
  // 2. Crear variantes
  const variantRecords = variants.map(v => ({
    product_id: product.id,
    size: v.size,
    color: v.color,
    color_hex: v.colorHex,
    stock: v.stock,
    price_modifier: v.priceModifier || 0
  }));
  
  const { error: variantsError } = await supabase
    .from('product_variants')
    .insert(variantRecords);
  
  if (variantsError) throw variantsError;
  
  return product;
};

// Crear pedido con múltiples items
const createOrder = async (userId, items, addressId) => {
  // 1. Calcular totales
  let subtotal = 0;
  let taxAmount = 0;
  
  for (const item of items) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select('price_modifier, product:products(price)')
      .eq('id', item.variantId)
      .single();
    
    const price = variant.product.price + (variant.price_modifier || 0);
    subtotal += price * item.quantity;
  }
  
  taxAmount = subtotal * 0.21; // 21% IVA España
  const totalAmount = subtotal + taxAmount;
  
  // 2. Crear pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: `ORD-${Date.now()}`,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single();
  
  if (orderError) throw orderError;
  
  // 3. Crear items del pedido
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) throw itemsError;
  
  return order;
};

// Insertar múltiples registros
const bulkInsertProducts = async (products) => {
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();
  
  if (error) throw error;
  return data;
};
```

#### UPDATE (Actualizar datos)

```javascript
// ═══════════════════════════════════════════════════════════════
// UPDATE - ACTUALIZAR DATOS
// ═══════════════════════════════════════════════════════════════

// Actualizar producto
const updateProduct = async (productId, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      description: updates.description,
      price: updates.price,
      updated_at: new Date()
    })
    .eq('id', productId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Actualizar stock de variante
const updateVariantStock = async (variantId, newStock) => {
  const { data, error } = await supabase
    .from('product_variants')
    .update({
      stock: newStock,
      updated_at: new Date()
    })
    .eq('id', variantId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Cambiar estado de pedido
const updateOrderStatus = async (orderId, newStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      updated_at: new Date()
    })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Actualización condicional (increment)
const incrementProductSales = async (productId) => {
  const { data, error } = await supabase.rpc('increment_sales', {
    product_id: productId
  });
  
  if (error) throw error;
  return data;
};

// Batch update
const updateMultipleOrders = async (orderIds, updates) => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .in('id', orderIds)
    .select();
  
  if (error) throw error;
  return data;
};
```

#### DELETE (Eliminar datos)

```javascript
// ═══════════════════════════════════════════════════════════════
// DELETE - ELIMINAR DATOS
// ═══════════════════════════════════════════════════════════════

// Eliminar producto (soft delete)
const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId);
  
  if (error) throw error;
};

// Eliminar pedido (solo en estado pending)
const deleteOrder = async (orderId) => {
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();
  
  if (fetchError) throw fetchError;
  if (order.status !== 'pending') {
    throw new Error('Solo se pueden eliminar pedidos pendientes');
  }
  
  // Eliminar items primero (por FK)
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);
  
  if (itemsError) throw itemsError;
  
  // Luego eliminar pedido
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  
  if (error) throw error;
};

// Eliminar de la wishlist
const removeFromWishlist = async (userId, productId) => {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  
  if (error) throw error;
};
```

---

# 5️⃣ STORAGE - ALMACENAMIENTO DE ARCHIVOS
## Subir/Descargar imágenes, documentos

### 5.1 CONFIGURACIÓN DE STORAGE

```
Dashboard → Storage → Buckets

CREAR BUCKETS:
1. images (público)
2. avatars (privado)
3. documents (privado)
```

### 5.2 FUNCIONES DE STORAGE

#### Subir archivo

```javascript
// backend/src/services/storage.service.js

// ═══════════════════════════════════════════════════════════════
// SUBIR ARCHIVOS
// ═══════════════════════════════════════════════════════════════

// Subir imagen de producto
const uploadProductImage = async (productId, file, fileName) => {
  const path = `products/${productId}/${Date.now()}-${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);
  
  return {
    path: data.path,
    url: publicUrl,
    fullPath: `https://xyzabc.supabase.co/storage/v1/object/public/images/${path}`
  };
};

// Subir avatar de usuario
const uploadAvatar = async (userId, file) => {
  const path = `avatars/${userId}`;
  
  // Eliminar avatar anterior si existe
  try {
    await supabase.storage
      .from('avatars')
      .remove([path]);
  } catch (e) {
    // Ignorar si no existe
  }
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);
  
  // Actualizar perfil del usuario
  await supabase
    .from('user_profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
  
  return publicUrl;
};

// Subir con progress tracking
const uploadFileWithProgress = async (bucket, path, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        resolve(publicUrl);
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Upload error')));
    
    // Hacer upload manual
    // O usar la librería recomendada
  });
};

// Subir múltiples archivos
const uploadMultipleImages = async (productId, files) => {
  const uploads = files.map(file => 
    uploadProductImage(productId, file, file.name)
  );
  
  const results = await Promise.all(uploads);
  return results;
};
```

#### Descargar/obtener URL

```javascript
// ═══════════════════════════════════════════════════════════════
// DESCARGAR Y OBTENER URLS
// ═══════════════════════════════════════════════════════════════

// Obtener URL pública
const getPublicUrl = (bucket, path) => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};

// Obtener URL privada (requiere token)
const getPrivateUrl = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60); // Válida 1 hora
  
  if (error) throw error;
  return data.signedUrl;
};

// Descargar archivo
const downloadFile = async (bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) throw error;
  return data;
};

// Generar URL temporal para documento privado
const generateTempDocumentLink = async (userId, docType) => {
  const path = `documents/${userId}/${docType}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 24 * 60 * 60); // 24 horas
  
  if (error) throw error;
  return data.signedUrl;
};
```

#### Eliminar archivo

```javascript
// ═══════════════════════════════════════════════════════════════
// ELIMINAR ARCHIVOS
// ═══════════════════════════════════════════════════════════════

// Eliminar una imagen
const deleteImage = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

// Eliminar todas las imágenes de un producto
const deleteProductImages = async (productId) => {
  // Listar archivos
  const { data: files, error: listError } = await supabase.storage
    .from('images')
    .list(`products/${productId}`);
  
  if (listError) throw listError;
  
  // Eliminar todos
  const paths = files.map(f => `products/${productId}/${f.name}`);
  
  const { error } = await supabase.storage
    .from('images')
    .remove(paths);
  
  if (error) throw error;
};

// Limpiar bucket antiguo
const clearBucket = async (bucket) => {
  const { data: files, error: listError } = await supabase.storage
    .from(bucket)
    .list('', { limit: 100 });
  
  if (listError) throw listError;
  
  if (files.length > 0) {
    const paths = files.map(f => f.name);
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
  }
};
```

---

# 6️⃣ REALTIME - ACTUALIZACIONES EN TIEMPO REAL
## WebSocket subscriptions

### 6.1 SUBSCRIBE A CAMBIOS

```javascript
// backend/src/services/realtime.service.js

// ═══════════════════════════════════════════════════════════════
// REALTIME - ESCUCHAR CAMBIOS
// ═══════════════════════════════════════════════════════════════

// Escuchar cambios en productos
const subscribeToProducts = (onInsert, onUpdate, onDelete) => {
  const subscription = supabase
    .on(
      'postgres_changes',
      {
        event: '*', // 'INSERT' | 'UPDATE' | 'DELETE'
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') onInsert(payload.new);
        if (payload.eventType === 'UPDATE') onUpdate(payload.new, payload.old);
        if (payload.eventType === 'DELETE') onDelete(payload.old);
      }
    )
    .subscribe();
  
  return subscription;
};

// Escuchar cambios en pedidos específicos del usuario
const subscribeToUserOrders = (userId) => {
  return supabase
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Order updated:', payload);
      }
    )
    .subscribe();
};

// Escuchar cambios en carrito
const subscribeToCart = (userId) => {
  return supabase
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=cs.(SELECT id FROM carts WHERE user_id=eq.${userId})`
      },
      (payload) => {
        console.log('Cart changed:', payload);
      }
    )
    .subscribe();
};

// Ejemplo completo con manejo de errores
const setupRealtimeListener = () => {
  const ordersSubscription = supabase
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        // Aquí procesar actualización
        handleOrderUpdate(payload.new);
      }
    )
    .on('*', (payload) => {
      // Logs para debugging
      console.log('Realtime event:', payload);
    })
    .subscribe();
  
  return () => {
    supabase.removeAllChannels();
  };
};

const handleOrderUpdate = (order) => {
  // Emitir evento a clientes WebSocket
  // broadcast(`order:${order.id}`, { type: 'updated', data: order });
};
```

### 6.2 FLUTTER REALTIME

```dart
// flutter/lib/services/realtime_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';

class RealtimeService {
  final supabase = Supabase.instance.client;
  
  // Escuchar cambios en stock de producto
  Future<RealtimeChannel> subscribeToProductStock(String productId) async {
    final channel = supabase.channel(
      'product_stock:$productId',
      opts: const RealtimeChannelConfig(
        key: 'product_stock',
        self: true,
      ),
    );
    
    channel.on(
      RealtimeListenTypes.postgresChanges,
      event: 'UPDATE',
      schema: 'public',
      table: 'product_variants',
      filter: 'product_id=eq.$productId',
      callback: (payload) {
        print('Stock updated: ${payload['new']}');
        // Actualizar UI
      },
    ).subscribe();
    
    return channel;
  }
  
  // Escuchar estado del pedido
  Future<RealtimeChannel> subscribeToOrder(String orderId) async {
    final channel = supabase.channel(
      'order_status:$orderId',
    );
    
    channel.on(
      RealtimeListenTypes.postgresChanges,
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: 'id=eq.$orderId',
      callback: (payload) {
        print('Order changed: ${payload['new']}');
      },
    ).subscribe();
    
    return channel;
  }
  
  // Unsubscribe
  Future<void> unsubscribe(RealtimeChannel channel) async {
    await channel.unsubscribe();
  }
}
```

---

# 7️⃣ EDGE FUNCTIONS
## Funciones serverless en Deno

### 7.1 CREAR EDGE FUNCTION

```bash
# Crear nueva function
supabase functions new send-order-email

# Estructura generada:
# supabase/functions/send-order-email/index.ts
```

### 7.2 EJEMPLO: Enviar email de pedido

```typescript
// supabase/functions/send-order-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    // Crear cliente Supabase con service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Obtener datos del pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        user:auth.users(email),
        items:order_items(*)
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    // Enviar email con Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "noreply@fashionstore.com",
        to: order.user.email,
        subject: `Pedido confirmado #${order.order_number}`,
        html: `
          <h2>¡Pedido confirmado!</h2>
          <p>Número de pedido: <strong>${order.order_number}</strong></p>
          <p>Total: €${order.total_amount}</p>
          <p>Estado: ${order.status}</p>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado",
        data: emailData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### 7.3 DEPLOY Y LLAMAR

```bash
# Deploy local
supabase functions deploy send-order-email

# Deploy remoto
supabase functions deploy --project-ref xyzabc send-order-email
```

```javascript
// Llamar edge function desde backend
const invokeEdgeFunction = async (orderId) => {
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: { orderId }
  });
  
  if (error) throw error;
  return data;
};
```

---

# 8️⃣ VECTOR/EMBEDDINGS
## Para búsqueda por IA y similitud

### 8.1 CONFIGURAR PGVECTOR

```sql
-- Habilitar extensión
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla con embeddings
CREATE TABLE product_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  content text,
  embedding vector(1536),  -- OpenAI ada: 1536 dimensiones
  created_at timestamp DEFAULT now()
);

CREATE INDEX ON product_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 8.2 GENERAR EMBEDDINGS CON OPENAI

```javascript
// backend/src/services/embedding.service.js

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Generar embedding de texto
const generateEmbedding = async (text) => {
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });

  return response.data.data[0].embedding;
};

// Indexar producto con embedding
const indexProductEmbedding = async (productId) => {
  // Obtener producto
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("id", productId)
    .single();

  // Generar embedding del contenido
  const text = `${product.name} ${product.description}`;
  const embedding = await generateEmbedding(text);

  // Guardar en Supabase
  const { error } = await supabase
    .from("product_embeddings")
    .upsert({
      product_id: productId,
      content: text,
      embedding,
    });

  if (error) throw error;
};

// Buscar productos similares
const searchSimilarProducts = async (query, limit = 5) => {
  // Generar embedding de query
  const queryEmbedding = await generateEmbedding(query);

  // Buscar en Supabase
  const { data, error } = await supabase.rpc(
    "search_products_by_embedding",
    {
      query_embedding: queryEmbedding,
      similarity_threshold: 0.1,
      match_count: limit,
    }
  );

  if (error) throw error;
  return data;
};

// RPC para búsqueda (crear en Supabase)
const createSearchFunction = `
CREATE OR REPLACE FUNCTION search_products_by_embedding(
  query_embedding vector,
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    product_embeddings.id,
    product_embeddings.product_id,
    1 - (product_embeddings.embedding <=> query_embedding) as similarity
  FROM product_embeddings
  WHERE 1 - (product_embeddings.embedding <=> query_embedding) > similarity_threshold
  ORDER BY product_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
`;
```

---

# 9️⃣ CLAVES API Y VARIABLES DE ENTORNO
## Todas las credenciales necesarias

### 9.1 OBTENER LAS CLAVES

```
Dashboard Supabase → Settings → API
```

### 9.2 ARCHIVO .env

```bash
# ═══════════════════════════════════════════════════════════════
# SUPABASE BACKEND
# ═══════════════════════════════════════════════════════════════

SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc0NzcyNDAwLCJleHAiOjE5OTA0NDI0MDB9.xYzAbC...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NzQ3NzI0MDAsImV4cCI6MTk5MDQ0MjQwMH0.aBcDeF...
SUPABASE_JWT_SECRET=your-jwt-secret-key-for-signing-tokens

# ═══════════════════════════════════════════════════════════════
# SUPABASE FLUTTER
# ═══════════════════════════════════════════════════════════════

SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ═══════════════════════════════════════════════════════════════
# SUPABASE ADMIN
# ═══════════════════════════════════════════════════════════════

SUPABASE_ADMIN_URL=https://xyzabc.supabase.co
SUPABASE_ADMIN_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 9.3 VARIBLES DENTRO DE SUPABASE

```
Dashboard → Settings → Environment Variables

Añadir variables:
- RESEND_API_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- TWILIO_AUTH_TOKEN
```

---

# 🔟 TROUBLESHOOTING
## Problemas comunes y soluciones

### ❌ "Success. No rows returned"

```javascript
// PROBLEMA: Ejecutas una query SELECT pero no devuelve datos

// ❌ INCORRECTO:
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('slug', 'vestido-negro');

if (error) console.error(error);
console.log(data); // null o []

// ✅ CORRECTO: Verificar antes
const { data, error, status } = await supabase
  .from('products')
  .select('*')
  .eq('slug', 'vestido-negro');

console.log('Status:', status); // Debería ser 200
console.log('Data:', data);     // Array de resultados
console.log('Error:', error);   // null si no hay error

// Soluciones comunes:

// 1. Revisar RLS - ¿Hay políticas que bloqueen?
// En Dashboard → Authentication → Policies
// Asegúrate de que el usuario autenticado tiene permiso

// 2. Los datos existen pero están desactivados
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('slug', 'vestido-negro')
  .eq('is_active', true); // ← Agregar filtro

// 3. Typo en nombre de columna
// Verificar que 'slug' existe (no 'product_slug', etc)

// 4. Usar .single() sin garantizar que existe registro
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single(); // Lanza error si hay 0 o 2+ resultados

// Mejor:
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId);

if (data && data.length === 1) {
  // Usar data[0]
}

// 5. RLS está habilitado pero no hay política de lectura
// En PostgreSQL:
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (is_active = true);
```

### ❌ "JWT expired"

```javascript
// PROBLEMA: El token JWT expiró

// Solución: Implementar refresh automático
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: userSession.refresh_token
});

if (data.session) {
  // Guardar nuevo token
  localStorage.setItem('access_token', data.session.access_token);
  localStorage.setItem('refresh_token', data.session.refresh_token);
}
```

### ❌ "Column does not exist"

```sql
-- PROBLEMA: Typo en nombre de columna

-- ❌ INCORRECTO
SELECT product_name FROM products;  -- ← No existe

-- ✅ CORRECTO
SELECT name FROM products;

-- Ver columnas:
\d products  -- En psql
-- O en Supabase Dashboard → SQL Editor
```

### ❌ "Violates foreign key constraint"

```javascript
// PROBLEMA: Intentas insertar con FK inválida

// ❌ INCORRECTO
const { error } = await supabase
  .from('order_items')
  .insert({
    order_id: 'non-existent-id',  // ← No existe en orders
    product_id: productId,
    quantity: 1
  });

// ✅ CORRECTO: Verificar que existen
const { data: order } = await supabase
  .from('orders')
  .select('id')
  .eq('id', orderId)
  .single();

if (order) {
  await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      product_id: productId,
      quantity: 1
    });
}
```

### ❌ "Permission denied"

```javascript
// PROBLEMA: No tienes permisos (RLS)

// ✅ SOLUCIONES:
// 1. Crear política correcta
CREATE POLICY "Users can create orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

// 2. Usar token correcto
const { data } = await supabase.auth.getUser(accessToken);

// 3. En Edge Functions, usar service role
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY  // ← Más permisos
);
```

### ❌ "Storage object not found"

```javascript
// PROBLEMA: Intentas acceder a archivo que no existe

// ✅ SOLUCIÓN: Verificar existencia
const { data: files } = await supabase.storage
  .from('images')
  .list('products/xyz');

if (files?.length > 0) {
  // Existe, proceder
} else {
  // No existe
}
```

### ❌ Conexión lenta / timeout

```javascript
// PROBLEMA: Conexión lenta a Supabase

// ✅ OPTIMIZACIONES:
// 1. Usar índices en DB
CREATE INDEX idx_products_active ON products(is_active);

// 2. Limitar columnas SELECT
const { data } = await supabase
  .from('products')
  .select('id, name, price')  // ← No traer todo
  .limit(20);

// 3. Usar paginación
const { data } = await supabase
  .from('products')
  .select('*')
  .range(0, 19);  // Primeros 20

// 4. Cachear resultados
const cached = new Map();
const getProduct = async (id) => {
  if (cached.has(id)) return cached.get(id);
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  cached.set(id, data);
  return data;
};
```

---

# 🔗 LINKS ÚTILES
## Documentación oficial y recursos

## Documentación Oficial

```
📚 DOCS PRINCIPALES:
  → https://supabase.com/docs
  
🔐 AUTENTICACIÓN:
  → https://supabase.com/docs/guides/auth
  → https://supabase.com/docs/guides/auth/social-login
  
🗄️ DATABASE:
  → https://supabase.com/docs/guides/database
  → https://supabase.com/docs/guides/database/queries
  → https://supabase.com/docs/guides/database/full-text-search
  
💾 STORAGE:
  → https://supabase.com/docs/guides/storage
  
⚡ REALTIME:
  → https://supabase.com/docs/guides/realtime
  
🔧 EDGE FUNCTIONS:
  → https://supabase.com/docs/guides/functions
  
🤖 VECTOR/EMBEDDINGS:
  → https://supabase.com/docs/guides/ai
  → https://supabase.com/docs/guides/vector
  
🛡️ SECURITY:
  → https://supabase.com/docs/guides/auth/row-level-security
  
📱 FLUTTER:
  → https://supabase.com/docs/reference/dart
  → https://pub.dev/packages/supabase_flutter
  
🟦 JAVASCRIPT:
  → https://supabase.com/docs/reference/javascript
  → https://www.npmjs.com/package/@supabase/supabase-js
```

## Tutoriales y Ejemplos

```
📖 TUTORIALES:
  → https://supabase.com/docs/guides/getting-started
  → https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts
  → https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-row-level-security
  
💡 EJEMPLOS:
  → https://github.com/supabase/supabase/tree/master/examples
  → https://github.com/supabase/awesome-supabase
  
🎓 CURSOS:
  → https://www.youtube.com/channel/UCqw4wKBmPuHp4XgaX4kCL6A (Supabase YouTube)
```

## Community

```
💬 COMUNIDAD:
  → Discord: https://discord.supabase.com
  → GitHub Discussions: https://github.com/supabase/supabase/discussions
  → Twitter: @supabase
  
🐛 BUGS/ISSUES:
  → https://github.com/supabase/supabase/issues
```

## Herramientas Relacionadas

```
🔧 TOOLS:
  → Supabase CLI: https://supabase.com/docs/guides/cli
  → Migration Tool: https://supabase.com/docs/guides/migrations
  → Dashboard: https://app.supabase.com
  
📊 EXTENSIONES PostgreSQL:
  → uuid-ossp (UUIDs)
  → pgvector (Vectors/AI)
  → pg_trgm (Full-text search)
  → pgcrypto (Encryption)
```

---

# 📝 RESUMEN RÁPIDO - CHEATSHEET

```javascript
// ═══════════════════════════════════════════════════════════════
// COMANDOS MÁS USADOS
// ═══════════════════════════════════════════════════════════════

// INICIALIZAR
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)

// AUTENTICACIÓN
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
await supabase.auth.refreshSession({ refresh_token })

// SELECT
await supabase.from('table').select('*')
await supabase.from('table').select('*').eq('id', value)
await supabase.from('table').select('*').limit(10)
await supabase.from('table').select('*').range(0, 9)

// INSERT
await supabase.from('table').insert({ ...data })

// UPDATE
await supabase.from('table').update({ ...data }).eq('id', id)

// DELETE
await supabase.from('table').delete().eq('id', id)

// STORAGE
await supabase.storage.from('bucket').upload(path, file)
await supabase.storage.from('bucket').download(path)
await supabase.storage.from('bucket').remove([path])
supabase.storage.from('bucket').getPublicUrl(path)

// REALTIME
supabase.on('postgres_changes', { table: 'products' }, callback).subscribe()

// RPC (Funciones PostgreSQL)
await supabase.rpc('function_name', { param1, param2 })
```

---

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║                       FIN DE LA GUÍA DE SUPABASE                           ║
# ║                                                                            ║
# ║    Este documento cubre:                                                  ║
# ║    ✅ Configuración inicial                                               ║
# ║    ✅ Autenticación JWT completa                                          ║
# ║    ✅ Database PostgreSQL avanzado                                        ║
# ║    ✅ Storage de archivos                                                 ║
# ║    ✅ Realtime con WebSocket                                              ║
# ║    ✅ Edge Functions (Deno)                                               ║
# ║    ✅ Vector/Embeddings con IA                                            ║
# ║    ✅ Todas las claves y variables                                        ║
# ║    ✅ Troubleshooting y soluciones                                        ║
# ║    ✅ Links de documentación oficial                                      ║
# ║                                                                            ║
# ║    Para más información: https://supabase.com/docs                        ║
# ║                                                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
