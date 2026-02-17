-- Migration: Add missing RLS policies for all tables
-- Location: supabase/migrations/003-add-missing-rls-policies.sql
-- Purpose: Secures remaining tables (orders_items, wishlists, returns, variant_images, coupon_uses)
-- Created: 2024
-- Idempotent: Yes (uses DROP IF EXISTS + CREATE)

BEGIN;

-- ============================================================================
-- 1. ORDER_ITEMS - Customer can see own orders' items, admin can see all
-- ============================================================================

DROP POLICY IF EXISTS "order_items_public_read" ON order_items;
DROP POLICY IF EXISTS "order_items_customer_select" ON order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Admin can select all order items
CREATE POLICY "order_items_admin_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Admin can insert order items
CREATE POLICY "order_items_admin_insert"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Admin can update order items
CREATE POLICY "order_items_admin_update"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Customers can only see items from their own orders
CREATE POLICY "order_items_customer_select"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.customer_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. WISHLISTS - Customer can manage own, admin can see all
-- ============================================================================

DROP POLICY IF EXISTS "wishlists_public_read" ON wishlists;
DROP POLICY IF EXISTS "wishlists_customer_manage" ON wishlists;
DROP POLICY IF EXISTS "wishlists_admin_all" ON wishlists;

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Public can read wishlist counts (for product pages)
CREATE POLICY "wishlists_public_select"
  ON wishlists FOR SELECT
  USING (true);

-- Customers can insert to own wishlist
CREATE POLICY "wishlists_customer_insert"
  ON wishlists FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Customers can only see/update their own wishlists
CREATE POLICY "wishlists_customer_select"
  ON wishlists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "wishlists_customer_update"
  ON wishlists FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wishlists_customer_delete"
  ON wishlists FOR DELETE
  USING (user_id = auth.uid());

-- Admin can do anything
CREATE POLICY "wishlists_admin_all"
  ON wishlists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================================================
-- 3. RETURNS - Customer can see own, admin can manage all
-- ============================================================================

DROP POLICY IF EXISTS "returns_customer_select" ON returns;
DROP POLICY IF EXISTS "returns_customer_insert" ON returns;
DROP POLICY IF EXISTS "returns_admin_all" ON returns;

ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Customers can insert (request) returns for own orders
CREATE POLICY "returns_customer_insert"
  ON returns FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = returns.order_id
      AND o.customer_id = auth.uid()
    )
  );

-- Customers can only see their own returns
CREATE POLICY "returns_customer_select"
  ON returns FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "returns_customer_update"
  ON returns FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Admin can do everything (view, approve, reject, complete)
CREATE POLICY "returns_admin_all"
  ON returns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================================================
-- 4. VARIANT_IMAGES - Public read (product images), admin manage
-- ============================================================================

DROP POLICY IF EXISTS "variant_images_public_read" ON variant_images;
DROP POLICY IF EXISTS "variant_images_admin_manage" ON variant_images;

ALTER TABLE variant_images ENABLE ROW LEVEL SECURITY;

-- Public can read all variant images (for product display)
CREATE POLICY "variant_images_public_read"
  ON variant_images FOR SELECT
  USING (true);

-- Admin can manage variant images
CREATE POLICY "variant_images_admin_insert"
  ON variant_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "variant_images_admin_update"
  ON variant_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "variant_images_admin_delete"
  ON variant_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================================================
-- 5. COUPON_USES - Track coupon usage (admin view only)
-- ============================================================================

DROP POLICY IF EXISTS "coupon_uses_public_read" ON coupon_uses;
DROP POLICY IF EXISTS "coupon_uses_admin_manage" ON coupon_uses;

ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- Only admin and service role can see/manage
CREATE POLICY "coupon_uses_admin_all"
  ON coupon_uses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Service role can insert (via backend functions)
CREATE POLICY "coupon_uses_service_insert"
  ON coupon_uses FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================================================
-- 6. ADMIN_USERS - Admins can see all admin users, each admin sees self
-- ============================================================================

DROP POLICY IF EXISTS "admin_users_admin_view" ON admin_users;
DROP POLICY IF EXISTS "admin_users_self_view" ON admin_users;
DROP POLICY IF EXISTS "admin_users_admin_manage" ON admin_users;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can see all admin users
CREATE POLICY "admin_users_admin_select"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users vc
      WHERE vc.auth_user_id = auth.uid()
      AND vc.is_active = true
    )
  );

-- Admin users can create/update admin users
CREATE POLICY "admin_users_admin_manage"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users vc
      WHERE vc.auth_user_id = auth.uid()
      AND vc.is_active = true
    )
  );

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION SCRIPT (run after migration)
-- ============================================================================
/*

-- Check all tables have RLS enabled
SELECT tablename, 
       (SELECT count(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected output: Each table should have multiple policies
-- Tables: products, categories, variants, coupons, orders, order_items, 
--         cart_items, wishlists, returns, variant_images, coupon_uses, admin_users

-- Test policies (requires test user setup):
-- 1. Non-admin tries to update product -> should fail (403)
-- 2. Admin updates product -> should succeed
-- 3. Customer tries to see other's orders -> should see empty result
-- 4. Service role bypasses RLS -> should work
-- 5. Public gets products -> should only see is_active=true

*/
