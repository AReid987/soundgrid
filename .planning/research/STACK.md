# Technology Stack: SoundGrid

**Project:** SoundGrid - Commercial Operating System for Music Professionals
**Domain:** Fintech / Music Industry Commercial OS
**Researched:** 2026-02-25 (Standard 2025 Stack)
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 15.1.x | Full-stack Framework | Industry standard for 2025. Utilizes App Router, Server Actions, and Partial Prerendering (PPR) for high-performance financial dashboards. |
| **TypeScript** | 5.7.x | Language | Mandatory for type-safe financial transactions and contract metadata. Ensures reliability in complex royalty calculations. |
| **Prisma** | 7.4.x | ORM | Preferred in project context. Version 7+ features improved engine performance and better support for serverless connection pooling via Accelerate. |
| **Neon** | Serverless | Database | Postgres with branching and autoscaling. Essential for multi-tenant music platforms requiring high availability and low maintenance. |
| **Stripe Connect** | 20.3.x | Payment Orchestration | Standard for marketplaces. Necessary for split-pay logic (producers, artists, labels) and escrow-like fund holding. |
| **DocuSign API** | 8.6.x | Legal Automation | Enterprise-grade e-signatures. Version 8.x (REST v2.1) is robust for programmatic contract generation and webhook-based status tracking. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@auth/nextjs** | 5.0.0-beta.x | Authentication | Use for secure, edge-compatible authentication. Required for Next.js 15 App Router compatibility. |
| **ddex-parser** | 0.4.5 | Music Metadata | Use for parsing and validating DDEX ERN 4.3 XML files. High-performance Rust bindings ensure speed for large catalogs. |
| **Zod** | 4.3.x | Validation | Use for all schema validation (Prisma models, API payloads, form inputs). Essential for financial data integrity. |
| **TanStack Query** | 5.6.x | Server State | Use for client-side data fetching, caching, and optimistic updates in the dashboard. |
| **Zustand** | 5.0.x | Global State | Use for lightweight UI state management (e.g., multi-step contract wizard, modal states). |
| **Tailwind CSS** | 4.0.x | Styling | Utility-first CSS for 2025. Performance-optimized with better CSS-in-JS alternatives and zero-runtime overhead. |
| **Shadcn UI** | Latest | UI Components | Provides accessible, customizable components (Radix UI based) that follow modern fintech design patterns. |
| **Inngest** | Latest | Workflow Engine | Use for orchestrating multi-step background tasks (e.g., "Charge Card -> Generate Contract -> Wait for Sign -> Release Funds"). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Playwright** | E2E Testing | Critical for testing the full "contract-to-payment" flow across different user roles (Artist/Label). |
| **Stripe CLI** | Webhook Testing | Essential for local development of payment triggers and escrow release logic. |
| **Inngest Dev Server** | Background Jobs | Local UI for visualizing and debugging complex multi-step workflows. |

## Installation

```bash
# Core Framework & Auth
npx create-next-app@latest soundgrid --typescript --tailwind --eslint --app
npm install @auth/nextjs@beta zod react-hook-form @hookform/resolvers

# Database & ORM
npm install prisma @prisma/client @neondatabase/serverless
npx prisma init

# Payments & Contracts
npm install stripe @stripe/stripe-js docusign-esign

# Domain Specific (Music Metadata)
npm install ddex-parser

# State Management & Data Fetching
npm install @tanstack/react-query zustand lucide-react clsx tailwind-merge
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Prisma** | **Drizzle ORM** | If extremely low cold-start latency in serverless environments is more important than developer abstraction. |
| **Auth.js** | **Clerk** | If project timeline is tight and you prefer to offload user management/social login UI entirely to a 3rd party. |
| **Neon** | **Supabase** | If the project requires built-in Realtime or Storage features alongside the database, though Neon is more focused on core Postgres. |
| **DocuSign** | **Dropbox Sign** | If budget is constrained and the high-end enterprise features/branding of DocuSign are not required. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Pages Router** | Deprecated for new Next.js 15+ projects; lacks Server Component performance benefits. | **App Router** |
| **Sequelize** | Poor TypeScript support and high boilerplate compared to modern ORMs. | **Prisma** or **Drizzle** |
| **NextAuth v4** | Not fully compatible with Next.js 15 App Router and middleware on the Edge runtime. | **@auth/nextjs (v5)** |
| **Pure XML Parsers** | Processing DDEX ERN 4.3 with generic XML parsers is slow and error-prone. | **ddex-parser** (Rust bindings) |
| **Manual Escrow** | Building custom escrow accounts is a massive regulatory and security burden. | **Stripe Connect** manual payouts |

## Version Compatibility

| Package | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.1.x` | `react@19.0.x` | Next.js 15 requires React 19 features like `useActionState`. |
| `@auth/nextjs@5.x` | `next@15.x` | Version 5 is designed for the App Router architecture. |
| `prisma@7.x` | `typescript@5.7+` | Improved type-narrowing for Prisma models. |

## Sources

- **NPM Registry** — Verified latest versions for `next`, `prisma`, `stripe`, `docusign-esign`, `ddex-parser`.
- **Next.js Official Docs** — Verified v15 App Router and React 19 integration.
- **Stripe Documentation** — Confirmed Stripe Connect vs Treasury best practices for "escrow-like" flows.
- **DDEX Suite** — Verified `ddex-parser` v0.4.5 capabilities for ERN 4.3.
- **Context7** — Verified Prisma 7 serverless driver compatibility.

---
*Stack research for: Music Industry Commercial Operating System*
*Researched: 2026-02-25*
