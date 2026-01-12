-- BETA LAUNCH: Limits & Events
-- Date: 2026-01-12

-- 1. App Config for Feature Flags & Limits
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Defaults
INSERT INTO public.app_config (key, value, description)
VALUES 
    ('BETA_MODE', 'true', 'Master switch for Invite Gate'),
    ('BETA_HOUSEHOLD_CAP', '100', 'Hard limit for active households'),
    ('BETA_SIGNUPS_PAUSED', 'false', 'Emergency brake for new signups')
ON CONFLICT (key) DO NOTHING;

-- 2. Helper View for Counting Households
CREATE OR REPLACE VIEW public.view_beta_households_count AS
SELECT count(*) as count FROM public.households;

-- 3. Beta Events (Fallback Analytics)
CREATE TABLE IF NOT EXISTS public.beta_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_name TEXT NOT NULL,
    user_id UUID, -- Nullable if pre-auth
    household_id UUID,
    payload JSONB DEFAULT '{}'::jsonb
);

-- Indices for Events
CREATE INDEX IF NOT EXISTS idx_beta_events_name_time ON public.beta_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_events_household ON public.beta_events(household_id, created_at DESC);

-- RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_events ENABLE ROW LEVEL SECURITY;

-- Config: Public Read (needed for login/signup checks), Ops Write
CREATE POLICY "Public Read Config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Ops Write Config" ON public.app_config FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Events: Service Role Write (Server actions), Ops Read
CREATE POLICY "Service Role Full Access Events" ON public.beta_events FOR ALL TO service_role USING (true) WITH CHECK (true);
