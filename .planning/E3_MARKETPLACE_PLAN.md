# Plan: E3 - Licensing Marketplace

**Epic**: E3 - Licensing Marketplace  
**Points**: 91  
**Priority**: P0  
**Target Phase**: Phase 1-2  
**Source**: Backlog E3-1 through E3-15

---

## Epic Overview

The Licensing Marketplace is the core revenue-generating feature of SoundGrid. It enables buyers to discover, preview, and license music tracks from producers and artists. The marketplace supports multiple license tiers, advanced search with filters, and instant delivery upon purchase.

### Key Features
- Advanced search (genre, mood, BPM, key)
- Watermarked audio previews
- Multiple license tiers (basic, premium, exclusive)
- Instant license PDF generation
- Wishlists and favorites
- Bulk upload for sellers

---

## User Stories

### P0 Stories (Must Have)

#### E3-1: Marketplace Search (8 pts)
**As a** buyer, **I can** search the marketplace by genre, mood, BPM, and key **so that** I find relevant tracks quickly.

**Acceptance Criteria**:
- Full-text search on track title, artist name
- Faceted filters: genre, mood, BPM range, key, price range
- Filters work in combination
- Results return in < 500ms
- Pagination with infinite scroll option
- Sort by: relevance, newest, price (low/high), trending

**Technical Notes**:
- Elasticsearch or Algolia for search
- Faceted aggregation for filter counts
- Search analytics for query optimization

#### E3-2: Watermarked Previews (5 pts)
**As a** buyer, **I can** preview tracks with a watermarked stream **so that** I evaluate before buying.

**Acceptance Criteria**:
- 30-second preview plays
- Watermark audible (voice overlay or beep)
- No download without purchase
- Waveform visualization with playhead
- Continuous playback while browsing

#### E3-3: License Purchase (8 pts)
**As a** buyer, **I can** purchase a license with a credit card **so that** I get instant access.

**Acceptance Criteria**:
- Stripe checkout completes
- License PDF generated automatically
- Download unlocked immediately
- Email confirmation with license and download links
- Transaction recorded with audit trail

#### E3-4: License Tier Management (5 pts)
**As a** seller, **I can** set custom license tiers (basic, premium, exclusive) with different prices **so that** I maximize revenue.

**Acceptance Criteria**:
- Up to 5 license tiers per track
- Each tier has: name, price, description, rights
- Pricing saved and validated
- Correct tier served on purchase
- Tier comparison view for buyers

#### E3-5: License Agreement Access (3 pts)
**As a** buyer, **I can** view and download my license agreements **so that** I have legal proof of purchase.

**Acceptance Criteria**:
- License PDF in account
- Email copy sent
- License includes: track info, buyer info, date, terms
- License stored permanently
- Re-download available anytime

#### E3-6: Transaction History (3 pts)
**As a** seller, **I can** see all my marketplace transactions **so that** I track my sales.

**Acceptance Criteria**:
- Transaction list: date, buyer, amount, license type
- CSV export
- Filter by date range
- Total earnings summary

#### E3-12: Content Moderation (5 pts)
**As a** marketplace admin, **I can** flag and remove content that violates policy **so that** the platform stays clean.

**Acceptance Criteria**:
- Flag queue in admin dashboard
- Remove action soft-deletes
- Seller notified with reason
- Appeal process available

#### E3-13: License Type Filtering (3 pts)
**As a** buyer, **I can** filter by license type (royalty-free, sync, exclusive) **so that** I find the right terms.

**Acceptance Criteria**:
- License type filter works on search
- Badge shown on track card
- Exclusive tracks clearly marked

### P1 Stories (Should Have)

#### E3-7: Supervisor Briefs (8 pts)
**As a** music supervisor, **I can** submit a brief describing music needs **so that** producers can pitch.

**Acceptance Criteria**:
- Brief form: genre, mood, budget, deadline, usage
- Published to supervisor board
- Visibility control (public/private)
- Pitch deadline tracking

#### E3-8: Producer Pitches (5 pts)
**As a** producer, **I can** respond to supervisor briefs with track pitches **so that** I get sync deals.

**Acceptance Criteria**:
- Pitch form attaches track
- Message to supervisor
- Status tracked (pending, shortlisted, rejected)
- Pitch analytics for producers

#### E3-9: Wishlists (2 pts)
**As a** buyer, **I can** save tracks to a wishlist **so that** I can revisit later.

**Acceptance Criteria**:
- Wishlist persists across sessions
- Tracks can be removed
- Shareable via URL
- Notify if price changes

#### E3-10: Discount Codes (5 pts)
**As a** seller, **I can** offer discounts and coupon codes **so that** I run promotions.

**Acceptance Criteria**:
- Coupon creation form
- % or fixed discount options
- Expiry date setting
- Usage limit (total or per user)
- Code validation at checkout

#### E3-11: Usage History (5 pts)
**As a** buyer, **I can** see a track's usage history and license status **so that** I avoid conflicts.

**Acceptance Criteria**:
- Exclusive purchases shown as unavailable
- Usage stats on track page
- Number of licenses sold (if non-exclusive)

#### E3-14: Bulk Upload (8 pts)
**As a** seller, **I can** bulk upload tracks via CSV or ZIP **so that** I list my catalog efficiently.

**Acceptance Criteria**:
- Bulk upload accepts up to 50 tracks
- Validates metadata
- Shows error report
- Resume on failure

#### E3-15: Automatic Royalty Splits (8 pts)
**As a** seller, **I can** opt into automatic royalty splits with collaborators **so that** payments are automated.

**Acceptance Criteria**:
- Split percentages saved per track
- Stripe Connect distributes on sale
- Split history tracked
- Collaborator notification

---

## Technical Architecture

### Database Schema Additions

```prisma
// Marketplace listing (extends Track model)
model Track {
  // ... existing fields ...
  
  // Marketplace fields
  isAvailable   Boolean  @default(true)
  viewCount     Int      @default(0)
  previewCount  Int      @default(0)
  purchaseCount Int      @default(0)
  
  // Search indexing
  searchVector  String?  // Full-text search vector
  
  // Flagging
  flags         TrackFlag[]
  
  // Relations
  licenses      License[]
  pitches       Pitch[]
  wishlistedBy  WishlistItem[]
}

// License record
model License {
  id            String   @id @default(cuid())
  
  // Track reference
  trackId       String
  track         Track    @relation(fields: [trackId], references: [id])
  
  // License tier reference
  tierId        String
  tierName      String   // Snapshot of tier name
  tierPrice     Int      // Snapshot of price (cents)
  tierRights    Json     // Snapshot of rights
  
  // Buyer
  buyerId       String
  buyer         User     @relation("BuyerLicenses", fields: [buyerId], references: [id])
  
  // Seller
  sellerId      String
  seller        User     @relation("SellerLicenses", fields: [sellerId], references: [id])
  
  // Transaction
  transactionId String   @unique
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  
  // License document
  licenseNumber String   @unique
  licenseUrl    String   // S3 URL to PDF
  
  // Usage tracking
  usageReported Boolean  @default(false)
  usageDetails  Json?    // Where/how track is used
  
  createdAt     DateTime @default(now())
  
  @@index([buyerId])
  @@index([sellerId])
  @@index([trackId])
  @@index([createdAt])
}

// Track flagging
model TrackFlag {
  id        String   @id @default(cuid())
  trackId   String
  track     Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  reason    String   // copyright, inappropriate, spam, etc.
  details   String?
  reportedBy String
  
  status    FlagStatus @default(PENDING)
  
  createdAt DateTime @default(now())
  reviewedAt DateTime?
}

// Sync briefs
model SyncBrief {
  id          String   @id @default(cuid())
  
  title       String
  description String
  
  // Requirements
  genre       String[]
  mood        String[]
  bpmRange    Json?    // { min: number, max: number }
  
  // Budget
  budgetMin   Int?     // Cents
  budgetMax   Int?     // Cents
  
  // Timeline
  deadline    DateTime
  usageType   String   // tv, film, ad, game, etc.
  
  // Visibility
  isPublic    Boolean  @default(true)
  
  // Supervisor
  supervisorId String
  supervisor   User     @relation(fields: [supervisorId], references: [id])
  
  // Pitches
  pitches     Pitch[]
  
  status      BriefStatus @default(ACTIVE)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([supervisorId])
  @@index([status])
  @@index([deadline])
}

// Pitches to briefs
model Pitch {
  id          String   @id @default(cuid())
  
  briefId     String
  brief       SyncBrief @relation(fields: [briefId], references: [id], onDelete: Cascade)
  
  trackId     String
  track       Track    @relation(fields: [trackId], references: [id])
  
  producerId  String
  producer    User     @relation(fields: [producerId], references: [id])
  
  message     String?
  
  status      PitchStatus @default(PENDING)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([briefId, trackId])
  @@index([briefId])
  @@index([producerId])
}

// Wishlists
model WishlistItem {
  id        String   @id @default(cuid())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  trackId   String
  track     Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, trackId])
  @@index([userId])
}

// Discount codes
model DiscountCode {
  id          String   @id @default(cuid())
  
  code        String   @unique
  description String?
  
  // Discount type
  type        DiscountType
  value       Int      // Percentage or fixed amount (cents)
  
  // Limits
  maxUses     Int?
  usedCount   Int      @default(0)
  maxUsesPerUser Int?
  
  // Scope
  appliesTo   String[] // track_ids or 'all'
  
  // Validity
  validFrom   DateTime
  validUntil  DateTime?
  
  createdBy   String
  createdAt   DateTime @default(now())
  
  @@index([code])
  @@index([validFrom, validUntil])
}
```

### API Endpoints

#### Marketplace Search
```
GET    /api/v1/marketplace/tracks       # Search tracks
GET    /api/v1/marketplace/filters      # Available filter options
GET    /api/v1/marketplace/trending     # Trending tracks
GET    /api/v1/marketplace/new          # New arrivals
```

#### Track Details
```
GET    /api/v1/marketplace/tracks/:id   # Track details (public)
GET    /api/v1/marketplace/tracks/:id/licenses  # Available licenses
POST   /api/v1/marketplace/tracks/:id/preview   # Log preview play
```

#### Purchase
```
POST   /api/v1/marketplace/purchase     # Initiate purchase
GET    /api/v1/marketplace/licenses     # My licenses
GET    /api/v1/marketplace/licenses/:id/download  # Download track
```

#### Wishlist
```
POST   /api/v1/marketplace/wishlist     # Add to wishlist
DELETE /api/v1/marketplace/wishlist/:trackId  # Remove from wishlist
GET    /api/v1/marketplace/wishlist     # My wishlist
```

#### Sync Briefs
```
GET    /api/v1/briefs                   # List briefs
POST   /api/v1/briefs                   # Create brief
GET    /api/v1/briefs/:id               # Brief details
POST   /api/v1/briefs/:id/pitch         # Submit pitch
GET    /api/v1/briefs/:id/pitches       # View pitches (supervisor only)
PATCH  /api/v1/pitches/:id              # Update pitch status
```

#### Discount Codes
```
POST   /api/v1/discount-codes           # Create code (seller)
GET    /api/v1/discount-codes           # My codes
DELETE /api/v1/discount-codes/:id       # Delete code
POST   /api/v1/discount-codes/validate  # Validate at checkout
```

---

## Search Implementation

### Elasticsearch Mapping

```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "standard" },
      "artistName": { "type": "keyword" },
      "genre": { "type": "keyword" },
      "mood": { "type": "keyword" },
      "bpm": { "type": "integer" },
      "key": { "type": "keyword" },
      "price": { "type": "integer" },
      "licenseTypes": { "type": "keyword" },
      "isAvailable": { "type": "boolean" },
      "createdAt": { "type": "date" },
      "purchaseCount": { "type": "integer" }
    }
  }
}
```

### Search Query Example

```typescript
// Faceted search with aggregations
const searchTracks = async (query: SearchQuery) => {
  const esQuery = {
    bool: {
      must: [
        { multi_match: { query: query.q, fields: ['title^2', 'artistName'] } }
      ],
      filter: [
        { term: { isAvailable: true } },
        ...(query.genre ? [{ terms: { genre: query.genre } }] : []),
        ...(query.mood ? [{ terms: { mood: query.mood } }] : []),
        ...(query.bpmMin ? [{ range: { bpm: { gte: query.bpmMin } } }] : []),
        ...(query.bpmMax ? [{ range: { bpm: { lte: query.bpmMax } } }] : []),
        ...(query.priceMax ? [{ range: { price: { lte: query.priceMax } } }] : [])
      ]
    }
  };
  
  return await elasticsearch.search({
    index: 'tracks',
    body: {
      query: esQuery,
      aggs: {
        genres: { terms: { field: 'genre', size: 20 } },
        moods: { terms: { field: 'mood', size: 20 } },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 2500, key: 'under_25' },
              { from: 2500, to: 5000, key: '25_to_50' },
              { from: 5000, to: 10000, key: '50_to_100' },
              { from: 10000, key: 'over_100' }
            ]
          }
        }
      },
      sort: query.sort === 'price_asc' 
        ? [{ price: 'asc' }] 
        : query.sort === 'price_desc' 
        ? [{ price: 'desc' }]
        : [{ _score: 'desc' }],
      from: (query.page - 1) * query.perPage,
      size: query.perPage
    }
  });
};
```

---

## UI Components Needed

### Search & Discovery
- [ ] `MarketplaceSearch` - Main search component
- [ ] `SearchFilters` - Filter panel with collapsible sections
- [ ] `TrackGrid` - Grid of track cards
- [ ] `TrackCard` - Compact track display with play button
- [ ] `ActiveFilters` - Chips showing active filters
- [ ] `SortDropdown` - Sort options
- [ ] `Pagination` - Page navigation or infinite scroll

### Track Player
- [ ] `AudioPlayer` - Persistent bottom player
- [ ] `WaveformPlayer` - Track detail player with waveform
- [ ] `PlayButton` - Animated play/pause button
- [ ] `VolumeControl` - Volume slider
- [ ] `TimeDisplay` - Current/total time

### License Purchase
- [ ] `LicenseSelector` - Tier comparison table
- [ ] `LicenseCard` - Individual tier card
- [ ] `PurchaseModal` - Checkout flow
- [ ] `LicenseViewer` - View purchased license

### Sync Briefs
- [ ] `BriefCard` - Brief summary card
- [ ] `BriefDetail` - Full brief view
- [ ] `BriefForm` - Create brief form
- [ ] `PitchForm` - Submit pitch form
- [ ] `PitchList` - List of pitches (supervisor view)

### Wishlist
- [ ] `WishlistButton` - Add/remove from wishlist
- [ ] `WishlistPage` - My wishlist view

---

## Implementation Phases

### Phase E3-A: Search & Discovery (Week 1)
- [ ] Elasticsearch setup
- [ ] Search index sync
- [ ] Search API
- [ ] Filter UI
- [ ] Track grid and cards

### Phase E3-B: Audio Player & Previews (Week 2)
- [ ] Waveform generation
- [ ] Watermark overlay
- [ ] Audio player component
- [ ] Preview logging

### Phase E3-C: Licensing & Purchase (Week 3)
- [ ] License tier system
- [ ] Purchase flow with Stripe
- [ ] License PDF generation
- [ ] Transaction recording

### Phase E3-D: Sync Briefs (Week 4)
- [ ] Brief creation
- [ ] Brief discovery
- [ ] Pitch submission
- [ ] Pitch management

### Phase E3-E: Polish & Advanced (Week 5)
- [ ] Wishlists
- [ ] Discount codes
- [ ] Bulk upload
- [ ] Usage tracking

---

## Dependencies

- E1: Authentication (✅ Complete)
- E2: Artist Hub - For track data
- E5: Payments - For Stripe integration
- E11: Admin - For content moderation

---

## Success Metrics

- Search response time < 500ms
- Conversion rate (preview to purchase) > 3%
- Average order value > $50
- Wishlist-to-purchase rate > 15%
- Content moderation queue < 24h

---

## Related Documents

- `docs/soundgrid-backlog.md` - Source backlog
- `.planning/IMPLEMENTATION_PLAN.md` - Overall plan
