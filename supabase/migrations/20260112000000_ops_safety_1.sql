-- P0 Ops Safety: last_checked_at NULL-safe
-- Date: 2026-01-12

-- 1) Add column if missing (Safety check, though typically exists)
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;

-- 2) Backfill nulls with NOW() to ensure non-null constraint holds
UPDATE public.offers
SET last_checked_at = COALESCE(last_checked_at, NOW())
WHERE last_checked_at IS NULL;

-- 3) Set Default + Not Null Constraint
ALTER TABLE public.offers
ALTER COLUMN last_checked_at SET DEFAULT NOW();

ALTER TABLE public.offers
ALTER COLUMN last_checked_at SET NOT NULL;

-- 4) Index for keyset pagination (Replaces previous loose index if any)
-- DROP existing if exists to be safe
DROP INDEX IF EXISTS idx_offers_tracking_keyset;
DROP INDEX IF EXISTS idx_offers_last_checked_at_id;

CREATE INDEX IF NOT EXISTS idx_offers_last_checked_at_id
ON public.offers (last_checked_at, id);
