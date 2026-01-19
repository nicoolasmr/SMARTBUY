
-- Fix: Missing home_list_items table
-- Date: 2026-01-16

CREATE TABLE IF NOT EXISTS public.home_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    frequency_days INTEGER DEFAULT 30,
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    next_suggested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.home_list_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_home_list_items_household_id ON public.home_list_items(household_id);
CREATE INDEX IF NOT EXISTS idx_home_list_items_next_suggested ON public.home_list_items(next_suggested_at);

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage their home list" ON public.home_list_items;

CREATE POLICY "Users can manage their home list" ON public.home_list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = home_list_items.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Trigger
DROP TRIGGER IF EXISTS update_home_list_updated_at ON public.home_list_items;
CREATE TRIGGER update_home_list_updated_at
    BEFORE UPDATE ON public.home_list_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
