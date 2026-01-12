# ADR-012: Beta Launch Operations Architecture

**Date**: 2026-01-12
**Status**: PROPOSED

## Context
For the Closed Beta Launch (Sprint 11), we need to strictly control user access, limit platform scale (Hard Cap), and ensure observability without building a full-featured enterprise admin system. The priority is **Trust > Speed**.

## Decision

### 1. Invite-Only Access (The Gate)
- We implemented a `beta_invites` table.
- Users must provide a valid invite code during signup.
- Invites are claimed atomically via RPC `fn_claim_invite` to prevent double-spending.
- **Why**: Simple, robust, and allows manual distribution to "Friends & Family".

### 2. Hard Cap Enforcement
- Limit set to **100 Households**.
- Enforced via RPC `fn_beta_can_create_household` which uses `pg_advisory_xact_lock` to prevent race conditions during concurrent signups.
- **Why**: Prevent viral explosion crashing the MVP or exceeding Vercel Pro limits.

### 3. Falback Metrics
- Instead of complex 3rd party tooling, we use a simple `beta_events` table for critical events (Onboarding, Feed View, Alerts).
- **Why**: Zero latency, queryable via SQL, cheap for low volume.

### 4. Ops Config
- Configuration (BETA_MODE, CAP, PAUSED) stored in `app_config` table.
- Ops Server Actions manage this config + invites.
- **Why**: Allows changing limits without re-deploying code (Environment variables require redeploy).

## Consequences
- **Positive**: Strict control over growth; high observability; zero external dependencies for critical path.
- **Negative**: Ops Panel is minimal/raw; Manual work to generate invites.

## Compliance
- All sensitive Ops actions are logged to `ops_audit_logs`.
- Routes protected by Auth + Config checks.
