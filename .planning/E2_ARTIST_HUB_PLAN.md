# Plan: E2 - Artist & Producer Hub

**Epic**: E2 - Artist & Producer Hub  
**Points**: 56  
**Priority**: P0  
**Target Phase**: Phase 1  
**Source**: Backlog E2-1 through E2-12

---

## Epic Overview

The Artist & Producer Hub is the core creator-facing feature of SoundGrid. It enables artists and producers to showcase their work, manage their portfolios, track earnings, and build their professional presence.

### Key Features
- Public profile pages with SEO optimization
- Track and beats portfolio management
- Electronic Press Kit (EPK) with shareable links
- Streaming stats integration (Spotify, Apple Music)
- Earnings dashboard aggregation
- Collaboration tools

---

## User Stories

### P0 Stories (Must Have)

#### E2-1: Public Artist Profile (5 pts)
**As an** artist, **I can** create a public profile page with bio, links, and portfolio **so that** fans and collaborators can find me.

**Acceptance Criteria**:
- Profile renders publicly without login
- SEO meta tags set (OpenGraph, Twitter Cards)
- Custom URL slug: `/artist/{slug}`
- Profile includes: photo, bio, links, portfolio preview
- Mobile responsive

**Technical Notes**:
- Static generation with ISR for SEO
- Dynamic OG image generation
- Social link validation

#### E2-2: Track Upload to Portfolio (5 pts)
**As an** artist, **I can** upload tracks to my portfolio **so that** I can showcase my music.

**Acceptance Criteria**:
- Audio uploads to S3 (MP3, WAV, FLAC supported)
- Waveform generated server-side
- Playback works in browser with custom player
- Track metadata: title, description, genre, mood, BPM, key
- Cover art upload (auto-resize to 300x300, 1200x1200)

**Technical Notes**:
- S3 presigned upload for large files
- Waveform generation using audiowaveform or similar
- HLS streaming for large files

#### E2-3: List Beats for Sale/License (8 pts)
**As a** producer, **I can** list beats for sale or license **so that** I can monetize my catalog.

**Acceptance Criteria**:
- Beat listed with price and license type
- Visible in marketplace search
- Stem availability toggle
- Exclusive/non-exclusive pricing
- Instant delivery on purchase

**Technical Notes**:
- Integration with marketplace search index
- License tier configuration per beat
- Stem file management (ZIP upload)

#### E2-4: EPK Management (5 pts)
**As an** artist, **I can** manage my EPK (Electronic Press Kit) with photos, bio, and press quotes **so that** I can share it with industry contacts.

**Acceptance Criteria**:
- EPK has shareable URL: `/epk/{artist-slug}`
- PDF export works
- Custom domain option (CNAME support)
- Sections: bio, photos, press quotes, social links, contact
- Professional template with 3+ themes

**Technical Notes**:
- PDF generation using Puppeteer or similar
- Custom domain DNS configuration
- Template system with theme switching

#### E2-5: Streaming Stats Integration (8 pts)
**As an** artist, **I can** track my streaming stats (Spotify, Apple Music) **so that** I understand my audience.

**Acceptance Criteria**:
- OAuth connection to DSPs
- Stats pulled daily (cron job)
- Dashboard displays: plays, listeners, saves, playlist adds
- Geographic breakdown
- Device type breakdown

**Technical Notes**:
- Spotify Web API integration
- Apple Music API integration
- Data synchronization job
- Time-series data storage

#### E2-6: Earnings Dashboard (5 pts)
**As an** artist, **I can** view earnings from all revenue streams in one dashboard **so that** I can manage my finances.

**Acceptance Criteria**:
- Earnings aggregated from Stripe/royalties
- Filterable by date/source
- Total earnings, pending, available to payout
- Transaction history with details
- CSV export

**Technical Notes**:
- Integration with payments service
- Royalty data aggregation
- Date range queries with indexing

#### E2-7: License Terms Management (5 pts)
**As a** producer, **I can** set stem availability and license terms per beat **so that** buyers know what they're getting.

**Acceptance Criteria**:
- License terms selectable: basic/premium/exclusive
- Custom license builder available
- Stem flag saved per track
- Terms displayed on track page
- Terms included in license PDF

#### E2-9: Genre/Mood/Instrumentation Tags (2 pts)
**As an** artist, **I can** tag my genre, mood, and instrumentation **so that** I appear in relevant searches.

**Acceptance Criteria**:
- Tags saved to track
- Indexed for search
- Displayed on profile and track pages
- Suggestions based on audio analysis (future)

### P1 Stories (Should Have)

#### E2-8: Collaboration Requests (3 pts)
**As an** artist, **I can** send collaboration requests to other artists **so that** I can build my network.

**Acceptance Criteria**:
- Request notification sent to target artist
- Accept/decline flow works
- Message thread created on acceptance
- Request history maintained

#### E2-10: Pinned Track/Video (2 pts)
**As an** artist, **I can** feature a pinned track or video on my profile **so that** I control my first impression.

**Acceptance Criteria**:
- Pin feature works
- Only one item pinned at a time
- Pinned item displayed prominently

#### E2-11: Scheduled Releases (3 pts)
**As an** artist, **I can** schedule a track release date **so that** it appears at the right time.

**Acceptance Criteria**:
- Scheduled releases trigger at UTC time
- Notifications sent to followers
- Unreleased tracks hidden from public
- Release calendar view

#### E2-12: Free Downloads with Email Gate (5 pts)
**As a** producer, **I can** offer free downloads with an email gate **so that** I can grow my mailing list.

**Acceptance Criteria**:
- Email capture form shown before download
- Download triggered on email submit
- List synced to Mailchimp/SendGrid
- Download tracking

---

## Technical Architecture

### Database Schema Additions

```prisma
// Track/Beat model
model Track {
  id            String   @id @default(cuid())
  title         String
  description   String?
  
  // Audio files
  audioUrl      String   // S3 URL
  audioKey      String   // S3 key for deletion
  waveformUrl   String?  // Generated waveform image
  duration      Int      // Duration in seconds
  
  // Cover art
  coverArtUrl   String?
  coverArtKey   String?
  
  // Metadata
  genre         String[]
  mood          String[]
  bpm           Int?
  key           String?
  tags          String[]
  
  // License settings
  isForSale     Boolean  @default(false)
  licenseTiers  LicenseTier[]
  
  // Stems
  stemsUrl      String?
  stemsKey      String?
  hasStems      Boolean  @default(false)
  
  // Release
  status        TrackStatus @default(DRAFT)
  releaseDate   DateTime?
  pinned        Boolean  @default(false)
  
  // Relations
  artistId      String
  artist        User     @relation(fields: [artistId], references: [id])
  
  // Stats
  playCount     Int      @default(0)
  downloadCount Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([artistId])
  @@index([status])
  @@index([genre])
  @@index([mood])
}

model LicenseTier {
  id          String  @id @default(cuid())
  name        String  // Basic, Premium, Exclusive
  description String?
  price       Int     // Cents
  rights      Json    // Usage rights object
  
  trackId     String
  track       Track   @relation(fields: [trackId], references: [id], onDelete: Cascade)
}

model StreamingStat {
  id          String   @id @default(cuid())
  trackId     String
  track       Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  platform    String   // spotify, apple_music, etc.
  date        DateTime
  
  plays       Int
  listeners   Int
  saves       Int
  playlistAdds Int
  
  // Geographic data (JSON for flexibility)
  topCountries Json?
  deviceBreakdown Json?
  
  @@unique([trackId, platform, date])
  @@index([trackId])
  @@index([platform])
  @@index([date])
}

model PressQuote {
  id        String   @id @default(cuid())
  quote     String
  source    String   // Publication name
  url       String?
  
  artistId  String
  artist    User     @relation(fields: [artistId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

### API Endpoints

#### Track Management
```
POST   /api/v1/tracks                    # Upload new track
GET    /api/v1/tracks                    # List user's tracks
GET    /api/v1/tracks/:id                # Get track details
PATCH  /api/v1/tracks/:id                # Update track
DELETE /api/v1/tracks/:id                # Delete track

POST   /api/v1/tracks/:id/upload         # Upload audio file (presigned)
POST   /api/v1/tracks/:id/cover          # Upload cover art
POST   /api/v1/tracks/:id/stems          # Upload stems (ZIP)

POST   /api/v1/tracks/:id/license-tiers  # Create license tier
PATCH  /api/v1/tracks/:id/license-tiers/:tierId  # Update license tier
```

#### Public Profile
```
GET    /api/v1/artists/:slug             # Public artist profile
GET    /api/v1/artists/:slug/tracks      # Public track listing
GET    /api/v1/artists/:slug/epk         # EPK data
GET    /api/v1/artists/:slug/epk.pdf     # EPK PDF export
```

#### Streaming Stats
```
GET    /api/v1/stats/streams             # Get streaming stats
POST   /api/v1/stats/streams/sync        # Trigger manual sync
GET    /api/v1/stats/earnings            # Get earnings summary
GET    /api/v1/stats/earnings/export     # Export earnings CSV
```

#### Collaborations
```
POST   /api/v1/collaborations/request    # Send collab request
GET    /api/v1/collaborations            # List collabs
PATCH  /api/v1/collaborations/:id        # Accept/decline request
```

### File Storage Structure

```
S3 Bucket: soundgrid-uploads
├── audio/
│   ├── {userId}/
│   │   ├── {trackId}/
│   │   │   ├── audio.mp3         # Main audio file
│   │   │   ├── audio.wav         # WAV version (if uploaded)
│   │   │   ├── waveform.png      # Generated waveform
│   │   │   └── stems.zip         # Stems (optional)
├── images/
│   ├── {userId}/
│   │   ├── profile/              # Profile photos
│   │   ├── covers/               # Track cover art
│   │   └── epk/                  # EPK photos
└── temp/
    └── {uploadId}/               # Temporary upload staging
```

---

## UI Components Needed

### Artist Dashboard
- [ ] `ArtistDashboardLayout` - Main layout with sidebar
- [ ] `TrackManager` - List view with sort/filter
- [ ] `TrackUploadModal` - Multi-step upload flow
- [ ] `TrackEditor` - Edit track metadata
- [ ] `LicenseTierBuilder` - Configure license types
- [ ] `EPKPreview` - Live EPK preview
- [ ] `EPKThemeSelector` - Theme switcher
- [ ] `StreamingStatsChart` - Stats visualization
- [ ] `EarningsWidget` - Earnings summary cards

### Public Profile
- [ ] `ArtistProfilePage` - Public profile view
- [ ] `TrackPlayer` - Embedded audio player
- [ ] `TrackCard` - Compact track display
- [ ] `EPKPage` - EPK public view

### Shared Components
- [ ] `AudioWaveform` - Waveform visualization
- [ ] `GenreSelector` - Multi-select with suggestions
- [ ] `MoodSelector` - Mood tag picker
- [ ] `CoverArtUploader` - Drag-drop with preview
- [ ] `FileUploadProgress` - Progress indicator

---

## Implementation Phases

### Phase E2-A: Track Upload & Management (Week 1)
- [ ] Database schema migration
- [ ] S3 upload infrastructure
- [ ] Track upload API
- [ ] Basic track management UI
- [ ] Waveform generation

### Phase E2-B: Public Profile & EPK (Week 2)
- [ ] Public profile pages (SSR)
- [ ] SEO meta tags
- [ ] EPK builder
- [ ] EPK PDF export
- [ ] Theme system

### Phase E2-C: Licensing & Monetization (Week 3)
- [ ] License tier system
- [ ] Marketplace integration
- [ ] Beat listing management
- [ ] Stem upload

### Phase E2-D: Stats & Analytics (Week 4)
- [ ] Spotify OAuth integration
- [ ] Stats sync job
- [ ] Stats dashboard
- [ ] Earnings aggregation

### Phase E2-E: Polish (Week 5)
- [ ] Collaboration requests
- [ ] Scheduled releases
- [ ] Email gate for free downloads
- [ ] Pinned tracks

---

## Dependencies

### External Services
- **AWS S3** - File storage
- **Spotify Web API** - Streaming stats
- **Apple Music API** - Streaming stats (optional)
- **Puppeteer** - PDF generation
- **Mailchimp API** - Email list sync

### Internal Dependencies
- E1: Authentication (✅ Complete)
- E3: Licensing Marketplace (for beat sales)
- E5: Payments (for earnings dashboard)
- E11: Admin (for content moderation)

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Large file uploads fail | High | Medium | Chunked uploads, resumable transfers |
| DSP API rate limits | Medium | High | Implement caching, request throttling |
| Waveform generation slow | Medium | Medium | Async processing, queue-based |
| Storage costs high | Medium | Low | Lifecycle policies, CDN optimization |
| Copyright violations | High | Medium | Content moderation, reporting system |

---

## Success Metrics

- Track upload completion rate > 90%
- Average tracks per artist > 5
- Profile page load time < 2s
- EPK share rate > 20% of artists
- DSP connection rate > 40% of artists

---

## Related Documents

- `docs/soundgrid-backlog.md` - Source backlog
- `.planning/IMPLEMENTATION_PLAN.md` - Overall plan
- `packages/database/prisma/schema.prisma` - Database schema
