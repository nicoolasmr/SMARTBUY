
-- Performance Tuning Migration
-- Ensuring all Foreign Keys and critical columns are indexed

-- 1. Profiles: Active Household Lookup
CREATE INDEX IF NOT EXISTS idx_profiles_active_household ON public.profiles(active_household_id);

-- 2. Household Profiles: Just to be safe (should exist)
CREATE INDEX IF NOT EXISTS idx_household_profiles_household_id_perf ON public.household_profiles(household_id);

-- 3. Wishes: By Household (should exist)
CREATE INDEX IF NOT EXISTS idx_wishes_household_id_perf ON public.wishes(household_id);

-- 4. Shops: Domain lookup speed
CREATE INDEX IF NOT EXISTS idx_shops_domain ON public.shops(domain);

-- Analyze tables to update statistics for query planner
ANALYZE public.profiles;
ANALYZE public.household_profiles;
ANALYZE public.wishes;
ANALYZE public.shops;
ANALYZE public.products;
ANALYZE public.offers;
