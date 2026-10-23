-- 20261024000003_indexes_and_constraints.sql
-- High Performance Indexes for 50-500 Concurrent Visitors

-- Events Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status_starts_at ON events(status, starts_at);

-- Registrations Indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_public_reference ON registrations(public_reference);
CREATE INDEX IF NOT EXISTS idx_registrations_idempotency_key ON registrations(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_registrations_mobile ON registrations(mobile_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Audit Logs Index
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
