import { createSupabaseAdmin } from "@/lib/supabase/admin"

interface TrackOptions {
    userId?: string
    householdId?: string
    payload?: Record<string, unknown>
}

export async function track(eventName: string, options: TrackOptions = {}) {
    const admin = createSupabaseAdmin()

    // Fire and forget (best effort) to not block main thread
    // In strict environments we might await, but for analytics speed is preferred.
    // However, in serverless, if we don't await, execution might be cut.
    // We will await but catch errors silently.
    try {
        await admin.from('beta_events').insert({
            event_name: eventName,
            user_id: options.userId,
            household_id: options.householdId,
            payload: options.payload || {}
        })
    } catch (err) {
        console.error(`[Analytics] Failed to track ${eventName}:`, err)
    }
}
