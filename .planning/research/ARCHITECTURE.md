# Architecture Research: Music Industry Commercial Operating Systems

**Domain:** Music Industry Fintech, Catalog & Rights Management (SoundGrid)
**Researched:** May 2024
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Dashboard │  │ Catalog │  │ Contract│  │ Payments│        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                        Business Logic                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Event Bus / Jobs Queue           │    │
│  └──────────────────┬───────────────────┬───────────────┘    │
│                     │                   │                   │
│  ┌─────────┐  ┌─────┴───┐  ┌────────────┴┐  ┌─────────┐     │
│  │ Identity│  │ Catalog │  │ Rights/Splits│  │ Payments│     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                        Data & Storage                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Postgres │  │ Redis    │  │ S3 (WORM)│  │ Ledger   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Identity Service** | Auth, RBAC (Artist, Manager, Label), Organization profiles. | NextAuth.js, Clerk, Supabase Auth. |
| **Catalog Service** | Metadata (ISRC/ISWC), Audio assets, DDEX standards, Release management. | Next.js 14 App Router, AWS S3, CloudFront. |
| **Rights & Splits** | Percentage ownership, Contract versioning, E-signature status. | Drizzle/Prisma, HelloSign/DocuSign API. |
| **Payment & Escrow** | Fund holding, Transaction ledger, Payouts, Tax compliance. | Stripe Connect (Manual Payouts/Delayed Capture). |
| **Document Store** | Legally binding PDFs, Immutable storage, SHA-256 integrity checks. | AWS S3 (Object Lock - Compliance Mode). |
| **Event Bus** | Triggering payouts on contract sign, Metadata updates. | BullMQ, Inngest, Upstash QStash. |

## Recommended Project Structure

SoundGrid uses a **monorepo** structure for code reuse between web and potentially mobile/CLI tools.

```
soundgrid/
├── apps/
│   └── web/              # Next.js 14 App Router (Primary UI/API)
│       ├── app/          # Routes, Layouts, Server Components
│       ├── components/   # UI components
│       └── lib/          # App-specific logic
├── packages/
│   ├── core/             # Business logic (Services, Validators)
│   ├── db/               # Prisma/Drizzle schemas, Migrations
│   ├── payment/          # Stripe Connect logic, Escrow handlers
│   ├── storage/          # S3 Object Lock wrappers, File hashing
│   ├── ui/               # Shared React components (Tailwind)
│   └── config/           # Shared ESLint, TypeScript, Tailwind config
└── .planning/            # Project planning & research
```

### Structure Rationale

- **packages/payment/:** Critical logic for escrow and ledger isolated for rigorous testing and potential reuse in sub-apps.
- **packages/storage/:** Abstracting S3 Object Lock and integrity hashing ensures legal compliance is handled consistently across the system.
- **apps/web/ (App Router):** Leveraging Next.js 14 features like Server Components for secure data fetching and Server Actions for form submissions (Contract signing).

## Architectural Patterns

### Pattern 1: Double-Entry Ledger for Escrow

**What:** Every monetary movement is recorded as two entries (Debit/Credit) in a ledger table, ensuring balance and auditability.
**When to use:** Whenever managing funds between parties (Escrow).
**Trade-offs:** More complex than simple "balance" columns but prevents data inconsistency.

**Example:**
```typescript
interface LedgerEntry {
  id: string;
  amount: number; // In cents
  type: 'DEBIT' | 'CREDIT';
  account: 'ESCROW' | 'ARTIST_WALLET' | 'PLATFORM_FEES';
  referenceType: 'PAYMENT_INTENT' | 'CONTRACT_PAYOUT';
  referenceId: string;
}
```

### Pattern 2: WORM (Write Once Read Many) for Legal Documents

**What:** Storing PDFs with S3 Object Lock in "Compliance Mode" where no user can delete the file for a set period.
**When to use:** Storing legally binding signed contracts and financial reports.
**Trade-offs:** Higher cost (cannot delete junk), but essential for high-trust environments.

### Pattern 3: Event-Driven State Transitions

**What:** Using a queue/bus to handle long-running operations like "Contract Signed -> Generate PDF -> Upload to S3 -> Fund Escrow".
**When to use:** Complex multi-step business workflows.
**Trade-offs:** Requires reliable message delivery (idempotency is a must).

## Data Flow

### Request Flow (Contract Signing)

```
[Artist Signs Contract (UI)]
    ↓
[Server Action (Next.js)] → [E-Sign Service (API)] → [Webhook Receiver]
    ↓                          ↓                      ↓
[Update DB Status] ← [Background Job: PDF Lock] ← [Upload to S3 (WORM)]
    ↓
[Trigger Stripe PaymentIntent Capture (Escrow)]
```

### State Management

SoundGrid favors **Server State** over Client State.
- **Server:** React Server Components (RSC) + React Query (for client caching if needed).
- **Client:** Minimal Zustand/Context for UI state (modals, toasts).

### Key Data Flows

1. **Metadata Ingestion:** Artist uploads audio -> Extraction of ID3/WAV tags -> Validation against ISRC/ISWC formats -> Catalog Entry.
2. **Escrow Funding:** Buyer pays -> Stripe PaymentIntent (Authorized) -> Contract Signed -> Stripe Capture -> Ledger Credit (Escrow).
3. **Fund Release:** Milestones met -> Admin/System approval -> Ledger Debit (Escrow) / Credit (Artist) -> Stripe Payout.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolithic Next.js + Postgres. Vertical scaling. |
| 1k-50k users | Read Replicas for analytics (Royalty reporting). Offload jobs to BullMQ/Redis. |
| 50k+ users | Microservices for Royalty Engine (Go/Rust for perf). S3 Glacier for historical reports. |

### Scaling Priorities

1. **First bottleneck:** Royalty calculations across thousands of tracks. Fix: Offload to background workers with batching.
2. **Second bottleneck:** Ledger table size. Fix: Horizontal partitioning (Sharding) or Time-series DB for audit logs.

## Anti-Patterns

### Anti-Pattern 1: Floats for Financial Values

**What people do:** Use `number` or `float` for currency ($10.50).
**Why it's wrong:** Floating point errors lead to missing cents over time.
**Do this instead:** Store as `integers` in smallest unit (cents: 1050).

### Anti-Pattern 2: Mutable Contract Versions

**What people do:** Update the same database row for contract changes.
**Why it's wrong:** Destroys legal audit trail.
**Do this instead:** Each version is a new row; link to a parent "AgreementID".

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Stripe Connect** | Webhooks + Server SDK | Handles KYC, Escrow-like payouts. |
| **AWS S3** | SDK (Object Lock) | WORM storage for legal/financial docs. |
| **DocuSign/HelloSign** | Embeded Iframe/Webhooks | Digital signature for binding contracts. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Catalog ↔ Rights** | Direct API / Service Call | Metadata is read-only for Rights. |
| **Rights ↔ Payment** | Event Bus (Webhook/Job) | Decouple "Sign" from "Pay" to handle failures. |

## Sources

- [Stripe Connect Marketplace Patterns](https://stripe.com/docs/connect)
- [AWS S3 Object Lock Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Music Industry Standards (DDEX, ISRC)](https://www.ddex.net/)
- [Domain-Driven Design (DDD) in Fintech](https://martinfowler.com/articles/patterns-of-distributed-systems/)

---
*Architecture research for: Music Industry Operating Systems (SoundGrid)*
*Researched: May 2024*
