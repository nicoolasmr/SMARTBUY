# Data Model

## Users & Identity
- `auth.users`, `public.profiles`, `public.households`... (See Sprint 2/3)

## Personalization
- `public.household_profiles`, `public.wishes` (See Sprint 3)

## Global Catalog (Sprint 4)

### `products`
The unique source of truth for "What is this item?".
- `ean_normalized`: The strong key.
- Shared globally across all households.
```sql
id UUID PK
name TEXT
brand TEXT
ean_normalized TEXT UNIQUE
category TEXT
attributes JSONB
```

### `shops`
Registry of supported retailers.
```sql
id UUID PK
name TEXT
domain TEXT
reputation_score NUMERIC
```

### `offers`
A listing of a Product at a Shop.
```sql
id UUID PK
product_id UUID FK
shop_id UUID FK
price NUMERIC
freight NUMERIC
is_available BOOL
updated_at TIMESTAMPTZ
```

### `offer_price_history`
TimeSeries of price changes for analytics.
```sql
id UUID PK
offer_id UUID FK
price NUMERIC
captured_at TIMESTAMPTZ
```

## Planning (Sprint 6)

### `missions`
A goal-oriented container for purchases.
```sql
id UUID PK
household_id UUID FK
title TEXT
budget_total NUMERIC
is_active BOOL
```

### `mission_items`
Checklist items within a mission.
```sql
id UUID PK
mission_id UUID FK
title TEXT
wish_id UUID FK (Optional link)
estimated_price NUMERIC
is_completed BOOL
```

## Proactive (Sprint 7)

### `alerts`
User-defined conditions for notification.
```sql
id UUID PK
household_id UUID FK
type TEXT (price, freight)
target_value NUMERIC
last_triggered_at TIMESTAMPTZ
```

### `alert_events`
Audit log of triggered alerts.
```sql
id UUID PK
alert_id UUID FK
offer_id UUID FK
payload JSONB (snapshot of price/shop)
triggered_at TIMESTAMPTZ
```

## Value Loop (Sprint 8)

### `attribution_links`
Tracks intention to buy.
```sql
id UUID PK
offer_id UUID FK
token TEXT UNIQUE
expires_at TIMESTAMPTZ
```

### `purchases`
Declared transactions.
```sql
id UUID PK
offer_id UUID FK
price_paid NUMERIC
status TEXT (pending, confirmed)
```

### `receipt_uploads`
Proof files.
```sql
id UUID PK
purchase_id UUID FK
file_path TEXT
status TEXT
```

### `economy_daily`
Confirmed savings.
```sql
id UUID PK
purchase_id UUID FK
economy_amount NUMERIC
calculated_at TIMESTAMPTZ
```

## Retention (Sprint 9)

### `home_list_items`
Recurring household needs.
```sql
id UUID PK
household_id UUID FK
product_id UUID FK
frequency_days INT
last_purchase_at DATE
next_suggested_at DATE
is_active BOOL
```
