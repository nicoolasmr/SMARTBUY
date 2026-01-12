# ADR 009: Home List Strategy

## Status
Accepted

## Context
SmartBuy needs a retention mechanism. Users buy certain items repeatedly (coffee, detergent, pet food).
We want to shift from "Searching for deals" to "Managing my household".

## Decision
We implemented a **"Lista da Casa" (Home List)**.
- **Concept**: A list of items with a defined replenish frequency.
- **Logic**: Sytem calculates `next_suggested_at` based on `last_purchase + frequency`.
- **Feed Integration**: Items "due soon" get a heavy boost in the main feed.
- **WhatsApp**: We generate a copy-paste text summary to facilitate family sharing or easy ordering.

## Consequences
- **Positive**:
    - **Retention**: Gives users a reason to open the app weekly.
    - **Convenience**: Users don't need to remember what to buy.
    - **Viral**: WhatsApp summary might spread the brand if shared.
- **Negative**:
    - **Manual Entry**: Initial setup requires user effort to input frequency.
    - **Static Logic**: Fixed frequency doesn't account for consumption spikes (e.g. party). ML is future work.

## Why not auto-add?
We decided *against* auto-adding every purchase to the Home List to avoid clutter.
Users must explicitly "Add to Home List" to signal it's a recurrent need.
