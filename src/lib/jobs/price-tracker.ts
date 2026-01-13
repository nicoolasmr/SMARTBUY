import { createSupabaseAdmin } from "@/lib/supabase/admin"
import { sendAlert } from "@/lib/notifications/dispatcher"

// [BETA] Hardened Price Tracker Job
// 1. Uses Secure Admin Client (Throws if no key)
// 2. Uses Keyset Pagination on (last_checked_at, id) for rotation
// 3. NO RANDOM PRICES in Beta (Stub Logic) outside DEV
// 4. [OPS] Uses Distributed Lock to prevent concurrency

export async function runPriceTrackingJob() {
    const JOB_ID = `job_${Date.now()}`

    // 0. Safety Kill Switch
    if (process.env.ENABLE_JOBS === 'false' || process.env.ENABLE_PRICE_TRACKER === 'false') {
        console.log(`[JOB:${JOB_ID}][WARN] Price Tracker disabled via feature flag.`)
        return { processed: 0 }
    }

    // 1. Setup
    console.log(`[JOB:${JOB_ID}][START] Price Tracker`)
    const supabaseAdmin = createSupabaseAdmin()

    // Configuration
    const MAX_BATCHES = 10
    const BATCH_SIZE = 100
    const MAX_TIME_MS = 40000 // 40s (Conservative buffer for 60s limit)
    // Lock TTL needs to be > MAX_TIME_MS. Let's safeguard with 90s.
    const LOCK_TTL_SEC = 90
    const JOB_NAME = 'price_tracker'

    // [OPS] Acquire Lock
    let hasLock = false
    try {
        const { data: acquired, error: lockError } = await supabaseAdmin.rpc('fn_acquire_job_lock', {
            p_job_name: JOB_NAME,
            p_locked_by: JOB_ID,
            p_ttl_seconds: LOCK_TTL_SEC
        })

        if (lockError) {
            console.error(`[JOB:${JOB_ID}][ERROR] Failed to call acquire lock RPC:`, lockError)
            return { processed: 0, error: "Lock Error" }
        }

        if (!acquired) {
            console.warn(`[JOB:${JOB_ID}][WARN] Job Lock held by another instance. Exiting.`)
            return { processed: 0, status: 'skipped_locked' }
        }
        hasLock = true
        console.log(`[JOB:${JOB_ID}][INFO] Lock acquired.`)
    } catch (err) {
        console.error(`[JOB:${JOB_ID}][ERROR] Exception acquiring lock:`, err)
        return { processed: 0 }
    }

    const startTime = Date.now()
    let processedCount = 0
    let changesCount = 0

    // Initial Cursor: Very old date to pick items never checked or checked long ago
    let cursorCheckedAt = '1970-01-01T00:00:00.000Z'
    let cursorId = '00000000-0000-0000-0000-000000000000'

    try {
        for (let i = 0; i < MAX_BATCHES; i++) {
            // Time Guard
            const duration = Date.now() - startTime
            if (duration > MAX_TIME_MS) {
                console.warn(`[JOB:${JOB_ID}][WARN] TIME_GUARD_BREAK after ${duration}ms.`)
                break;
            }

            console.log(`[JOB:${JOB_ID}][BATCH] ${i + 1}/${MAX_BATCHES} Cursor(checked=${cursorCheckedAt}, id=${cursorId})...`)

            // 2. Fetch Batch (Keyset Pagination)
            // Using last_checked_at to rotate queue without polluting updated_at
            const { data: offers, error } = await supabaseAdmin
                .from('offers')
                .select('id, price, freight, last_checked_at, url')
                .eq('is_available', true)
                // Keyset: (last_checked_at > cursor) OR (last_checked_at = cursor AND id > cursorId)
                .or(`last_checked_at.gt.${cursorCheckedAt},and(last_checked_at.eq.${cursorCheckedAt},id.gt.${cursorId})`)
                .order('last_checked_at', { ascending: true })
                .order('id', { ascending: true })
                .limit(BATCH_SIZE)

            if (error) {
                console.error(`[JOB:${JOB_ID}][ERROR] DB Error:`, error)
                throw error
            }

            if (!offers || offers.length === 0) {
                console.log(`[JOB:${JOB_ID}][INFO] No more offers pending update.`)
                break;
            }

            // 3. Process Batch
            const _updates = []

            for (const offer of offers) {
                // Check Price (Stub or Demo Random)
                const newPrice = await checkExternalPriceMock(offer.price)
                const now = new Date().toISOString()

                if (newPrice !== offer.price) {
                    // Actual Price Change: Update price + updated_at + last_checked_at
                    await supabaseAdmin
                        .from('offers')
                        .update({
                            price: newPrice,
                            updated_at: now,
                            last_checked_at: now
                        })
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
                    // Stable: Just bump last_checked_at to rotate in queue
                    // NO POLLUTION of updated_at
                    await supabaseAdmin
                        .from('offers')
                        .update({ last_checked_at: now })
                        .eq('id', offer.id)
                }
            }

            processedCount += offers.length

            // Update Cursor
            const lastItem = offers[offers.length - 1]
            // Use fallback if last_checked_at is null (though migration defaults to NOW)
            cursorCheckedAt = lastItem.last_checked_at || '1970-01-01T00:00:00.000Z'
            cursorId = lastItem.id

            if (offers.length < BATCH_SIZE) break;
        }
    } catch (err) {
        console.error(`[JOB:${JOB_ID}][ERROR] Fatal:`, err)
    } finally {
        // [OPS] Release Lock
        if (hasLock) {
            try {
                await supabaseAdmin.rpc('fn_release_job_lock', {
                    p_job_name: JOB_NAME,
                    p_locked_by: JOB_ID
                })
                console.log(`[JOB:${JOB_ID}][INFO] Lock released.`)
            } catch (unlockErr) {
                console.error(`[JOB:${JOB_ID}][ERROR] Failed to release lock:`, unlockErr)
            }
        }
    }

    const totalDuration = Date.now() - startTime
    console.log(`[JOB:${JOB_ID}][END] Processed=${processedCount}, Changes=${changesCount}, Duration=${totalDuration}ms`)

    return { processed: processedCount }
}

// [BETA] Strict Price Adapter Stub
async function checkExternalPriceMock(currentPrice: number): Promise<number> {
    // REQUIREMENT: Random price only if flag explicitly TRUE AND in DEV
    const isDemoMode = process.env.ENABLE_DEMO_PRICE_FLUCTUATION === 'true'
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDemoMode || !isDev) {
        // PRODUCTION/BETA: Stable. Never random.
        if (isDemoMode && !isDev) {
            console.warn('[WARN] ENABLE_DEMO_PRICE_FLUCTUATION active but ignored (NOT Development).')
        }
        return currentPrice
    }

    // DEMO MODE (Dev Only): 10% chance of fluctuation
    const isStable = Math.random() > 0.1
    if (isStable) return currentPrice

    const change = (Math.random() * 0.10) - 0.05 // +/- 5%
    return Number((currentPrice * (1 + change)).toFixed(2))
}

export async function runAlertEvaluatorJob() {
    const JOB_ID = `alert_${Date.now()}`

    // 0. Safety Kill Switch
    if (process.env.ENABLE_JOBS === 'false' || process.env.ENABLE_ALERT_EVALUATOR === 'false') {
        console.log(`[JOB:${JOB_ID}][WARN] Alert Evaluator disabled via feature flag.`)
        return { alertsProcessed: 0, eventsTriggered: 0 }
    }

    console.log(`[JOB:${JOB_ID}][START] Alert Evaluator`)
    const supabaseAdmin = createSupabaseAdmin()

    // [OPS] Distributed Lock
    const LOCK_TTL_SEC = 90
    const JOB_NAME = 'alert_evaluator'
    let hasLock = false
    try {
        const { data: acquired, error: lockError } = await supabaseAdmin.rpc('fn_acquire_job_lock', {
            p_job_name: JOB_NAME,
            p_locked_by: JOB_ID,
            p_ttl_seconds: LOCK_TTL_SEC
        })

        if (lockError) {
            console.error(`[JOB:${JOB_ID}][ERROR] Lock RPC failed:`, lockError)
            return { alertsProcessed: 0, eventsTriggered: 0, error: 'Lock Error' }
        }
        if (!acquired) {
            console.warn(`[JOB:${JOB_ID}][WARN] Locked by another instance. Exiting.`)
            return { alertsProcessed: 0, eventsTriggered: 0, status: 'skipped_locked' }
        }
        hasLock = true
    } catch (e) {
        console.error(`[JOB:${JOB_ID}][ERROR] Exception acquiring lock:`, e)
        return { alertsProcessed: 0, eventsTriggered: 0 }
    }

    try {
        // 1. Fetch Active Alerts
        const { data: alerts, error } = await supabaseAdmin
            .from('alerts')
            .select('*, products(name), wishes(title)')
            .eq('is_active', true)

        if (error) {
            console.error(`[JOB:${JOB_ID}][ERROR] Failed to fetch alerts:`, error)
        } else if (alerts && alerts.length > 0) {
            let triggeredCount = 0

            for (const alert of alerts) {
                // [HARDENING] 1. Global Cooldown Check (Alert Level)
                const cooldownMinutes = alert.cooldown_minutes || 60
                if (alert.last_triggered_at) {
                    const last = new Date(alert.last_triggered_at).getTime()
                    const now = new Date().getTime()
                    const diffMins = (now - last) / 60000

                    if (diffMins < cooldownMinutes) {
                        // In cooldown, skip checking
                        continue
                    }
                }

                // 2. Find Best Offer
                let query = supabaseAdmin
                    .from('offers')
                    .select('*, shops(name)')
                    .eq('is_available', true)
                    .order('price', { ascending: true })
                    .limit(1)

                if (alert.product_id) {
                    query = query.eq('product_id', alert.product_id)
                } else if (alert.wish_id) {
                    continue // Wish alerts skipped in Beta
                }

                const { data: offers } = await query
                const bestOffer = offers?.[0]

                if (!bestOffer) continue

                // 3. Check Condition
                let shouldTrigger = false
                if (alert.type === 'price' && bestOffer.price <= alert.target_value) {
                    shouldTrigger = true
                }

                if (shouldTrigger) {
                    // [HARDENING] 4. Window Deduplication Check (Event Level)
                    const dedupeWindowMins = cooldownMinutes
                    const cutoffDate = new Date(Date.now() - (dedupeWindowMins * 60000)).toISOString()

                    const { data: recentEvents } = await supabaseAdmin
                        .from('alert_events')
                        .select('id')
                        .eq('alert_id', alert.id)
                        .eq('offer_id', bestOffer.id)
                        .gt('triggered_at', cutoffDate)
                        .limit(1)

                    if (recentEvents && recentEvents.length > 0) {
                        console.log(`[JOB:${JOB_ID}][INFO] Suppressed duplicate alert for Offer ${bestOffer.id} (Window Dedupe)`)
                        continue
                    }

                    // 5. Create Event & Dispatch
                    const payload = {
                        price: bestOffer.price,
                        shop: bestOffer.shops.name,
                        url: bestOffer.url
                    }

                    const { error: dbError } = await supabaseAdmin.from('alert_events').insert({
                        alert_id: alert.id,
                        offer_id: bestOffer.id,
                        payload,
                        triggered_at: new Date().toISOString()
                    })

                    if (dbError) {
                        console.error(`[JOB:${JOB_ID}][ERROR] DB Insert failed:`, dbError)
                        continue
                    }

                    try {
                        // Dispatch
                        await sendAlert('push', {
                            title: `Alerta de Preço: ${alert.products?.name || 'Item'}`,
                            body: `Preço atingiu R$ ${bestOffer.price}! (${bestOffer.shops.name})`,
                            data: { url: bestOffer.url }
                        })

                        // Update Alert Timestamp
                        await supabaseAdmin
                            .from('alerts')
                            .update({ last_triggered_at: new Date().toISOString() })
                            .eq('id', alert.id)

                        triggeredCount++
                        console.log(`[JOB:${JOB_ID}][SUCCESS] Alert Triggered: ${alert.id} -> R$ ${bestOffer.price}`)

                    } catch (err) {
                        console.error(`[JOB:${JOB_ID}][ERROR] Dispatch failed (Event persited):`, err)
                    }
                }
            }
            console.log(`[JOB:${JOB_ID}][END] Alerts Processed=${alerts.length}, Triggered=${triggeredCount}`)
            return { alertsProcessed: alerts.length, eventsTriggered: triggeredCount }
        } else {
            console.log(`[JOB:${JOB_ID}][INFO] No active alerts found.`)
            return { alertsProcessed: 0, eventsTriggered: 0 }
        }
    } finally {
        // [OPS] Release Lock
        if (hasLock) {
            try {
                await supabaseAdmin.rpc('fn_release_job_lock', {
                    p_job_name: JOB_NAME,
                    p_locked_by: JOB_ID
                })
            } catch (e) {
                console.error(`[JOB:${JOB_ID}][ERROR] Release lock failed:`, e)
            }
        }
    }

    return { alertsProcessed: 0, eventsTriggered: 0 } // Fallback return
}
