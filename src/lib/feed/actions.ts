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

    let feedItems: FeedItem[] = []
    const seenProductIds = new Set<string>()

    // [FALLBACK] Discovery Mode: If no personal matches, show "SmartBuy Selection"
    if (!candidates || candidates.length === 0) {
        let discoveryProducts: any[] | null = null;

        try {
            // 1. Try Profile-Based Recommendations
            const userPrefs = (profile as any)?.preferences || {}
            // Safe access to potential nested props
            const lifeStage = userPrefs?.life_stage || ''
            const tags = Array.isArray(userPrefs?.tags) ? userPrefs.tags : []

            // Build Base Query
            let profileQuery = supabase
                .from('products')
                .select(`
                    *,
                    offers!inner (
                        id, price, url, is_available,
                        shops (id, name, reputation_score),
                        offer_risk_scores (bucket, score, reasons)
                    )
                `)
                .limit(10)

            // Simple Mapping Logic
            const categoriesOfInterest: string[] = []
            if (tags.includes('premium')) { /* Logic could be price > X */ }
            if (tags.includes('tech') || tags.includes('gamer')) categoriesOfInterest.push('Eletrônicos', 'Home Office')
            if (tags.includes('fitness')) categoriesOfInterest.push('Suplementos', 'Fitness')
            if (lifeStage === 'familia_pequena' || lifeStage === 'familia_grande') categoriesOfInterest.push('Bebê', 'Casa', 'Cozinha')
            if (lifeStage === 'casal') categoriesOfInterest.push('Casa', 'Cozinha')

            // If we have categories, filter. Else, skip specific filter to get generic mix
            if (categoriesOfInterest.length > 0) {
                profileQuery = profileQuery.in('category', categoriesOfInterest)
            }

            const { data, error } = await profileQuery
            if (!error && data) {
                discoveryProducts = data
            } else if (error) {
                console.warn('Profile Discovery Query Failed (Non-fatal):', error)
            }
        } catch (err) {
            console.error('Profile Discovery Logic Exception:', err)
            // Swallow error to allow generic fallback
        }

        // If profile yielded nothing (or no profile), fallback to generic random
        if (!discoveryProducts || discoveryProducts.length === 0) {
            try {
                const { data: genericProducts } = await supabase
                    .from('products')
                    .select(`
                    *,
                    offers!inner (
                        id, price, url, is_available,
                        shops (id, name, reputation_score),
                        offer_risk_scores (bucket, score, reasons)
                    )
                `)
                    .limit(10)
                discoveryProducts = genericProducts
            } catch (err) {
                console.error('Generic Discovery Falback Failed:', err)
            }
        }

        if (discoveryProducts) {
            const discoveryItems: FeedItem[] = discoveryProducts.map((p: any) => {
                // Find best offer (cheapest)
                const sortedOffers = (p.offers || []).sort((a: any, b: any) => a.price - b.price)
                const best = sortedOffers[0]

                if (!best) return null

                // Determine reason based on profile match
                // Re-derive categories of interest safely for checking
                const userPrefs = (profile as any)?.preferences || {}
                const lifeStage = userPrefs?.life_stage || ''
                const tags = Array.isArray(userPrefs?.tags) ? userPrefs.tags : []
                const categoriesOfInterest: string[] = []
                if (tags.includes('tech') || tags.includes('gamer')) categoriesOfInterest.push('Eletrônicos', 'Home Office')
                // ... (simplified check for UI label)

                const isProfileMatch = categoriesOfInterest.includes(p.category)
                // Use a simpler check for reasons to avoid re-running complex logic
                const reasons = isProfileMatch
                    ? ['Baseado no seu perfil', `Destaque em ${p.category}`]
                    : ['Sugestão SmartBuy', 'Descubra novidades']

                return {
                    type: 'product_recommendation',
                    product: {
                        id: p.id,
                        name: p.name,
                        brand: p.brand,
                        ean_normalized: p.ean_normalized,
                        category: p.category,
                        attributes: p.attributes
                    },
                    bestOffer: {
                        id: best.id,
                        price: best.price,
                        url: best.url,
                        shops: best.shops,
                        offer_risk_scores: best.offer_risk_scores?.[0]
                    },
                    reasons: reasons,
                    matchScore: isProfileMatch ? 70 : 50
                }
            }).filter(Boolean) as FeedItem[]

            return { data: discoveryItems }
        }
        return { data: [] }
    }

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
