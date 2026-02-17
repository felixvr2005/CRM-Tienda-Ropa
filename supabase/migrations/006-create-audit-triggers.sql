-- Migration: Create Triggers for Audit Logging
-- Location: supabase/migrations/006-create-audit-triggers.sql
-- Purpose: Automatically log all changes to critical tables
-- Created: 2024
-- Idempotent: Yes

BEGIN;

-- ============================================================================
-- 1. GENERIC AUDIT TRIGGER FUNCTION
-- ============================================================================

DROP FUNCTION IF EXISTS audit_trigger_func() CASCADE;

CREATE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields JSONB;
  v_operation VARCHAR;
BEGIN
  -- Convert record to JSONB
  v_old_values := to_jsonb(OLD);
  v_new_values := to_jsonb(NEW);

  -- Determine operation type
  IF TG_OP = 'INSERT' THEN
    v_operation := 'INSERT';
    v_changed_fields := v_new_values;
  ELSIF TG_OP = 'UPDATE' THEN
    v_operation := 'UPDATE';
    -- Only include changed fields (diff between old and new)
    v_changed_fields := (
      SELECT jsonb_object_agg(key, NEW.*::jsonb -> key)
      FROM jsonb_each(v_new_values)
      WHERE v_new_values -> key != v_old_values -> key
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_operation := 'DELETE';
    v_changed_fields := v_old_values;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    operation,
    resource_type,
    resource_id,
    details,
    status
  ) VALUES (
    v_operation || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    (v_new_values::jsonb ->> 'id')::UUID,
    jsonb_build_object(
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN v_old_values ELSE NULL END,
      'new_values', CASE WHEN TG_OP = 'INSERT' THEN v_new_values ELSE NULL END,
      'changed_fields', CASE WHEN TG_OP = 'UPDATE' THEN v_changed_fields ELSE NULL END,
      'changed_at', NOW()
    ),
    'success'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. PRODUCTS TABLE - Audit changes
-- ============================================================================

DROP TRIGGER IF EXISTS audit_products_trigger ON products CASCADE;

CREATE TRIGGER audit_products_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 3. CATEGORIES TABLE - Audit changes
-- ============================================================================

DROP TRIGGER IF EXISTS audit_categories_trigger ON categories CASCADE;

CREATE TRIGGER audit_categories_trigger
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 4. ORDERS TABLE - Audit changes (especially status changes)
-- ============================================================================

DROP TRIGGER IF EXISTS audit_orders_trigger ON orders CASCADE;

CREATE TRIGGER audit_orders_trigger
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- Additional trigger: Log significant order status changes
DROP FUNCTION IF EXISTS log_order_status_change() CASCADE;

CREATE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.status != OLD.status) THEN
    INSERT INTO audit_logs (
      operation,
      resource_type,
      resource_id,
      details,
      status
    ) VALUES (
      'ORDER_STATUS_CHANGE',
      'orders',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      ),
      'success'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change_trigger ON orders CASCADE;

CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- 5. COUPONS TABLE - Audit changes
-- ============================================================================

DROP TRIGGER IF EXISTS audit_coupons_trigger ON coupons CASCADE;

CREATE TRIGGER audit_coupons_trigger
AFTER INSERT OR UPDATE OR DELETE ON coupons
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 6. RETURNS TABLE - Audit changes (important for compliance)
-- ============================================================================

DROP TRIGGER IF EXISTS audit_returns_trigger ON returns CASCADE;

CREATE TRIGGER audit_returns_trigger
AFTER INSERT OR UPDATE OR DELETE ON returns
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 7. ADMIN_USERS TABLE - Audit admin user changes
-- ============================================================================

DROP TRIGGER IF EXISTS audit_admin_users_trigger ON admin_users CASCADE;

CREATE TRIGGER audit_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 8. VARIANT_IMAGES TABLE - Track image changes
-- ============================================================================

DROP TRIGGER IF EXISTS audit_variant_images_trigger ON variant_images CASCADE;

CREATE TRIGGER audit_variant_images_trigger
AFTER INSERT OR UPDATE OR DELETE ON variant_images
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 9. COUPON_USES TABLE - Track coupon usage
-- ============================================================================

DROP TRIGGER IF EXISTS audit_coupon_uses_trigger ON coupon_uses CASCADE;

CREATE TRIGGER audit_coupon_uses_trigger
AFTER INSERT ON coupon_uses
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 10. CART_ITEMS TABLE - Optional: Track cart changes (high volume)
-- ============================================================================

-- NOTE: Cart items change frequently. Consider enabling only if needed.
-- Uncomment to enable:

-- DROP TRIGGER IF EXISTS audit_cart_items_trigger ON cart_items CASCADE;
-- 
-- CREATE TRIGGER audit_cart_items_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON cart_items
-- FOR EACH ROW
-- EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 11. STOCK CHANGE TRACKING (via product updates)
-- ============================================================================

DROP FUNCTION IF EXISTS track_stock_changes() CASCADE;

CREATE FUNCTION track_stock_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.stock != OLD.stock) THEN
    INSERT INTO audit_logs (
      operation,
      resource_type,
      resource_id,
      details,
      status
    ) VALUES (
      'STOCK_CHANGE',
      'products',
      NEW.id,
      jsonb_build_object(
        'old_stock', OLD.stock,
        'new_stock', NEW.stock,
        'difference', NEW.stock - OLD.stock,
        'changed_at', NOW()
      ),
      'success'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stock_change_trigger ON products CASCADE;

CREATE TRIGGER stock_change_trigger
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
EXECUTE FUNCTION track_stock_changes();

-- ============================================================================
-- 12. PRICE CHANGE TRACKING (via product updates)
-- ============================================================================

DROP FUNCTION IF EXISTS track_price_changes() CASCADE;

CREATE FUNCTION track_price_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.price != OLD.price) THEN
    INSERT INTO audit_logs (
      operation,
      resource_type,
      resource_id,
      details,
      status
    ) VALUES (
      'PRICE_CHANGE',
      'products',
      NEW.id,
      jsonb_build_object(
        'old_price', OLD.price,
        'new_price', NEW.price,
        'percentage_change', ROUND(((NEW.price - OLD.price) / OLD.price * 100)::numeric, 2),
        'changed_at', NOW()
      ),
      'success'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS price_change_trigger ON products CASCADE;

CREATE TRIGGER price_change_trigger
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION track_price_changes();

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

/*

-- Check all triggers created:
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Expected output: 12+ triggers on critical tables

-- Verify audit logs being created:
SELECT
  operation,
  resource_type,
  COUNT(*) as change_count,
  MAX(created_at) as last_change
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY operation, resource_type
ORDER BY change_count DESC;

-- Test: Insert product and check audit log
INSERT INTO products (name, slug, price, stock, category_id)
VALUES ('Test Product', 'test-product', 99.99, 10, 'category-uuid');

SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 1;

-- Expected: audit log entry with operation='INSERT_products'

*/
