-- Create offer_risk_scores table
CREATE TABLE public.offer_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 100 CHECK (score >= 0 AND score <= 100),
    bucket TEXT NOT NULL CHECK (bucket IN ('A', 'B', 'C')),
    reasons JSONB DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.offer_risk_scores ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_risk_offer_id ON public.offer_risk_scores(offer_id);
CREATE INDEX idx_risk_bucket ON public.offer_risk_scores(bucket);

-- RLS Policies

-- Public Read: Everyone can see risk scores (transparency)
CREATE POLICY "Public read risk scores" ON public.offer_risk_scores
    FOR SELECT
    USING (true);

-- Service Write: Only service role (jobs/ops) can update scores
-- No user Policy for Insert/Update/Delete needed as we rely on Service Role for calculation.
-- Ops users might strictly need a policy if doing it via client, but `upsertRiskScore` action likely uses service role or admin client.
-- Let's add Ops policy just in case client-side ops is used.
-- Assuming "Ops" are users with specific metadata (skip for MVP simple policy, rely on Server Action with Service Key).

-- Simple Service Role maintenance is default if no policy allows INSERT/UPDATE for anon/authenticated.
