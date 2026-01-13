-- Create products table (Global)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT,
    ean_normalized TEXT UNIQUE,
    category TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create shops table (Global)
CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    reputation_score NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create offers table (Global)
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    freight NUMERIC DEFAULT 0,
    delivery_days INT,
    url TEXT,
    reputation_score NUMERIC DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create offer_price_history table (Global)
CREATE TABLE public.offer_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    freight NUMERIC DEFAULT 0,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_price_history ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_products_ean ON public.products(ean_normalized);
CREATE INDEX idx_offers_product_id ON public.offers(product_id);
CREATE INDEX idx_offers_shop_id ON public.offers(shop_id);
CREATE INDEX idx_offer_history_offer_id ON public.offer_price_history(offer_id);
CREATE INDEX idx_offer_history_captured_at ON public.offer_price_history(captured_at);

-- RLS Policies

-- Helper function to check for Ops/Admin role (Mock for now, assumes metadata or specific user ID if needed, 
-- but for MVP we will allow specific emails or just rely on service role for writing. 
-- However, the requirement is "Ops/Admin", let's assume we check app_metadata -> role.
-- Note: Supabase auth.jwt() -> app_metadata -> role is standard).

-- PRODUCTS
-- Everyone can read
CREATE POLICY "Public read access for products" ON public.products
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only Ops/Admin can write (Simplified: checking if we want to restrict. 
-- For now, let's create a policy that simply denies everything unless you are a super user or we add specific logic.
-- Actually, the prompt says "INSERT / UPDATE / DELETE: somente profiles.app_role in ('ops','admin')". 
-- To check `profiles`, we need a join or subquery).

CREATE POLICY "Ops can insert products" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );

CREATE POLICY "Ops can update products" ON public.products
    FOR UPDATE
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );

-- SHOPS
CREATE POLICY "Public read access for shops" ON public.shops
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Ops can manage shops" ON public.shops
    FOR ALL
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );

-- OFFERS
CREATE POLICY "Public read access for offers" ON public.offers
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Ops can manage offers" ON public.offers
    FOR ALL
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );

-- PRICE HISTORY
-- Ops/Admin Only for now (as per prompt "SELECT: ops/admin")
CREATE POLICY "Ops read access for history" ON public.offer_price_history
    FOR SELECT
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );
    
CREATE POLICY "Ops insert access for history" ON public.offer_price_history
    FOR INSERT
    WITH CHECK (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );
    
-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
