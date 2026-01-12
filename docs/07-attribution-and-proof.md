# Attribution and Proof of Purchase

## Overview
This module closes the loop between "Finding a Deal" and "Confirming the Savings".

## Workflows

### 1. Attribution (Click Tracking)
- **User Action**: Clicks "Go to Store" on an offer.
- **System**:
    - Generates a unique `attribution_link` token.
    - Logs the click in `click_events`.
    - Redirects user to the retailer.
    - Stores the link ID in user's session/context (for easy declaration later).

### 2. Purchase Declaration
- **User Action**: Returns to SmartBuy and clicks "I bought this".
- **System**:
    - User selects the clicked offer (or enters manually).
    - Helper prompts for `price_paid` and `date`.
    - Creates a `purchase` record with status `pending`.

### 3. Proof (Receipt Upload)
- **User Action**: Uploads a photo or PDF of the invoice/receipt.
- **System**:
    - Stores file in Secure Storage.
    - Links file to `purchase` via `receipt_uploads`.

### 4. Verification (Ops)
- **Ops Action**: Reviews queue at `/ops/receipts`.
- **Validation**: Checks if product matches and price is correct.
- **Outcome**:
    - **Approve**: Sets purchase to `confirmed`. Calculates `economy_amount`.
    - **Reject**: Asks for re-upload or denies.

## Data Model impact
- New tables: `attribution_links`, `click_events`, `purchases`, `receipt_uploads`, `economy_daily`.
- Strict RLS ensures users only see their own financial data.
