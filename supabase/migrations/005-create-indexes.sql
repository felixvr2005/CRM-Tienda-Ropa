-- Migration: Create Indexes for Performance Optimization
-- Location: supabase/migrations/005-create-indexes.sql
-- Purpose: Improve query performance on frequently queried columns
-- Created: 2024
-- Idempotent: Yes

BEGIN;

-- ============================================================================
-- 1. PRODUCTS TABLE INDEXES
-- ============================================================================

-- Index on category_id for filtering products by category
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Index on slug for direct product lookups by URL slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Composite index for listing: is_active + created_at (common filter + sort)
CREATE INDEX IF NOT EXISTS idx_products_active_created ON products(is_active, created_at DESC);

-- Index for admin dashboard: is_active + price range searches
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(is_active, price);

-- ============================================================================
-- 2. CATEGORIES TABLE INDEXES
-- ============================================================================

-- Index on slug for category page lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Index for filtering active categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================================================
-- 3. VARIANTS TABLE INDEXES
-- ============================================================================

-- Index on product_id for querying variants of a product
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);

-- Index on sku for inventory lookups
CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);

-- ============================================================================
-- 4. ORDERS TABLE INDEXES
-- ============================================================================

-- Index on customer_id for listing customer's orders (RLS filter)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Index on created_at for listing recent orders (dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Composite index for dashboard: status + created_at (filter orders by status)
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Index on stripe_payment_intent_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_intent ON orders(stripe_payment_intent_id);

-- ============================================================================
-- 5. ORDER_ITEMS TABLE INDEXES
-- ============================================================================

-- Index on order_id for querying items in an order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index on product_id for product sales analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- 6. CART_ITEMS TABLE INDEXES
-- ============================================================================

-- Index on user_id for loading customer's cart (RLS + performance critical)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Index on session_id for anonymous carts
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- ============================================================================
-- 7. WISHLISTS TABLE INDEXES
-- ============================================================================

-- Index on user_id for loading customer's wishlist
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);

-- Index on product_id for reverse lookups (product wishlists)
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- ============================================================================
-- 8. COUPONS TABLE INDEXES
-- ============================================================================

-- Index on code for coupon code lookups (validates user input)
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Index on is_active for listing active coupons
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Composite index for expiry checks: is_active + valid_until
CREATE INDEX IF NOT EXISTS idx_coupons_active_expiry ON coupons(is_active, valid_until DESC);

-- ============================================================================
-- 9. RETURNS TABLE INDEXES
-- ============================================================================

-- Index on customer_id for listing customer's returns
CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id);

-- Index on order_id for order-to-returns relationship
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);

-- Index on status for admin dashboard (filter by status)
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

-- ============================================================================
-- 10. AUDIT LOGS TABLE INDEXES
-- ============================================================================

-- Index on operation for querying operations by type
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation, created_at DESC);

-- Index on resource_type + resource_id for entity history
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);

-- Index on user_id for user action tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);

-- Index on status for filtering failures
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status, created_at DESC);

-- ============================================================================
-- 11. LOGS TABLE INDEXES
-- ============================================================================

-- Index on level for filtering by log level
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level, created_at DESC);

-- Index on created_at for recent logs (dashboard)
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

-- ============================================================================
-- 12. COUPON_USES TABLE INDEXES
-- ============================================================================

-- Index on coupon_id for usage counting
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon_id ON coupon_uses(coupon_id);

-- Index on user_id for per-user coupon usage limits
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user_id ON coupon_uses(user_id);

-- Composite index for usage validation: coupon_id + user_id
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon_user ON coupon_uses(coupon_id, user_id);

-- ============================================================================
-- 13. VARIANT_IMAGES TABLE INDEXES
-- ============================================================================

-- Index on variant_id for loading images for a variant
CREATE INDEX IF NOT EXISTS idx_variant_images_variant_id ON variant_images(variant_id);

-- Index on product_id for bulk image loading
CREATE INDEX IF NOT EXISTS idx_variant_images_product_id ON variant_images(product_id);

-- ============================================================================
-- STATS & ANALYSIS
-- ============================================================================

-- Index on users table for login performance (if not already indexed)
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);

-- ============================================================================
-- VACUUM ANALYZE - Optimize query planner statistics
-- ============================================================================

VACUUM ANALYZE;

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION & MONITORING
-- ============================================================================

/*

-- View all indexes (run after migration):
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected output: 40+ indexes across all tables

-- Check index usage (run after migration + some queries):
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor query performance:
EXPLAIN ANALYZE
SELECT * FROM products
WHERE category_id = 'category-uuid'
AND is_active = true
ORDER BY created_at DESC
LIMIT 20;

-- Should use: idx_products_active_created or idx_products_category_id

-- Check missing indexes (PostgreSQL extension):
-- SELECT * FROM pg_stat_user_tables WHERE seq_scan > 100;
-- High seq_scan indicates missing index opportunity

*/
