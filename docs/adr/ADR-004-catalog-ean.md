# ADR 004: Catalog Strategy (Global EAN Identity)

## Status
Accepted

## Context
SmartBuy needs to aggregate offers from multiple stores (Amazon, Mercado Livre, etc.) into a single "Product" entity to allow fair price comparison.
Without a strong identity, we would have duplicates like "iPhone 15" (Amazon) and "Apple iPhone 15 128GB" (ML) treating them as different items, breaking price tracking.

## Decision
We adopted a **Global Catalog** strategy centered on **EAN/GTIN (European Article Number)** as the primary key for identity normalization.

1.  **Product Entity**: Represents the physical item (Samsung TV 55"). Unique constraint on `ean_normalized`.
2.  **Offer Entity**: Represents a specific store's listing (Samsung TV 55" at Kabum for R$ 2000).
3.  **Separation**: Products are Global (no household ownership). Offers are Global.

## Consequences
- **Positive**: Enables "Apple-to-Apple" comparison. We can chart price history across all stores for the specific EAN.
- **Negative**: Harder to manage products without EAN (generic items).
    - *Mitigation*: For generic items, we may generate internal SKU, but EAN is mandatory for brand products.
- **Risk**: Catalog quality depends on accurate EAN data from Ops or Connectors. Bad EANs lead to bad merges.
