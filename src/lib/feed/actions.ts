'use server'

import { createClient } from '@/lib/supabase/server'
import { getHouseholdProfile, getActiveHouseholdId } from '@/lib/app/actions'
// import { getWishes } from '@/lib/app/actions'
// import { searchProducts } from '@/lib/catalog/actions'

export type FeedProduct = {
    id: string
    name: string
    brand?: string
    ean_normalized: string
    category?: string
    attributes?: Record<string, unknown>
}

export type FeedOffer = {
    id: string
    price: number
    url: string
    shops: {
        id: string
        name: string
        logo_url?: string
        reputation_score?: number
    }
    freight?: number
    delivery_days?: number
    offer_risk_scores?: {
        bucket: 'A' | 'B' | 'C'
        score: number
        reasons: string[]
    }
}

export type FeedItem = {
    type: 'product_recommendation'
    product: FeedProduct
    bestOffer: FeedOffer & { risk?: FeedOffer['offer_risk_scores'] }
    reasons: string[]
    matchScore: number
    wishId?: string
    missionId?: string
}

type RPCFeedCandidate = {
    w_id: string
    w_title: string
    w_urgency: 'high' | 'medium' | 'low'
    w_min_price?: number
    w_max_price?: number
    product_data: FeedProduct
    best_offer_data: FeedOffer
    risk_data?: FeedOffer['offer_risk_scores']
}


import { track } from '@/lib/analytics/track'

export async function getFeed(context?: { missionId?: string }) {
    const supabase = await createClient()

    // 1. Gather Context
    const activeHouseholdId = await getActiveHouseholdId(supabase)
    if (!activeHouseholdId) return { data: [] }

    // [ANALYTICS]
    // Fire & Forget
    track('feed_viewed', { householdId: activeHouseholdId, payload: { missionId: context?.missionId } })

    // Parallel Fetching for JS-side Scoring Context
    const [profileRes, homeListRes, missionItemsRes] = await Promise.all([
        getHouseholdProfile(),
        supabase.from('home_list_items').select('product_id, next_suggested_at').eq('household_id', activeHouseholdId),
        context?.missionId
            ? supabase.from('mission_items').select('wish_id').eq('mission_id', context.missionId).not('wish_id', 'is', null)
            : Promise.resolve({ data: [] })
    ])

    const profile = profileRes.data || {}
    const homeListItems = homeListRes.data || []
    const missionWishIds = (missionItemsRes.data || []).map((i) => i.wish_id)

    // 2. RPC Call - [Hardening] Use SQL to filter candidates and join data efficiently
    const { data: candidates, error } = await supabase.rpc('fn_get_feed_candidates', { p_household_id: activeHouseholdId })

    if (error) {
        console.error('Feed RPC Error:', error)
        // Fallback or empty? Empty for now, safety.
        return { data: [] }
    }

    if (!candidates) return { data: [] }

    const feedItems: FeedItem[] = []
    const seenProductIds = new Set<string>()

    // 3. Scoring & Logic (JS Side - Keeping transparency)
    // Cast strict type to RPC result
    const rpcCandidates = (candidates || []) as unknown as RPCFeedCandidate[]

    for (const item of rpcCandidates) {
        const product = item.product_data

        // Ensure bestOffer has the structure UI expects
        // RPC returns standardized snake_case usually if raw, but here likely json properties if jsonb.
        const bestOffer = item.best_offer_data
        const riskData = item.risk_data

        // RPC returns JSON objects, keys are preserved as built in SQL jsonb_build_object.
        // bestOffer: { id, price, shops: {...}, offer_risk_scores: {...} }

        if (seenProductIds.has(product.id)) continue;

        const reasons: string[] = []
        let score = 0

        // Derived from RPC columns
        const wishTitle = item.w_title
        const wishUrgency = item.w_urgency
        const wishMinPrice = item.w_min_price
        const wishId = item.w_id

        // Score: Wish Match
        score += 100
        reasons.push(`Baseado no seu desejo "${wishTitle}"`)

        // Score: Home List Logic
        const homeItem = homeListItems.find((h) => h.product_id === product.id)
        if (homeItem) {
            const due = new Date(homeItem.next_suggested_at)
            const today = new Date()
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays <= 7) {
                score += 150
                reasons.push('restock')
            }
        }

        // Score: Urgency
        if (wishUrgency === 'high') score += 50
        if (wishUrgency === 'medium') score += 20

        // Score: Price vs Wish Target
        if (wishMinPrice && bestOffer.price <= wishMinPrice) {
            score += 30
            reasons.push('Abaixo do seu preço alvo!')
        }

        // Score: Budget Check (Positive reinforcement)
        // Note: RPC did HARD filter on budget_per_mission. Here we do "Good Price" bonus.
        if (profile.budget_per_mission && bestOffer.price < (profile.budget_per_mission * 0.5)) {
            score += 10
            reasons.push('Bem abaixo do seu limite de missão')
        }

        // Score: Mission Boost
        if (context?.missionId && wishId && missionWishIds.includes(wishId)) {
            score += 200
            reasons.unshift('Parte da sua Missão Ativa')
        }

        // Score: Anti-Cilada Risk Penalty/Bonus
        if (riskData) {
            if (riskData.bucket === 'C') {
                score -= 500
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
                risk: riskData // Attach for UI compatibility
            },
            reasons,
            matchScore: score,
            wishId: wishId,
            missionId: context?.missionId
        })
        seenProductIds.add(product.id)
    }

    // Sort by Match Score DESC
    feedItems.sort((a, b) => b.matchScore - a.matchScore)

    return { data: feedItems }
}
