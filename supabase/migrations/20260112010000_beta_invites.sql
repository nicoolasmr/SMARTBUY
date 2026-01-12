-- BETA LAUNCH: Invites System
-- Date: 2026-01-12

-- 1. Create table for Beta Invites
CREATE TABLE IF NOT EXISTS public.beta_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    email TEXT, -- Optional: restrict to specific email
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'revoked', 'expired')),
    max_uses INT NOT NULL DEFAULT 1,
    used_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ, -- Timestamp of last use
    used_by_user_id UUID REFERENCES auth.users(id), -- If single use, tracks who used it
    used_by_household_id UUID REFERENCES public.households(id),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) -- Auditing (Ops user)
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_beta_invites_code ON public.beta_invites(code);
CREATE INDEX IF NOT EXISTS idx_beta_invites_status ON public.beta_invites(status);
CREATE INDEX IF NOT EXISTS idx_beta_invites_expires ON public.beta_invites(expires_at);

-- 3. RLS Policies
ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Only Ops/Admins (Service Role) can manage invites
-- For MVP Beta, we assume server-side ops actions use Service Role.
-- We can also add a policy for authenticated users to VIEW if needed, but validation is ideally RPC.
-- Lets allow Service Role full access.

CREATE POLICY "Service Role Full Access"
ON public.beta_invites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Ops (authenticated with verified email/role) - placeholder for now, trusting Service Role mostly.
