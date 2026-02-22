-- ============================================================
-- REVERTIR RLS — Ejecutar en Supabase SQL Editor
-- Esto deshabilita RLS en las tablas que eran UNRESTRICTED
-- y elimina las políticas nuevas que se crearon.
-- Deja todo EXACTAMENTE como estaba antes.
-- ============================================================

-- Desactivar RLS en todas las tablas que eran UNRESTRICTED
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_change_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Verificar que todo está UNRESTRICTED de nuevo:
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
