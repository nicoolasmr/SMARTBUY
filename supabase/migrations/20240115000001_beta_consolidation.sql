-- BETA CONSOLIDATION: Jobs Optimized Schema
-- Date: 2024-01-15 13:30

-- 1. Add 'last_checked_at' to Offers
-- Prevents pollution of 'updated_at' when price hasn't changed.
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Optimize Index for Price Tracker (Keyset Pagination)
-- We need to traverse offers by when they were last checked to ensure fairness.
DROP INDEX IF EXISTS idx_offers_tracking_cursor; -- Drop old index from previous iteration if exists

CREATE INDEX IF NOT EXISTS idx_offers_tracking_keyset 
ON public.offers (last_checked_at ASC, id ASC) 
WHERE is_available = true;

-- 3. Optimize Index for Alert Deduplication (Window based)
-- Need to quickly find if (alert_id, offer_id) happened in last X minutes.
CREATE INDEX IF NOT EXISTS idx_alert_events_dedupe_window 
ON public.alert_events (alert_id, offer_id, triggered_at DESC);
