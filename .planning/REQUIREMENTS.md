# Requirements: SoundGrid v1 MVP

## v1 Requirements

### Authentication & Identity
- [x] **AUTH-01**: Multi-persona sign-up workflow (Artist, Producer, Supervisor, Venue, Manager).
- [x] **AUTH-02**: Integrated Identity Verification via Stripe Identity for any payout recipient.
- [x] **AUTH-03**: OAuth Integration (Google, Apple) for frictionless professional onboarding.
- [x] **AUTH-04**: Role-Based Access Control (RBAC) ensuring data isolation between roles.

### ContractGrid (Legal & Escrow)
- [x] **CONT-01**: Guided Contract Wizard for Producer Agreements, Split Sheets, and Performance Contracts.
- [ ] **CONT-02**: Integrated Multi-party E-Signature via DocuSign REST API.
- [ ] **CONT-03**: Milestone-based Escrow Engine using Stripe Treasury to secure funds.
- [ ] **CONT-04**: Distribution Gate: Programmatic release of ISRC/ISWC codes only after contract execution.
- [ ] **CONT-05**: Basic DAW Integration capturing session start/end to trigger contract drafts.
- [ ] **CONT-06**: Versioned Contracts with effective dates to maintain historical royalty accuracy.

### SyncGrid & AI
- [ ] **SYNC-01**: Music Catalog Ingest supporting audio files and DDEX-standard metadata.
- [ ] **SYNC-02**: Aigency AI Agent for autonomous metadata validation and "Sync-Readiness" scoring.
- [ ] **SYNC-03**: Sync Opportunity Marketplace where supervisors post briefs and artists submit tracks.
- [ ] **SYNC-04**: Automated Split Ledger (micro-cents) calculating ownership for every placement.

### LiveGrid (Touring)
- [ ] **LIVE-01**: Venue Discovery Marketplace with filtered search (capacity, genre, location).
- [ ] **LIVE-02**: AI Tour Routing Optimizer suggesting city sequences and travel times.
- [ ] **LIVE-03**: Integrated Live Booking Engine connecting venue discovery to performance agreements.

## v2 Requirements (Deferred)
- **AUTH-05**: Multi-territory tax compliance automation (W8-BEN/W9).
- **SYNC-05**: Content ID integration (HAAWK/Identifyy) for downstream royalty tracking.
- **SYNC-06**: Bulk metadata editing via CSV/JSON templates.
- **LIVE-04**: Technical Rider management and sharing.

## Out of Scope
- **OS-01**: Native Mobile Apps — Web-responsive standard is sufficient for MVP.
- **OS-02**: In-app Audio Editing — Professionals use dedicated DAWs.
- **OS-03**: Blockchain Contracts — Standard e-signatures and Stripe Treasury provide superior legal/financial trust for v1.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 2 | Pending |
| CONT-06 | Phase 2 | Pending |
| SYNC-01 | Phase 4 | Pending |
| SYNC-02 | Phase 4 | Pending |
| SYNC-03 | Phase 5 | Pending |
| SYNC-04 | Phase 3 | Pending |
| LIVE-01 | Phase 5 | Pending |
| LIVE-02 | Phase 6 | Pending |
| LIVE-03 | Phase 5 | Pending |
