-- Migración para convertir precios de euros a céntimos
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor

-- Actualizar precios de productos (multiplicar por 100)
UPDATE products
SET price = price * 100
WHERE price < 1000; -- Solo productos que parecen estar en euros (< 1000€)

-- Actualizar precios comparativos
UPDATE products
SET compare_at_price = compare_at_price * 100
WHERE compare_at_price < 1000 AND compare_at_price IS NOT NULL;

-- Verificar cambios
SELECT 'Productos actualizados:' as info, COUNT(*) as count
FROM products
WHERE price >= 1000;

SELECT 'Productos aún en euros:' as warning, COUNT(*) as count
FROM products
WHERE price < 1000;