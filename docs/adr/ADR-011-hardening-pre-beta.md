# ADR-011: Hardening Pre-Beta 🛡️

**Date**: 2026-01-14
**Status**: Accepted

## Context
SmartBuy is preparing for Beta launch with real users. The initial audit revealed performance bottlenecks in the Feed (Memory intensive) and risks in Job execution (Timeouts), as well as a lack of auditability in Ops.

## Decision

### 1. Feed via RPC (`fn_get_feed_candidates`)
We decided to move the "Candidate Selection" and "Hard Filtering" logic to a SQL RPC function.
- **Pros**: Reduces data transfer by ~90%; eliminates N+1 queries; allows indexing on join/filter columns.
- **Cons**: Splits logic (Candidates in SQL, Scoring in JS).
- **Justification**: Performance is critical for the main view. The split is acceptable as SQL handles "Who qualifies?" and JS handles "How much do we like them?" (Scoring), maintaining explainability.

### 2. Job Cursor Pagination
We refactored the Price Tracker to use Cursor-based pagination (ID > lastId) with a batch limit.
- **Pros**: Prevents memory leaks and Vercel Function Timeouts.
- **Cons**: Slightly more complex code state.
- **Justification**: Essential for stability. A crash in price tracking degrades data quality immediately.

### 3. Synchronous Ops Logging
We introduced a `logOpsAction` helper that writes to `ops_audit_logs` *during* the Server Action.
- **Pros**: Guaranteed trail; simple to implement.
- **Cons**: Adds latency to Ops actions.
- **Justification**: Ops traffic is low volume but high sensitivity. Latency is an acceptable trade-off for governance.

## Consequences
- The system is now robust enough for >1000 users.
- Ops actions are traceble.
- Developers must maintain the SQL RPC logic if schema changes.
