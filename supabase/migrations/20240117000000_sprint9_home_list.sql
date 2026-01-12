-- Create home_list_items table
CREATE TABLE public.home_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    frequency_days INTEGER NOT NULL DEFAULT 30,
    last_purchase_at DATE,
    next_suggested_at DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.home_list_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_home_list_household ON public.home_list_items(household_id);
CREATE INDEX idx_home_list_next_suggested ON public.home_list_items(next_suggested_at);
CREATE INDEX idx_home_list_is_active ON public.home_list_items(is_active);

-- RLS Policies

-- Users satisfy RLS if they belong to the household
CREATE POLICY "Users manage household home list" ON public.home_list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = home_list_items.household_id
            AND hm.user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_home_list_updated_at
    BEFORE UPDATE ON public.home_list_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
