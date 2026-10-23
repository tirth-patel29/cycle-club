-- 20261024000002_security_policies.sql
-- Anand Cycling Club Row Level Security Policies

-- Enable RLS on all application tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authorized admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'event_manager')
  );
END;
$$;

-- EVENTS POLICIES
-- Public can view published events
CREATE POLICY "Public can view published events"
ON events FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admins have full access to events
CREATE POLICY "Admins can manage all events"
ON events FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- REGISTRATIONS POLICIES
-- Public cannot enumerate registrations
-- Admins can view and manage all registrations
CREATE POLICY "Admins can view and manage registrations"
ON registrations FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- PAYMENTS POLICIES
-- Only Admins can view payments
CREATE POLICY "Admins can view payments"
ON payments FOR SELECT
TO authenticated
USING (is_admin());

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- AUDIT LOGS POLICIES
-- Append-only for system/admin, readable only by admins
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());
