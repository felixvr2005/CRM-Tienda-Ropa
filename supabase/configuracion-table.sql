-- =====================================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  tipo VARCHAR(50) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json', 'integer')),
  descripcion TEXT,
  categoria VARCHAR(50), -- general, ofertas, envios, pago, etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_clave ON configuracion(clave);
CREATE INDEX IF NOT EXISTS idx_config_categoria ON configuracion(categoria);

-- Insertar configuraciones por defecto
INSERT INTO configuracion (clave, valor, tipo, descripcion, categoria, is_public)
VALUES
  ('ofertas_activas', 'false', 'boolean', 'Activa/desactiva ofertas flash', 'ofertas', true),
  ('flash_sales_discount', '20', 'number', 'Descuento de ofertas flash (%)', 'ofertas', true),
  ('min_order_amount', '0', 'number', 'Monto mínimo del pedido (€)', 'general', false),
  ('free_shipping_threshold', '100', 'number', 'Envío gratis a partir de (€)', 'envios', true),
  ('site_name', 'FashionStore', 'string', 'Nombre del sitio', 'general', true),
  ('site_description', 'Tu tienda de moda online', 'string', 'Descripción del sitio', 'general', true),
  ('contact_email', 'hola@fashionstore.com', 'string', 'Email de contacto', 'general', true),
  ('contact_phone', '+34 900 123 456', 'string', 'Teléfono de contacto', 'general', true)
ON CONFLICT (clave) DO NOTHING;

COMMENT ON TABLE configuracion IS 'Almacena configuraciones del sistema (ofertas, envío, etc.)';
