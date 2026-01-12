-- BETA LAUNCH: Atomic Invite Claim
-- Date: 2026-01-12

CREATE OR REPLACE FUNCTION public.fn_claim_invite(
    p_code TEXT, 
    p_user_id UUID, 
    p_household_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invite public.beta_invites%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- 1. Lock & Select Invite
    SELECT * INTO v_invite
    FROM public.beta_invites
    WHERE code = p_code
    FOR UPDATE; -- Lock row to prevent race condition on parallel usage

    -- 2. Validate
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'NOT_FOUND');
    END IF;

    IF v_invite.status != 'active' THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'STATUS_' || v_invite.status); -- e.g. REVOKED
    END IF;

    IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < v_now THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'EXPIRED');
    END IF;

    IF v_invite.used_count >= v_invite.max_uses THEN
        -- Should have been marked used, but double safety
        RETURN jsonb_build_object('ok', false, 'reason', 'MAX_USES_REACHED');
    END IF;

    -- 3. Update Usage
    UPDATE public.beta_invites
    SET 
        used_count = used_count + 1,
        used_at = v_now,
        used_by_user_id = p_user_id,
        used_by_household_id = p_household_id,
        status = CASE 
            WHEN (used_count + 1) >= max_uses THEN 'used' 
            ELSE 'active' 
        END
    WHERE id = v_invite.id;

    RETURN jsonb_build_object('ok', true);
END;
$$;
