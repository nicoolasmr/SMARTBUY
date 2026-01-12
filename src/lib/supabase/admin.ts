import { createClient } from '@supabase/supabase-js'

/**
 * Creates a secure Supabase Admin client with Service Role privileges.
 * 
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is missing.
 * @returns SupabaseClient
 */
export function createSupabaseAdmin() {
    // 1. Strict Environment Check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // FAIL FAST: Never allow a job to run without proper auth
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'FATAL: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. ' +
            'Cannot create Admin Client for Background Job.'
        )
    }

    // 2. Create Client (No Cookies, pure Server-Server)
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
