-- ============================================================
-- NPR Hackathon Portal — Supabase Database Schema
-- Run this in Supabase SQL Editor in order
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: hackathon_settings
-- Configurable hackathon metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS hackathon_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT NOT NULL UNIQUE,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO hackathon_settings (key, value, description) VALUES
  ('hackathon_name',    '"NPR Hackathon 2025"',                              'Name of the hackathon'),
  ('hackathon_year',    '"2025"',                                            'Year/edition'),
  ('hackathon_tagline', '"Build Today, Solve Tomorrow"',                     'Hero tagline'),
  ('hackathon_description', '"A 24-hour hackathon for engineering innovators at NPR College of Engineering."', 'Short description'),
  ('hackathon_start_date', '"2025-03-15T09:00:00+05:30"',                   'Event start date'),
  ('hackathon_end_date',   '"2025-03-16T09:00:00+05:30"',                   'Event end date'),
  ('registration_open', 'false',                                             'Whether team registration is open (always false for this portal)'),
  ('contact_email',     '"hackathon@nprcolleges.org"',                       'Organizer contact email'),
  ('contact_phone',     '"+91 98765 43210"',                                 'Organizer phone'),
  ('rules', '[
    "Each team must select exactly one problem statement.",
    "Once a problem statement is locked, it cannot be changed without organizer approval.",
    "Teams must be present at the venue on the day of the hackathon.",
    "All code submitted must be original work.",
    "Teams must not exceed the maximum member limit.",
    "Plagiarism will result in immediate disqualification.",
    "The organizer decision is final in all disputes."
  ]', 'Hackathon rules array'),
  ('max_team_size',     '4',                                                 'Maximum members per team'),
  ('problem_categories', '["AI/ML", "Web", "IoT", "Cybersecurity", "Blockchain", "Health", "Sustainability", "Other"]', 'Available problem categories')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Table: admins
-- Administrator accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default administrator account (username: admin, password: admin123)
-- Uses bcrypt hash compatible with bcryptjs
INSERT INTO admins (id, username, password_hash, display_name, role, status) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    '$2b$10$ZUTdSLi7itBlD/TPTcqzm.z0Axm6D8Z7F4lHQz/VD441asCvmJB5S',
    'System Administrator',
    'super_admin',
    'active'
  )
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- Table: teams
-- Pre-created hackathon teams
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code       TEXT NOT NULL UNIQUE,
  team_name       TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  plain_password  TEXT,                                -- Plaintext password for admin dashboard reference
  members         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{name, role}]
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);

-- ============================================================
-- Table: problems
-- Hackathon problem statements
-- ============================================================
CREATE TABLE IF NOT EXISTS problems (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_code              TEXT NOT NULL UNIQUE,
  title                     TEXT NOT NULL,
  short_description         TEXT NOT NULL,
  description               TEXT NOT NULL,
  category                  TEXT NOT NULL,
  difficulty                TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags                      TEXT[] NOT NULL DEFAULT '{}',
  expected_outcome          TEXT NOT NULL DEFAULT '',
  recommended_technologies  TEXT[] NOT NULL DEFAULT '{}',
  constraints               TEXT NOT NULL DEFAULT '',
  resources                 JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{label, url}]
  status                    TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_problem_code ON problems(problem_code);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);

-- ============================================================
-- Table: allocations
-- Atomic team-to-problem selection (the source of truth)
-- ============================================================
CREATE TABLE IF NOT EXISTS allocations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  problem_id  UUID NOT NULL REFERENCES problems(id) ON DELETE RESTRICT,
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Enforce: one allocation per team
  CONSTRAINT uq_allocations_team    UNIQUE (team_id),
  -- Enforce: one allocation per problem
  CONSTRAINT uq_allocations_problem UNIQUE (problem_id)
);

CREATE INDEX IF NOT EXISTS idx_allocations_team_id    ON allocations(team_id);
CREATE INDEX IF NOT EXISTS idx_allocations_problem_id ON allocations(problem_id);

-- ============================================================
-- Table: audit_logs
-- Immutable record of important actions
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    TEXT,                        -- admin id, team_code, or 'system'
  actor_type  TEXT NOT NULL,               -- 'admin', 'team', 'system'
  action      TEXT NOT NULL,               -- e.g. 'PROBLEM_LOCKED', 'ALLOCATION_RELEASED'
  entity_type TEXT,                        -- 'team', 'problem', 'allocation', 'admin'
  entity_id   TEXT,                        -- UUID or code of the entity
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id    ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs(created_at DESC);

-- ============================================================
-- Function: lock_problem (atomic, concurrency-safe)
-- Returns: JSON with success/error info
-- ============================================================
CREATE OR REPLACE FUNCTION lock_problem(
  p_team_id    UUID,
  p_problem_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team          teams%ROWTYPE;
  v_problem       problems%ROWTYPE;
  v_allocation    allocations%ROWTYPE;
  v_new_alloc_id  UUID;
BEGIN
  -- 1. Validate team exists and is active
  SELECT * INTO v_team FROM teams WHERE id = p_team_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TEAM_NOT_FOUND', 'message', 'Team not found or inactive.');
  END IF;

  -- 2. Check team does not already have an allocation
  SELECT * INTO v_allocation FROM allocations WHERE team_id = p_team_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TEAM_ALREADY_ALLOCATED', 'message', 'Your team has already selected a problem.');
  END IF;

  -- 3. Lock the problem row for update (prevents race condition)
  SELECT * INTO v_problem FROM problems WHERE id = p_problem_id AND status = 'PUBLISHED' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROBLEM_NOT_FOUND', 'message', 'Problem not found or not published.');
  END IF;

  -- 4. Check problem is not already allocated
  SELECT * INTO v_allocation FROM allocations WHERE problem_id = p_problem_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROBLEM_ALREADY_LOCKED', 'message', 'This problem has already been selected by another team.');
  END IF;

  -- 5. Create the allocation atomically
  INSERT INTO allocations (team_id, problem_id)
  VALUES (p_team_id, p_problem_id)
  RETURNING id INTO v_new_alloc_id;

  -- 6. Write audit log
  INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, metadata)
  VALUES (
    v_team.team_code,
    'team',
    'PROBLEM_LOCKED',
    'allocation',
    v_new_alloc_id::text,
    jsonb_build_object(
      'team_id', p_team_id,
      'team_code', v_team.team_code,
      'team_name', v_team.team_name,
      'problem_id', p_problem_id,
      'problem_code', v_problem.problem_code,
      'problem_title', v_problem.title
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'allocation_id', v_new_alloc_id,
    'problem_code', v_problem.problem_code,
    'problem_title', v_problem.title,
    'locked_at', NOW()
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'CONFLICT', 'message', 'This problem was just selected by another team. Please choose a different problem.');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', 'An unexpected error occurred. Please try again.');
END;
$$;

-- ============================================================
-- Function: release_allocation (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION release_allocation(
  p_allocation_id UUID,
  p_admin_id      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alloc   allocations%ROWTYPE;
  v_team    teams%ROWTYPE;
  v_problem problems%ROWTYPE;
BEGIN
  SELECT * INTO v_alloc FROM allocations WHERE id = p_allocation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Allocation not found.');
  END IF;

  SELECT * INTO v_team    FROM teams    WHERE id = v_alloc.team_id;
  SELECT * INTO v_problem FROM problems WHERE id = v_alloc.problem_id;

  DELETE FROM allocations WHERE id = p_allocation_id;

  INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, metadata)
  VALUES (
    p_admin_id,
    'admin',
    'ALLOCATION_RELEASED',
    'allocation',
    p_allocation_id::text,
    jsonb_build_object(
      'team_code', v_team.team_code,
      'team_name', v_team.team_name,
      'problem_code', v_problem.problem_code,
      'problem_title', v_problem.title
    )
  );

  RETURN jsonb_build_object('success', true, 'message', 'Allocation released successfully.');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', 'Failed to release allocation.');
END;
$$;

-- ============================================================
-- Updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems          ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_settings ENABLE ROW LEVEL SECURITY;

-- PROBLEMS: Public can read published problems only
CREATE POLICY "Public read published problems"
  ON problems FOR SELECT
  TO anon, authenticated
  USING (status = 'PUBLISHED');

-- HACKATHON_SETTINGS: Public can read all settings
CREATE POLICY "Public read settings"
  ON hackathon_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- ALLOCATIONS: Public can see allocations (to show locked status) — but NOT team identity
-- (We expose problem_id only; team identity is NOT in the public query)
CREATE POLICY "Public read allocations"
  ON allocations FOR SELECT
  TO anon, authenticated
  USING (true);

-- All other operations (inserts, updates, deletes) go through service_role (server-side only)
-- No additional permissive policies — server uses service_role key which bypasses RLS
