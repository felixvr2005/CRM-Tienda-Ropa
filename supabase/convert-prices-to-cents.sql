-- Migración para convertir precios de euros a céntimos
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor

-- Actualizar precios de productos (multiplicar por 100 si parecen euros)
UPDATE products
SET price = CASE
  WHEN price < 100 THEN price * 100  -- Euros a céntimos
  ELSE price  -- Ya en céntimos o precios altos
END;

-- Actualizar precios comparativos
UPDATE products
SET compare_at_price = CASE
  WHEN compare_at_price < 100 AND compare_at_price IS NOT NULL THEN compare_at_price * 100
  ELSE compare_at_price
END;

-- Verificar cambios
SELECT 'Total productos:' as info, COUNT(*) as count FROM products;
SELECT 'Productos en euros convertidos:' as info, COUNT(*) as count FROM products WHERE price >= 1000;
SELECT 'Productos que pueden estar mal:' as warning, COUNT(*) as count FROM products WHERE price < 10 AND price > 0;