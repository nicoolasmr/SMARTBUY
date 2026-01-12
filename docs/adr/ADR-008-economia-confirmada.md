# ADR 008: Confirmed Savings Strategy

## Status
Accepted

## Context
SmartBuy's core value proposition is saving money. However, up to this point, savings were "potential".
To prove value and calculate Real ROI for the user, we need to track actual purchases and confirmed prices.

## Decision
We implemented a **Declarative + Proof** model.
1.  **Attribution**: We track clicks to store via `attribution_links`.
2.  **Declaration**: Users manually declare "I bought this" (linking to the click or generic).
3.  **Proof**: Users upload a receipt (image/PDF).
4.  **Validation**: Ops manual review approves the receipt and confirms the `price_paid`.
5.  **Calculation**: `Savings = Reference Price - Price Paid`.

## Consequences
- **Positive**:
    - **Trust**: Savings are backed by proof, not just estimates.
    - **Data**: We get real transaction data (what people actually pay vs what is advertised).
- **Negative**:
    - **Friction**: Uploading receipts is high effort. We need to gamify this later (e.g. cashback, points).
    - **Ops Load**: Manual review is not scalable. We will need OCR/AI in future sprints.

## Why not automatic tracking?
Bank integration (Open Finance) or Email scraping is too complex and invasive for MVP.
Affiliate postback is unreliable for "price paid" verification in many cases and doesn't cover all stores.
