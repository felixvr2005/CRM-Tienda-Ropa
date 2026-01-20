-- =====================================================
-- FUNCIONES DE CONTROL DE STOCK ATÓMICO
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Función para decrementar stock de forma atómica
-- Usa bloqueo FOR UPDATE para evitar race conditions
CREATE OR REPLACE FUNCTION decrease_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_rows_affected INTEGER;
BEGIN
  -- Verificar que la cantidad sea positiva
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;

  -- Obtener el stock actual con bloqueo
  SELECT stock INTO v_current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  -- Verificar que existe el variant
  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Variante de producto no encontrada: %', p_variant_id;
  END IF;

  -- Verificar stock suficiente
  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', v_current_stock, p_quantity;
  END IF;

  -- Actualizar el stock
  UPDATE product_variants
  SET 
    stock = stock - p_quantity,
    updated_at = NOW()
  WHERE id = p_variant_id
    AND stock >= p_quantity;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- Verificar que se actualizó
  IF v_rows_affected = 0 THEN
    RAISE EXCEPTION 'No se pudo actualizar el stock (posible race condition)';
  END IF;

  RETURN TRUE;
END;
$$;

-- Función para incrementar stock (devoluciones, cancelaciones)
CREATE OR REPLACE FUNCTION increase_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que la cantidad sea positiva
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;

  -- Actualizar el stock
  UPDATE product_variants
  SET 
    stock = stock + p_quantity,
    updated_at = NOW()
  WHERE id = p_variant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variante de producto no encontrada: %', p_variant_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- Función para verificar disponibilidad de stock
CREATE OR REPLACE FUNCTION check_stock_availability(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT stock INTO v_current_stock
  FROM product_variants
  WHERE id = p_variant_id;

  IF v_current_stock IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN v_current_stock >= p_quantity;
END;
$$;

-- Función para reservar stock temporalmente (para carritos)
CREATE OR REPLACE FUNCTION reserve_stock(
  p_variant_id UUID,
  p_quantity INTEGER,
  p_reservation_minutes INTEGER DEFAULT 15
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_id UUID;
  v_current_stock INTEGER;
BEGIN
  -- Crear tabla de reservas si no existe
  CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Obtener stock actual con bloqueo
  SELECT stock INTO v_current_stock
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN NULL;
  END IF;

  -- Crear reserva
  INSERT INTO stock_reservations (variant_id, quantity, expires_at)
  VALUES (p_variant_id, p_quantity, NOW() + (p_reservation_minutes || ' minutes')::INTERVAL)
  RETURNING id INTO v_reservation_id;

  -- Decrementar stock disponible
  UPDATE product_variants
  SET stock = stock - p_quantity
  WHERE id = p_variant_id;

  RETURN v_reservation_id;
END;
$$;

-- Función para liberar reserva de stock
CREATE OR REPLACE FUNCTION release_stock_reservation(
  p_reservation_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_variant_id UUID;
  v_quantity INTEGER;
BEGIN
  -- Obtener y eliminar la reserva
  DELETE FROM stock_reservations
  WHERE id = p_reservation_id
  RETURNING variant_id, quantity INTO v_variant_id, v_quantity;

  IF v_variant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Devolver el stock
  UPDATE product_variants
  SET stock = stock + v_quantity
  WHERE id = v_variant_id;

  RETURN TRUE;
END;
$$;

-- Job para limpiar reservas expiradas (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleaned INTEGER := 0;
  v_reservation RECORD;
BEGIN
  FOR v_reservation IN 
    SELECT id, variant_id, quantity 
    FROM stock_reservations 
    WHERE expires_at < NOW()
  LOOP
    -- Devolver stock
    UPDATE product_variants
    SET stock = stock + v_reservation.quantity
    WHERE id = v_reservation.variant_id;
    
    -- Eliminar reserva
    DELETE FROM stock_reservations WHERE id = v_reservation.id;
    
    v_cleaned := v_cleaned + 1;
  END LOOP;

  RETURN v_cleaned;
END;
$$;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION decrease_stock IS 'Decrementa el stock de forma atómica con bloqueo FOR UPDATE para evitar race conditions';
COMMENT ON FUNCTION increase_stock IS 'Incrementa el stock (para devoluciones o cancelaciones)';
COMMENT ON FUNCTION check_stock_availability IS 'Verifica si hay stock suficiente sin modificar';
COMMENT ON FUNCTION reserve_stock IS 'Reserva stock temporalmente para un carrito';
COMMENT ON FUNCTION release_stock_reservation IS 'Libera una reserva de stock';
COMMENT ON FUNCTION cleanup_expired_reservations IS 'Limpia reservas expiradas y devuelve el stock';

-- =====================================================
-- PERMISOS
-- =====================================================

-- Permitir que el rol anon y authenticated ejecuten estas funciones
GRANT EXECUTE ON FUNCTION decrease_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increase_stock TO authenticated;
GRANT EXECUTE ON FUNCTION check_stock_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION release_stock_reservation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_reservations TO service_role;

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

/*
-- Decrementar stock tras una venta:
SELECT decrease_stock('uuid-del-variant', 2);

-- Verificar disponibilidad:
SELECT check_stock_availability('uuid-del-variant', 5);

-- Incrementar stock (devolución):
SELECT increase_stock('uuid-del-variant', 1);

-- Llamar desde Supabase JS:
const { error } = await supabase.rpc('decrease_stock', {
  p_variant_id: 'uuid-del-variant',
  p_quantity: 2
});
*/
