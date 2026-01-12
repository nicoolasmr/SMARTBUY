# ADR 003: Separation of User Profile and Household Configuration

## Status
Accepted

## Context
We need to store user preferences and restrictions. However, SmartBuy is multi-tenant based on Households. A "Vegan" restriction might be personal to one user, but "Budget" is shared by the household.

## Decision
We separated the entities into:
1.  `profiles`: User-specific metadata (Avatar, Name).
2.  `household_profiles`: Shared configuration for the household (Budget, shared blocked stores).

For Sprint 3, even "Restrictions" were placed in `household_profiles` to simplify the "Family Buy" logic (if one person is allergic to peanuts, the household shouldn't buy peanuts).

## Consequences
- **Positive**: Simplifies the recommendation engine (it checks one profile per household).
- **Negative**: Reduces individual granularity. If User A is vegan but User B is carnivore, placing "Vegan" on the household profile filters out meat for everyone.
    - *Mitigation*: Future sprints may introduce "Shopper Profiles" for specific missions, or split restrictions into "Global" vs "Personal". For MVP, Global is safer.
