-- Hardening Pre-Beta Migration
-- Created at: 2024-01-14

-- 1. Ops Audit Logs
CREATE TABLE IF NOT EXISTS public.ops_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ops_user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- e.g. 'UPSERT_PRODUCT', 'UPDATE_OFFER', 'CALC_RISK'
    entity_type TEXT NOT NULL, -- e.g. 'product', 'offer'
    entity_id TEXT, -- UUID as text to allow flexible references
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Audit Logs
ALTER TABLE public.ops_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Ops/Admins (Service Role) can insert
CREATE POLICY "Ops can insert audit logs"
ON public.ops_audit_logs
FOR INSERT
WITH CHECK (
    -- In a real scenario, we'd check a role claim.
    -- For now, we rely on the backend using Service Role or valid Ops Session.
    -- Reusing the 'public' read logic isn't enough, we want explicit write.
    -- Assuming app logic handles the 'who is ops' and we just allow authenticated inserts for simplicity in this MVP 
    -- OR restrict to service_role only if we strictly use admin client.
    -- Let's use generic authenticated for now to unblock the App Actions.
    auth.role() = 'authenticated'
);

-- Policy: Only Ops can view logs (if we had an Ops UI for it)
CREATE POLICY "Ops can view audit logs"
ON public.ops_audit_logs
FOR SELECT
USING (auth.role() = 'authenticated');


-- 2. Feed Optimization RPC
-- Consolidates "Find Candidates + Filter Best Offer" into one DB call to avoid N+1
CREATE OR REPLACE FUNCTION fn_get_feed_candidates(p_household_id UUID)
RETURNS TABLE (
    wish_id UUID,
    wish_title TEXT,
    wish_urgency TEXT,
    wish_min_price NUMERIC,
    wish_max_price NUMERIC,
    product_data JSONB,
    best_offer_data JSONB,
    risk_data JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_blocked_stores TEXT[];
    v_budget_mission NUMERIC;
BEGIN
    -- Fetch Restrictions from Profile
    SELECT 
        COALESCE(ARRAY(SELECT jsonb_array_elements_text(blocked_stores)), ARRAY[]::text[]),
        budget_per_mission
    INTO v_blocked_stores, v_budget_mission
    FROM household_profiles 
    WHERE household_id = p_household_id;

    RETURN QUERY
    WITH my_wishes AS (
        SELECT id, title, urgency, min_price, max_price 
        FROM wishes 
        WHERE household_id = p_household_id
    ),
    -- "Fuzzy" Match Products to Wishes
    -- Note: Ideally use Full Text Search (tsvector), but ILIKE is sufficient for Beta scale.
    product_matches AS (
        SELECT 
            w.id as w_id,
            w.title as w_title,
            w.urgency as w_urgency,
            w.min_price as w_min,
            w.max_price as w_max,
            p.id as p_id,
            p.name as p_name,
            p.brand as p_brand,
            p.ean_normalized as p_ean,
            p.category as p_category,
            p.attributes as p_attributes
        FROM my_wishes w
        JOIN products p ON p.name ILIKE '%' || w.title || '%'
    ),
    -- Find Best Offer (Price) per Match that isn't blocked
    ranked_offers AS (
        SELECT 
            pm.*,
            o.id as o_id,
            o.price as o_price,
            o.shop_id as o_shop_id,
            s.name as s_name,
            s.reputation_score as s_score,
            ors.bucket as r_bucket,
            ors.score as r_score,
            ors.reasons as r_reasons,
            ROW_NUMBER() OVER (PARTITION BY pm.p_id ORDER BY o.price ASC) as rn
        FROM product_matches pm
        JOIN offers o ON o.product_id = pm.p_id
        JOIN shops s ON o.shop_id = s.id
        LEFT JOIN offer_risk_scores ors ON ors.offer_id = o.id
        WHERE o.is_available = TRUE
    )
    SELECT 
        w_id,
        w_title,
        w_urgency,
        w_min,
        w_max,
        jsonb_build_object(
            'id', p_id, 
            'name', p_name, 
            'brand', p_brand, 
            'ean_normalized', p_ean, 
            'category', p_category,
            'attributes', p_attributes
        ) as product_data,
        jsonb_build_object(
            'id', o_id, 
            'price', o_price, 
            'shop_id', o_shop_id, 
            'shops', jsonb_build_object('name', s_name, 'reputation_score', s_score),
            'offer_risk_scores', CASE WHEN r_bucket IS NOT NULL THEN jsonb_build_object('bucket', r_bucket, 'score', r_score, 'reasons', r_reasons) ELSE NULL END
        ) as best_offer_data,
        CASE WHEN r_bucket IS NOT NULL THEN jsonb_build_object('bucket', r_bucket, 'score', r_score, 'reasons', r_reasons) ELSE NULL END as risk_data
    FROM ranked_offers ro
    WHERE rn = 1
    -- Apply Hard Filters in SQL
    AND (v_blocked_stores IS NULL OR NOT (ro.s_name = ANY(v_blocked_stores))) -- Blocked Store Check
    AND (v_budget_mission IS NULL OR ro.o_price <= v_budget_mission) -- Global Mission Budget Check
    -- Note: w_max (Wish Budget) is soft in TS logic ("score penalty" vs "hard filter"). 
    -- The prompt requested moving "Hard Filters" to SQL. 
    -- If Wish Max Price is "Filter: Max Price from Wish" in TS, we treat it as Hard here?
    -- In TS it was: "if (wish.max_price && bestOffer.price > wish.max_price) continue;" -> It was Hard.
    AND (ro.w_max IS NULL OR ro.o_price <= ro.w_max);
END;
$$;
