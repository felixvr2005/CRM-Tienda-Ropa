-- ============================================
-- FASHIONSTORE - COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL
-- Con autenticación separada Admin/Cliente
-- y carrito persistente para usuarios
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING (para reiniciar limpio)
-- ============================================
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS generate_order_number CASCADE;

-- ============================================
-- ADMIN USERS TABLE (Separado de clientes)
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL, -- Referencia a auth.users de Supabase
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_auth ON admin_users(auth_user_id);

-- ============================================
-- CUSTOMERS TABLE (Clientes de la tienda)
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- Referencia a auth.users de Supabase (NULL si es invitado)
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  birth_date DATE,
  avatar_url TEXT,
  addresses JSONB DEFAULT '[]'::jsonb, -- Array de direcciones
  default_shipping_address JSONB,
  default_billing_address JSONB,
  newsletter_subscribed BOOLEAN DEFAULT false,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth ON customers(auth_user_id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2), -- Precio tachado
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  cost_price DECIMAL(10,2), -- Precio de costo (solo admin)
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(100),
  material VARCHAR(255),
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_flash_offer BOOLEAN DEFAULT false,
  flash_offer_ends TIMESTAMPTZ,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_new ON products(is_new) WHERE is_new = true;
CREATE INDEX idx_products_flash ON products(is_flash_offer) WHERE is_flash_offer = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- ============================================
-- PRODUCT VARIANTS TABLE (SIZE + COLOR + STOCK)
-- ============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7),
  color_image TEXT, -- Imagen específica de este color
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  reserved_stock INTEGER DEFAULT 0 CHECK (reserved_stock >= 0),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  weight DECIMAL(10,2), -- En gramos
  price_modifier DECIMAL(10,2) DEFAULT 0, -- +/- al precio base
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock);
CREATE INDEX idx_variants_low_stock ON product_variants(stock) WHERE stock < 5 AND stock > 0;
CREATE INDEX idx_variants_out_of_stock ON product_variants(stock) WHERE stock = 0;

-- ============================================
-- CART ITEMS TABLE (Carrito persistente para usuarios logueados)
-- ============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- Para invitados
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, variant_id),
  UNIQUE(session_id, variant_id)
);

CREATE INDEX idx_cart_customer ON cart_items(customer_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_cart_variant ON cart_items(variant_id);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_wishlist_customer ON wishlists(customer_id);

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2), -- Máximo descuento para porcentajes
  max_uses INTEGER,
  max_uses_per_customer INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  applicable_categories UUID[], -- NULL = todas las categorías
  applicable_products UUID[], -- NULL = todos los productos
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  
  -- Direcciones
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  same_billing_address BOOLEAN DEFAULT true,
  
  -- Montos
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Cupón aplicado
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code VARCHAR(50),
  
  -- Estados
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  
  -- Pago
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  
  -- Envío
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  estimated_delivery DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe ON orders(stripe_checkout_session_id);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot del producto al momento de la compra
  product_name VARCHAR(255) NOT NULL,
  product_slug VARCHAR(255),
  product_image TEXT,
  product_sku VARCHAR(100),
  size VARCHAR(20),
  color VARCHAR(50),
  
  -- Cantidades y precios
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'FS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actualizar estadísticas de producto después de un review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actualizar estadísticas de cliente después de un pedido
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status != 'paid') THEN
    UPDATE customers 
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar si usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_user_id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Merge cart de invitado a usuario registrado
CREATE OR REPLACE FUNCTION merge_guest_cart(p_session_id VARCHAR, p_customer_id UUID)
RETURNS void AS $$
BEGIN
  -- Actualizar items del carrito de invitado al customer
  INSERT INTO cart_items (customer_id, product_id, variant_id, quantity)
  SELECT p_customer_id, product_id, variant_id, quantity
  FROM cart_items
  WHERE session_id = p_session_id
  ON CONFLICT (customer_id, variant_id) 
  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;
  
  -- Eliminar items de la sesión de invitado
  DELETE FROM cart_items WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order number trigger
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
  FOR EACH ROW WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Review rating trigger
CREATE TRIGGER update_product_rating_trigger AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Customer stats trigger
CREATE TRIGGER update_customer_stats_trigger AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - ADMIN USERS
-- ============================================
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin_users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE auth_user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================
-- RLS POLICIES - CUSTOMERS
-- ============================================
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage all customers"
  ON customers FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow customer creation"
  ON customers FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - CATEGORIES (Public read, Admin write)
-- ============================================
CREATE POLICY "Public read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - PRODUCTS (Public read, Admin write)
-- ============================================
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - VARIANTS (Public read, Admin write)
-- ============================================
CREATE POLICY "Public read active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - CART ITEMS
-- ============================================
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR session_id IS NOT NULL -- Invitados
  );

CREATE POLICY "Admins can view all carts"
  ON cart_items FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - WISHLISTS
-- ============================================
CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- RLS POLICIES - COUPONS
-- ============================================
CREATE POLICY "Public read active coupons"
  ON coupons FOR SELECT
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - ORDERS
-- ============================================
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR customer_email = (SELECT email FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Allow order creation"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - ORDER ITEMS
-- ============================================
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Allow order item creation"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - REVIEWS
-- ============================================
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- SAMPLE DATA - CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
  ('Mujer', 'mujer', 'Colección completa para mujer', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80', 1),
  ('Hombre', 'hombre', 'Colección completa para hombre', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 2),
  ('Accesorios', 'accesorios', 'Complementos y accesorios', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 3),
  ('Nueva Colección', 'nueva-coleccion', 'Lo último en tendencias', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80', 4),
  ('Sale', 'sale', 'Ofertas especiales', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80', 5)
ON CONFLICT (slug) DO NOTHING;

-- Subcategorías
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Vestidos', 'vestidos', 'Vestidos para toda ocasión', (SELECT id FROM categories WHERE slug = 'mujer'), 1),
  ('Blusas', 'blusas', 'Blusas y tops', (SELECT id FROM categories WHERE slug = 'mujer'), 2),
  ('Pantalones Mujer', 'pantalones-mujer', 'Pantalones para mujer', (SELECT id FROM categories WHERE slug = 'mujer'), 3),
  ('Camisas', 'camisas', 'Camisas elegantes', (SELECT id FROM categories WHERE slug = 'hombre'), 1),
  ('Pantalones Hombre', 'pantalones-hombre', 'Pantalones para hombre', (SELECT id FROM categories WHERE slug = 'hombre'), 2),
  ('Chaquetas', 'chaquetas', 'Chaquetas y abrigos', (SELECT id FROM categories WHERE slug = 'hombre'), 3),
  ('Bolsos', 'bolsos', 'Bolsos y carteras', (SELECT id FROM categories WHERE slug = 'accesorios'), 1),
  ('Cinturones', 'cinturones', 'Cinturones de piel', (SELECT id FROM categories WHERE slug = 'accesorios'), 2)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE DATA - PRODUCTS
-- ============================================
INSERT INTO products (name, slug, description, price, compare_at_price, discount_percentage, image_url, images, category_id, brand, material, is_featured, is_new, tags) VALUES
  (
    'Vestido Midi Satinado',
    'vestido-midi-satinado',
    'Elegante vestido midi en tela satinada con corte fluido. Perfecto para ocasiones especiales. Cierre invisible en la espalda.',
    89.90,
    NULL,
    0,
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'vestidos'),
    'FashionStore',
    '100% Poliéster satinado',
    true,
    true,
    ARRAY['elegante', 'fiesta', 'satinado']
  ),
  (
    'Blusa Oversize Lino',
    'blusa-oversize-lino',
    'Blusa oversized en lino natural. Corte relajado y cómodo. Perfecta para el día a día con un toque sofisticado.',
    59.90,
    79.90,
    25,
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'blusas'),
    'FashionStore',
    '100% Lino',
    true,
    false,
    ARRAY['casual', 'lino', 'verano']
  ),
  (
    'Pantalón Wide Leg',
    'pantalon-wide-leg',
    'Pantalón de pierna ancha en tejido fluido. Cintura alta con pinzas. Silueta estilizada y elegante.',
    79.90,
    NULL,
    0,
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'pantalones-mujer'),
    'FashionStore',
    '65% Poliéster, 35% Viscosa',
    false,
    true,
    ARRAY['elegante', 'oficina', 'wide-leg']
  ),
  (
    'Camisa Oxford Premium',
    'camisa-oxford-premium',
    'Camisa Oxford de algodón premium con cuello button-down. Corte regular fit. Un básico imprescindible.',
    69.90,
    NULL,
    0,
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'camisas'),
    'FashionStore',
    '100% Algodón Oxford',
    true,
    false,
    ARRAY['clasico', 'oficina', 'oxford']
  ),
  (
    'Pantalón Chino Slim',
    'pantalon-chino-slim',
    'Pantalón chino de corte slim en algodón stretch. Máxima comodidad sin perder elegancia.',
    79.90,
    99.90,
    20,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'pantalones-hombre'),
    'FashionStore',
    '98% Algodón, 2% Elastano',
    true,
    false,
    ARRAY['casual', 'chino', 'slim']
  ),
  (
    'Blazer Estructurado',
    'blazer-estructurado',
    'Blazer de lana con estructura perfecta. Solapas de muesca. Ideal para ocasiones formales.',
    189.90,
    NULL,
    0,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'chaquetas'),
    'FashionStore',
    '70% Lana, 30% Poliéster',
    true,
    true,
    ARRAY['formal', 'blazer', 'lana']
  ),
  (
    'Bolso Tote Piel',
    'bolso-tote-piel',
    'Bolso tote en piel genuina. Amplio y versátil. Compartimento interior con cremallera.',
    149.90,
    179.90,
    15,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'bolsos'),
    'FashionStore',
    '100% Piel Vacuno',
    false,
    false,
    ARRAY['piel', 'tote', 'trabajo']
  ),
  (
    'Cinturón Piel Premium',
    'cinturon-piel-premium',
    'Cinturón de piel con hebilla metálica. Acabado artesanal. Ajuste perfecto.',
    49.90,
    NULL,
    0,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    (SELECT id FROM categories WHERE slug = 'cinturones'),
    'FashionStore',
    '100% Piel',
    false,
    false,
    ARRAY['piel', 'clasico', 'accesorio']
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE DATA - VARIANTS
-- ============================================
INSERT INTO product_variants (product_id, size, color, color_hex, stock, sku) VALUES
  -- Vestido Midi Satinado
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'XS', 'Negro', '#000000', 5, 'VMS-XS-NEG'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'S', 'Negro', '#000000', 10, 'VMS-S-NEG'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'M', 'Negro', '#000000', 15, 'VMS-M-NEG'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'L', 'Negro', '#000000', 8, 'VMS-L-NEG'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'S', 'Burdeos', '#800020', 8, 'VMS-S-BUR'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'M', 'Burdeos', '#800020', 10, 'VMS-M-BUR'),
  ((SELECT id FROM products WHERE slug = 'vestido-midi-satinado'), 'L', 'Burdeos', '#800020', 6, 'VMS-L-BUR'),
  
  -- Blusa Oversize Lino
  ((SELECT id FROM products WHERE slug = 'blusa-oversize-lino'), 'S', 'Blanco', '#FFFFFF', 12, 'BOL-S-BLA'),
  ((SELECT id FROM products WHERE slug = 'blusa-oversize-lino'), 'M', 'Blanco', '#FFFFFF', 18, 'BOL-M-BLA'),
  ((SELECT id FROM products WHERE slug = 'blusa-oversize-lino'), 'L', 'Blanco', '#FFFFFF', 10, 'BOL-L-BLA'),
  ((SELECT id FROM products WHERE slug = 'blusa-oversize-lino'), 'M', 'Beige', '#F5F5DC', 8, 'BOL-M-BEI'),
  ((SELECT id FROM products WHERE slug = 'blusa-oversize-lino'), 'L', 'Beige', '#F5F5DC', 6, 'BOL-L-BEI'),
  
  -- Pantalón Wide Leg
  ((SELECT id FROM products WHERE slug = 'pantalon-wide-leg'), 'XS', 'Negro', '#000000', 7, 'PWL-XS-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-wide-leg'), 'S', 'Negro', '#000000', 12, 'PWL-S-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-wide-leg'), 'M', 'Negro', '#000000', 15, 'PWL-M-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-wide-leg'), 'L', 'Negro', '#000000', 9, 'PWL-L-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-wide-leg'), 'M', 'Crema', '#FFFDD0', 8, 'PWL-M-CRE'),
  
  -- Camisa Oxford Premium
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'S', 'Blanco', '#FFFFFF', 15, 'COP-S-BLA'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'M', 'Blanco', '#FFFFFF', 20, 'COP-M-BLA'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'L', 'Blanco', '#FFFFFF', 18, 'COP-L-BLA'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'XL', 'Blanco', '#FFFFFF', 10, 'COP-XL-BLA'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'M', 'Celeste', '#B0E0E6', 12, 'COP-M-CEL'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'L', 'Celeste', '#B0E0E6', 10, 'COP-L-CEL'),
  ((SELECT id FROM products WHERE slug = 'camisa-oxford-premium'), 'M', 'Rosa', '#FFB6C1', 8, 'COP-M-ROS'),
  
  -- Pantalón Chino Slim
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'S', 'Negro', '#000000', 10, 'PCS-S-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'M', 'Negro', '#000000', 15, 'PCS-M-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'L', 'Negro', '#000000', 12, 'PCS-L-NEG'),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'M', 'Beige', '#D4C4B0', 10, 'PCS-M-BEI'),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'L', 'Beige', '#D4C4B0', 8, 'PCS-L-BEI'),
  ((SELECT id FROM products WHERE slug = 'pantalon-chino-slim'), 'M', 'Azul Marino', '#1E3A5F', 8, 'PCS-M-AZM'),
  
  -- Blazer Estructurado
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'M', 'Negro', '#000000', 6, 'BES-M-NEG'),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'L', 'Negro', '#000000', 5, 'BES-L-NEG'),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'XL', 'Negro', '#000000', 3, 'BES-XL-NEG'),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'M', 'Azul Marino', '#1E3A5F', 4, 'BES-M-AZM'),
  ((SELECT id FROM products WHERE slug = 'blazer-estructurado'), 'L', 'Azul Marino', '#1E3A5F', 3, 'BES-L-AZM'),
  
  -- Bolso Tote Piel
  ((SELECT id FROM products WHERE slug = 'bolso-tote-piel'), 'UNICA', 'Negro', '#000000', 10, 'BTP-U-NEG'),
  ((SELECT id FROM products WHERE slug = 'bolso-tote-piel'), 'UNICA', 'Camel', '#C19A6B', 8, 'BTP-U-CAM'),
  ((SELECT id FROM products WHERE slug = 'bolso-tote-piel'), 'UNICA', 'Burdeos', '#800020', 5, 'BTP-U-BUR'),
  
  -- Cinturón Piel Premium
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '85', 'Negro', '#000000', 15, 'CPP-85-NEG'),
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '90', 'Negro', '#000000', 20, 'CPP-90-NEG'),
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '95', 'Negro', '#000000', 18, 'CPP-95-NEG'),
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '100', 'Negro', '#000000', 12, 'CPP-100-NEG'),
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '90', 'Marrón', '#8B4513', 15, 'CPP-90-MAR'),
  ((SELECT id FROM products WHERE slug = 'cinturon-piel-premium'), '95', 'Marrón', '#8B4513', 12, 'CPP-95-MAR')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE DATA - COUPONS
-- ============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_uses, expires_at) VALUES
  ('BIENVENIDO10', '10% de descuento en tu primera compra', 'percentage', 10, 50, 1000, NOW() + INTERVAL '1 year'),
  ('VERANO25', '25% de descuento en toda la tienda', 'percentage', 25, 100, 500, NOW() + INTERVAL '3 months'),
  ('ENVIOGRATIS', 'Envío gratis en compras superiores a 75€', 'fixed', 5.99, 75, NULL, NOW() + INTERVAL '6 months')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- GRANT PUBLIC ACCESS FOR ANON KEY
-- ============================================
-- Esto permite que el anon key pueda leer datos públicos
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_variants TO anon;
GRANT SELECT ON coupons TO anon;
GRANT SELECT ON reviews TO anon;

-- Para carrito de invitados
GRANT INSERT, UPDATE, DELETE ON cart_items TO anon;
GRANT SELECT ON cart_items TO anon;

-- Para crear pedidos
GRANT INSERT ON orders TO anon;
GRANT INSERT ON order_items TO anon;
GRANT INSERT ON customers TO anon;

-- ============================================
-- SUCCESS! Database ready
-- ============================================
SELECT 'Database schema created successfully!' as status;
