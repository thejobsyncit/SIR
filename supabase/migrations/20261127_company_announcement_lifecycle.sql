-- ==============================================================================
-- Migration: Company Announcement Lifecycle, Soft Deletion & Audit History
-- Date: 2026-11-27
-- Safe, idempotent migration (does not drop or recreate existing tables)
-- ==============================================================================

-- 1. Safely add soft-deletion & publication history columns to company_announcements
ALTER TABLE IF EXISTS public.company_announcements
  ADD COLUMN IF NOT EXISTS is_deleted INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS was_published INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS deleted_by_name TEXT,
  ADD COLUMN IF NOT EXISTS deleted_by_role TEXT,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Backfill safe defaults for existing records without marking valid notices as deleted
UPDATE public.company_announcements
SET is_deleted = 0
WHERE is_deleted IS NULL;

UPDATE public.company_announcements
SET was_published = 1
WHERE COALESCE(was_published, 0) = 0
  AND (published_at IS NOT NULL OR status IN ('Published', 'Scheduled', 'Expired'));

CREATE INDEX IF NOT EXISTS idx_company_announcements_lifecycle
  ON public.company_announcements (is_deleted, status, published_at DESC);

-- 2. Create immutable announcement audit log table
CREATE TABLE IF NOT EXISTS public.company_announcement_audit_logs (
  id TEXT PRIMARY KEY,
  announcement_id TEXT NOT NULL REFERENCES public.company_announcements(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_name TEXT,
  actor_role TEXT,
  details TEXT,
  reason TEXT,
  snapshot_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_announcement_audit_ann_id
  ON public.company_announcement_audit_logs (announcement_id, created_at DESC);

-- 3. Row Level Security for audit logs (append-only for backend/authenticated, no UPDATE/DELETE)
ALTER TABLE public.company_announcement_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'company_announcement_audit_logs'
      AND policyname = 'Allow read on company_announcement_audit_logs'
  ) THEN
    CREATE POLICY "Allow read on company_announcement_audit_logs"
      ON public.company_announcement_audit_logs FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'company_announcement_audit_logs'
      AND policyname = 'Allow insert on company_announcement_audit_logs'
  ) THEN
    CREATE POLICY "Allow insert on company_announcement_audit_logs"
      ON public.company_announcement_audit_logs FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
