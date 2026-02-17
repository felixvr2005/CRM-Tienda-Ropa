-- Migration: Fix insecure admin RLS policies
-- Date: 2026-02-02
-- Description: Replace auth.role() = 'authenticated' with proper admin_users checks
-- Status: IDEMPOTENT - Safe to run multiple times

BEGIN;

-- ==============================================================================
-- DROP INSECURE POLICIES
-- ==============================================================================

-- Categories policies
DROP POLICY IF EXISTS "Admin full access" ON categories CASCADE;

-- Products policies
DROP POLICY IF EXISTS "Admin full access" ON products CASCADE;

-- Product variants policies
DROP POLICY IF EXISTS "Admin full access" ON product_variants CASCADE;

-- Orders policies
DROP POLICY IF EXISTS "Admin full access" ON orders CASCADE;

-- Coupons policies
DROP POLICY IF EXISTS "Admin full access" ON coupons CASCADE;

-- ==============================================================================
-- CREATE SECURE ADMIN POLICIES (using admin_users table)
-- ==============================================================================

-- Categories: Public read, Admin manage
CREATE POLICY "categories_public_select" ON categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "categories_admin_all" ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Products: Public read active, Admin manage
CREATE POLICY "products_public_select" ON products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Product variants: Public read, Admin manage
CREATE POLICY "product_variants_public_select" ON product_variants
  FOR SELECT
  USING (true);

CREATE POLICY "product_variants_admin_all" ON product_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Orders: Customer own, Admin all
CREATE POLICY "orders_customer_own" ON orders
  FOR SELECT
  USING (customer_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Coupons: Public read active, Admin manage
CREATE POLICY "coupons_public_select" ON coupons
  FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- ==============================================================================
-- CUSTOMER-ONLY POLICIES (new)
-- ==============================================================================

-- Cart items: Customer own
CREATE POLICY "cart_items_customer_own" ON cart_items
  FOR ALL
  USING (customer_id = auth.uid() OR session_id = current_setting('request.session_id', true));

-- Wishlists: Customer own or public
CREATE POLICY "wishlists_customer_own" ON wishlists
  FOR SELECT
  USING (customer_id = auth.uid() OR is_public = true);

CREATE POLICY "wishlists_customer_manage_own" ON wishlists
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "wishlists_customer_update_own" ON wishlists
  FOR UPDATE
  USING (customer_id = auth.uid());

-- Returns: Customer own or admin
CREATE POLICY "returns_customer_own" ON returns
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = returns.order_id 
    AND (o.customer_id = auth.uid() OR o.user_id = auth.uid())
  ));

CREATE POLICY "returns_customer_create" ON returns
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = returns.order_id 
    AND (o.customer_id = auth.uid() OR o.user_id = auth.uid())
  ));

CREATE POLICY "returns_admin_all" ON returns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

COMMIT;
