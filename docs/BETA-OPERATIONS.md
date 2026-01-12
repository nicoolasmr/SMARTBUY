# SMARTBUY — BETA OPERATIONS MANUAL 🕹️

> **Version**: 1.1
> **Phase**: Closed Beta (Friends & Family)
> **Goal**: Protect Trust > Speed

## 1. Beta Scope & Limits 🚧

### Constraints
- **User Cap**: Max 100 Households.
- **Audience**: Invite-only (Waitlist/F&F).
- **Duration**: 14 Days (Daily Cycles).

### Technical Limiters (Active)
- **Jobs**: 
  - `MAX_BATCHES` enforced (10 blocks of 100 items).
  - Time Guard: Max 60s execution.
- **Safety Switches (Env Vars)**:
  - `ENABLE_JOBS=true` (Master Switch - Kills ALL jobs).
  - `ENABLE_PRICE_TRACKER=true` (Specific).
  - `ENABLE_ALERT_EVALUATOR=true` (Specific).
  - `ENABLE_ANTI_CILADA=true` (Scoring Engine).
  - **Security (Ops)**:
    - `CRON_SECRET`: Required for all `/api/internal/jobs/*` calls.
    - **Concurrency Locks**: Distributed lock (TTL 90s) prevents double execution.

## 2. Daily Routine (D+1) 🗓️

**Operator**: CTO / Eng Lead

### Morning Check (09:00)
1.  **Feed Health**:
    - [ ] Open App as generic user.
    - [ ] Verify load time (< 2s).
    - [ ] Check for "Empty Feed" states.
    - [ ] *Metric*: % of users with < 5 items.

2.  **Job Verification**:
    - [ ] Check Vercel Logs for `[JOB]`.
    - [ ] Verify `Price Tracker` completed batches.
    - [ ] Verify `Alert Evaluator` triggered events.
    - [ ] *Action*: If job failed > 3x, **Kill Switch** via Env Var.

3.  **Governance & Ops**:
    - [ ] Query `ops_audit_logs`.
    - [ ] Identify manual overrides.
    - [ ] *Red Flag*: If > 5 manual catalog fixes/day, pause invites.

### Evening Review (18:00)
1.  **User Signals**:
    - [ ] Review `purchases` table for declared economies.
    - [ ] Check for support messages/complaints.

## 3. Incident Response 🚨

### Scenario A: Feed Empty / Slow
1.  **Check**: RPC `fn_get_feed_candidates`.
2.  **Mitigation**: Is household profile too restrictive?
3.  **Action**: Suggest user broaden filters.

### Scenario B: "This Price is Wrong"
1.  **Check**: `offers` table `updated_at`.
2.  **Check**: `offer_price_history`.
3.  **Action**: Ops manual update (Logged).

### Scenario C: Job Loop / Cost Spike
1.  **Action**: Set `ENABLE_JOBS=false`.
2.  **Fix**: Investigate logs. Deploy fix. Re-enable.

### Scenario D: Manual Job Trigger (Secure)
If a job needs to be run manually (e.g., after fix):
```bash
curl -X GET https://smartbuy.vercel.app/api/internal/jobs/price-tracker \
  -H "x-cron-secret: [VALUE_FROM_VERCEL_ENV]"
```

### Scenario E: Viral Spike / Hard Cap Breach
1.  **Symptom**: 105 households created (race condition leak).
2.  **Action**: Go to `/ops/beta` -> Click **STOP Signups (Panic)**.
3.  **Result**: `BETA_SIGNUPS_PAUSED=true`. No new accounts even with invites.

## 4. Escalation Runbook 🪜

| Severity | Definition | Response Time | Action Owner | Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1** | **System Down / Core Loop Broken** (Empty Feed, Login Fail) | 30 min | CTO | **STOP BETA**. Disable Invites. Rollback. |
| **SEV-2** | **Data Integrity / Trust Issue** (Wrong Prices, Alerts Spam) | 2 hours | Eng Lead | Disable specific Job (`ENABLE_X=false`). Fix in < 4h. |
| **SEV-3** | **Minor UX / Glitch** (Typo, Slow Load) | 24 hours | Product | Log in Backlog. Fix in next build. |

## 5. Cost & Performance Guardrails 💸

### Job Execution
- **Frequency**: Max 1x/hour per Job.
- **Batch Size**: Max 100 items per batch.
- **Total Limit**: Max 1,000 items processed per execution (10 batches).
- **Cost Cap**: If Vercel functions exceed 50% of Pro limits -> **STOP JOBS**.

### Database
- **Connections**: Max 20 active connections (Pooler).
- **Storage**: Max 500MB for Beta.

## 6. Final Report Template (D+14) 📝

**Metrics**:
- Active Households: `[Count]`
- Confirmed Economy: `R$ [Value]`
- Job Reliability: `[0-100]%`

**Verdict**:
- [ ] NO-GO (Fix criticals)
- [ ] GO (Expand to 500)
