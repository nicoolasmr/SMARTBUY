'use server'

import { createSupabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { crypto } from "next/dist/server/web/sandbox/polyfills" // Fallback or use standard Node crypto if available in runtime

// Helper to generate short codes
function generateCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

async function logOpsAction(action: string, metadata: any) {
    const admin = createSupabaseAdmin()
    // Simple fire & forget or await
    await admin.from('ops_audit_logs').insert({
        action,
        metadata,
        performed_at: new Date().toISOString(),
        // performed_by: 'system' // or we try to get user from context if we pass it
    })
}

export async function getBetaStatus() {
    const admin = createSupabaseAdmin()

    // 1. Config
    const { data: config } = await admin.from('app_config').select('*')
    const betaMode = config?.find(c => c.key === 'BETA_MODE')?.value === 'true'
    const isPaused = config?.find(c => c.key === 'BETA_SIGNUPS_PAUSED')?.value === 'true'
    const cap = parseInt(config?.find(c => c.key === 'BETA_HOUSEHOLD_CAP')?.value || '100')

    // 2. Counts
    const { data: households } = await admin.rpc('fn_beta_can_create_household') // Reusing RPC might not give count
    // View
    const { data: viewData, error: viewError } = await admin.from('view_beta_households_count').select('count').single()
    const activeHouseholds = viewData?.count || 0

    return { betaMode, isPaused, cap, activeHouseholds }
}

export async function getInvites() {
    const admin = createSupabaseAdmin()
    const { data, error } = await admin.from('beta_invites').select('*').order('created_at', { ascending: false })
    if (error) return []
    return data
}

export async function generateInvites(count: number, notes: string) {
    const admin = createSupabaseAdmin()
    const codes = []

    for (let i = 0; i < count; i++) {
        const code = `INV-${generateCode(6)}`
        codes.push({
            code,
            notes,
            created_at: new Date().toISOString(),
            status: 'active'
        })
    }

    const { error } = await admin.from('beta_invites').insert(codes)

    if (error) {
        return { error: error.message }
    }

    await logOpsAction('GENERATE_INVITES', { count, notes })
    revalidatePath('/ops/beta')
    return { success: true }
}

export async function revokeInvite(id: string) {
    const admin = createSupabaseAdmin()
    const { error } = await admin
        .from('beta_invites')
        .update({ status: 'revoked' })
        .eq('id', id)

    if (error) return { error: error.message }

    await logOpsAction('REVOKE_INVITE', { inviteId: id })
    revalidatePath('/ops/beta')
    return { success: true }
}

export async function toggleBetaPause(currentState: boolean) {
    const admin = createSupabaseAdmin()
    const newState = (!currentState).toString()

    const { error } = await admin
        .from('app_config')
        .update({ value: newState })
        .eq('key', 'BETA_SIGNUPS_PAUSED')

    if (error) return { error: error.message }

    await logOpsAction('TOGGLE_BETA_PAUSE', { newState })
    revalidatePath('/ops/beta')
    return { success: true }
}
