# Recommendations & Personalization

## Core Concepts

SmartBuy is NOT a marketplace. It is a decision engine that filters the world of products through two main lenses:
1.  **Hard Filters (Profile Guardrails)**: What is allowed for this household?
2.  **Soft Filters (Preferences)**: What does this household prefer?

## Data Entities

### 1. Household Profile (`household_profiles`)
This entity stores the "Configuration" of the household. It is distinct from the user profile.
- **Budget**: Monthly limit and per-mission limit.
- **Restrictions**: Dietary or ethical restrictions (e.g., Vegan, Gluten-Free).
- **Store Policies**: Allowed and Blocked stores.

### 2. Wishes (`wishes`)
Wishes represent the "Demand" side of the equation.
- **Intent**:
    - `buy_now`: User needs this immediately. High urgency.
    - `research`: User is exploring options. Medium urgency.
    - `track_price`: User knows the product but wants a deal. Low urgency.

## The Recommendation Loop (Future)
1.  **Trigger**: User creates a Wish.
2.  **Filter**: System fetches products matching Wish keywords + Household Restrictions.
3.  **Rank**: System scores products based on Preferences + Price vs. Budget.
4.  **Present**: Top 3 options presented to user.

## The Recommendation Engine (v0 - Sprint 5)

Our current engine is **Deterministic**. It follows this pipeline:

### 1. Context Gathering
We load your `HouseholdProfile` (Guardrails) and active `Wishes`.

### 2. Candidate Selection
We search the Global Catalog for products matching your Wish titles.

### 3. Hard Filters (The "Safety Net")
We **remove** any candidate that:
- Is from a `blocked_store`.
- Costs more than `household.budget_per_mission`.
- Costs more than `wish.max_price` (if set).

### 4. Scoring & Ranking
We score remaining items:
- **Base Score**: 100 points (It matches a wish!)
- **Urgency Bonus**: +50 (High), +20 (Medium).
- **Price Target Bonus**: +30 if below `wish.min_price`.
- **Budget Saver Bonus**: +10 if price is < 50% of budget limit.
- **Mission Boost**: +200 points if item is part of active mission.
- **Home List Boost (Sprint 9)**: +150 points if item is in `home_list` and due for replenishment (<= 7 days).

- **Anti-Cilada Ranking Impact (Sprint 10)**:
    - **Bucket A**: +50 points.
    - **Bucket B**: -50 points (Penalty).
    - **Bucket C**: -500 points (Severe Penalty, effectively removing from top spots).

### 4. Feed Output
Ordered by `Match Score` DESC.
