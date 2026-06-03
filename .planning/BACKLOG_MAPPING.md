# SoundGrid Backlog Mapping

**Source**: `docs/soundgrid-backlog.md`  
**Total Story Points**: ~589  
**Last Updated**: 2026-02-26

---

## Backlog Overview

### Epics Summary

| ID | Epic | Points | Priority | Target Phase | Status |
|----|------|--------|----------|--------------|--------|
| E1 | Authentication & User Management | 34 | P0 | Phase 1 | 🚧 In Progress |
| E2 | Artist & Producer Hub | 56 | P0 | Phase 1 | 📋 Planned |
| E3 | Licensing Marketplace | 91 | P0 | Phase 1-2 | 📋 Planned |
| E4 | Venue & Live Event Management | 61 | P0 | Phase 1-2 | 📋 Planned |
| E5 | Payments & Royalties Engine | 65 | P0 | Phase 1-2 | 📋 Planned |
| E6 | Collaboration & Communication | 39 | P1 | Phase 2 | 📋 Planned |
| E7 | Analytics & Reporting | 34 | P1 | Phase 2 | 📋 Planned |
| E8 | Sync Licensing & Music Supervision | 50 | P1 | Phase 2 | 📋 Planned |
| E9 | Mobile Experience | 34 | P1 | Phase 2-3 | 📋 Planned |
| E10 | AI Features & Recommendations | 52 | P2 | Phase 3 | 📋 Planned |
| E11 | Admin & Ops Dashboard | 34 | P0 | Phase 1 | 📋 Planned |
| E12 | API & Integrations | 39 | P1 | Phase 2 | 📋 Planned |

---

## Current Implementation Status

### Phase 1: Foundation & Identity (COMPLETE ✅)

**Mapped Stories**:
- E1-1: Email/password signup ✅
- E1-2: Google OAuth ✅
- E1-3: Password reset 📋 (Next)
- E1-4: Role selection (Artist, Producer, Venue, Supervisor) ✅
- E1-5: Onboarding wizard ✅
- E1-6: Profile photo upload 📋 (Next)
- E1-7: Notification preferences 📋 (Next)
- E1-8: MFA 📋 (Future)
- E1-9: Session management 📋 (Future)
- E1-10: GDPR data export 📋 (Future)

**Completed Plans**:
- [x] Plan 01-01: Project scaffolding and core identity schema
- [x] Plan 01-02: Multi-persona signup workflow with OAuth
- [x] Plan 01-03: Stripe Identity integration for verification
- [x] Plan 01-04: RBAC implementation and data isolation testing

**Total Points Completed**: ~20/34 (E1 partial)

---

### Phase 2: The Digital Handshake (IN PROGRESS 🚧)

**Mapped Stories**:
- E4-5: Booking contract generation from template 🚧 (Current Wave)
- E3-3: License purchase with Stripe 🚧 (Current Wave)
- E5-1: Stripe Connect onboarding 🚧 (Current Wave)
- E5-2: Credit/debit card payments 🚧 (Current Wave)
- E5-4: Platform commission (15%) 🚧 (Current Wave)
- E5-5: Automatic royalty splits 🚧 (Current Wave)

**Implementation Waves**:
- [x] Wave 0: Architecture migration (Turborepo + FastAPI)
- [ ] Wave 1: Custom E-Signature System (8-10 hrs) ← CURRENT
- [ ] Wave 2: Contract Versioning (4-5 hrs)
- [ ] Wave 3: DAW Integration (6-8 hrs)
- [ ] Wave 4: Integration & Polish (5-6 hrs)

**Missing Detailed Plans**:
- [ ] E2: Artist & Producer Hub (56 pts)
- [ ] E3: Licensing Marketplace - full (91 pts)
- [ ] E4: Venue & Live Event - full (61 pts)
- [ ] E5: Payments & Royalties - full (65 pts)
- [ ] E11: Admin & Ops Dashboard (34 pts)

---

### Phase 3: Asset Control & AI (PLANNED 📋)

**Mapped Stories**:
- E2-2: Upload tracks to portfolio
- E2-3: List beats for sale/license
- E2-5: Streaming stats (Spotify, Apple Music)
- E2-6: Earnings dashboard
- E3-1: Marketplace search (genre, mood, BPM, key)
- E3-2: Watermarked track preview
- E3-4: License tiers (basic/premium/exclusive)
- E10-3: AI-suggested tags for tracks
- E10-5: AI pricing suggestions

**Missing Detailed Plans**:
- Catalog upload and management
- AI metadata tagging
- Marketplace search with filters
- Watermarked audio streaming

---

### Phase 4: Discovery & Booking (PLANNED 📋)

**Mapped Stories**:
- E4-1: Venue profile creation
- E4-2: Booking calendar
- E4-3: Booking request submission
- E4-4: Accept/decline bookings
- E4-6: Personal calendar for artists
- E4-7: Open calls for artists
- E8-1: Sync briefs for supervisors
- E8-2: Producer pitch to briefs

**Missing Detailed Plans**:
- Venue discovery marketplace
- Booking system with calendar
- Sync licensing marketplace

---

### Phase 5: Tour Intelligence (PLANNED 📋)

**Mapped Stories**:
- E9-1: Mobile responsive experience
- E9-2: PWA installation
- E9-3: Push notifications
- E9-4: Background audio
- E9-5: Mobile file upload
- E9-6: Mobile earnings/bookings

**Missing Detailed Plans**:
- PWA implementation
- Push notification service
- Mobile-optimized UI

---

### Phase 6: Scale & AI (PLANNED 📋)

**Mapped Stories**:
- E6-1: Direct messaging
- E6-2: File sharing in projects
- E6-3: Project workspaces
- E6-4: Timestamped comments on tracks
- E6-5: In-app notifications
- E7-1: Track play analytics
- E7-2: Conversion analytics
- E8-6: AI track recommendations
- E10-1: AI recommendations for buyers
- E10-2: AI-generated bio suggestions
- E10-4: Natural language search
- E12-1: API key authentication
- E12-2: Public catalog API
- E12-3: Webhook events

**Missing Detailed Plans**:
- Real-time messaging (WebSocket)
- Analytics dashboard
- AI recommendation engine
- Public API with webhooks

---

## Gap Analysis

### What's Documented in .planning/

✅ Phase 1: Foundation (4/4 plans complete)  
🚧 Phase 2: Digital Handshake (architecture done, waves 1-4 in progress)  
📋 Phases 3-6: High-level only

### What's Missing

The following epics need detailed planning in `.planning/`:

#### High Priority (P0)
- [ ] **E2**: Artist & Producer Hub (56 pts)
  - Public profile pages
  - Track/beats upload
  - EPK management
  - Streaming stats integration
  - Earnings dashboard
  
- [ ] **E3**: Licensing Marketplace (partial - 91 pts total)
  - Search with filters (genre, mood, BPM, key)
  - Watermarked previews
  - License tier management
  - Wishlists
  - Bulk upload
  
- [ ] **E4**: Venue & Live Events (partial - 61 pts total)
  - Venue profiles
  - Booking calendar
  - Open calls
  - Technical riders
  
- [ ] **E5**: Payments & Royalties (partial - 65 pts total)
  - Stripe Connect
  - Commission engine
  - Automatic splits
  - Payouts
  - Tax documents (1099-K)
  
- [ ] **E11**: Admin & Ops Dashboard (34 pts)
  - User management
  - Transaction auditing
  - Content moderation
  - System health metrics

#### Medium Priority (P1)
- [ ] **E6**: Collaboration & Communication (39 pts)
- [ ] **E7**: Analytics & Reporting (34 pts)
- [ ] **E8**: Sync Licensing (50 pts)
- [ ] **E9**: Mobile Experience (34 pts)
- [ ] **E12**: API & Integrations (39 pts)

#### Lower Priority (P2)
- [ ] **E10**: AI Features (52 pts)

---

## Recommended Next Steps

### Immediate (This Week)
1. ✅ Complete Wave 1: E-Signature System (Phase 2)
2. 📝 Create detailed plan for E2: Artist & Producer Hub
3. 📝 Create detailed plan for E11: Admin Dashboard

### Short Term (Next 2-4 Weeks)
4. 📝 Create detailed plan for E3: Licensing Marketplace
5. 📝 Create detailed plan for E4: Venue & Live Events
6. 📝 Create detailed plan for E5: Payments & Royalties

### Medium Term (Next 1-2 Months)
7. 📝 Create detailed plan for E6-E9 (Phase 3-4)
8. 📝 Create detailed plan for E10-E12 (Phase 5-6)

---

## Documentation Needed

### New Planning Documents Required

For each epic, we need:
1. Epic overview document
2. User story breakdown
3. Technical architecture
4. API contracts
5. Database schema changes
6. UI/UX mockups or wireframes
7. Testing strategy
8. Acceptance criteria

### Priority Order

1. **E2 - Artist & Producer Hub** (P0, Phase 1)
2. **E11 - Admin Dashboard** (P0, Phase 1)
3. **E3 - Licensing Marketplace** (P0, Phase 1-2)
4. **E4 - Venue & Live Events** (P0, Phase 1-2)
5. **E5 - Payments & Royalties** (P0, Phase 1-2)
6. **E6-E12** (P1-P2, Phase 2-3)

---

## Summary

**Current State**:
- ✅ Research: Complete
- ✅ Architecture: Migrated to Turborepo
- ✅ Phase 1: Complete (Foundation)
- 🚧 Phase 2: In Progress (Digital Handshake)
- 📋 Phases 3-6: High-level only, need detailed planning

**Critical Gap**: 9 epics (~469 story points) need detailed planning before implementation.

**Recommendation**: Complete detailed planning for P0 epics (E2, E3, E4, E5, E11) before proceeding with implementation.
