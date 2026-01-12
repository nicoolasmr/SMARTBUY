# SmartBuy Operations Runbook 📘

> **Purpose**: Guide for maintaining, monitoring, and responding to incidents in the SmartBuy platform.

## 1. System Overview
SmartBuy is a personal finance guardian running on:
- **Frontend/Backend**: Next.js 15 (Vercel)
- **Database**: Supabase (PostgreSQL 15+)
- **Jobs**: Next.js Server Actions (Cron/Background)

## 2. Jobs & Background Tasks
Currently, jobs run as scheduled functions or triggered actions.

### Price Tracker (`price-tracker.ts`)
- **Schedule**: Hourly.
- **Function**: `runPriceTrackingJob()`
- **Safety**: Uses cursor pagination (100 items/batch). Breaks after 1000 items to avoid timeout.
- **Monitoring**: Check Vercel Logs for `[JOB]`.
- **Failure**: If it fails, no immediate user impact (prices stagger).

### Alert Dispatcher
- **Schedule**: 15 mins.
- **Function**: `runAlertEvaluatorJob()`
- **Safety**: Loops active alerts.
- **Failure**: User doesn't receive push. Critical for trust.

## 3. Ops Audit Logs
All sensitive actions are logged to `ops_audit_logs`.
**Querying Logs**:
```sql
SELECT * FROM ops_audit_logs 
WHERE action_type = 'UPSERT_OFFER' 
ORDER BY created_at DESC;
```

## 4. Operational Procedures

### A. Updating the Catalog (Ops)
1. Navigate to `/ops/catalog`.
2. Add/Edit Product.
3. Check `ops_audit_logs` if verification needed.

### B. Handling "Cilada" Risks
1. Ops receives report or checks `/ops/offers`.
2. Click "Check Risk".
3. System logs `CALC_RISK`.
4. Rank bucket updates immediately.

### C. Deployment & Migrations
1. Push to `main` triggers Vercel deploy.
2. SQL migrations must be applied sequentially via Supabase CLI or Console.
   ```bash
   supabase db push
   ```

## 5. Incident Response

### Severity 1: Feed Down
- **Symptom**: Users see empty home screen.
- **Check**: Supabase connectivity, `fn_get_feed_candidates` errors.
- **Mitigation**: Logs in Vercel.

### Severity 2: Login Failure
- **Symptom**: User stuck on onboarding or login.
- **Check**: `auth.users` trigger, RLS policies.

### Severity 3: Job Stuck
- **Symptom**: Prices flatline.
- **Action**: Manually trigger job from Vercel Console or Ops endpoint (if exposed).

---
*Last Updated: Jan 2026 (Hardening Phase)*
