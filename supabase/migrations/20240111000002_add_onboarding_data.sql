DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_data') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
