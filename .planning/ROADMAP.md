# Roadmap: SoundGrid

## Overview

SoundGrid is built to provide an enforceable commercial layer for independent music professionals. The roadmap moves from establishing verified professional identities to creating the "Digital Handshake" (contracts), securing the financial layer (escrow), and finally enabling discovery and business growth through marketplaces and AI optimization.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Project Foundation & Verified Identity** - Setup and multi-persona RBAC with Stripe Identity.
- [ ] **Phase 2: The Digital Handshake** - Guided contract wizard and DocuSign integration.
- [ ] **Phase 3: Financial Trust** - Stripe Treasury escrow engine and automated split ledger.
- [ ] **Phase 4: Asset Control & AI Validation** - Catalog ingest, AI metadata scoring, and distribution gates.
- [ ] **Phase 5: Discovery & Booking** - Sync marketplace and venue discovery with booking integration.
- [ ] **Phase 6: Tour Intelligence & Polish** - AI routing optimization and final production refinement.

## Phase Details

### Phase 1: Project Foundation & Verified Identity
**Goal**: Users can safely join the platform with a verified professional identity.
**Depends on**: Nothing
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]
**Success Criteria**:
  1. User can sign up using Google/Apple or email and select a specific professional role (Artist, Producer, etc.).
  2. Users receiving payouts are blocked until completing Stripe Identity verification.
  3. RBAC prevents a "Venue" user from accessing "Producer" private contract drafts.
**Plans**: TBD

Plans:
- [x] 01-01: Project scaffolding and core identity schema
- [x] 01-02: Multi-persona signup workflow with OAuth
- [x] 01-03: Stripe Identity integration for verification
- [x] 01-04: RBAC implementation and data isolation testing

### Phase 2: The Digital Handshake
**Goal**: Users can execute legally binding music agreements with multi-party signatures.
**Depends on**: Phase 1
**Requirements**: [CONT-01, CONT-02, CONT-05, CONT-06]
**Success Criteria**:
  1. An Artist can generate a Producer Agreement using a guided wizard in under 5 minutes.
  2. Multiple parties receive, review, and sign a contract via integrated DocuSign workflow.
  3. Contract versions are maintained, ensuring historical accuracy for royalty calculations.
  4. Session triggers from a DAW automatically initiate draft contracts.
**Plans**: TBD

Plans:
- [x] 02-01: Guided Contract Wizard for core agreement types
- [ ] 02-02: DocuSign REST API integration for multi-party e-signature
- [ ] 02-03: Contract versioning and history tracking
- [ ] 02-04: DAW integration listener and draft automation

### Phase 3: Financial Trust
**Goal**: Payments are secured in escrow and ownership splits are immutably tracked.
**Depends on**: Phase 2
**Requirements**: [CONT-03, SYNC-04]
**Success Criteria**:
  1. Funds for a contract are successfully captured and held in a Stripe Treasury escrow account.
  2. Escrow funds are released to multiple parties based on milestone triggers (e.g., "All Signed").
  3. The automated split ledger calculates ownership down to micro-cents without rounding errors.
**Plans**: TBD

Plans:
- [ ] 03-01: Stripe Treasury setup and Escrow engine
- [ ] 03-02: Milestone trigger system for fund release
- [ ] 03-03: Automated Split Ledger with high-precision math

### Phase 4: Asset Control & AI Validation
**Goal**: Music assets are ingested, AI-validated for sync-readiness, and protected by distribution gates.
**Depends on**: Phase 2
**Requirements**: [CONT-04, SYNC-01, SYNC-02]
**Success Criteria**:
  1. Artists can upload audio and DDEX metadata to their personal catalog.
  2. The Aigency AI Agent provides a "Sync-Readiness" score and flags metadata gaps.
  3. ISRC/ISWC codes are hidden/locked until the associated contract is fully executed.
**Plans**: TBD

Plans:
- [ ] 04-01: Catalog ingest system (Audio + DDEX)
- [ ] 04-02: Aigency AI Agent for metadata validation
- [ ] 04-03: Distribution Gate for ISRC/ISWC code protection

### Phase 5: Discovery & Booking
**Goal**: Users can find opportunities (sync briefs, venues) and convert them into bookings.
**Depends on**: Phase 3, Phase 4
**Requirements**: [SYNC-03, LIVE-01, LIVE-03]
**Success Criteria**:
  1. Music Supervisors can post sync briefs and browse "Sync-Ready" tracks.
  2. Artists can search for venues by capacity, genre, and location.
  3. A venue discovery result can be converted directly into a performance agreement draft.
**Plans**: TBD

Plans:
- [ ] 05-01: Sync Opportunity Marketplace
- [ ] 05-02: Venue Discovery Marketplace with filtered search
- [ ] 05-03: Integrated Booking Engine (Discovery to Contract)

### Phase 6: Tour Intelligence & Polish
**Goal**: Live tours are optimized for efficiency and the platform is ready for production.
**Depends on**: Phase 5
**Requirements**: [LIVE-02]
**Success Criteria**:
  1. AI Tour Routing Optimizer generates an efficient city sequence for a multi-date tour.
  2. Users can visualize travel times and routing logic between venues.
**Plans**: TBD

Plans:
- [ ] 06-01: AI Tour Routing Optimizer
- [ ] 06-02: UI/UX Polish and Final Verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Identity | 4/4 | Completed | Phase 1 Complete |
| 2. The Digital Handshake | 1/4 | In Progress | 02-01 Complete |
| 3. Financial Trust | 0/3 | Not started | - |
| 4. Asset Control & AI | 0/3 | Not started | - |
| 5. Discovery & Booking | 0/3 | Not started | - |
| 6. Tour Intelligence | 0/2 | Not started | - |
