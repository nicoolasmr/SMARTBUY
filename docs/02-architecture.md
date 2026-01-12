# SmartBuy System Architecture 🏗️

> **Version**: 1.0 (Beta Ready)
> **Status**: Hardened

## 1. High-Level Overview
SmartBuy is a distributed system designed to act as a "Personal Finance Firewall".
It sits between the User and the Market, filtering offers through a personalized heuristic engine.

### Core Components
1.  **Client (PWA)**: Next.js App Router, highly interactive (Framer Motion), offline-first capabilities.
2.  **API Layer**: Server Actions (RPC style), strictly typed (Zod).
3.  **Database**: Supabase (PostgreSQL) with strictly enforced Row Level Security (RLS).
4.  **Worker Layer**: Background jobs for Price Tracking and Alerts (simulated via cron/dispatch).

## 2. Hardening & Scalability (Pre-Beta)
To support real users, the system underwent a hardening phase (Sprint 11).

### Feed Optimization (`fn_get_feed_candidates`)
Instead of fetching all products and filtering in memory (O(N)), we use a dedicated SQL RPC function.
- **Input**: `household_id`
- **Join**: `wishes` -> `products` (Fuzzy Match) -> `offers` (Best Price)
- **Hard Filters (SQL)**: Blocked Stores, Global Budget, Availability.
- **Result**: Small set of highly relevant candidates passed to JS for final scoring.

### Job Safety
- **Pagination**: Price Tracker uses cursor-based pagination (100 items/batch) to prevent timeouts.
- **Fail-safe**: Jobs log start/end/error patterns to facilitate monitoring.

### Governance
- **Audit Logs**: All critical Ops actions (Plan updates, Risk scoring, Catalog edits) are logged to `ops_audit_logs`.
- **RBAC**: Ops area strictly protected by checking User Role/Session.

## 3. Data Flow

### The "Anti-Cilada" Flow
1.  **Ingestion**: Offers upserted by Ops/Scrapers.
2.  **Risk Engine**: `anti-cilada` module calculates Score (0-100) based on volatility and shop reputation.
3.  **Persistence**: Scores stored in `offer_risk_scores`.
4.  **Presentation**: Feed RPC joins scores; UI displays "Traffic Light" badges (Safe/Warning/Risk).

### The "Confirmed Economy" Flow
1.  **Attribution**: User clicks offer -> `attribution_links` token generated.
2.  **Purchase**: User declares purchase -> `purchases` record created (Status: Pending).
3.  **Proof**: User uploads receipt -> `receipt_uploads`.
4.  **Validation**: Ops reviews receipt -> Status: Confirmed -> `economy_daily` updated.

## 4. Security Model
- **Authentication**: Supabase Auth (JWT).
- **Authorization**: RLS Policies on EVERY table.
- **Tenancy**: `household_id` is the primary isolation key.
- **Middleware**: `middleware.ts` guards route access based on Onboarding Status.

## 5. Technology Stack
- **Frontend/Backend**: Next.js 15
- **DB**: PostgreSQL 15 (Supabase)
- **Styling**: TailwindCSS + Radix UI
- **State**: React Server Components + server-only utils
