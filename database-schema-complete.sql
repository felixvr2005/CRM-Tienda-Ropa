-- ============================================
-- FASHIONSTORE - ESQUEMA COMPLETO DE BASE DE DATOS
-- Supabase PostgreSQL
-- Versión: 2.0 - Completo
-- ============================================

-- ============================================
-- ELIMINAR TABLAS EXISTENTES (si es necesario)
-- ============================================
-- DROP TABLE IF EXISTS stripe_payments CASCADE;
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS product_variants CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS configuracion CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- 1. TABLA: configuracion
-- Almacena configuración global del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
  descripcion TEXT,
  categoria VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion, categoria) VALUES
  ('ofertas_activas', 'false', 'boolean', 'Activa/desactiva la sección de ofertas flash en la home', 'ofertas'),
  ('ofertas_titulo', 'Ofertas Flash ⚡', 'string', 'Título de la sección de ofertas', 'ofertas'),
  ('ofertas_subtitulo', 'Descuentos por tiempo limitado', 'string', 'Subtítulo de ofertas', 'ofertas'),
  ('nombre_tienda', 'FashionStore', 'string', 'Nombre de la tienda', 'general'),
  ('descripcion_tienda', 'Tu tienda de moda online', 'string', 'Descripción SEO', 'general'),
  ('moneda', 'EUR', 'string', 'Moneda principal', 'general'),
  ('simbolo_moneda', '€', 'string', 'Símbolo de moneda', 'general'),
  ('envio_gratis_desde', '15000', 'integer', 'Envío gratis desde X céntimos (15000 = €150)', 'envio'),
  ('coste_envio_estandar', '499', 'integer', 'Coste envío estándar en céntimos', 'envio'),
  ('iva_porcentaje', '21', 'integer', 'Porcentaje de IVA', 'impuestos'),
  ('stripe_mode', 'test', 'string', 'Modo de Stripe: test o live', 'pagos'),
  ('max_productos_carrito', '10', 'integer', 'Máximo de productos por carrito', 'carrito'),
  ('dias_devolucion', '30', 'integer', 'Días para devolución', 'politicas'),
  ('email_contacto', 'contacto@fashionstore.com', 'string', 'Email de contacto', 'contacto'),
  ('telefono_contacto', '+34 900 000 000', 'string', 'Teléfono de contacto', 'contacto'),
  ('direccion_tienda', 'Calle Ejemplo 123, Madrid, España', 'string', 'Dirección física', 'contacto'),
  ('redes_sociales', '{"instagram": "", "facebook": "", "twitter": ""}', 'json', 'URLs redes sociales', 'contacto')
ON CONFLICT (clave) DO NOTHING;

-- ============================================
-- 2. TABLA: categories
-- Categorías de productos
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías iniciales
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Camisas', 'camisas', 'Camisas de alta calidad para toda ocasión', 1),
  ('Pantalones', 'pantalones', 'Pantalones elegantes y cómodos', 2),
  ('Trajes', 'trajes', 'Trajes completos de diseñador', 3),
  ('Chaquetas', 'chaquetas', 'Chaquetas y blazers premium', 4),
  ('Accesorios', 'accesorios', 'Complementos de moda masculina', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. TABLA: products
-- Productos de la tienda
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL, -- En céntimos (15990 = €159.90)
  precio_oferta INTEGER, -- Precio con descuento (en céntimos)
  es_oferta BOOLEAN DEFAULT FALSE,
  oferta_desde TIMESTAMP WITH TIME ZONE,
  oferta_hasta TIMESTAMP WITH TIME ZONE,
  porcentaje_descuento INTEGER, -- Calculado automáticamente
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5, -- Alerta cuando stock < este valor
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}', -- Array de URLs
  image_alt TEXT[] DEFAULT '{}',
  sizes VARCHAR(10)[] DEFAULT '{}', -- XS, S, M, L, XL, XXL
  colors VARCHAR(50)[] DEFAULT '{}',
  material VARCHAR(100),
  care_instructions TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  barcode VARCHAR(50),
  weight_grams INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABLA: product_variants
-- Variantes de producto (talla x color)
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  price_adjustment INTEGER DEFAULT 0, -- Ajuste de precio respecto al base
  image_url TEXT, -- Imagen específica de esta variante
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- ============================================
-- 5. TABLA: user_profiles
-- Perfiles de usuarios (conecta con auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'customer', -- 'admin', 'editor', 'customer'
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TABLA: addresses
-- Direcciones de envío de usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Casa", "Trabajo", etc.
  full_name VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  street_address_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'España',
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. TABLA: orders
-- Pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE, -- ORD-2026-00001
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending',
  -- Estados: pending, payment_pending, paid, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending',
  -- Estados: pending, completed, failed, refunded
  subtotal INTEGER NOT NULL, -- En céntimos
  shipping_cost INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Datos del cliente
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  
  -- Dirección de envío
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  
  -- Envío
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Otros
  notes TEXT,
  admin_notes TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Secuencia para números de orden
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger para auto-generar número de orden
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- ============================================
-- 8. TABLA: order_items
-- Items de cada pedido
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL, -- Guardar nombre en caso de borrado
  product_sku VARCHAR(50),
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  size VARCHAR(10),
  color VARCHAR(50),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- Precio unitario en céntimos
  total_price INTEGER NOT NULL, -- quantity * unit_price
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. TABLA: cart_items
-- Items del carrito (sesiones anónimas o usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255), -- Para usuarios anónimos
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Para usuarios logueados
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  size VARCHAR(10),
  color VARCHAR(50),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  CONSTRAINT cart_items_session_or_user CHECK (session_id IS NOT NULL OR user_id IS NOT NULL)
);

-- ============================================
-- 10. TABLA: stripe_payments
-- Registro de pagos de Stripe
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) DEFAULT 'pending',
  -- Estados: pending, processing, succeeded, failed, cancelled, refunded
  payment_method VARCHAR(50), -- card, sepa_debit, etc.
  card_brand VARCHAR(20), -- visa, mastercard, etc.
  card_last4 VARCHAR(4),
  receipt_url TEXT,
  failure_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. TABLA: coupons
-- Cupones de descuento
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value INTEGER NOT NULL, -- Porcentaje o céntimos
  min_purchase_amount INTEGER DEFAULT 0, -- Compra mínima
  max_discount_amount INTEGER, -- Descuento máximo (para porcentaje)
  max_uses INTEGER, -- Usos totales permitidos
  uses_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. TABLA: coupon_uses
-- Registro de uso de cupones
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  discount_applied INTEGER NOT NULL, -- Descuento aplicado en céntimos
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_es_oferta ON products(es_oferta);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_order ON stripe_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_intent ON stripe_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================
-- FUNCIONES DE UTILIDAD
-- ============================================

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
  -- Si hay variante específica (talla + color)
  IF p_size IS NOT NULL AND p_color IS NOT NULL THEN
    -- Bloquear fila para actualización (evita race conditions)
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

-- Función para restaurar stock (cancelaciones/devoluciones)
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

-- Función para calcular porcentaje de descuento
CREATE OR REPLACE FUNCTION calcular_descuento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.precio_oferta IS NOT NULL AND NEW.price > 0 THEN
    NEW.porcentaje_descuento := ROUND(((NEW.price - NEW.precio_oferta)::DECIMAL / NEW.price) * 100);
  ELSE
    NEW.porcentaje_descuento := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular descuento automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_descuento ON products;
CREATE TRIGGER trigger_calcular_descuento
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION calcular_descuento();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_products_updated ON products;
CREATE TRIGGER trigger_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated ON orders;
CREATE TRIGGER trigger_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_configuracion_updated ON configuracion;
CREATE TRIGGER trigger_configuracion_updated
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- ======== CONFIGURACION ========
CREATE POLICY "Config publicly readable" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify config" ON configuracion
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== CATEGORIES ========
CREATE POLICY "Categories publicly readable" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins see all categories" ON categories
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== PRODUCTS ========
CREATE POLICY "Active products publicly readable" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins see all products" ON products
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'editor'))
  );

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'editor'))
  );

-- ======== PRODUCT VARIANTS ========
CREATE POLICY "Variants publicly readable" ON product_variants
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE is_active = true)
  );

CREATE POLICY "Admins can manage variants" ON product_variants
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'editor'))
  );

-- ======== USER PROFILES ========
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== ADDRESSES ========
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- ======== ORDERS ========
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== ORDER ITEMS ========
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== CART ITEMS ========
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (
    user_id = auth.uid() OR session_id IS NOT NULL
  );

-- ======== STRIPE PAYMENTS ========
CREATE POLICY "Users can view own payments" ON stripe_payments
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage payments" ON stripe_payments
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== COUPONS ========
CREATE POLICY "Active coupons publicly readable" ON coupons
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'admin')
  );

-- ======== COUPON USES ========
CREATE POLICY "Users can view own coupon uses" ON coupon_uses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert coupon uses" ON coupon_uses
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Productos de ejemplo
INSERT INTO products (name, slug, description, price, stock, category_id, images, sizes, colors, is_active, is_featured)
SELECT 
  'Camisa Premium Azul',
  'camisa-premium-azul',
  'Camisa de algodón 100% orgánico con diseño minimalista. Perfecta para ocasiones formales e informales.',
  15990,
  25,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['Azul', 'Blanco', 'Negro'],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'camisa-premium-azul');

INSERT INTO products (name, slug, description, price, precio_oferta, es_oferta, stock, category_id, images, sizes, colors, is_active, is_featured)
SELECT 
  'Pantalón Chino Elegante',
  'pantalon-chino-elegante',
  'Pantalón chino de corte slim fit. Tejido premium con elastano para mayor comodidad.',
  8990,
  6990,
  true,
  30,
  (SELECT id FROM categories WHERE slug = 'pantalones'),
  ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Negro', 'Beige', 'Gris'],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pantalon-chino-elegante');

INSERT INTO products (name, slug, description, price, stock, category_id, images, sizes, colors, is_active, is_new)
SELECT 
  'Traje Ejecutivo Gris',
  'traje-ejecutivo-gris',
  'Traje de dos piezas confeccionado en lana italiana. Ideal para reuniones de negocios.',
  45990,
  10,
  (SELECT id FROM categories WHERE slug = 'trajes'),
  ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Gris Oscuro', 'Azul Marino'],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'traje-ejecutivo-gris');

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
