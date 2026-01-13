-- BETA HARDENING: Jobs & Alerts Support
-- Date: 2024-01-15

-- 1. Add Cooldown to Alerts (Default 60 mins)
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS cooldown_minutes INTEGER DEFAULT 60;

-- 2. Indices for Price Tracker & Alert Evaluator
-- Support for: .eq('is_available', true).order('updated_at').order('id')
CREATE INDEX IF NOT EXISTS idx_offers_tracking_cursor 
ON public.offers (updated_at ASC, id ASC) 
WHERE is_available = true;

-- Support for: .eq('is_active', true) in alerts
CREATE INDEX IF NOT EXISTS idx_alerts_active 
ON public.alerts (is_active) 
WHERE is_active = true;

-- Support for: deduplication check order('triggered_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_alert_events_dedupe 
ON public.alert_events (alert_id, triggered_at DESC);

-- 3. Comments (Audit trail)
COMMENT ON INDEX idx_offers_tracking_cursor IS 'Optimizes Price Tracker Job cursor pagination';
COMMENT ON COLUMN public.alerts.cooldown_minutes IS 'Minimum time in minutes between alerts for same item';
