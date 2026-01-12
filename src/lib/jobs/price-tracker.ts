import { createClient } from "@/lib/supabase/client" // Using client for admin access in jobs? No, safer to use server createClient but we need Service Role.
// Since we don't have service role key exposed in env for this demo explicitly safe, we might assume Supabase Admin Client or use RLS bypass if possible.
// NOTE: For this MVP, we will use the standard server client but we need to act as "system". 
// Since Next.js server actions / components usually passed user cookies, a background job needs a SERVICE_ROLE client.
// Let's assume process.env.SUPABASE_SERVICE_ROLE_KEY exists or we simulate it.
// FOR MVP: We will assume we can run this via an API route that uses a Service Role client or similar.
// Actually, `createClient` from `@/lib/supabase/server` uses cookies. 
// We need `createClient` from `@supabase/supabase-js` with the service key.

import { createSupabaseAdmin } from "@/lib/supabase/admin"
import { sendAlert } from "@/lib/notifications/dispatcher"

// [BETA] Hardened Price Tracker Job
// 1. Uses Secure Admin Client (Throws if no key)
// 2. Uses Cursor Pagination (updated_at, id) for stability
// 3. NO RANDOM PRICES in Beta (Stub Logic)

export async function runPriceTrackingJob() {
    const JOB_ID = `job_${Date.now()}`

    // 0. Safety Kill Switch
    if (process.env.ENABLE_JOBS === 'false' || process.env.ENABLE_PRICE_TRACKER === 'false') {
        console.log(`[JOB:${JOB_ID}] Price Tracker disabled (ENABLE_PRICE_TRACKER=false).`)
        return { processed: 0 }
    }

    // 1. Setup
    console.log(`[JOB:${JOB_ID}] START Price Tracker`)
    const supabaseAdmin = createSupabaseAdmin()

    // Configuration
    const MAX_BATCHES = 10
    const BATCH_SIZE = 100
    const MAX_TIME_MS = 45000 // 45s (Safe buffer)
    const startTime = Date.now()

    let processedCount = 0
    let changesCount = 0
    let cursorUpdatedAt = '1970-01-01T00:00:00.000Z'
    let cursorId = '00000000-0000-0000-0000-000000000000'

    try {
        for (let i = 0; i < MAX_BATCHES; i++) {
            // Time Guard
            const duration = Date.now() - startTime
            if (duration > MAX_TIME_MS) {
                console.warn(`[JOB:${JOB_ID}] TIME_GUARD_BREAK after ${duration}ms. Stopping.`)
                break;
            }

            console.log(`[JOB:${JOB_ID}] Batch ${i + 1}/${MAX_BATCHES} Cursor(updated=${cursorUpdatedAt}, id=${cursorId})...`)

            // 2. Fetch Batch (Keyset Pagination)
            const { data: offers, error } = await supabaseAdmin
                .from('offers')
                .select('id, price, freight, updated_at, url')
                .eq('is_available', true)
                // Keyset: (updated_at > cursor) OR (updated_at = cursor AND id > cursorId)
                .or(`updated_at.gt.${cursorUpdatedAt},and(updated_at.eq.${cursorUpdatedAt},id.gt.${cursorId})`)
                .order('updated_at', { ascending: true })
                .order('id', { ascending: true })
                .limit(BATCH_SIZE)

            if (error) {
                console.error(`[JOB:${JOB_ID}] DB Error:`, error)
                throw error
            }

            if (!offers || offers.length === 0) {
                console.log(`[JOB:${JOB_ID}] No more offers pending update.`)
                break;
            }

            // 3. Process Batch
            for (const offer of offers) {
                // Check Price (Stub or Demo Random)
                const newPrice = await checkExternalPriceMock(offer.price)
                const now = new Date().toISOString()

                if (newPrice !== offer.price) {
                    // Actual Change
                    await supabaseAdmin
                        .from('offers')
                        .update({ price: newPrice, updated_at: now })
                        .eq('id', offer.id)

                    // Record History
                    await supabaseAdmin
                        .from('offer_price_history')
                        .insert({
                            offer_id: offer.id,
                            price: newPrice,
                            freight: offer.freight
                        })

                    changesCount++
                } else {
                    // Stable: Just bump timestamp to rotate in queue
                    await supabaseAdmin
                        .from('offers')
                        .update({ updated_at: now })
                        .eq('id', offer.id)
                }
            }

            processedCount += offers.length

            // Update Cursor
            const lastItem = offers[offers.length - 1]
            cursorUpdatedAt = lastItem.updated_at
            cursorId = lastItem.id

            if (offers.length < BATCH_SIZE) break;
        }
    } catch (err) {
        console.error(`[JOB:${JOB_ID}] FATAL ERROR:`, err)
        // Sentry.captureException(err) // If Sentry were configured
    }

    const totalDuration = Date.now() - startTime
    console.log(`[JOB:${JOB_ID}] END. Processed=${processedCount}, Changes=${changesCount}, Duration=${totalDuration}ms`)

    return { processed: processedCount }
}

// [BETA] Strict Price Adapter Stub
async function checkExternalPriceMock(currentPrice: number): Promise<number> {
    // REQUIREMENT: Random price only if flag explicitly TRUE
    const isDemoMode = process.env.ENABLE_DEMO_PRICE_FLUCTUATION === 'true'

    if (!isDemoMode) {
        // PRODUCTION/BETA: Stable. Never random.
        // In real world, this would verify against external API.
        return currentPrice
    }

    // DEMO MODE: 10% chance of fluctuation
    const isStable = Math.random() > 0.1
    if (isStable) return currentPrice

    const change = (Math.random() * 0.10) - 0.05 // +/- 5%
    return Number((currentPrice * (1 + change)).toFixed(2))
}

export async function runAlertEvaluatorJob() {
    // 0. Safety Kill Switch
    if (process.env.ENABLE_JOBS === 'false' || process.env.ENABLE_ALERT_EVALUATOR === 'false') {
        console.log('[JOB] Alert Evaluator is disabled via feature flag.')
        return { alertsProcessed: 0, eventsTriggered: 0 }
    }

    console.log('[JOB] Starting Alert Evaluator (Beta Hardened)...')
    const supabaseAdmin = createSupabaseAdmin()

    // 1. Fetch Active Alerts
    // Optimization: Filter out alerts that triggered recently via SQL not possible efficiently without join.
    // So we fetch active and filter in memory or join.
    // For MVP Beta: Fetch active alerts is fine (low volume).
    const { data: alerts } = await supabaseAdmin
        .from('alerts')
        .select('*, products(name), wishes(title)')
        .eq('is_active', true)

    if (!alerts) return { alertsProcessed: 0, eventsTriggered: 0 }

    let triggeredCount = 0

    for (const alert of alerts) {
        // [HARDENING] Cooldown Check
        // Default cooldown: 60 minutes
        const cooldownMinutes = alert.cooldown_minutes || 60
        if (alert.last_triggered_at) {
            const last = new Date(alert.last_triggered_at).getTime()
            const now = new Date().getTime()
            const diffMins = (now - last) / 60000

            if (diffMins < cooldownMinutes) {
                // In cooldown, skip
                continue
            }
        }

        // Find best offer for the target
        let query = supabaseAdmin
            .from('offers')
            .select('*, shops(name)')
            .eq('is_available', true)
            .order('price', { ascending: true })
            .limit(1)

        if (alert.product_id) {
            query = query.eq('product_id', alert.product_id)
        } else if (alert.wish_id) {
            // Beta Limitation: Wish alerts supported?
            // If logic complex, skip for stability.
            // Let's assume unsupported for now to avoid errors.
            continue
        }

        const { data: offers } = await query
        const bestOffer = offers?.[0]

        if (!bestOffer) continue

        // Check Trigger Condition
        let shouldTrigger = false
        if (alert.type === 'price' && bestOffer.price <= alert.target_value) {
            shouldTrigger = true
        }

        if (shouldTrigger) {
            // [HARDENING] Deduplication Check
            // Did we already send THIS specific offer recently?
            // "Don't tell me about the same offer twice in a row"
            // Check last event for this alert_id
            const { data: lastEvent } = await supabaseAdmin
                .from('alert_events')
                .select('offer_id')
                .eq('alert_id', alert.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (lastEvent && lastEvent.offer_id === bestOffer.id) {
                // Same offer as last time. 
                // Only re-trigger if price DROPPED further?
                // For Beta stability: suppress duplicate offer alerts.
                continue
            }

            // Create Event payload structure
            const payload = {
                price: bestOffer.price,
                shop: bestOffer.shops.name,
                url: bestOffer.url
            }

            // DB Insert
            const { error } = await supabaseAdmin.from('alert_events').insert({
                alert_id: alert.id,
                offer_id: bestOffer.id,
                payload
            })

            if (error) {
                console.error('[JOB] Failed to insert alert event:', error)
                continue
            }

            // Dispatch Notification
            try {
                await sendAlert('push', {
                    title: `Alerta de Preço: ${alert.products?.name || 'Item'}`,
                    body: `Preço atingiu R$ ${bestOffer.price}! (${bestOffer.shops.name})`,
                    data: { url: bestOffer.url }
                })
            } catch (err) {
                console.error('[JOB] Dispatch failed:', err)
                // Consume error, don't crash job loop
            }

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
