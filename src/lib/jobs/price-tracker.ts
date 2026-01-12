import { createClient } from "@/lib/supabase/client" // Using client for admin access in jobs? No, safer to use server createClient but we need Service Role.
// Since we don't have service role key exposed in env for this demo explicitly safe, we might assume Supabase Admin Client or use RLS bypass if possible.
// NOTE: For this MVP, we will use the standard server client but we need to act as "system". 
// Since Next.js server actions / components usually passed user cookies, a background job needs a SERVICE_ROLE client.
// Let's assume process.env.SUPABASE_SERVICE_ROLE_KEY exists or we simulate it.
// FOR MVP: We will assume we can run this via an API route that uses a Service Role client or similar.
// Actually, `createClient` from `@/lib/supabase/server` uses cookies. 
// We need `createClient` from `@supabase/supabase-js` with the service key.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendAlert } from '@/lib/notifications/dispatcher'

// Mock environment variables for illustration if they aren't in process.env
// const SUBS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Fallback to "simulated" job if no service key (local dev without env)
// But real implementation needs strict auth.
// const supabaseAdmin = createSupabaseClient(SUBS_URL, SERVICE_KEY || 'mock-key-for-build')

// Helper to get admin client lazily to avoid build errors if env vars missing
function getAdminClient() {
    const SUBS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
    return createSupabaseClient(SUBS_URL, SERVICE_KEY)
}


export async function runPriceTrackingJob() {
    console.log('[JOB] Starting Price Tracking...')
    const supabaseAdmin = getAdminClient()

    // Safety: Max execution blocks
    const MAX_BATCHES = 10
    const BATCH_SIZE = 100 // Process 100 at a time

    let processedCount = 0
    let lastId = '00000000-0000-0000-0000-000000000000' // UUID min

    // Loop for pagination
    for (let i = 0; i < MAX_BATCHES; i++) {
        // Fetch next batch of active offers > lastId
        const { data: offers } = await supabaseAdmin
            .from('offers')
            .select('id, price, freight')
            .eq('is_available', true)
            .gt('id', lastId)
            .order('id', { ascending: true })
            .limit(BATCH_SIZE)

        if (!offers || offers.length === 0) {
            console.log('[JOB] No more offers to process.')
            break;
        }

        // Process Batch
        for (const offer of offers) {
            // Simulate Price Fluctuation (-10% to +10%)
            const fluctuation = 1 + (Math.random() * 0.2 - 0.1)
            const newPrice = Number((offer.price * fluctuation).toFixed(2))

            // Update Offer
            await supabaseAdmin
                .from('offers')
                .update({ price: newPrice, updated_at: new Date().toISOString() })
                .eq('id', offer.id)

            // Record History
            await supabaseAdmin
                .from('offer_price_history')
                .insert({
                    offer_id: offer.id,
                    price: newPrice,
                    freight: offer.freight
                })

            // Only log every 10th update to avoid spamming logs in prod
            if (processedCount % 10 === 0) {
                console.log(`[JOB] Updated Offer ${offer.id}: R$ ${offer.price} -> R$ ${newPrice}`)
            }
        }

        processedCount += offers.length
        lastId = offers[offers.length - 1].id // Advance cursor

        // Safety break if we processed less than batch size (end of table)
        if (offers.length < BATCH_SIZE) break;
    }

    return { processed: processedCount }
}

export async function runAlertEvaluatorJob() {
    console.log('[JOB] Starting Alert Evaluator...')
    const supabaseAdmin = getAdminClient()

    // 1. Fetch Active Alerts
    const { data: alerts } = await supabaseAdmin
        .from('alerts')
        .select('*, products(name), wishes(title)')
        .eq('is_active', true)

    if (!alerts) return { alertsProcessed: 0, eventsTriggered: 0 }

    let triggeredCount = 0

    for (const alert of alerts) {
        // Find best offer for the target (Wish or Product)
        let query = supabaseAdmin
            .from('offers')
            .select('*, shops(name)')
            .eq('is_available', true)
            .order('price', { ascending: true })
            .limit(1)

        if (alert.product_id) {
            query = query.eq('product_id', alert.product_id)
        } else if (alert.wish_id) {
            // Complex: Need to find products linked to wish? 
            // For MVP, simplified: Alert usually linked to Product directly or generic Wish search.
            // Let's assume Alert->Product linkage is preferred or we skip Wish-only alerts for this v0 logic.
            continue
        }

        const { data: offers } = await query
        const bestOffer = offers?.[0]

        if (!bestOffer) continue

        // Check Condition
        let triggered = false
        if (alert.type === 'price' && bestOffer.price <= alert.target_value) {
            triggered = true
        }

        if (triggered) {
            // Check cooldown? Skip for MVP.

            // Create Event
            const payload = {
                price: bestOffer.price,
                shop: bestOffer.shops.name,
                url: bestOffer.url
            }

            await supabaseAdmin.from('alert_events').insert({
                alert_id: alert.id,
                offer_id: bestOffer.id,
                payload
            })

            // Dispatch
            await sendAlert('push', {
                title: `Alerta de Preço: ${alert.products?.name || 'Item'}`,
                body: `Preço atingiu R$ ${bestOffer.price}!`,
                data: { url: bestOffer.url }
            })

            // Update Last Triggered
            await supabaseAdmin
                .from('alerts')
                .update({ last_triggered_at: new Date().toISOString() })
                .eq('id', alert.id)

            triggeredCount++
            console.log(`[JOB] Alert Triggered: ${alert.id} for R$ ${bestOffer.price}`)
        }
    }

    return { alertsProcessed: alerts.length, eventsTriggered: triggeredCount }
}
