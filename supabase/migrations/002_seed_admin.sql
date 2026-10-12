-- ============================================================
-- NPR Hackathon Portal — Seed Default Admin
-- Run this in Supabase SQL Editor if you already ran 001_initial_schema.sql
-- ============================================================

-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert or update default super admin
-- Username: admin
-- Password: admin123
INSERT INTO admins (
  id,
  username,
  password_hash,
  display_name,
  role,
  status
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  '$2b$10$ZUTdSLi7itBlD/TPTcqzm.z0Axm6D8Z7F4lHQz/VD441asCvmJB5S',
  'System Administrator',
  'super_admin',
  'active'
)
ON CONFLICT (username) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  status = 'active',
  role = 'super_admin',
  updated_at = NOW();
