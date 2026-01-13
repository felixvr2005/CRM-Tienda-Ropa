-- ============================================
-- FASHION MARKET - DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Crear tablas

-- 1. TABLA: categories
-- Almacena las categorías de productos (Camisas, Pantalones, Trajes, etc.)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: products
-- Almacena los productos con su información de precio, stock e imágenes
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL, -- Almacenado en céntimos (ej: 15990 = €159.90)
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}', -- Array de URLs de imágenes almacenadas en Storage
  image_alt TEXT[] DEFAULT '{}', -- Array de textos alt para accesibilidad
  sizes VARCHAR(10)[] DEFAULT '{}', -- Tallas disponibles (XS, S, M, L, XL, XXL)
  colors VARCHAR(50)[] DEFAULT '{}', -- Colores disponibles
  material VARCHAR(100),
  care_instructions TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: product_variants
-- Almacena variantes de productos (talla x color)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: users (para administradores)
-- Nota: Supabase Auth gestiona auth_users automáticamente
-- Esta tabla conecta la auth_user con datos de perfil
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer', -- 'admin', 'editor', 'viewer'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: orders (para futuro - estructura base)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  total_amount INTEGER NOT NULL, -- En céntimos
  currency VARCHAR(3) DEFAULT 'EUR',
  items JSONB NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: cart_items (sesiones de carrito)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL, -- ID anónimo de sesión
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  size VARCHAR(10),
  color VARCHAR(50),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_cart_items_session ON cart_items(session_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACCESO
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ======== CATEGORIES ========
-- Lectura pública: todos pueden leer categorías
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

-- Escritura solo para admin
CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- ======== PRODUCTS ========
-- Lectura pública: todos pueden leer productos activos
CREATE POLICY "Public products are readable"
  ON products FOR SELECT
  USING (is_active = true);

-- Admin puede ver todos los productos (incluso inactivos)
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Escritura solo para admin
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- ======== PRODUCT VARIANTS ========
-- Lectura pública
CREATE POLICY "Product variants are publicly readable"
  ON product_variants FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM products WHERE is_active = true
    )
  );

-- Escritura solo para admin
CREATE POLICY "Only admins can manage variants"
  ON product_variants FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update variants"
  ON product_variants FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- ======== USER PROFILES ========
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Solo admins pueden crear perfiles
CREATE POLICY "Only admins can create user profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- ======== ORDERS ========
-- Los usuarios pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Solo admin puede ver todas las órdenes
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- ======== CART ITEMS ========
-- Los usuarios pueden manejar su carrito por session_id
CREATE POLICY "Cart items are accessible by session"
  ON cart_items FOR SELECT
  USING (true);

CREATE POLICY "Cart items can be inserted"
  ON cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Cart items can be updated"
  ON cart_items FOR UPDATE
  USING (true);

CREATE POLICY "Cart items can be deleted"
  ON cart_items FOR DELETE
  USING (true);

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar categorías
INSERT INTO categories (name, slug, description) VALUES
  ('Camisas', 'camisas', 'Camisas de alta calidad y diseño exclusivo'),
  ('Pantalones', 'pantalones', 'Pantalones premium para todo ocasión'),
  ('Trajes', 'trajes', 'Trajes elegantes y sofisticados'),
  ('Accesorios', 'accesorios', 'Complementos de moda para el hombre moderno')
ON CONFLICT DO NOTHING;
