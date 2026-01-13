-- ============================================
-- FASHIONSTORE - DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_flash_offer BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_flash ON products(is_flash_offer) WHERE is_flash_offer = true;

-- ============================================
-- PRODUCT VARIANTS TABLE (SIZE + COLOR)
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100),
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_stock ON product_variants(stock) WHERE stock < 5;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  shipping_address JSONB,
  billing_address JSONB,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  stripe_checkout_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  size VARCHAR(20),
  color VARCHAR(50),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- CUSTOMERS TABLE (optional, for registered users)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  default_shipping_address JSONB,
  default_billing_address JSONB,
  is_subscribed_newsletter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, variants
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Authenticated users can manage all (admin)
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access variants" ON product_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Camisas', 'camisas', 'Camisas elegantes para todas las ocasiones'),
  ('Pantalones', 'pantalones', 'Pantalones de alta calidad'),
  ('Chaquetas', 'chaquetas', 'Chaquetas y abrigos'),
  ('Accesorios', 'accesorios', 'Complementos y accesorios'),
  ('Básicos', 'basicos', 'Prendas esenciales')
ON CONFLICT (slug) DO NOTHING;

-- Sample Products
INSERT INTO products (name, slug, description, price, discount_percentage, image_url, category_id, is_featured, is_new) VALUES
  (
    'Camisa Oxford Clásica',
    'camisa-oxford-clasica',
    'Camisa Oxford de algodón 100% con cuello button-down. Corte regular, perfecta para el día a día.',
    59.90,
    0,
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    (SELECT id FROM categories WHERE slug = 'camisas'),
    true,
    true
  ),
  (
    'Pantalón Chino Slim',
    'pantalon-chino-slim',
    'Pantalón chino de corte slim en algodón stretch. Máxima comodidad y elegancia.',
    79.90,
    15,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    (SELECT id FROM categories WHERE slug = 'pantalones'),
    true,
    false
  ),
  (
    'Blazer Estructurado',
    'blazer-estructurado',
    'Blazer de lana con estructura perfecta. Ideal para ocasiones formales.',
    189.90,
    0,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    (SELECT id FROM categories WHERE slug = 'chaquetas'),
    true,
    true
  ),
  (
    'Camiseta Básica Premium',
    'camiseta-basica-premium',
    'Camiseta de algodón pima con acabado suave. Un básico imprescindible.',
    29.90,
    20,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    (SELECT id FROM categories WHERE slug = 'basicos'),
    false,
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- Sample Variants
INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'S', 'Blanco', '#FFFFFF', 10),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'M', 'Blanco', '#FFFFFF', 15),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'L', 'Blanco', '#FFFFFF', 12),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'XL', 'Blanco', '#FFFFFF', 8),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'M', 'Azul', '#1E3A5F', 10),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-clasica'), 'L', 'Azul', '#1E3A5F', 8),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'S', 'Negro', '#000000', 5),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'M', 'Negro', '#000000', 12),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'L', 'Negro', '#000000', 10),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'M', 'Beige', '#D4C4B0', 8),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'L', 'Beige', '#D4C4B0', 6),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'M', 'Negro', '#000000', 4),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'L', 'Negro', '#000000', 3),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'XL', 'Negro', '#000000', 2),
  ((SELECT id FROM products WHERE slug = 'camiseta-basica-premium'), 'S', 'Blanco', '#FFFFFF', 20),
  ((SELECT id FROM products WHERE slug = 'camiseta-basica-premium'), 'M', 'Blanco', '#FFFFFF', 25),
  ((SELECT id FROM products WHERE slug = 'camiseta-basica-premium'), 'L', 'Blanco', '#FFFFFF', 18),
  ((SELECT id FROM products WHERE slug = 'camiseta-basica-premium'), 'M', 'Negro', '#000000', 20),
  ((SELECT id FROM products WHERE slug = 'camiseta-basica-premium'), 'L', 'Negro', '#000000', 15)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS!
-- ============================================
