# Project Research Summary: SoundGrid

**Project:** SoundGrid - Commercial Operating Layer for Independent Music Professionals
**Status:** Greenfield
**Date:** 2026-02-25

## Key Findings

### 1. Technology Stack (The "2025 Standard")
- **Frontend/Backend**: Next.js 15 (React 19) with App Router, Server Actions, and Partial Prerendering.
- **Financial Engine**: **Stripe Connect + Treasury**. This is the only way to safely simulate escrow while handling multi-party royalty splits and KYC compliance.
- **Legal Engine**: **DocuSign API** for multi-party e-signatures and audit trails.
- **Data Integrity**: **Prisma 7 + Neon (Postgres)**. Must use `BigInt` or specialized decimal libraries to prevent "Penny Bleed" in royalty calculations.
- **Music Metadata**: `ddex-parser` (Rust bindings) for high-performance processing of DDEX ERN 4.3 standards.

### 2. Table Stakes (Expected Features)
- **Multi-Persona Auth**: Distinct workflows for Artists, Producers, Managers, and Venues.
- **Contract Wizard**: Guided templates for Producer agreements, Split sheets, and Performance contracts.
- **Royalty Splits**: Automated, immutable ledger of who owns what percentage of every cent.
- **E-Signature**: Integrated legally-binding signing without leaving the platform.

### 3. Differentiators (SoundGrid's Edge)
- **Distribution Gate**: Controlling the "release" of ISRC/ISWC codes until contracts are executed.
- **Milestone Escrow**: Securing funds in a Stripe Treasury account that release only when contract triggers (e.g., "All Signed") are met.
- **Aigency AI Agent**: An autonomous agent that validates metadata against industry registries to provide a "Sync-Readiness" score.
- **DAW capturing**: Strategic capture of producers via plugins that trigger contracts the moment a session starts or ends.

### 4. Watch Out For (Critical Pitfalls)
- **Regulatory Risk**: Holding "other people's money" without proper KYC/KYB creates "Accidental Bank" liability. KYC must be a blocking gate for payouts.
- **Split Rigidity**: Contracts must be versioned with effective dates. Changing a split today shouldn't retroactively change earnings from a month ago.
- **Floating Point Math**: Never use `float` for currency. Rounding errors over millions of streams will break the ledger.
- **ISRC Collision**: ISRCs are not unique primary keys in the real world. Use an internal `GridID` mapping.

## Next Steps
Research is complete. Proceeding to define **REQUIREMENTS.md** using these findings to scope the v1 MVP.
