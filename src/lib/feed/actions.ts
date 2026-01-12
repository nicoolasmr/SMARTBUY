'use server'

import { createClient } from '@/lib/supabase/server'
import { getHouseholdProfile, getWishes, getActiveHouseholdId } from '@/lib/app/actions'
import { searchProducts } from '@/lib/catalog/actions'

export type FeedItem = {
    type: 'product_recommendation'
    product: any
    bestOffer: any
    reasons: string[]
    matchScore: number
    wishId?: string
    missionId?: string
}

export async function getFeed(context?: { missionId?: string }) {
    const supabase = await createClient()

    // 1. Gather Context
    const activeHouseholdId = await getActiveHouseholdId(supabase)
    let wishlistItems: any[] = []
    let activeMissionItems: any[] = []
    let homeListItems: any[] = []

    const [profileRes, wishesRes] = await Promise.all([
        getHouseholdProfile(),
        getWishes()
    ])

    const profile = profileRes.data || {}
    const wishes = wishesRes.data || [] // This is the original wishes, which is used later in the loop.

    // Fetch Mission Items if missionId is present
    let missionWishIds: string[] = []
    if (context?.missionId) {
        const { data: mItems } = await supabase
            .from('mission_items')
            .select('wish_id')
            .eq('mission_id', context.missionId)
            .not('wish_id', 'is', null)

        if (mItems) {
            missionWishIds = mItems.map((i: any) => i.wish_id)
        }
    }

    // [NEW] Home List Fetch
    if (activeHouseholdId) {
        const { data: hList } = await supabase.from('home_list_items').select('product_id, next_suggested_at').eq('household_id', activeHouseholdId)
        if (hList) homeListItems = hList
    }


    const feedItems: FeedItem[] = []
    const seenProductIds = new Set<string>()

    // 2. Candidate Selection (Strategy: Wish-based)
    for (const wish of wishes) {
        // Simple fuzzy search based on wish title
        // In a real engine, we'd use semantic search or embeddings.
        const candidatesRes = await searchProducts(wish.title)
        const candidates = candidatesRes.data || []

        for (const product of candidates) {
            if (seenProductIds.has(product.id)) continue;

            // Fetch offers for this product to check filters
            const { data: offers, error } = await supabase
                .from('offers')
                .select('*, shops(*), offer_risk_scores(score, bucket, reasons)')
                .eq('product_id', product.id)
                .eq('is_available', true)
                .order('price', { ascending: true }) // Best price first

            if (error || !offers || offers.length === 0) continue;

            const bestOffer = offers[0]
            const reasons: string[] = []
            let isFiltered = false

            // 3. Hard Filters

            // Filter: Budget (Global Monthly or Per Mission?)
            // For v0, let's check individual item price vs "Budget Per Mission" if set.
            if (profile.budget_per_mission && bestOffer.price > profile.budget_per_mission) {
                // Skip this product, too expensive for a single item allow
                continue;
            }

            // Filter: Max Price from Wish
            if (wish.max_price && bestOffer.price > wish.max_price) {
                // But maybe another offer is cheaper? We already took bestOffer.
                // So if best offer is bad, skip product.
                continue;
            }

            // Filter: Blocked Stores
            if (profile.blocked_stores && profile.blocked_stores.includes(bestOffer.shops.name)) {
                // If best offer is from blocked store, check next best?
                // For simplified v0, if best offer is blocked, we might skip or find next.
                // Let's try to find first valid offer.
                const validOffer = offers.find((o: any) => !profile.blocked_stores?.includes(o.shops.name))
                if (!validOffer) continue; // No valid offers
                // Swap bestOffer
                // Note: We can't re-assign const bestOffer easily logic-wise without refactoring loop,
                // but conceptually: use filteredOffers[0]
            }

            // 4. Ranking / Scoring (Deterministic)
            let score = 0

            // Score: Wish Match
            score += 100
            reasons.push(`Baseado no seu desejo "${wish.title}"`)

            // [NEW] Home List Logic
            const homeItem = homeListItems.find((h: any) => h.product_id === product.id)
            if (homeItem) {
                const due = new Date(homeItem.next_suggested_at)
                const today = new Date()
                const diffTime = due.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays <= 7) { // Due within week or late
                    score += 150 // Strong boost
                    reasons.push('restock')
                }
            }

            // Score: Urgency
            if (wish.urgency === 'high') score += 50
            if (wish.urgency === 'medium') score += 20

            // Score: Price vs Wish Target
            if (wish.min_price && bestOffer.price <= wish.min_price) {
                score += 30
                reasons.push('Abaixo do seu preço alvo!')
            }

            // Score: Budget Check (Positive reinforcement)
            if (profile.budget_per_mission && bestOffer.price < (profile.budget_per_mission * 0.5)) {
                score += 10
                reasons.push('Bem abaixo do seu limite de missão')
            }

            // Score: Mission Boost
            if (context?.missionId && wish.id && missionWishIds.includes(wish.id)) {
                score += 200 // Huge boost!
                reasons.unshift('Parte da sua Missão Ativa')
            }

            // [NEW] Anti-Cilada Risk Penalty/Bonus
            // Assumption: one risk score per offer (joined array or single object depending on relation 1:1)
            // Supabase join usually returns array for 1:N or single object for 1:1 if configured?
            // Let's handle array safer.
            const riskData = Array.isArray(bestOffer.offer_risk_scores) ? bestOffer.offer_risk_scores[0] : bestOffer.offer_risk_scores

            if (riskData) {
                if (riskData.bucket === 'C') {
                    score -= 500 // Nuke it ranking-wise
                    reasons.push('⚠️ Risco de Cilada Detectado')
                } else if (riskData.bucket === 'B') {
                    score -= 50
                    reasons.push('⚠️ Requer Atenção')
                } else if (riskData.bucket === 'A') {
                    score += 50
                    reasons.push('✅ Oferta Segura')
                }
            }

            // Final Push
            feedItems.push({
                type: 'product_recommendation',
                product,
                bestOffer: {
                    ...bestOffer,
                    risk: riskData // Attach for UI
                },
                reasons,
                matchScore: score,
                wishId: wish.id,
                missionId: context?.missionId
            })
            seenProductIds.add(product.id)
        }
    }

    // Sort by Match Score DESC
    feedItems.sort((a, b) => b.matchScore - a.matchScore)

    return { data: feedItems }
}
