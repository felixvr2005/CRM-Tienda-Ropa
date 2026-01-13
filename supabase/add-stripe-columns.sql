-- ============================================
-- AÑADIR COLUMNAS DE STRIPE A PRODUCTOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Añadir columnas para IDs de Stripe en la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON products(stripe_price_id);

-- Comentarios para documentación
COMMENT ON COLUMN products.stripe_product_id IS 'ID del producto en Stripe';
COMMENT ON COLUMN products.stripe_price_id IS 'ID del precio en Stripe';

-- Verificar que se añadieron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stripe_product_id', 'stripe_price_id');
