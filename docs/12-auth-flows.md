# Auth & Onboarding Flows

## Overview
SmartBuy enforces a strict "Onboarding Gate" architecture. No user can access the main application (`/app`) without completing the onboarding wizard.

## Flows

### 1. Sign Up Logic
1. User submits Sign Up form.
2. Supabase Trigger `handle_new_user` fires:
   - Creates `public.profiles` entry with `onboarding_status = 'pending'`.
   - Creates a new `households` record.
   - Links user to household in `household_members` (role: owner).
   - Sets `active_household_id` in profile.
3. User is redirected to `/onboarding/welcome`.

### 2. Login Logic
1. User submits Login form.
2. Success -> Redirect to `/app`.
3. **Middleware Intercept**:
   - Checks `onboarding_status`.
   - If `pending` or `in_progress` -> Redirects to `/onboarding/welcome` (protecting `/app`).
   - If `completed` -> Allows access to `/app`.

### 3. Onboarding Wizard
The onboarding is a server-side state application (conceptually), gated by profile status.
- **Welcome**: Introduction.
- **Momento**: Life stage selection.
- **Orcamento**: Budget definition.
- **Preferencias**: Multi-select tags.
- **Restricoes**: Dietary restrictions.
- **Desejos**: Free text for immediate needs.
- **Final**: Triggers `finishOnboarding` action.
   - Updates `onboarding_status` to `'completed'`.
   - Sets `onboarding_completed_at`.
   - Unlocks `/app`.

## Route Guards
- `/app/*`: Requires Session + `onboarding_status = 'completed'`.
- `/ops/*`: Requires Session + `app_role = 'ops' | 'admin'`.
- `/onboarding/*`: Requires Session.
