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

### 2. Offer Management (`/ops/offers`)
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
