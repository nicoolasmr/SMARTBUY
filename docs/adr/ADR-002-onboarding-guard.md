# ADR 002: Server-Side Onboarding Guard

## Status
Accepted

## Context
SmartBuy relies heavily on user preference data (budget, restrictions, household size) to provide intelligent recommendations. Allowing users to access the app without this data results in a poor "Cold Start" experience and empty states.

## Decision
We enforce a **hard block** on the `/app` routes for any user whose `onboarding_status` is not `'completed'`.

This check is performed in the **Edge Middleware**, enabling:
1.  Instant redirection without loading client JS.
2.  Security at the route level (Next.js Middleware).
3.  Simplicity in frontend components (they can assume data exists).

## Consequences
### Positives
- **Data Guarantee**: The core application can assume a baseline of user data exists.
- **Better UX**: No empty dashboards or "configure your profile" banners cluttering the main UI.

### Negatives
- **Database Load**: Middleware needs to fetch the profile on every navigation to `/app` (unless ensuring session claim updates, which are harder to sync immediately).
    - *Mitigation*: For Sprint 2, direct DB call is acceptable. Future optimization: Cache validation in edge config or signed session cookie.
- **Flexibility**: Hard to do "progressive onboarding" later without changing this architecture.
