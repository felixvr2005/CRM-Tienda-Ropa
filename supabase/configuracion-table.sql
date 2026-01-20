-- =====================================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category VARCHAR(50), -- general, ofertas, envios, pago, etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_key ON configuracion(key);
CREATE INDEX idx_config_category ON configuracion(category);

-- Insertar configuraciones por defecto
INSERT INTO configuracion (key, value, type, description, category, is_public)
VALUES
  ('flash_sales_enabled', 'false', 'boolean', 'Activa/desactiva ofertas flash', 'ofertas', true),
  ('flash_sales_discount', '20', 'number', 'Descuento de ofertas flash (%)', 'ofertas', true),
  ('min_order_amount', '0', 'number', 'Monto mínimo del pedido (€)', 'general', false),
  ('free_shipping_threshold', '100', 'number', 'Envío gratis a partir de (€)', 'envios', true),
  ('site_name', 'FashionStore', 'string', 'Nombre del sitio', 'general', true),
  ('site_description', 'Tu tienda de moda online', 'string', 'Descripción del sitio', 'general', true),
  ('contact_email', 'hola@fashionstore.com', 'string', 'Email de contacto', 'general', true),
  ('contact_phone', '+34 900 123 456', 'string', 'Teléfono de contacto', 'general', true)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE configuracion IS 'Almacena configuraciones del sistema (ofertas, envío, etc.)';
