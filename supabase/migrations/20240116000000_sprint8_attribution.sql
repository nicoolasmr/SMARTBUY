-- Create attribution_links table
CREATE TABLE public.attribution_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create click_events table
CREATE TABLE public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribution_link_id UUID NOT NULL REFERENCES public.attribution_links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_agent TEXT
);

-- Create purchases table
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id),
    attribution_link_id UUID REFERENCES public.attribution_links(id),
    price_paid NUMERIC NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create receipt_uploads table
CREATE TABLE public.receipt_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create economy_daily table (Confirmed Savings)
CREATE TABLE public.economy_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
    economy_amount NUMERIC NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.attribution_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_daily ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_attribution_token ON public.attribution_links(token);
CREATE INDEX idx_purchases_household ON public.purchases(household_id);
CREATE INDEX idx_receipts_purchase ON public.receipt_uploads(purchase_id);
CREATE INDEX idx_economy_household ON public.economy_daily(household_id);

-- RLS Policies

-- Attribution: Users can create links for their household
CREATE POLICY "Users can create attribution links" ON public.attribution_links
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = attribution_links.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Attribution: Users can view their links
CREATE POLICY "Users can view attribution links" ON public.attribution_links
    FOR SELECT
    USING (
         EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = attribution_links.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Click Events: Users can insert (via server action ideally, but enabling for auth users for transparency)
-- Actually click events might happen anonymously if token is public? 
-- For now, assume protected tracking or public insert via link ID?
-- Let's allow INSERT for anyone if link exists (Server Action likely bypasses or handles this)
-- But for strict RLS: 
CREATE POLICY "Public insert for clicks" ON public.click_events
    FOR INSERT
    WITH CHECK (true); 

-- Purchases: Users manage their household purchases
CREATE POLICY "Users manage household purchases" ON public.purchases
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = purchases.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Receipts: Users manage uploads for their purchases
CREATE POLICY "Users manage receipts" ON public.receipt_uploads
    FOR ALL
    USING (
        EXISTS (
             SELECT 1 FROM public.purchases p
             JOIN public.household_members hm ON hm.household_id = p.household_id
             WHERE p.id = receipt_uploads.purchase_id
             AND hm.user_id = auth.uid()
        )
    );

-- Economy: Users view their savings
CREATE POLICY "Users view savings" ON public.economy_daily
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = economy_daily.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Triggers
CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
