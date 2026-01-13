-- ============================================
-- CORREGIR POLÍTICAS RLS PARA PRODUCTOS Y VARIANTES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- =====================
-- TABLA: products
-- =====================
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be inserted" ON products;
DROP POLICY IF EXISTS "Products can be updated" ON products;
DROP POLICY IF EXISTS "Products can be deleted" ON products;

CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

CREATE POLICY "Products can be inserted" 
ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Products can be updated" 
ON products FOR UPDATE USING (true);

CREATE POLICY "Products can be deleted" 
ON products FOR DELETE USING (true);

-- =====================
-- TABLA: product_variants
-- =====================
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Variants can be inserted" ON product_variants;
DROP POLICY IF EXISTS "Variants can be updated" ON product_variants;
DROP POLICY IF EXISTS "Variants can be deleted" ON product_variants;

CREATE POLICY "Variants are viewable by everyone" 
ON product_variants FOR SELECT USING (true);

CREATE POLICY "Variants can be inserted" 
ON product_variants FOR INSERT WITH CHECK (true);

CREATE POLICY "Variants can be updated" 
ON product_variants FOR UPDATE USING (true);

CREATE POLICY "Variants can be deleted" 
ON product_variants FOR DELETE USING (true);

-- =====================
-- TABLA: categories  
-- =====================
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be inserted" ON categories;
DROP POLICY IF EXISTS "Categories can be updated" ON categories;
DROP POLICY IF EXISTS "Categories can be deleted" ON categories;

CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

CREATE POLICY "Categories can be inserted" 
ON categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Categories can be updated" 
ON categories FOR UPDATE USING (true);

CREATE POLICY "Categories can be deleted" 
ON categories FOR DELETE USING (true);

-- =====================
-- TABLA: orders
-- =====================
DROP POLICY IF EXISTS "Orders viewable" ON orders;
DROP POLICY IF EXISTS "Orders insertable" ON orders;
DROP POLICY IF EXISTS "Orders updatable" ON orders;

CREATE POLICY "Orders viewable" 
ON orders FOR SELECT USING (true);

CREATE POLICY "Orders insertable" 
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders updatable" 
ON orders FOR UPDATE USING (true);

-- =====================
-- TABLA: order_items
-- =====================
DROP POLICY IF EXISTS "Order items viewable" ON order_items;
DROP POLICY IF EXISTS "Order items insertable" ON order_items;

CREATE POLICY "Order items viewable" 
ON order_items FOR SELECT USING (true);

CREATE POLICY "Order items insertable" 
ON order_items FOR INSERT WITH CHECK (true);

-- =====================
-- TABLA: customers
-- =====================
DROP POLICY IF EXISTS "Customers viewable" ON customers;
DROP POLICY IF EXISTS "Customers insertable" ON customers;
DROP POLICY IF EXISTS "Customers updatable" ON customers;

CREATE POLICY "Customers viewable" 
ON customers FOR SELECT USING (true);

CREATE POLICY "Customers insertable" 
ON customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers updatable" 
ON customers FOR UPDATE USING (true);

-- Verificar políticas creadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
