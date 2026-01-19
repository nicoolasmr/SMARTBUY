-- Create household_profiles table
CREATE TABLE IF NOT EXISTS public.household_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    budget_monthly NUMERIC,
    budget_per_mission NUMERIC,
    max_installments INTEGER,
    allowed_stores TEXT[],
    blocked_stores TEXT[],
    preferences JSONB DEFAULT '{}'::jsonb,
    restrictions JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT household_profiles_household_id_key UNIQUE (household_id)
);

-- Create wishes table
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    intent TEXT NOT NULL CHECK (intent IN ('buy_now', 'research', 'track_price')),
    min_price NUMERIC,
    max_price NUMERIC,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
    constraints JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_household_profiles_household_id ON public.household_profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_wishes_household_id ON public.wishes(household_id);

-- RLS Policies for household_profiles

-- Users can view their own household profile
DROP POLICY IF EXISTS "Users can view their own household profile" ON public.household_profiles;
CREATE POLICY "Users can view their own household profile" ON public.household_profiles
    FOR SELECT
    USING (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can update their own household profile
DROP POLICY IF EXISTS "Users can update their own household profile" ON public.household_profiles;
CREATE POLICY "Users can update their own household profile" ON public.household_profiles
    FOR UPDATE
    USING (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can insert their own household profile
DROP POLICY IF EXISTS "Users can insert their own household profile" ON public.household_profiles;
CREATE POLICY "Users can insert their own household profile" ON public.household_profiles
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- RLS Policies for wishes

-- Users can view their own household wishes
DROP POLICY IF EXISTS "Users can view their own household wishes" ON public.wishes;
CREATE POLICY "Users can view their own household wishes" ON public.wishes
    FOR SELECT
    USING (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can create wishes for their own household
DROP POLICY IF EXISTS "Users can create wishes for their own household" ON public.wishes;
CREATE POLICY "Users can create wishes for their own household" ON public.wishes
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can update their own household's wishes
DROP POLICY IF EXISTS "Users can update their own household wishes" ON public.wishes;
CREATE POLICY "Users can update their own household wishes" ON public.wishes
    FOR UPDATE
    USING (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Users can delete their own household's wishes
DROP POLICY IF EXISTS "Users can delete their own household wishes" ON public.wishes;
CREATE POLICY "Users can delete their own household wishes" ON public.wishes
    FOR DELETE
    USING (
        household_id IN (
            SELECT active_household_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_household_profiles_updated_at ON public.household_profiles;
CREATE TRIGGER update_household_profiles_updated_at
    BEFORE UPDATE ON public.household_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishes_updated_at ON public.wishes;
CREATE TRIGGER update_wishes_updated_at
    BEFORE UPDATE ON public.wishes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
