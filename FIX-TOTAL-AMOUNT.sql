-- Script para arreglar total_amount NULL en órdenes
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Ver cuántas órdenes tienen total_amount NULL
SELECT COUNT(*) as orders_with_null_total FROM orders WHERE total_amount IS NULL;

-- Paso 2: Actualizar total_amount calculando: subtotal + shipping_cost - discount_amount
UPDATE orders
SET total_amount = COALESCE(subtotal, 0) + COALESCE(shipping_cost, 0) - COALESCE(discount_amount, 0)
WHERE total_amount IS NULL;

-- Paso 3: Verificar que se actualizaron
SELECT COUNT(*) as remaining_null FROM orders WHERE total_amount IS NULL;

-- Paso 4: Ver algunos ejemplos
SELECT order_number, subtotal, shipping_cost, discount_amount, total_amount 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
