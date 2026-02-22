-- ============================================================
-- POLÍTICAS RLS RESTRICTIVAS — Ejecutar en Supabase SQL Editor
-- ============================================================
-- Reemplaza las políticas USING(true) permisivas con políticas
-- reales que protegen los datos.
--
-- REGLA CLAVE: El service_role key SIEMPRE bypassa RLS.
-- Las operaciones admin (supabaseAdmin) no se ven afectadas.
-- Solo necesitamos políticas para el anon/authenticated key.
-- ============================================================

-- ============================================================
-- 1. ADMIN_USERS — Bloqueado totalmente para público
-- ============================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No se necesitan políticas → anon/authenticated no puede leer ni escribir
-- Todas las consultas a admin_users usan service_role

-- ============================================================
-- 2. PRODUCTS — Público lee SOLO productos activos
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Limpiar TODAS las políticas viejas permisivas
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be inserted" ON products;
DROP POLICY IF EXISTS "Products can be updated" ON products;
DROP POLICY IF EXISTS "Products can be deleted" ON products;
DROP POLICY IF EXISTS "Active products publicly readable" ON products;
DROP POLICY IF EXISTS "Admins see all products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "products_public_read" ON products;

-- Solo productos activos visibles para el público
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = true);
-- INSERT/UPDATE/DELETE: solo service_role (admin)

-- ============================================================
-- 3. CATEGORIES — Público lee SOLO categorías activas
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be inserted" ON categories;
DROP POLICY IF EXISTS "Categories can be updated" ON categories;
DROP POLICY IF EXISTS "Categories can be deleted" ON categories;
DROP POLICY IF EXISTS "Categories publicly readable" ON categories;
DROP POLICY IF EXISTS "Admins see all categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "categories_public_read" ON categories;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (is_active = true);

-- ============================================================
-- 4. PRODUCT_VARIANTS — Público lee variantes de productos activos
-- ============================================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Variants can be inserted" ON product_variants;
DROP POLICY IF EXISTS "Variants can be updated" ON product_variants;
DROP POLICY IF EXISTS "Variants can be deleted" ON product_variants;
DROP POLICY IF EXISTS "Variants publicly readable" ON product_variants;
DROP POLICY IF EXISTS "Admins can manage variants" ON product_variants;
DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;

CREATE POLICY "product_variants_public_read"
  ON product_variants FOR SELECT
  USING (
    product_id IN (SELECT id FROM products WHERE is_active = true)
  );

-- ============================================================
-- 5. ORDERS — Bloqueado para público (usa service_role)
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders viewable" ON orders;
DROP POLICY IF EXISTS "Orders insertable" ON orders;
DROP POLICY IF EXISTS "Orders updatable" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

-- Sin políticas públicas → todo via service_role

-- ============================================================
-- 6. ORDER_ITEMS — Bloqueado para público (usa service_role)
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order items viewable" ON order_items;
DROP POLICY IF EXISTS "Order items insertable" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- Sin políticas públicas → todo via service_role

-- ============================================================
-- 7. COUPONS — Público lee cupones activos no expirados
-- ============================================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active coupons publicly readable" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "coupons_public_read" ON coupons;

CREATE POLICY "coupons_public_read"
  ON coupons FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- ============================================================
-- 8. COUPON_USAGES / COUPON_USES — Bloqueado para público
-- ============================================================
DO $$ BEGIN
  EXECUTE 'ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- coupon_uses no existe, solo coupon_usages (ya habilitada arriba)

-- ============================================================
-- 9. CUSTOMERS — Bloqueado para público (usa service_role)
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers viewable" ON customers;
DROP POLICY IF EXISTS "Customers insertable" ON customers;
DROP POLICY IF EXISTS "Customers updatable" ON customers;

-- Sin políticas públicas → todo via service_role

-- ============================================================
-- 10. STOCK_CHANGE_LOG — Bloqueado para público
-- ============================================================
ALTER TABLE stock_change_log ENABLE ROW LEVEL SECURITY;

-- Solo service_role escribe logs de stock

-- ============================================================
-- 11. STATIC_PAGES — Público lee las publicadas
-- ============================================================
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "static_pages_public_read" ON static_pages;

CREATE POLICY "static_pages_public_read"
  ON static_pages FOR SELECT
  USING (is_active = true);

-- ============================================================
-- 12. PROBLEMATIC_PRICES / PROBLEMATIC_STOCKS — Son VISTAS, no tablas
-- Las vistas no soportan RLS. Ya están protegidas porque dependen
-- de tablas que sí tienen RLS (products, product_variants).
-- ============================================================

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Ejecuta esto para confirmar que RLS está activo:
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Y esto para ver las políticas creadas:
SELECT tablename, policyname, cmd, permissive, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
