# SmartBuy - Project Overview

## Product Vision
SmartBuy is an intelligent shopping assistant that curates products based on strict guardrails (Quality, Price, Health). It is **not** a marketplace; it is a decision engine.

## Core Modules (Sprint 2 Status)

### 1. Authentication & Identity
- **Provider**: Supabase Auth (Email/Password).
- **Structure**: Multi-tenant via `households`.
- **Onboarding**: Strict gating. Apps are locked until profile is complete.

### 2. App Structure
- **Marketing**: Public facing pages.
- **App**: Authenticated, onboarding-gate protected area.
- **Ops**: Internal tools for product management.

### 3. Architecture
- **Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS + shadcn/ui.
- **Database**: Postgres + RLS.
- **State**: Server Actions for mutations, React Query for fetching (coming soon).

## Key Decisions
- **Rule of Least Privilege**: RLS policies default to deny.
- **Edge Protection**: Middleware handles auth guards.
- **Premium UX**: Design system enforces tokens for consistency.
