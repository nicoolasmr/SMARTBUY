-- BETA LAUNCH: Hard Cap Check
-- Date: 2026-01-12

CREATE OR REPLACE FUNCTION public.fn_beta_can_create_household()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cap INT;
    v_current INT;
    v_paused TEXT;
BEGIN
    -- 1. Check if Beta Signups Paused
    SELECT value INTO v_paused FROM public.app_config WHERE key = 'BETA_SIGNUPS_PAUSED';
    IF v_paused = 'true' THEN
        RETURN FALSE;
    END IF;

    -- 2. Get Cap
    SELECT value::INT INTO v_cap FROM public.app_config WHERE key = 'BETA_HOUSEHOLD_CAP';
    IF v_cap IS NULL THEN 
        v_cap := 100; -- Fallback
    END IF;

    -- 3. Get Current Count
    -- We use pg_advisory_xact_lock to ensure we don't read "99" in parallel for 10 users
    -- Usage of advisory lock key 1001 for "household creation gate"
    PERFORM pg_advisory_xact_lock(1001);

    SELECT count INTO v_current FROM public.view_beta_households_count;

    IF v_current >= v_cap THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;
