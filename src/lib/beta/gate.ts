import { createSupabaseAdmin } from "@/lib/supabase/admin"

export interface InviteValidationResult {
    valid: boolean
    reason?: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'USED' | 'MAX_USES_REACHED' | 'STATUS_REVOKED' | 'EMAIL_MISMATCH'
}

export async function isBetaMode(): Promise<boolean> {
    const admin = createSupabaseAdmin()
    const { data } = await admin.from('app_config').select('value').eq('key', 'BETA_MODE').single()
    return data?.value === 'true'
}

export async function validateInvite(code: string, email?: string): Promise<InviteValidationResult> {
    const admin = createSupabaseAdmin()

    // 1. Fetch Invite
    const { data: invite, error } = await admin
        .from('beta_invites')
        .select('*')
        .eq('code', code)
        .single()

    if (error || !invite) {
        return { valid: false, reason: 'NOT_FOUND' }
    }

    // 2. Status Check
    if (invite.status !== 'active') {
        return { valid: false, reason: 'REVOKED' } // Generic for non-active
    }

    // 3. Expiration
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return { valid: false, reason: 'EXPIRED' }
    }

    // 4. Usage Limit
    if (invite.used_count >= invite.max_uses) {
        return { valid: false, reason: 'MAX_USES_REACHED' }
    }

    // 5. Email Match (if strictly assigned)
    if (invite.email && email && invite.email !== email) {
        return { valid: false, reason: 'EMAIL_MISMATCH' }
    }

    return { valid: true }
}

export async function checkBetaCap(): Promise<boolean> {
    const admin = createSupabaseAdmin()
    // Use the RPC we created which handles locking and config check
    const { data, error } = await admin.rpc('fn_beta_can_create_household')

    if (error) {
        console.error('Beta Cap Check Failed:', error)
        return false // Fail safe (Closed)
    }

    return !!data
}

export async function claimInvite(code: string, userId: string, householdId?: string): Promise<boolean> {
    const admin = createSupabaseAdmin()

    const { data, error } = await admin.rpc('fn_claim_invite', {
        p_code: code,
        p_user_id: userId,
        p_household_id: householdId // Optional at this stage if household not created yet
    })

    if (error) {
        console.error('Failed to claim invite:', error)
        return false
    }

    return data?.ok === true
}
