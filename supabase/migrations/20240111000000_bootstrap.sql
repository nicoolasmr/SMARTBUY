-- Create app_role enum
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('user', 'ops', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE household_role AS ENUM ('owner', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  app_role app_role DEFAULT 'user'::app_role NOT NULL,
  active_household_id UUID,
  onboarding_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create households table
CREATE TABLE IF NOT EXISTS public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Meu Lar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create household_members table
CREATE TABLE IF NOT EXISTS public.household_members (
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role household_role DEFAULT 'member'::household_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (household_id, user_id)
);

-- Add active_household_id FK (circular logic needs care, but IF NOT EXISTS constraint usually requires DO block or simple ALTER check)
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT fk_active_household
    FOREIGN KEY (active_household_id) REFERENCES public.households(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Ops/Admins can view all profiles" ON public.profiles;
CREATE POLICY "Ops/Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND app_role IN ('ops', 'admin'))
  );

-- Policies for households
DROP POLICY IF EXISTS "Users can view their households" ON public.households;
CREATE POLICY "Users can view their households" ON public.households
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = id AND user_id = auth.uid())
  );

-- Policies for household_members
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
CREATE POLICY "Users can view members of their households" ON public.household_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.household_members hm WHERE hm.household_id = household_id AND hm.user_id = auth.uid())
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

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

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
