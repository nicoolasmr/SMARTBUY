# Ops Area

## Overview
The Ops Area (`/ops`) is the back-office for SmartBuy administrators and content managers. It is restricted to users with `role: 'ops'` or `'admin'`.

## Modules

### 1. Catalog Management (`/ops/catalog`)
- **Purpose**: Maintain the integrity of the Global Product Catalog.
- **Capabilities**:
    - List all products.
    - Search by Name or EAN.
    - (Future) Merge duplicates.

### 2. Beta Ops (`/ops/beta`) 🕹️

**Control Tower for the Closed Beta.**

### Features
- **Status Monitor**: View current `BETA_MODE`, `PAUSED` state, and Active Households vs Cap (100).
- **Invite Management**:
  - **Generate**: Create bulk invites with notes (e.g. "Family", "Twitter").
  - **Revoke**: Invalidate specific codes immediately. Re-validates UI instantly.
- **Panic Button**:
  - **STOP Signups**: Sets `BETA_SIGNUPS_PAUSED=true`. Blocks ALL new signups, even with valid invites. Use in case of overflow or technical issues.

### Audit
All actions on this page generate logs in `ops_audit_logs` with type:
- `GENERATE_INVITES`
- `REVOKE_INVITE`
- `TOGGLE_BETA_PAUSE`

### 3. Offer Management (`/ops/offers`)
- **Purpose**: Oversee the pricing and availability data.
- **Capabilities**:
    - View active offers.
    - Manually deactivate bad offers (e.g., broken links or fake prices).

## Security
- **RLS**: Database policies strictly enforce that only Ops/Admin can INSERT/UPDATE catalog tables.
- **Middleware**: Routes under `/ops` are guarded.

## Workflow
1.  System (or Connector) ingests raw data.
2.  Ops reviews "New Products" in dashboard (Future).
3.  Ops approves/merges into `products` table.
