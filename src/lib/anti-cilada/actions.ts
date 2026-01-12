'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock Bad List (e.g., shops known for issues)
const BAD_REPUTATION_SHOPS = ['FakeStore', 'ScamMart', 'LojaProblematica']

export async function calculateRiskScore(offerId: string) {
    const supabase = await createClient()

    // 1. Fetch Offer Data
    const { data: offer } = await supabase
        .from('offers')
        .select('*, shops(name), products(name)')
        .eq('id', offerId)
        .single()

    if (!offer) return null

    // 2. Fetch History (Volatility Check)
    const { data: history } = await supabase
        .from('offer_price_history')
        .select('price, recorded_at')
        .eq('offer_id', offerId)
        .order('recorded_at', { ascending: false })
        .limit(10) // Last 10 points

    let score = 100
    const reasons: string[] = []

    // --- Heuristic 1: Shop Reputation (Mock) ---
    if (offer.shops?.name && BAD_REPUTATION_SHOPS.includes(offer.shops.name)) {
        score -= 40
        reasons.push('Loja com reputação duvidosa')
    }

    // --- Heuristic 2: Price Volatility ---
    if (history && history.length >= 2) {
        const currentPrice = offer.price
        // Check if price increased significantly recently before dropping (fake promo)
        // Simple check: variance?
        // Or check if current price is > average of last week? 
        // Let's check: If max price in history was > 50% higher than min price in short window -> Volatile
        const prices = history.map((h: any) => h.price)
        const maxP = Math.max(...prices)
        const minP = Math.min(...prices)

        if (maxP > minP * 1.5) {
            score -= 15
            reasons.push('Alta volatilidade de preço recente')
        }
    }

    // --- Heuristic 3: Suspiciously Low Price (Anti-Scam) ---
    // If we had an "Average Market Price" for product, we could compare.
    // For now, let's assume we don't have global avg easy access here without heavy query.
    // Skipping for MVP v0 efficiency.

    // Bucket Logic
    let bucket: 'A' | 'B' | 'C' = 'A'
    if (score < 60) bucket = 'C'
    else if (score < 80) bucket = 'B'

    return { score: Math.max(0, score), bucket, reasons }
}

export async function upsertRiskScore(offerId: string) {
    // Note: In real world, this needs Service Role since users can't write to risk scores.
    // We simulate using standard client if we assume it's triggered by Ops (who has policies?)
    // Or we use the job helper `getAdminClient`.
    // For this Server Action triggered by Ops UI, we rely on authenticated Ops user having permissions?
    // Actually our migration said "Service Write". So standard user (even ops) might fail if RLS blocks.
    // Let's assume we use SERVICE_KEY or RLS allows Ops.
    // For now, as we did with Jobs, let's use the Environment key if available for "Sudo" actions.

    const SUBS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Fallback to client if no key, but warn
    let sbAdmin
    if (SERVICE_KEY) {
        const { createClient: createAdmin } = require('@supabase/supabase-js')
        sbAdmin = createAdmin(SUBS_URL, SERVICE_KEY)
    } else {
        sbAdmin = await createClient() // Might fail RLS
    }

    const result = await calculateRiskScore(offerId)
    if (!result) return { error: 'Offer not found' }

    const { error } = await sbAdmin
        .from('offer_risk_scores')
        .upsert({
            offer_id: offerId,
            score: result.score,
            bucket: result.bucket,
            reasons: result.reasons,
            calculated_at: new Date().toISOString()
        }, { onConflict: 'offer_id' })

    if (error) return { error: error.message }

    revalidatePath('/ops/offers')
    return { success: true, ...result }
}
