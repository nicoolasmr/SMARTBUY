-- Create missions table
-- [SELF-HEALING] Cleanup
DROP TABLE IF EXISTS public.mission_items CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;

CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget_total NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create mission_items table
CREATE TABLE public.mission_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    wish_id UUID REFERENCES public.wishes(id) ON DELETE SET NULL,
    estimated_price NUMERIC DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    position INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_items ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_missions_household_id ON public.missions(household_id);
CREATE INDEX idx_missions_is_active ON public.missions(is_active);
CREATE INDEX idx_mission_items_mission_id ON public.mission_items(mission_id);

-- RLS Policies

-- Helper to check household access (reusing pattern from previous sprints)
-- We assume `auth.uid()` links to a profile which links to households via `household_members`.
-- But for Sprint 3 we used `active_household_id` passed in queries or session context.
-- Ideally, RLS should enforce `household_id` matches the user's membership.
-- For Simplicity in MVP (and following previous patterns), we check if the user is a member of the household.

CREATE POLICY "Users can manage missions of their households" ON public.missions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.household_members hm
            WHERE hm.household_id = missions.household_id
            AND hm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage items of their missions" ON public.mission_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.missions m
            JOIN public.household_members hm ON hm.household_id = m.household_id
            WHERE m.id = mission_items.mission_id
            AND hm.user_id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_mission_items_updated_at
    BEFORE UPDATE ON public.mission_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
