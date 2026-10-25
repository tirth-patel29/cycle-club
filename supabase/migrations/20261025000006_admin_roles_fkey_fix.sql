-- 20261025000006_admin_roles_fkey_fix.sql
-- Allow admin_roles to support Neon Auth and independent administrative identities

-- Drop strict auth.users foreign key on admin_roles to support Neon Auth administrators
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS admin_roles_user_id_fkey;
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS admin_roles_assigned_by_fkey;

-- Ensure role check constraint
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS admin_roles_role_check;
ALTER TABLE admin_roles ADD CONSTRAINT admin_roles_role_check 
  CHECK (role IN ('admin', 'event_manager', 'rider'));

-- Ensure unique role per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_roles_user_role ON admin_roles(user_id, role);
