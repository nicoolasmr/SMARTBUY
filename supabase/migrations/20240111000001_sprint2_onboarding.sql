-- Add onboarding_completed_at to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Ensure onboarding_status exists (it should from bootstrap, but good to be safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_status') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create index for active_household_id on profiles for performance
CREATE INDEX IF NOT EXISTS idx_profiles_active_household_id ON public.profiles(active_household_id);

-- Update handle_new_user to ensure onboarding_status is set (explicitly)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Insert profile with explicit onboarding_status
  INSERT INTO public.profiles (id, full_name, avatar_url, onboarding_status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    'pending'
  );

  -- Create default household
  INSERT INTO public.households (name)
  VALUES ('Meu Lar')
  RETURNING id INTO new_household_id;

  -- Add user to household as owner
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, new.id, 'owner');

  -- Update active_household_id
  UPDATE public.profiles
  SET active_household_id = new_household_id
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
