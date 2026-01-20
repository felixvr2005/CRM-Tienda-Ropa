-- ============================================
-- CORREGIR POLÍTICAS RLS PARA variant_images
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- =====================
-- TABLA: variant_images
-- =====================
ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variant images are viewable by everyone" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be inserted" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be updated" ON variant_images;
DROP POLICY IF EXISTS "Variant images can be deleted" ON variant_images;

CREATE POLICY "Variant images are viewable by everyone" 
ON variant_images FOR SELECT USING (true);

CREATE POLICY "Variant images can be inserted" 
ON variant_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Variant images can be updated" 
ON variant_images FOR UPDATE USING (true);

CREATE POLICY "Variant images can be deleted" 
ON variant_images FOR DELETE USING (true);

-- Verificar que las políticas fueron creadas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'variant_images'
ORDER BY cmd;
