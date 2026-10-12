-- ============================================================
-- Migration: Add plain_password column to teams table
-- Run this in Supabase SQL Editor if you already have existing tables
-- ============================================================

ALTER TABLE teams ADD COLUMN IF NOT EXISTS plain_password TEXT;
