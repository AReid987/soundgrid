---
type: Page
title: Soundgrid System Architecture
aliases: null
description: null
icon: null
createdAt: '2026-02-24T16:10:48.906Z'
creationDate: 2026-02-24 10:10
modificationDate: 2026-02-24 10:12
tags: []
coverImage: null
---

# SoundGrid — System Architecture Document v1

**Prepared:** February 24, 2026
**Author:** Ava "Architect" Chen — Principal Systems Architect
**Status:** APPROVED — Engineering Reference Document
**Version:** 1.0

---

## Table of Contents

1. Architecture Overview (#1-architecture-overview)

2. System Context Diagram (#2-system-context-diagram)

3. Service Architecture (#3-service-architecture)

4. Data Architecture (#4-data-architecture)

5. API Design (#5-api-design)

6. Infrastructure & Deployment (#6-infrastructure--deployment)

7. Security Architecture (#7-security-architecture)

8. Integration Architecture (#8-integration-architecture)

9. Observability & Monitoring (#9-observability--monitoring)

10. Scalability & Performance (#10-scalability--performance)

11. Disaster Recovery & Business Continuity (#11-disaster-recovery--business-continuity)

12. Architecture Decision Records (#12-architecture-decision-records)

---

## 1. Architecture Overview

### 1.1 Guiding Principles

1. **API-first:** Every service exposes a versioned REST or GraphQL API. No direct service-to-service DB queries.

2. **Event-driven core:** Business-critical state transitions (contract signed, payment released, booking confirmed) are published as domain events. Consumers are decoupled and independently scalable.

3. **Security by design:** Encryption at rest and in transit on every layer. Zero trust between services. Principle of least privilege on all IAM roles.

4. **Progressive complexity:** MVP is a modular monolith with clear service boundaries. Services are extracted to microservices as traffic and team scale demand.

5. **Managed services over custom:** Leverage managed cloud services (RDS, ElastiCache, SQS, S3) to minimize operational burden on a small engineering team.

6. **Escrow as a trust primitive:** Payment escrow is treated as a first-class architectural concern — never a side feature. It has its own service, its own audit log, and its own compliance boundary.

### 1.2 Architecture Style

**Phase 1 (MVP — Months 1–4):** Modular Monolith

- Single deployable Rails/Node application with clearly bounded internal modules

- Shared PostgreSQL database with schema-level module isolation

- Deployed on AWS ECS (Fargate) — containerized but not yet microservices

- Rationale: 4-engineer team moves faster without distributed systems overhead; module boundaries enable future extraction

**Phase 2 (V1 — Months 5–9):** Hybrid — Extract Critical Services

- ContractGrid payment/escrow extracted to standalone Escrow Service

- SyncGrid audio processing extracted to standalone Media Service

- Core platform remains modular monolith

- Introduce async event bus (AWS SQS + SNS) for cross-module communication

**Phase 3 (V2 — Months 10–18):** Full Microservices

- Each pillar (ContractGrid, SyncGrid, LiveGrid) becomes an independent service

- API Gateway for unified external interface

- Event sourcing for audit-critical domains (contracts, payments)

- Kubernetes orchestration (EKS)

---

## 2. System Context Diagram

```markdown
┌────────────────────────────────────────────────────────────────────-─┐
│                        EXTERNAL ACTORS                               │
│                                                                      │
│  [Artist/Producer]  [Music Supervisor]  [Venue Operator]  [Manager]  │
│         │                  │                  │               │      │
└─────────┼──────────────────┼──────────────────┼───────────────┼──────┘
          │                  │                  │               │
          ▼                  ▼                  ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SOUNDGRID WEB APPLICATION                        │
│              (React SPA + Next.js SSR — see Frontend Arch)          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS / REST + GraphQL
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                 │
│              (AWS API Gateway / Kong — auth, rate limit, routing)   │
└───────┬──────────────┬──────────────┬──────────────┬───────────-────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Auth        │ │  Contract    │ │  Sync        │ │  Live        │
│  Service     │ │  Service     │ │  Service     │ │  Service     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED INFRASTRUCTURE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │PostgreSQL│  │  Redis   │  │  AWS S3  │  │  Event Bus       │   │
│  │(RDS)     │  │(ElastiC.)│  │(Storage) │  │  (SQS/SNS)       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
        │                │                │                │
        ▼                ▼                ▼                ▼
┌──────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Stripe  │    │   DocuSign   │  │  SendGrid    │  │  Twilio      │
│(Payments)│    │(E-Signature) │  │  (Email)     │  │  (SMS)       │
└──────────┘    └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Service Architecture

### 3.1 Auth Service

**Responsibility:** User registration, authentication, session management, role/permission enforcement, identity verification coordination.

**Technology Stack:**

- Runtime: Node.js 20 (TypeScript)

- Framework: Express.js

- Auth library: Passport.js (JWT strategy + OAuth2)

- Token store: Redis (JWT refresh tokens, session blacklist)

**Key Endpoints:**

```text
POST   /auth/register          — Create account + send verification email
POST   /auth/login             — Email/password login → JWT pair
POST   /auth/refresh           — Refresh access token
POST   /auth/logout            — Invalidate refresh token
GET    /auth/oauth/google      — Google OAuth initiation
GET    /auth/oauth/apple       — Apple OAuth initiation
POST   /auth/verify-email      — Email verification token
POST   /auth/2fa/enroll        — TOTP 2FA enrollment
POST   /auth/2fa/verify        — TOTP verification
POST   /auth/identity/initiate — Initiate Stripe Identity check
GET    /auth/identity/status   — Poll Stripe Identity verification status
```

**JWT Token Design:**

```json
{
  "sub": "usr_abc123",
  "email": "user@example.com",
  "roles": ["producer", "artist"],
  "tier": "professional",
  "identity_verified": true,
  "org_id": null,
  "iat": 1740000000,
  "exp": 1740003600
}
```

**Session Strategy:**

- Access token: 15-minute expiry (JWT, stateless)

- Refresh token: 30-day expiry (stored in Redis, httpOnly cookie)

- Concurrent session limit: 5 devices per user

---

### 3.2 Contract Service

**Responsibility:** Contract lifecycle management — creation, template management, negotiation workflow, e-signature orchestration, version history, document storage.

**Technology Stack:**

- Runtime: Ruby 3.3 / Rails 7.2 (API mode)

- Database: PostgreSQL (schema: `contracts`)

- Background jobs: Sidekiq + Redis

- Document generation: Prawn (PDF) + DocuSign SDK

- AI integration: OpenAI API (clause suggestions, conflict detection)

**Key Domain Models:**

```text
Contract
  id, type, status, creator_id, title, template_id
  created_at, updated_at, expires_at
ContractParty
  id, contract_id, user_id, role (creator/signer/observer)
  signature_status, signed_at, ip_address
ContractClause
  id, contract_id, position, clause_type, content
  is_custom, ai_flagged, version
ContractVersion
  id, contract_id, version_number, snapshot (JSONB)
  author_id, change_summary, created_at
NegotiationThread
  id, contract_id, status (open/closed)
  round_number
NegotiationMessage
  id, thread_id, author_id, content, message_type
  (comment/proposal/acceptance/rejection)
ContractDocument
  id, contract_id, version, s3_key, document_type
  (draft/final/signed), generated_at
EscrowConfig
  id, contract_id, trigger_type, trigger_value
  total_amount, platform_fee_pct, status
  stripe_payment_intent_id
```

**Contract State Machine:**

```text
DRAFT → PENDING_REVIEW → IN_NEGOTIATION → PENDING_SIGNATURE
      → FULLY_SIGNED → PAYMENT_PENDING → PAYMENT_RELEASED
      → COMPLETED | DISPUTED | VOIDED | EXPIRED
```

**Key Endpoints:**

```text
POST   /contracts                    — Create contract from template
GET    /contracts                    — List user's contracts (paginated)
GET    /contracts/:id                — Get contract detail
PATCH  /contracts/:id                — Update draft contract
POST   /contracts/:id/submit         — Submit for counterparty review
POST   /contracts/:id/negotiate      — Submit negotiation round
POST   /contracts/:id/accept-terms   — Accept current terms
POST   /contracts/:id/send-signature — Initiate DocuSign envelope
GET    /contracts/:id/versions       — Get version history
GET    /contracts/:id/document       — Download signed PDF
POST   /contracts/:id/void           — Void contract
GET    /templates                    — List available templates
GET    /templates/:id                — Get template with default clauses
POST   /templates/:id/customize      — Create contract from template
```

**DocuSign Integration Flow:**

```text
1. Contract reaches PENDING_SIGNATURE state
2. Contract Service generates final PDF via Prawn
3. Upload PDF to DocuSign as document
4. Create DocuSign envelope with signatories from ContractParty
5. Send envelope → DocuSign triggers email to each signer
6. DocuSign webhook → Contract Service on envelope events:
   - recipient_completed → update ContractParty.signature_status
   - envelope_completed → update Contract.status → FULLY_SIGNED
                        → publish ContractSigned domain event
7. ContractSigned event consumed by Escrow Service → trigger payment
```

---

### 3.3 Escrow Service

**Responsibility:** Payment escrow lifecycle — fund collection, holding, conditional release, split distribution, dispute handling, audit trail. This service is the financial trust core of SoundGrid.

**Technology Stack:**

- Runtime: Node.js 20 (TypeScript)

- Framework: Fastify (high-performance, low overhead for financial operations)

- Database: PostgreSQL (schema: `escrow`) — separate schema for compliance isolation

- External: Stripe Connect + Stripe Treasury

**Key Domain Models:**

```text
EscrowAccount
  id, user_id, stripe_account_id, stripe_treasury_financial_account_id
  status (pending/active/restricted), balance_usd, created_at
EscrowTransaction
  id, contract_id, payer_id, amount_cents, platform_fee_cents
  trigger_type, trigger_value, status
  stripe_payment_intent_id, stripe_transfer_id
  initiated_at, released_at, disputed_at
EscrowSplit
  id, transaction_id, recipient_id, amount_cents, percentage
  stripe_transfer_id, transferred_at
EscrowAuditLog
  id, transaction_id, event_type, actor_id, metadata (JSONB)
  created_at
EscrowDispute
  id, transaction_id, initiator_id, reason, status
  evidence_s3_key, resolution, resolved_at
```

**Payment Flow:**

```text
1. Contract FULLY_SIGNED → ContractSigned event received
2. Escrow Service validates EscrowConfig for contract
3. Create Stripe PaymentIntent for payer (amount + platform fee)
4. Payer completes payment → funds held in Stripe Treasury account
5. Monitor trigger condition:
   a. ON_SIGNATURE → immediate (already satisfied)
   b. ON_DATE → Sidekiq scheduled job at trigger_value datetime
   c. ON_MILESTONE → await manual confirmation from payer
6. Trigger fires → initiate Stripe Transfer(s) to recipient(s)
7. For split payments: create Transfer per EscrowSplit
8. Deduct platform fee (2.5%) → transfer to SoundGrid Stripe account
9. Publish PaymentReleased domain event
10. All steps logged to EscrowAuditLog
```

**Key Endpoints:**

```text
POST   /escrow/setup              — Configure escrow for contract
GET    /escrow/:contract_id       — Get escrow status + balance
POST   /escrow/:id/fund           — Initiate payer payment
POST   /escrow/:id/release        — Manual release trigger
POST   /escrow/:id/dispute        — Initiate dispute
GET    /escrow/:id/audit-log      — Get full audit trail
GET    /escrow/account/balance    — User's pending/available balance
```

---

### 3.4 Media Service

**Responsibility:** Audio file ingestion, processing, storage, metadata extraction, AI-powered tagging, sync-ready validation.

**Technology Stack:**

- Runtime: Python 3.12

- Framework: FastAPI

- Audio processing: FFmpeg (via subprocess), librosa (audio analysis)

- AI tagging: OpenAI Whisper (if lyrics present) + custom ML model for mood/genre

- Storage: AWS S3 + CloudFront CDN

- Queue: AWS SQS for async processing jobs

**Audio Processing Pipeline:**

```text
1. Client uploads audio file → presigned S3 URL (direct upload, bypasses server)
2. S3 upload event → SQS message → Media Service worker picks up
3. Worker pipeline:
   a. Validate file format + size (WAV/AIFF/FLAC/MP3, max 500MB)
   b. Extract technical metadata: BPM, key, duration, sample rate, bit depth
   c. Generate waveform visualization data (JSON)
   d. Create MP3 preview (128kbps, 30-second preview clip)
   e. AI mood/genre tag inference → top 5 suggestions with confidence scores
   f. ISRC lookup / auto-generation if absent
   g. Update track record: status → processed, all extracted fields populated
4. Publish TrackProcessed event → notify client via WebSocket or polling
```

**Key Endpoints:**

```text
POST   /media/tracks/upload-url     — Generate presigned S3 upload URL
GET    /media/tracks/:id/status     — Poll processing status
GET    /media/tracks/:id/waveform   — Get waveform data
GET    /media/tracks/:id/preview    — Stream 30-second preview
POST   /media/tracks/:id/metadata   — Update user-provided metadata
GET    /media/tracks/:id/sync-score — Get sync-readiness score (0-100)
DELETE /media/tracks/:id            — Remove track + S3 objects
```

---

### 3.5 Sync Service

**Responsibility:** Sync opportunity marketplace — brief posting, catalog matching, submission management, license generation routing.

**Technology Stack:**

- Runtime: Python 3.12

- Framework: FastAPI

- Search: AWS OpenSearch (Elasticsearch-compatible) for catalog discovery

- AI matching: Semantic similarity via OpenAI text-embedding-3-small on track metadata vectors

- Database: PostgreSQL (schema: `sync`)

**Key Domain Models:**

```text
SyncOpportunity
  id, supervisor_id, title, project_type, mood_tags[], genre_tags[]
  budget_min, budget_max, territory, exclusivity, deadline, status
SyncSubmission
  id, opportunity_id, artist_id, track_id, message, status
  submitted_at, reviewed_at, shortlisted_at
SyncDeal
  id, submission_id, license_type, fee_cents, territory
  exclusivity, duration_months, contract_id, status
TrackSearchIndex (OpenSearch document)
  track_id, title, artist_id, mood_tags, genre_tags
  bpm, key, duration, sync_readiness_score
  embedding_vector (1536-dim for semantic search)
```

**Search Architecture:**

```text
Dual-index search strategy:
1. Keyword search: OpenSearch BM25 on mood_tags, genre_tags, title
2. Semantic search: Cosine similarity on embedding_vector
   (brief description → embed → find nearest track vectors)
3. Hybrid ranking: RRF (Reciprocal Rank Fusion) combining both scores
4. Filters applied post-ranking: territory, exclusivity, sync_readiness_score >= 80
```

---

### 3.6 Live Service

**Responsibility:** Venue marketplace, tour routing, booking workflow, performance agreement generation.

**Technology Stack:**

- Runtime: Node.js 20 (TypeScript)

- Framework: Express.js

- Geospatial: PostGIS extension on PostgreSQL for venue proximity queries

- Routing algorithm: Google Maps Distance Matrix API + custom greedy tour optimizer

- Database: PostgreSQL + PostGIS (schema: `live`)

**Key Domain Models:**

```text
Venue
  id, operator_id, name, location (GEOGRAPHY POINT), capacity
  genre_tags[], venue_type, tech_rider_url, typical_fee_range
  photos_s3_keys[], booking_contact, soundgrid_rating
TourRoute
  id, artist_id, name, start_date, end_date, status
  start_city, end_city, optimization_criteria
TourStop
  id, route_id, venue_id, proposed_date, status
  drive_time_from_prev_hours, distance_from_prev_miles
BookingInquiry
  id, artist_id, venue_id, proposed_date, proposed_fee
  message, status, responded_at
LiveBooking
  id, inquiry_id, confirmed_date, confirmed_fee
  contract_id, status
```

---

### 3.7 Notification Service

**Responsibility:** Unified notification delivery across all channels (in-app, email, SMS). Consumes domain events from all services.

**Technology Stack:**

- Runtime: Node.js 20 (TypeScript)

- Message broker: AWS SQS (event consumption)

- Email: SendGrid API

- SMS: Twilio API

- In-app: WebSocket (Socket.io) + Redis pub/sub for real-time delivery

- Database: PostgreSQL (schema: `notifications`)

**Event Subscriptions:**

```text
ContractSigned        → notify all parties: "Your contract has been signed"
PaymentReleased       → notify recipient: "Payment of $X released to your account"
PaymentOverdue        → notify payer: "Payment overdue: X contract"
NegotiationProposal   → notify counterparty: "New terms proposed on X contract"
SyncSubmissionUpdate  → notify artist: "Your submission was shortlisted/rejected"
BookingInquiryReceived → notify venue: "New booking inquiry from [Artist]"
ContractExpiring      → notify all parties: "Contract expires in 48 hours"
```

---

## 4. Data Architecture

### 4.1 Database Strategy

**Primary Database:** AWS RDS PostgreSQL 16 (Multi-AZ in production)

**Schema Isolation by Service:**

```text
soundgrid_db
├── schema: auth         (users, sessions, oauth_accounts, identity_verifications)
├── schema: contracts    (contracts, clauses, versions, parties, negotiations, documents)
├── schema: escrow       (accounts, transactions, splits, audit_logs, disputes)
├── schema: media        (tracks, audio_files, waveforms, processing_jobs)
├── schema: sync         (opportunities, submissions, deals)
├── schema: live         (venues, routes, stops, inquiries, bookings)
└── schema: notifications (templates, deliveries, preferences)
```

**Cross-Schema References:** Foreign key constraints are NOT used across schemas. References are by ID with application-level joins. This enables future schema-per-database extraction.

### 4.2 Core Data Models

#### Users (auth schema)

```sql
CREATE TABLE auth.users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),
  email_verified  BOOLEAN DEFAULT FALSE,
  roles           TEXT[] DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  identity_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
CREATE TABLE auth.profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  display_name    VARCHAR(255),
  bio             TEXT,
  avatar_s3_key   VARCHAR(500),
  genre_tags      TEXT[],
  social_links    JSONB DEFAULT '{}',
  public_profile_slug VARCHAR(100) UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Contracts (contracts schema)

```sql
CREATE TABLE contracts.contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL,
  template_id     UUID,
  contract_type   VARCHAR(100) NOT NULL,
  title           VARCHAR(500) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'draft',
  current_version INTEGER DEFAULT 1,
  expires_at      TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE contracts.clauses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts.contracts(id),
  position        INTEGER NOT NULL,
  clause_key      VARCHAR(100) NOT NULL,
  clause_type     VARCHAR(50) NOT NULL,
  label           VARCHAR(255),
  content         TEXT NOT NULL,
  is_custom       BOOLEAN DEFAULT FALSE,
  ai_flagged      BOOLEAN DEFAULT FALSE,
  is_locked       BOOLEAN DEFAULT FALSE,
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Escrow Transactions (escrow schema)

```sql
CREATE TABLE escrow.transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id             UUID NOT NULL,
  payer_id                UUID NOT NULL,
  amount_cents            INTEGER NOT NULL,
  platform_fee_cents      INTEGER NOT NULL,
  currency                CHAR(3) DEFAULT 'USD',
  trigger_type            VARCHAR(50) NOT NULL,
  trigger_value           JSONB,
  status                  VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id        VARCHAR(255),
  funded_at               TIMESTAMPTZ,
  released_at             TIMESTAMPTZ,
  disputed_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE escrow.splits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      UUID NOT NULL REFERENCES escrow.transactions(id),
  recipient_id        UUID NOT NULL,
  percentage          DECIMAL(5,2) NOT NULL,
  amount_cents        INTEGER NOT NULL,
  stripe_transfer_id  VARCHAR(255),
  transferred_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE escrow.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES escrow.transactions(id),
  event_type      VARCHAR(100) NOT NULL,
  actor_id        UUID,
  actor_type      VARCHAR(50),
  metadata        JSONB DEFAULT '{}',
  ip_address      INET,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Caching Strategy

**Redis (AWS ElastiCache):**

```text
Cache Layer 1 — Session & Auth:
  Key: session:{user_id}:{device_id}  TTL: 30 days
  Key: refresh_token:{token_hash}      TTL: 30 days
  Key: rate_limit:{ip}:{endpoint}      TTL: 60 seconds
Cache Layer 2 — Application:
  Key: user_profile:{user_id}          TTL: 15 minutes
  Key: contract:{contract_id}          TTL: 5 minutes (draft)
  Key: template_list:{tier}            TTL: 1 hour
  Key: sync_opportunity_list:{filters} TTL: 5 minutes
Cache Layer 3 — Search:
  Key: search:{query_hash}:{filters}   TTL: 2 minutes
  Key: track_sync_score:{track_id}     TTL: 30 minutes
```

**Cache Invalidation:**

- Contract cache invalidated on any status change (event-driven)

- Profile cache invalidated on profile update

- Search cache invalidated on new track/opportunity creation

### 4.4 File Storage Architecture

**AWS S3 Bucket Structure:**

```text
soundgrid-prod-media/
├── audio/
│   ├── originals/{user_id}/{track_id}/original.{ext}
│   ├── previews/{user_id}/{track_id}/preview_30s.mp3
│   └── waveforms/{user_id}/{track_id}/waveform.json
soundgrid-prod-documents/
├── contracts/
│   ├── drafts/{contract_id}/v{n}.pdf
│   └── signed/{contract_id}/signed_final.pdf
├── riders/
│   └── {venue_id}/tech_rider.pdf
soundgrid-prod-avatars/
└── profiles/{user_id}/avatar.{ext}
```

**Access Control:**

- Audio originals: Private — accessed via presigned URLs (1-hour expiry)

- Audio previews: Public via CloudFront CDN (music discovery requires public access)

- Contracts (drafts): Private — presigned URL, signatories only

- Contracts (signed): Private — presigned URL, signatories only, 7-year retention

- Avatars: Public via CloudFront

---

## 5. API Design

### 5.1 API Standards

- **Style:** RESTful JSON API (primary) + GraphQL (for complex dashboard queries, V2)

- **Versioning:** URL path versioning `/api/v1/`, `/api/v2/`

- **Authentication:** Bearer token (JWT) in `Authorization` header

- **Response format:**

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-02-24T10:00:00Z"
  },
  "errors": null
}
```

- **Error format:**

```json
{
  "data": null,
  "errors": [
    {
      "code": "CONTRACT_NOT_FOUND",
      "message": "Contract with ID abc123 not found",
      "field": null,
      "status": 404
    }
  ]
}
```

- **Pagination:** Cursor-based for all list endpoints

```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6ICIxMjMifQ==",
    "has_next": true,
    "total_count": 247
  }
}
```

### 5.2 Rate Limiting

| Tier            | Requests/minute | Burst |
| :-------------- | :-------------- | :---- |
| Unauthenticated | 20              | 30    |
| Free            | 60              | 100   |
| Creator         | 120             | 200   |
| Professional    | 300             | 500   |
| Enterprise      | 1,000           | 2,000 |

**Headers returned:**

```text
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 247
X-RateLimit-Reset: 1740000060
```

### 5.3 Webhook Design (Inbound from Partners)

All inbound webhooks validated via HMAC-SHA256 signature:

```text
POST /webhooks/docusign      — DocuSign envelope events
POST /webhooks/stripe        — Stripe payment events
POST /webhooks/stripe/identity — Stripe Identity verification events
```

**Webhook processing pattern:**

1. Validate signature immediately (return 200 even if invalid to prevent retry loops — log and discard)

2. Enqueue event to SQS for async processing (webhook handler is non-blocking)

3. Process event in background worker

4. Idempotency check: skip if event_id already processed

---

## 6. Infrastructure & Deployment

### 6.1 AWS Architecture (Production)

```text
Region: us-east-1 (primary) | us-west-2 (DR)
VPC Layout:
├── Public Subnets (2 AZs)
│   ├── Application Load Balancer
│   └── NAT Gateway
├── Private Subnets — Application (2 AZs)
│   ├── ECS Fargate (API services)
│   └── ECS Fargate (Background workers)
└── Private Subnets — Data (2 AZs)
    ├── RDS PostgreSQL (Multi-AZ)
    ├── ElastiCache Redis (cluster mode)
    └── OpenSearch (2-node cluster)
CDN: CloudFront
  ├── Origin 1: S3 (media/documents)
  └── Origin 2: ALB (API — for caching GET responses)
DNS: Route 53
  ├── soundgrid.io → CloudFront (web app)
  ├── api.soundgrid.io → ALB (API)
  └── cdn.soundgrid.io → CloudFront (media)
```

### 6.2 Container Architecture (ECS Fargate)

**Services (MVP — modular monolith containers):**

```text
soundgrid-api          2 tasks × (0.5 vCPU, 1GB RAM)  → scale to 10
soundgrid-worker       2 tasks × (1 vCPU, 2GB RAM)    → scale to 8
soundgrid-media-worker 1 task  × (2 vCPU, 4GB RAM)    → scale to 4
```

**Auto-scaling triggers:**

- CPU > 70% for 2 consecutive minutes → add task

- CPU < 30% for 5 consecutive minutes → remove task (min 2 tasks always)

- SQS queue depth > 100 messages → scale worker immediately

### 6.3 CI/CD Pipeline

```text
GitHub Repository
├── main branch          → Production deployment
├── staging branch       → Staging environment
└── feature/* branches   → Preview environments (ephemeral)
Pipeline (GitHub Actions):
1. PR opened →
   a. Run test suite (RSpec / Jest)
   b. Run linter (RuboCop / ESLint)
   c. Security scan (Brakeman / npm audit)
   d. Docker build (validate image builds)
   e. Preview environment deploy (ECS)
2. Merge to staging →
   a. Full test suite
   b. Build + push Docker image to ECR (tag: staging-{sha})
   c. Deploy to staging ECS cluster
   d. Run smoke tests against staging
   e. Notify team on Slack
3. Merge to main (via PR from staging) →
   a. Full test suite
   b. Build + push Docker image to ECR (tag: {version}-{sha})
   c. Blue/green deployment to production ECS
   d. Health check validation (5 minutes)
   e. Automatic rollback if health checks fail
   f. Deploy notification + changelog post
```

### 6.4 Environment Strategy

| Environment | Purpose                   | Database                      | Scale              |
| :---------- | :------------------------ | :---------------------------- | :----------------- |
| Local (dev) | Engineer development      | Docker PostgreSQL             | Single container   |
| Preview     | PR review                 | Shared staging DB (read-only) | 1 task             |
| Staging     | Pre-production validation | Staging RDS                   | 1 task per service |
| Production  | Live platform             | Production RDS (Multi-AZ)     | 2–10 tasks         |

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**JWT Security:**

- Algorithm: RS256 (asymmetric — public key verification at API gateway)

- Access token expiry: 15 minutes

- Refresh token: httpOnly, SameSite=Strict cookie; stored hash in Redis

- Token rotation: New refresh token issued on every refresh (old invalidated)

**Authorization Model (RBAC + ABAC hybrid):**

```text
Every API request evaluates:
1. Is the JWT valid and unexpired? (RBAC — role in token)
2. Does the user's tier permit this feature? (RBAC — tier in token)
3. Does the user own or have explicit access to this resource? (ABAC — resource check)
Example: GET /contracts/:id
  1. Valid JWT: YES
  2. Tier check: Free tier can read contracts → PASS
  3. Resource check: user_id in ContractParty for this contract_id → PASS or 403
```

**Service-to-Service Auth:**

- Internal services communicate via private VPC subnets (no public internet)

- Service identity via IAM roles (ECS task roles)

- Shared secret for service mesh communication (rotated monthly)

### 7.2 Data Security

| Layer                    | Mechanism                                                         |
| :----------------------- | :---------------------------------------------------------------- |
| Data at rest (RDS)       | AWS RDS encryption (AES-256, KMS managed key)                     |
| Data at rest (S3)        | S3 SSE-KMS (customer-managed KMS key)                             |
| Data at rest (Redis)     | ElastiCache encryption at rest (AES-256)                          |
| Data in transit          | TLS 1.3 enforced at ALB; internal VPC traffic TLS 1.2+            |
| Contract documents       | AES-256 at rest; access via presigned URL only (max 1hr)          |
| PII fields (email, name) | Encrypted at application layer before DB write (V2 — post SOC2)   |
| Escrow audit log         | Append-only table (no UPDATE/DELETE permissions on escrow schema) |

### 7.3 Compliance Controls

**SOC 2 Type II Preparation (Target: Month 12):**

- CC1: Control Environment — documented policies, security training

- CC6: Logical Access — RBAC, MFA enforcement for admin, access reviews quarterly

- CC7: System Operations — monitoring, incident response playbook

- CC8: Change Management — CI/CD pipeline, PR reviews required, deploy approvals

- CC9: Risk Mitigation — vendor security reviews (DocuSign, Stripe SOC2 reviewed)

**GDPR / CCPA:**

- Data deletion: soft-delete → hard-delete after 30 days; contracts retained 7 years (legal requirement override)

- Data portability: Export endpoint returns all user data as JSON + PDF package

- Consent management: Explicit opt-in for marketing; cookie consent banner

- DPA: Data Processing Agreements with all sub-processors (AWS, Stripe, DocuSign, SendGrid)

---

## 8. Integration Architecture

### 8.1 Stripe Integration (Critical Path)

**Products used:**

- **Stripe Connect** (Express accounts) — marketplace payment routing

- **Stripe Treasury** — escrow fund holding in financial accounts

- **Stripe Identity** — KYC/identity verification for payouts

- **Stripe Billing** — subscription management

**Connect Account Flow:**

```text
1. User registers on SoundGrid
2. User enables "receive payments" → onboarding to Stripe Connect Express
3. Stripe hosted onboarding (bank account, SSN last 4, DOB)
4. Stripe webhooks: account.updated → update user.stripe_account_status
5. Payout: Stripe Transfer from SoundGrid platform account → connected account
6. Stripe Treasury: Connected account has financial account for escrow holding
```

**Webhook Events Consumed:**

```text
payment_intent.created        → Log escrow funding initiation
payment_intent.succeeded      → Update EscrowTransaction.status → funded
transfer.created              → Log split payout initiation
transfer.paid                 → Update EscrowSplit.transferred_at
account.updated               → Update user Stripe account status
identity.verification_session.verified → Update user.identity_verified = true
customer.subscription.created → Activate subscription tier
customer.subscription.deleted → Downgrade to free tier
invoice.payment_failed        → Trigger dunning workflow
```

### 8.2 DocuSign Integration

**API version:** DocuSign eSignature REST API v2.1
**Authentication:** OAuth 2.0 JWT Grant (server-to-server)

**Envelope Creation Pattern:**

```javascript
const envelope = {
  emailSubject: `Sign: ${contract.title}`,
  documents: [{
    documentBase64: pdfBase64,
    name: contract.title,
    fileExtension: 'pdf',
    documentId: '1'
  }],
  recipients: {
    signers: contract.parties.map((party, idx) => ({
      email: party.email,
      name: party.display_name,
      recipientId: String(idx + 1),
      routingOrder: String(idx + 1),
      tabs: {
        signHereTabs: [getSignaturePosition(party.role, contract.type)]
      }
    }))
  },
  status: 'sent'
};
```

### 8.3 Event Bus Architecture (AWS SQS/SNS)

**Topic/Queue Design:**

```text
SNS Topics (publishers):
  soundgrid-contracts-events     (Contract Service publishes)
  soundgrid-escrow-events        (Escrow Service publishes)
  soundgrid-sync-events          (Sync Service publishes)
  soundgrid-live-events          (Live Service publishes)
  soundgrid-media-events         (Media Service publishes)
SQS Queues (subscribers):
  escrow-contract-events-queue   ← subscribes to contracts-events
  notifications-all-events-queue ← subscribes to all topics
  analytics-events-queue         ← subscribes to all topics
  audit-log-events-queue         ← subscribes to escrow-events (compliance)
Dead Letter Queues:
  Each queue has a DLQ with 3-retry policy
  DLQ messages trigger CloudWatch alarm → PagerDuty alert
```

**Domain Events Schema:**

```json
{
  "event_id": "evt_abc123",
  "event_type": "ContractSigned",
  "service": "contract-service",
  "version": "1.0",
  "timestamp": "2026-02-24T10:00:00Z",
  "payload": {
    "contract_id": "con_xyz789",
    "contract_type": "producer_agreement",
    "parties": ["usr_111", "usr_222"],
    "escrow_config_id": "esc_456"
  }
}
```

---

## 9. Observability & Monitoring

### 9.1 Logging

**Strategy:** Structured JSON logs → CloudWatch Logs → CloudWatch Log Insights

**Log format:**

```json
{
  "timestamp": "2026-02-24T10:00:00.123Z",
  "level": "info",
  "service": "contract-service",
  "request_id": "req_abc123",
  "user_id": "usr_xyz",
  "action": "contract.create",
  "duration_ms": 145,
  "status": "success",
  "metadata": {}
}
```

**Log retention:** 30 days CloudWatch; 1 year S3 archive; 7 years for escrow audit logs

### 9.2 Metrics & Alerting

**Key metrics monitored (CloudWatch + Datadog):**

```text
Business Metrics:
  contracts_created_per_hour
  contracts_signed_per_hour
  escrow_gmv_per_day
  new_subscriptions_per_day
  payment_failures_per_hour
Technical Metrics:
  api_response_time_p95
  api_error_rate (target: <0.1%)
  db_query_time_p95
  sqs_queue_depth (alert: >1000)
  ecs_cpu_utilization
  ecs_memory_utilization
  rds_connections (alert: >80% max)
Security Metrics:
  failed_login_attempts_per_ip
  unusual_geographic_access
  rate_limit_hits_per_user
```

**Alert Routing:**

```text
P0 (immediate — PagerDuty + SMS):
  - API error rate >1% for 5 minutes
  - Escrow transaction failure
  - Database connection failure
  - Payment processing failure
P1 (PagerDuty — 15-min response):
  - API p95 response >2 seconds for 10 minutes
  - SQS DLQ message count >0
  - ECS task health check failure
P2 (Slack alert — business hours):
  - New subscription failure
  - Email delivery failure
  - Unusual signup spike (>3x baseline)
```

### 9.3 Distributed Tracing

- **Tool:** AWS X-Ray (MVP) → OpenTelemetry + Jaeger (V2)

- Trace ID propagated via `X-Request-ID` header across all services

- Sampling rate: 100% for errors; 10% for successful requests (cost optimization)

---

## 10. Scalability & Performance

### 10.1 Load Projections

| Phase          | MAU     | Peak RPS | DB Connections | Storage |
| :------------- | :------ | :------- | :------------- | :------ |
| MVP Launch     | 5,000   | 50       | 25             | 500GB   |
| V1 (Month 9)   | 25,000  | 250      | 100            | 5TB     |
| V2 (Month 18)  | 100,000 | 1,000    | 400            | 25TB    |
| Series A Scale | 500,000 | 5,000    | 2,000          | 100TB   |

### 10.2 Database Performance

- **Read replicas:** 1 read replica from Month 6 (for analytics queries, royalty reports)

- **Connection pooling:** PgBouncer (transaction mode) — 5 app connections serve 500 DB connections

- **Slow query threshold:** Alert on queries >100ms; optimize if >500ms

- **Index strategy:** Index all foreign keys, status columns, and timestamp columns used in WHERE clauses

### 10.3 Audio Delivery Performance

- CloudFront CDN: 30-second preview clips cached at edge (TTL: 7 days)

- Waveform JSON served from CDN (TTL: 30 days — immutable once generated)

- Direct-to-S3 uploads (presigned URLs) — bypass application server entirely

- Original audio files served via presigned URL only (no CDN — private content)

---

## 11. Disaster Recovery & Business Continuity

### 11.1 Recovery Objectives

| Tier     | Service              | RTO        | RPO                         |
| :------- | :------------------- | :--------- | :-------------------------- |
| Critical | Escrow / Payments    | 15 minutes | 0 (synchronous replication) |
| High     | Contract execution   | 1 hour     | 15 minutes                  |
| Medium   | SyncGrid marketplace | 4 hours    | 1 hour                      |
| Low      | LiveGrid, analytics  | 24 hours   | 4 hours                     |

### 11.2 Backup Strategy

```text
RDS PostgreSQL:
  - Automated backups: Daily snapshot + continuous WAL archiving to S3
  - Point-in-time recovery: up to 35 days
  - Cross-region backup: us-east-1 → us-west-2 (daily)
S3 (Audio + Documents):
  - Versioning enabled on all buckets
  - Cross-region replication: us-east-1 → us-west-2
  - Lifecycle policy: Move to Glacier after 2 years
Redis:
  - AOF (Append-Only File) persistence enabled
  - Daily snapshot to S3
Signed contracts:
  - Additional backup to separate compliance S3 bucket
  - Object Lock (WORM) for 7-year retention
```

### 11.3 Incident Response

**Severity Definitions:**

- SEV1: Platform down, payments unavailable, data breach suspected

- SEV2: Major feature unavailable (contract signing), >500 users affected

- SEV3: Degraded performance, isolated feature failure

- SEV4: Minor bug, cosmetic issue

**Runbooks (to be documented pre-launch):**

- DB failover procedure

- Escrow transaction failure recovery

- DocuSign API outage (queue + retry strategy)

- Stripe outage (queue + retry strategy)

- Data breach response (notification within 72 hours per GDPR)

---

## 12. Architecture Decision Records

### ADR-001: Modular Monolith for MVP

**Decision:** Start with modular monolith, not microservices
**Context:** 4-engineer team; need to move fast; service boundaries not yet validated by real usage
**Rationale:** Microservices add 40–60% operational overhead for a small team. Module isolation in a monolith enables future extraction without premature distribution.
**Consequences:** Must enforce module boundaries strictly in code review; no direct cross-module DB queries

### ADR-002: PostgreSQL as Primary Database

**Decision:** PostgreSQL 16 as the sole primary database (no NoSQL)
**Context:** Contract data, escrow transactions, and royalty splits require ACID transactions; schema evolution needs migrations
**Rationale:** PostgreSQL with JSONB provides both relational integrity and document flexibility. Single database reduces ops complexity. PostGIS extension handles geospatial for LiveGrid.
**Consequences:** Must manage schema migrations carefully; read replicas required as scale grows

### ADR-003: Stripe Connect for Marketplace Payments

**Decision:** Use Stripe Connect (Express) + Stripe Treasury for escrow
**Context:** Need to hold funds in escrow, route payments to multiple recipients, verify user identity
**Rationale:** Stripe handles PCI-DSS compliance, MSB licensing complexity, and identity verification. Building this in-house would require 6–12 months and significant legal overhead.
**Consequences:** 0.25% + Stripe fees on escrow transactions; dependent on Stripe's music industry classification

### ADR-004: DocuSign for E-Signature

**Decision:** DocuSign API over HelloSign (now Dropbox Sign) or in-house e-signature
**Context:** Need legally binding e-signatures with court-admissible audit trails
**Rationale:** DocuSign has the strongest legal admissibility record globally; startup pricing is competitive; SDK quality is highest
**Consequences:** Per-envelope cost ($0.50–$1.50); must be factored into unit economics; price increases with scale

### ADR-005: Python for Media and Sync Services

**Decision:** Python 3.12 for Media Service and Sync Service
**Context:** These services require audio processing (librosa, FFmpeg) and ML inference (embeddings, audio analysis)
**Rationale:** Python has the strongest ecosystem for audio ML; FastAPI provides high performance; these services are CPU-bound (not I/O-bound) so Node.js advantage doesn't apply
**Consequences:** Two language runtimes in the stack; engineering team needs Python proficiency

### ADR-006: AWS as Primary Cloud Provider

**Decision:** AWS over GCP or Azure
**Context:** Need managed PostgreSQL, Redis, file storage, CDN, container orchestration, and event bus
**Rationale:** AWS has the most mature managed services ecosystem; SoundGrid's primary engineers have AWS experience; AWS Marketplace credibility for enterprise sales
**Consequences:** Vendor lock-in on managed services (acceptable trade-off at this stage); multi-cloud strategy deferred to Series B

---

*Document Status: APPROVED*
*Next: SoundGrid UX Spec v1 (Phoenix "Pixel" Park)*

