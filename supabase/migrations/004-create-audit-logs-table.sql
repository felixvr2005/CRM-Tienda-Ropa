-- Migration: Create Audit Logs Tables
-- Location: supabase/migrations/004-create-audit-logs-table.sql
-- Purpose: Centralized audit trail for all sensitive operations
-- Created: 2024
-- Idempotent: Yes

BEGIN;

-- ============================================================================
-- 1. LOGS TABLE - Application logs (debug, info, warn, error, critical)
-- ============================================================================

DROP TABLE IF EXISTS logs CASCADE;

CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  error_message TEXT,
  error_stack TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for efficient querying by level and timestamp
CREATE INDEX idx_logs_level_created_at ON logs(level, created_at DESC);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);

-- ============================================================================
-- 2. AUDIT_LOGS TABLE - Sensitive operation audit trail
-- ============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Operation info
  operation VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  
  -- User info
  user_id UUID,
  admin_id UUID,
  
  -- Operation details
  details JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES admin_users(auth_user_id) ON DELETE SET NULL
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_status ON audit_logs(status, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. SERVICE ROLE OPERATIONS MATERIALIZED VIEW
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS service_role_operations_summary CASCADE;

CREATE MATERIALIZED VIEW service_role_operations_summary AS
SELECT
  operation,
  resource_type,
  status,
  COUNT(*) as operation_count,
  MIN(created_at) as first_operation,
  MAX(created_at) as last_operation,
  COUNT(CASE WHEN status = 'failure' THEN 1 END) as failure_count
FROM audit_logs
WHERE user_id IS NULL AND admin_id IS NULL -- Service role operations
GROUP BY operation, resource_type, status
ORDER BY last_operation DESC;

-- Refresh the view
REFRESH MATERIALIZED VIEW service_role_operations_summary;

-- ============================================================================
-- 4. RLS POLICIES FOR AUDIT TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
CREATE POLICY "logs_admin_view"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Admin can view all audit logs
CREATE POLICY "audit_logs_admin_view"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Service role can insert logs and audit logs
CREATE POLICY "logs_service_insert"
  ON logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_logs_service_insert"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 5. STORED FUNCTION: Log Admin Action
-- ============================================================================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_operation VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_status VARCHAR,
  p_details JSONB,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get current admin's auth_user_id
  SELECT auth_user_id INTO v_admin_id
  FROM admin_users
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;

  -- Insert audit log
  INSERT INTO audit_logs (
    operation,
    resource_type,
    resource_id,
    admin_id,
    status,
    details,
    error_message
  ) VALUES (
    p_operation,
    p_resource_type,
    p_resource_id,
    v_admin_id,
    p_status,
    p_details,
    p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. VIEWS FOR ADMIN DASHBOARD
-- ============================================================================

-- Recent operations by type
DROP VIEW IF EXISTS recent_operations CASCADE;

CREATE VIEW recent_operations AS
SELECT
  operation,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_at
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY operation, status
ORDER BY last_at DESC;

-- Failed operations (errors)
DROP VIEW IF EXISTS failed_operations CASCADE;

CREATE VIEW failed_operations AS
SELECT
  id,
  operation,
  resource_type,
  resource_id,
  user_id,
  admin_id,
  error_message,
  created_at
FROM audit_logs
WHERE status = 'failure'
ORDER BY created_at DESC
LIMIT 50;

-- ============================================================================
-- 7. RETENTION POLICY FUNCTION
-- ============================================================================

-- Delete logs older than 90 days (configurable)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM logs WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if using pg_cron extension - optional)
-- SELECT cron.schedule('cleanup-logs', '0 0 * * 0', 'SELECT cleanup_old_logs()');

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION SCRIPT
-- ============================================================================
/*

-- Check tables created
SELECT tablename FROM pg_tables WHERE tablename IN ('logs', 'audit_logs');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename IN ('logs', 'audit_logs');

-- Check materialized view
SELECT * FROM service_role_operations_summary;

-- Check recent audit logs (admin only)
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Check failed operations
SELECT * FROM failed_operations;

*/
