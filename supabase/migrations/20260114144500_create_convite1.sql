-- Migration: Create 'convite1' invite code
-- Date: 2026-01-14
-- Author: Assistant

-- Insert the invite code 'convite1' with 100 uses.
-- We use ON CONFLICT DO NOTHING to prevent errors if it already exists.

INSERT INTO public.beta_invites (code, max_uses, status, notes)
VALUES ('convite1', 100, 'active', 'Created manually for user testing')
ON CONFLICT (code) 
DO UPDATE SET 
    max_uses = 100,
    status = 'active';
