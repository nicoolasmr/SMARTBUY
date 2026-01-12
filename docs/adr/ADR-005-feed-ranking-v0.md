# ADR 005: Deterministic Ranking Strategy (v0)

## Status
Accepted

## Context
SmartBuy needs to show a personalized feed of products. We are in the early stages (Sprint 5) and do not have historical interaction data (clicks, conversions) to train a Machine Learning model. The ranking needs to be transparent and trustable immediately.

## Decision
We adopted a **Deterministic Ranking v0** strategy based on explicit signals from the User Profile and Wishes.

### The Algorithm
`Score = WishMatch (100) + Urgency (20-50) + BudgetBonus (10) + PriceMatch (30)`

1.  **Candidates**: Retrieved only if they fuzzy-match a Wish title.
2.  **Hard Filters**: Strictly remove items that violate blocked stores, max budget, or specific constraints.
3.  **Ranking**: Sort by the computed score descending.

## Consequences
- **Positive**:
    - **Explainability**: We can easily tell the user "We showed this because you wished for X".
    - **Control**: Users feel in control; changing a wish immediately changes the feed.
    - **Performance**: No heavy ML inference, just database queries and in-memory sort.
- **Negative**:
    - **Naivety**: The system doesn't learn. If a user always ignores "Store Z", we only stop showing it if they explicitly block it.
    - **Static**: The feed doesn't change until data changes (no serendipity).

## Future Evolution
Once we track `VIEW` and `CLICK` events (Sprint 7+), we will introduce a "Relevance Score" layer on top of this deterministic base.
