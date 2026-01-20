-- ====================================
-- SQL PARA SETUP DE TIPOS DE PRODUCTO
-- ====================================
-- Ejecuta estos scripts en Supabase SQL Editor
-- en orden para configurar el sistema de tipos de producto

-- ====================================
-- 1. Crear tabla product_types
-- ====================================
CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  size_type VARCHAR(50) NOT NULL DEFAULT 'standard', -- 'standard' | 'shoe' | 'unique'
  available_sizes TEXT[] DEFAULT ARRAY[]::TEXT[], -- Ej: '{S,M,L,XL}' para ropa, '{35,36,37,...,46}' para zapatos
  icon_name VARCHAR(50), -- 'shirt' | 'pants' | 'shoes' | 'jacket' | etc
  color_applicable BOOLEAN DEFAULT TRUE, -- Si tiene sentido asignar colores
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_product_types_slug ON product_types(slug);
CREATE INDEX idx_product_types_size_type ON product_types(size_type);

-- RLS
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_read_product_types" ON product_types
  FOR SELECT
  USING (true);

CREATE POLICY "admin_can_manage_product_types" ON product_types
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- ====================================
-- 2. Crear tabla variant_images
-- ====================================
CREATE TABLE IF NOT EXISTS variant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE, -- Imagen principal de la variante
  sort_order INT DEFAULT 0, -- Para ordenar imágenes en galería
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_variant_images_variant_id ON variant_images(variant_id);
CREATE INDEX idx_variant_images_is_primary ON variant_images(is_primary);
CREATE INDEX idx_variant_images_sort_order ON variant_images(sort_order);

-- RLS
ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_read_variant_images" ON variant_images
  FOR SELECT
  USING (true);

CREATE POLICY "admin_can_manage_variant_images" ON variant_images
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- ====================================
-- 3. Agregar columna product_type_id a products
-- ====================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type_id UUID REFERENCES product_types(id);

-- Índice
CREATE INDEX IF NOT EXISTS idx_products_product_type_id ON products(product_type_id);

-- ====================================
-- 4. Función: Obtener tallas por tipo de producto
-- ====================================
CREATE OR REPLACE FUNCTION get_sizes_by_product_type(p_product_type_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_sizes TEXT[];
BEGIN
  SELECT available_sizes INTO v_sizes
  FROM product_types
  WHERE id = p_product_type_id;
  
  RETURN COALESCE(v_sizes, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql STABLE;

-- ====================================
-- 5. Función: Obtener imágenes de variante
-- ====================================
CREATE OR REPLACE FUNCTION get_variant_images(p_variant_id UUID)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  alt_text TEXT,
  is_primary BOOLEAN,
  sort_order INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vi.id,
    vi.image_url,
    vi.alt_text,
    vi.is_primary,
    vi.sort_order
  FROM variant_images vi
  WHERE vi.variant_id = p_variant_id
  ORDER BY vi.sort_order ASC, vi.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ====================================
-- 6. Función: Marcar imagen como principal
-- ====================================
CREATE OR REPLACE FUNCTION set_primary_variant_image(p_image_id UUID)
RETURNS JSON AS $$
DECLARE
  v_variant_id UUID;
  v_result JSON;
BEGIN
  -- Obtener variant_id
  SELECT variant_id INTO v_variant_id FROM variant_images WHERE id = p_image_id;
  
  IF v_variant_id IS NULL THEN
    RAISE EXCEPTION 'Imagen no encontrada';
  END IF;

  -- Desmarcar todas las imágenes de esta variante
  UPDATE variant_images SET is_primary = FALSE WHERE variant_id = v_variant_id;
  
  -- Marcar esta como principal
  UPDATE variant_images SET is_primary = TRUE WHERE id = p_image_id;

  SELECT json_build_object(
    'success', true,
    'message', 'Imagen marcada como principal'
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. INSERT - Tipos de producto predefinidos
-- ====================================
INSERT INTO product_types (name, slug, description, size_type, available_sizes, icon_name, color_applicable)
VALUES
  ('Camiseta', 'camiseta', 'Camisetas y tops', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'shirt', true),
  ('Pantalón', 'pantalon', 'Pantalones y jeans', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'pants', true),
  ('Zapato', 'zapato', 'Calzado y zapatillas', 'shoe', ARRAY['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'], 'shoes', false),
  ('Chaqueta', 'chaqueta', 'Chaquetas y abrigos', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'jacket', true),
  ('Falda', 'falda', 'Faldas y shorts', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'skirt', true),
  ('Bolso', 'bolso', 'Bolsos y mochilas', 'unique', ARRAY['Único'], 'bag', true),
  ('Accesorios', 'accesorios', 'Accesorios varios', 'unique', ARRAY['Único'], 'star', false),
  ('Vestido', 'vestido', 'Vestidos', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'dress', true),
  ('Gorro', 'gorro', 'Sombreros y gorros', 'unique', ARRAY['Único'], 'hat', true)
ON CONFLICT (name) DO NOTHING;

-- ====================================
-- 8. VERIFICACIÓN - Consultas de prueba
-- ====================================

-- Ver todos los tipos de producto
SELECT id, name, size_type, available_sizes FROM product_types ORDER BY name;

-- Ver imágenes de una variante
-- SELECT * FROM variant_images WHERE variant_id = '[VARIANT_ID]' ORDER BY sort_order;

-- Ver productos con su tipo
-- SELECT p.name, pt.name as tipo_producto, pt.available_sizes
-- FROM products p
-- LEFT JOIN product_types pt ON p.product_type_id = pt.id
-- WHERE p.is_active = true;

-- ====================================
-- NOTAS IMPORTANTES
-- ====================================
/*
1. EJECUTAR EN ORDEN:
   - Primero el CREATE TABLE product_types
   - Luego el CREATE TABLE variant_images
   - Luego ALTER TABLE products
   - Luego las funciones
   - Finalmente los INSERTs

2. COLORES DE VARIANTES:
   - Las variantes siguen usando 'color' como antes
   - Ahora la 'talla' viene del product_type_id
   - Ejemplo: Camiseta Roja - S (color='Rojo', size='S' del tipo Camiseta)

3. PARA ZAPATOS:
   - No llevan color_applicable = FALSE
   - Pero pueden tener colores si lo decides (Negro, Blanco, Café, etc)
   - Las tallas vienen del tipo: 35,36,37...46

4. TABLAS AFECTADAS:
   - products: nueva columna product_type_id
   - product_variants: sin cambios en estructura, ahora size viene del tipo
   - variant_images: tabla nueva para múltiples imágenes

5. API ENDPOINTS:
   - GET /api/admin/product-types/sizes?type_id=xxx
   - POST /api/admin/products/variants
   - POST /api/admin/products/save

6. COMPONENTES:
   - VariantImagesUploader.tsx: maneja carga, reorden y primaria
*/
