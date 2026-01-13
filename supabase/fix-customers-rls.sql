-- ============================================
-- CORREGIR POLÍTICAS RLS PARA CUSTOMERS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Primero eliminar las políticas existentes
DROP POLICY IF EXISTS "Customers viewable" ON customers;
DROP POLICY IF EXISTS "Customers insertable" ON customers;
DROP POLICY IF EXISTS "Customers updatable" ON customers;
DROP POLICY IF EXISTS "Customers deletable" ON customers;
DROP POLICY IF EXISTS "Allow all customers select" ON customers;
DROP POLICY IF EXISTS "Allow all customers insert" ON customers;
DROP POLICY IF EXISTS "Allow all customers update" ON customers;
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
DROP POLICY IF EXISTS "Enable update for all users" ON customers;

-- Deshabilitar RLS temporalmente para probar (SOLO PARA DESARROLLO)
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- O crear políticas permisivas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Políticas muy permisivas para desarrollo
CREATE POLICY "customers_select_all" 
ON customers FOR SELECT 
TO public
USING (true);

CREATE POLICY "customers_insert_all" 
ON customers FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "customers_update_all" 
ON customers FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "customers_delete_all" 
ON customers FOR DELETE 
TO public
USING (true);

-- También dar permisos a anon y authenticated
GRANT ALL ON customers TO anon;
GRANT ALL ON customers TO authenticated;

-- Verificar políticas creadas
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'customers';
