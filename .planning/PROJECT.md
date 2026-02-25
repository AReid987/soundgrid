# Project SoundGrid

SoundGrid is the commercial operating layer for independent music professionals. It unifies contract creation, escrow-backed payments, sync licensing, and live booking into a single integrated workflow. By automating unenforceable verbal agreements and streamlining metadata clearance, SoundGrid ensures artists and producers get paid on time and protect their creative IP.

## Core Value
The ONE thing that must work: **Enable independent music professionals to execute enforceable, escrow-backed agreements in under 10 minutes.**

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] **PC-01**: Multi-persona Auth & Identity (Artist, Producer, Supervisor, Venue, Manager).
- [ ] **CG-01**: Guided Contract Wizard for 8 core music agreement types.
- [ ] **CG-02**: Integrated E-Signature workflow (DocuSign).
- [ ] **CG-03**: Escrow Payment Engine (Stripe Treasury/Connect) with milestone triggers.
- [ ] **PC-02**: Distribution Gate: Control ISRC/ISWC release based on contract execution.
- [ ] **PC-03**: Role-specific Dashboards (Pending actions, Activity, Escrow balance).
- [ ] **SG-01**: Sync-ready Catalog Management with AI-assisted metadata verification.
- [ ] **AI-01**: Aigency AI Agent for deep metadata validation and "Sync-Readiness" scoring.

### Out of Scope
- Native iOS/Android apps (Web-responsive only for v1).
- Blockchain/Smart Contracts (Escrow handled via Stripe Treasury).
- Fully autonomous AI negotiation (AI-assisted only).
- International multi-currency (USD-only for MVP).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-First | Target users (producers/artists) are mobile-heavy; core workflows must work on-the-go. | — Done |
| ISRC Gate | Immediate control mechanism for distribution without requiring deep DSP API partnerships. | — Confirmed |
| Aigency Agents | High-capability agents can automate the metadata verification gap identified in research. | — Confirmed |
| Vanilla CSS | Preferred for layout flexibility while maintaining professional, high-authority aesthetics. | — Noted |

## Constraints
- **Team**: 4 engineers, 4-month MVP window.
- **Compliance**: Must be SOC 2 Type II ready (Month 12 target).
- **Security**: AES-256 for documents; PCI-DSS Level 1 via Stripe.

---
*Last updated: 2026-02-24 after initialization*
