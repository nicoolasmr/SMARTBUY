# SmartBuy Platform 🛒

> **SmartBuy** is an intelligent buying assistant that protects families from misleading offers ("Ciladas"), manages household budgets, and tracks confirmed savings.

![Status](https://img.shields.io/badge/Status-Beta-green) ![Coverage](https://img.shields.io/badge/Audit-Passed-blue)

## 🚀 Overview

SmartBuy is NOT a marketplace. It is a **Personal Finance Guardian**.
In a market saturated with "fake discounts" and impulsive buying triggers, SmartBuy acts as a firewall between the user's desire and the purchase.

**Key Value Propositions:**
1.  **Anti-Cilada Score**: A heuristic engine that analyzes price volatility and seller reputation to flag risky offers (Bucket A/B/C).
2.  **Contextual Ranking**: Rankings are personalized based on household budget and immediate needs (Urgency).
3.  **Confirmed Economy**: Tracks "money saved" by comparing paid price vs. average market price or original intent price.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **State/Caching**: React Server Components + TanStack Query
- **Jobs/Queue**: BullMQ (Architecture ready)
- **Security**: 100% RLS (Row Level Security) on Database

## 📦 Key Features

### 1. Onboarding & Profiling
- Multi-step wizard to define "Household DNA" (Life stage, Budget).
- **Guard**: Strict middleware blocks access until profile is complete.

### 2. Smart Feed
- Aggregates products from a Global Catalog (EAN-based).
- **Ranking v0**: Scores products based on Wish matches + Price + Anti-Cilada Score.
- **Filters**: Automates "Hard Filters" (Blocked Stores, Budget caps).

### 3. Anti-Cilada Engine (Sprint 10)
- **Score (0-100)**: Calculated per offer.
- **Visuals**: Color-coded badges (Safe, Warning, Risk) with transparent tooltips.
- **Impact**: Risky offers are aggressively penalized in ranking.

### 4. Ops Area (`/ops`)
- Internal dashboard for Catalog Management, Offer Review, and Risk Recalculation.
- Restricted to `role: 'ops'` or `'admin'`.

### 5. Jobs & Alerts (Sprint 7)
- **Price Tracker**: Background job monitoring offer fluctuations.
- **Alert Dispatcher**: System to notify users when targets are met.

## 📂 Project Structure

```bash
├── docs/                   # Architectural Decision Records (ADRs) & Specs
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (app)/          # Main User Area (Protected)
│   │   ├── (auth)/         # Login/Signup
│   │   ├── (marketing)/    # Landing Page
│   │   ├── (onboarding)/   # Wizard Flow
│   │   └── (ops)/          # Admin Dashboard
│   ├── components/         # Shared UI Components (Design System)
│   ├── lib/                # Business Logic (Domain Driven)
│   │   ├── feed/           # Ranking Engine
│   │   ├── anti-cilada/    # Risk Scoring
│   │   └── ...
│   └── middleware.ts       # Route Protection
└── supabase/
    └── migrations/         # SQL Schema (Verify RLS here)
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project (Local or Cloud)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/nicoolasmr/SMARTBUY.git
    cd SMARTBUY
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env.local` and populate keys:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    SUPABASE_SERVICE_ROLE_KEY=... # For Jobs/Ops
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🛡 Security & Audit

This platform underwent a **Full Technical Audit** in Jan 2026.
- **RLS**: Enabled on ALL tables.
- **Multi-tenant**: Strict `household_id` isolation.
- **Status**: Ready for Beta.

See [audit-report.md](./audit-report.md) for full details.

## 📄 Documentation

For deep dives, check the `docs/` folder:
- [Data Model](./docs/03-data-model.md)
- [Auth Flows](./docs/12-auth-flows.md)
- [Recommendations Engine](./docs/06-recommendations-personalization.md)
- [Ops Area](./docs/11-ops-area.md)

---
*Built with ❤️ by the SmartBuy Team*
