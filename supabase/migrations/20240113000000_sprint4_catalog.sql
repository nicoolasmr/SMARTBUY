-- Create products table (Global)
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    reputation_score NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create offers table (Global)
CREATE TABLE IF NOT EXISTS public.offers (
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
CREATE TABLE IF NOT EXISTS public.offer_price_history (
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
CREATE INDEX IF NOT EXISTS idx_products_ean ON public.products(ean_normalized);
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON public.offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_shop_id ON public.offers(shop_id);
CREATE INDEX IF NOT EXISTS idx_offer_history_offer_id ON public.offer_price_history(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_history_captured_at ON public.offer_price_history(captured_at);

-- RLS Policies

-- PRODUCTS
-- Everyone can read
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only Ops/Admin can write
DROP POLICY IF EXISTS "Ops can insert products" ON public.products;
CREATE POLICY "Ops can insert products" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );

DROP POLICY IF EXISTS "Ops can update products" ON public.products;
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
DROP POLICY IF EXISTS "Public read access for shops" ON public.shops;
CREATE POLICY "Public read access for shops" ON public.shops
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Ops can manage shops" ON public.shops;
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
DROP POLICY IF EXISTS "Public read access for offers" ON public.offers;
CREATE POLICY "Public read access for offers" ON public.offers
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Ops can manage offers" ON public.offers;
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
-- Ops/Admin Only for now
DROP POLICY IF EXISTS "Ops read access for history" ON public.offer_price_history;
CREATE POLICY "Ops read access for history" ON public.offer_price_history
    FOR SELECT
    USING (
         EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND app_role IN ('ops', 'admin')
        )
    );
    
DROP POLICY IF EXISTS "Ops insert access for history" ON public.offer_price_history;
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
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
