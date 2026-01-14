-- Fix infinite recursion in profiles policy
-- The policy "Ops/Admins can view all profiles" was selecting from profiles to check permissions, causing a loop.
-- Date: 2026-01-14

-- 1. Drop the bad policy
DROP POLICY IF EXISTS "Ops/Admins can view all profiles" ON public.profiles;

-- 2. Create a secure helper function to check roles avoiding RLS loop
-- SECURITY DEFINER allows this function to bypass RLS when querying profiles
CREATE OR REPLACE FUNCTION public.is_admin_or_ops()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user exists and has the correct role
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND app_role IN ('ops', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; -- Set search_path for safety

-- 3. Re-create the policy using the function
CREATE POLICY "Ops/Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.is_admin_or_ops()
  );
