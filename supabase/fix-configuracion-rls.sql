-- =====================================================
-- FIX POLÍTICAS RLS PARA TABLA CONFIGURACION
-- Ejecutar en Supabase SQL Editor si la configuración no se guarda
-- =====================================================

-- 1. Asegurarse de que la tabla existe
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json', 'integer')),
  descripcion TEXT,
  categoria VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "configuracion_read_public" ON configuracion;
DROP POLICY IF EXISTS "configuracion_read_all" ON configuracion;
DROP POLICY IF EXISTS "configuracion_write_admin" ON configuracion;
DROP POLICY IF EXISTS "Allow service role full access to configuracion" ON configuracion;

-- 4. Crear políticas correctas

-- Lectura pública para configuraciones marcadas como públicas
CREATE POLICY "configuracion_read_public" ON configuracion
  FOR SELECT
  USING (is_public = true);

-- El service_role (supabaseAdmin) tiene acceso completo
CREATE POLICY "Allow service role full access to configuracion" ON configuracion
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Insertar configuraciones por defecto si no existen
INSERT INTO configuracion (clave, valor, tipo, descripcion, categoria, is_public)
VALUES
  ('ofertas_activas', 'false', 'boolean', 'Activa/desactiva ofertas flash', 'ofertas', true),
  ('flash_sales_discount', '20', 'number', 'Descuento de ofertas flash (%)', 'ofertas', true),
  ('free_shipping_threshold', '100', 'number', 'Envío gratis a partir de (€)', 'shipping', true),
  ('standard_shipping_cost', '4.95', 'number', 'Coste envío estándar (€)', 'shipping', true),
  ('express_shipping_cost', '9.95', 'number', 'Coste envío express (€)', 'shipping', true),
  ('site_name', 'FashionStore', 'string', 'Nombre del sitio', 'general', true),
  ('site_description', 'Tu tienda de moda online', 'string', 'Descripción del sitio', 'general', true),
  ('contact_email', 'hola@fashionstore.com', 'string', 'Email de contacto', 'general', true),
  ('contact_phone', '+34 900 123 456', 'string', 'Teléfono de contacto', 'general', true)
ON CONFLICT (clave) DO NOTHING;

-- 6. Verificar que las políticas están activas
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'configuracion';
