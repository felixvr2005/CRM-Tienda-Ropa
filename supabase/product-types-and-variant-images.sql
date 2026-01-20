-- =====================================================
-- SYSTEM DE TIPOS DE PRODUCTO CON TALLAS PERSONALIZADAS
-- Y FOTOS POR VARIANTE DE COLOR
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLA DE TIPOS DE PRODUCTO
-- =====================================================

CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE, -- "Camiseta", "Pantalón", "Zapato", etc.
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  size_type VARCHAR(50) NOT NULL CHECK (size_type IN ('standard', 'numeric', 'shoe')),
  -- standard: S, M, L, XL, XXL
  -- numeric: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  -- shoe: 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
  available_sizes TEXT[] NOT NULL, -- Array de tallas disponibles para este tipo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_types_slug ON product_types(slug);

-- Insertar tipos de producto comunes
INSERT INTO product_types (name, slug, description, size_type, available_sizes)
VALUES
  ('Camiseta', 'camiseta', 'Prendas superiores ajustadas', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  ('Pantalón', 'pantalon', 'Prendas inferiores', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  ('Falda', 'falda', 'Prendas inferiores para mujer', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  ('Chaqueta', 'chaqueta', 'Prendas de abrigo', 'standard', ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  ('Zapato', 'zapato', 'Calzado', 'shoe', ARRAY['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']),
  ('Bota', 'bota', 'Botas y botines', 'shoe', ARRAY['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']),
  ('Bolso', 'bolso', 'Bolsos y mochilas', 'numeric', ARRAY['1']),
  ('Sombrero', 'sombrero', 'Sombreros y gorras', 'numeric', ARRAY['1']),
  ('Accesorio', 'accesorio', 'Accesorios varios', 'numeric', ARRAY['1'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. MODIFICAR TABLA PRODUCTS PARA AÑADIR TIPO
-- =====================================================

ALTER TABLE products 
ADD COLUMN product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL;

CREATE INDEX idx_products_type ON products(product_type_id);

-- =====================================================
-- 3. TABLA DE IMÁGENES POR VARIANTE
-- Permite múltiples fotos para cada combinación color/talla
-- =====================================================

CREATE TABLE IF NOT EXISTS variant_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false, -- Imagen principal de la variante
  sort_order INTEGER DEFAULT 0, -- Orden de las imágenes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variant_images_variant ON variant_images(variant_id);
CREATE INDEX idx_variant_images_primary ON variant_images(variant_id) WHERE is_primary = true;
CREATE INDEX idx_variant_images_sort ON variant_images(variant_id, sort_order);

-- =====================================================
-- 4. COMENTARIOS
-- =====================================================

COMMENT ON TABLE product_types IS 'Define tipos de producto con sus tallas específicas (camiseta S,M,L / zapato 35-46)';
COMMENT ON TABLE variant_images IS 'Almacena múltiples imágenes para cada variante de color/talla';
COMMENT ON COLUMN product_types.size_type IS 'Tipo de talla: standard (S,M,L), numeric (1-10), shoe (35-46)';
COMMENT ON COLUMN variant_images.is_primary IS 'Imagen que se muestra como principal en la galería del producto';

-- =====================================================
-- 5. FUNCIÓN PARA OBTENER TALLAS DISPONIBLES POR TIPO
-- =====================================================

CREATE OR REPLACE FUNCTION get_sizes_by_product_type(p_product_type_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT available_sizes 
    FROM product_types 
    WHERE id = p_product_type_id
  );
END;
$$;

-- =====================================================
-- 6. FUNCIÓN PARA OBTENER IMÁGENES DE UNA VARIANTE
-- =====================================================

CREATE OR REPLACE FUNCTION get_variant_images(p_variant_id UUID)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  alt_text VARCHAR,
  is_primary BOOLEAN,
  sort_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- =====================================================
-- 7. FUNCIÓN PARA ESTABLECER IMAGEN PRIMARIA
-- =====================================================

CREATE OR REPLACE FUNCTION set_primary_variant_image(p_image_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_variant_id UUID;
BEGIN
  -- Obtener el variant_id de la imagen
  SELECT variant_id INTO v_variant_id
  FROM variant_images
  WHERE id = p_image_id;

  IF v_variant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Desmarcar todas las imágenes primarias de este variant
  UPDATE variant_images
  SET is_primary = FALSE
  WHERE variant_id = v_variant_id;

  -- Marcar la nueva como primaria
  UPDATE variant_images
  SET is_primary = TRUE
  WHERE id = p_image_id;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- 8. PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_sizes_by_product_type TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_variant_images TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_primary_variant_image TO authenticated;

-- =====================================================
-- 9. EJEMPLOS DE USO
-- =====================================================

/*
-- Obtener tallas disponibles para un tipo de producto:
SELECT get_sizes_by_product_type('uuid-del-tipo-camiseta');
-- Retorna: ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']

-- Obtener imágenes de una variante:
SELECT * FROM get_variant_images('uuid-de-la-variante');

-- Insertar imágenes para una variante:
INSERT INTO variant_images (variant_id, image_url, alt_text, sort_order)
VALUES 
  ('uuid-variante', 'https://...imagen1.jpg', 'Camisa roja frontal', 1),
  ('uuid-variante', 'https://...imagen2.jpg', 'Camisa roja trasera', 2),
  ('uuid-variante', 'https://...imagen3.jpg', 'Camisa roja detalle', 3);

-- Establecer una como primaria:
SELECT set_primary_variant_image('uuid-de-la-imagen-1');
*/
