# ADR 010: Anti-Cilada Score Strategy

## Status
Accepted

## Context
In a market full of "fake discounts" (raising prices before Black Friday) and unreliable stores, SmartBuy needs to be more than just a price sorter. It must be a "Financial Guardian".

## Decision
We implemented the **Anti-Cilada Score**.
- **Calculated**: Per offer, using heuristics (not ML yet).
- **Scale**: 0-100.
- **Buckets**:
    - **A (Safe)**: 80-100. (+Ranking Bonus)
    - **B (Warning)**: 60-79. (-Ranking Penalty)
    - **C (Risk)**: < 60. (Heavy Penalty, never top result).

## Signals (v0)
1.  **Price Volatility**: Checks if price spiked recently.
2.  **Reputation**: Checks store against a known "Bad List".
3.  **Thresholds**: (Future) Compare against market average.

## Explanation (Transparency)
We do not hide the score. We display a `RiskBadge` with a Tooltip explaining exactly *why* the score is low (e.g., "High Volatility"). This builds trust.

## Consequences
- **Positive**: Trust, Safety, Defensibility against generic competitors.
- **Negative**: Potential false positives if heuristics are too aggressive. Users might miss a real deal if flagged as risky.
