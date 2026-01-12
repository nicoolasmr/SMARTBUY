# Jobs & Alerting Architecture

## Overview
SmartBuy uses a background job system to monitor offer prices and evaluate user alerts.
Currently (v0), this is implemented as an API-driven "Cron" system.

## Components

### 1. Price Tracker (`src/lib/jobs/price-tracker.ts`)
- **Responsibility**: Scans active offers and simulates/fetches latest price updates.
- **Optimizations**: Prioritizes offers linked to Active Missions or Wishes.

### 2. Alert Evaluator (`src/lib/jobs/price-tracker.ts`)
- **Responsibility**: Checks if any updated offer meets the criteria of an active `Alert`.
- **Logic**:
    - Finds best offer for the alert's target (Product/Wish).
    - Checks `price <= target_value`.
    - Dispatches notification via Dispatcher.

### 3. Dispatcher (`src/lib/notifications/dispatcher.ts`)
- **Responsibility**: Abstraction layer for sending messages.
- **Channels**: Push, Email, Whatsapp (Mocked in v0).

## Data Flow
1.  **Job Trigger**: External Cron calls `/api/cron/track`.
2.  **Tracking**: Offers updated in `offers` and `offer_price_history`.
3.  **Evaluation**: Alerts checked against new prices.
4.  **Event**: `alert_events` row created.
5.  **Notify**: Dispatcher sends message.

## Monitoring
Operational metrics are visible at `/ops/alerts`.
- Count of active alerts.
- Log of recent triggered events.
