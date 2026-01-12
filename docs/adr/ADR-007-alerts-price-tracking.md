# ADR 007: Alerts & Price Tracking Architecture

## Status
Accepted

## Context
SmartBuy needs to proactively notify users about price drops.
We have two distinct domains:
1.  **Alerts**: Intention declared by the user (target price).
2.  **Tracking**: System process to update offer data.

## Decision
We separated the domains strictly:
- **Alerts** are owned by the Household.
- **Price Tracking** is a system-level background process (Jobs).

### Job Infrastructure (v0 - MVP)
Instead of a full separate Worker cluster (Redis/BullMQ), we implemented the logic as **API-Triggered Functions** (`/api/cron/track`).
This allows us to deploy easily on Vercel/similar without managing long-running servers yet.
In the future, this code moves 1:1 to a proper worker.

### Alert Evaluation
Evaluation happens **immediately after** tracking update for a batch of offers.
Events are recorded in `alert_events` (audit log) before dispatching notifications.

## Consequences
- **Positive**:
    - **Simplicity**: Easy to debug via API.
    - **Auditability**: `alert_events` keeps history of every notification.
    - **Isolation**: Jobs run with Admin privileges but only write to specific tables; User actions are RLS-scoped.
- **Negative**:
    - **Scale**: API routes have timeouts (Vercel 10s-60s limit). We can only process small batches.
    - **Latency**: Alerts rely on the "Cron" frequency.
