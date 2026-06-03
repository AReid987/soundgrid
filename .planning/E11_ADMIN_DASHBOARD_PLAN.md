# Plan: E11 - Admin & Ops Dashboard

**Epic**: E11 - Admin & Ops Dashboard  
**Points**: 34  
**Priority**: P0  
**Target Phase**: Phase 1  
**Source**: Backlog E11-1 through E11-8

---

## Epic Overview

The Admin & Ops Dashboard provides platform administrators with tools to manage users, moderate content, monitor transactions, and oversee platform health. This is critical for maintaining platform quality, security, and compliance.

### Key Features
- User management with search/filter
- Content moderation queue
- Transaction auditing and refunds
- Platform-wide announcements
- System health monitoring
- Feature flag management

---

## User Stories

### P0 Stories (Must Have)

#### E11-1: User Management (5 pts)
**As an** admin, **I can** view all users with search and filter **so that** I manage the user base.

**Acceptance Criteria**:
- User list with: email, name, role, status, join date
- Search by email/name
- Filter by: role, status, join date range
- Export to CSV
- Bulk actions (suspend, delete)
- User detail view with full profile

**Technical Notes**:
- Server-side pagination (100 per page)
- Full-text search on email/name
- Role-based access (admin only)

#### E11-2: Suspend/Ban Users (3 pts)
**As an** admin, **I can** suspend or ban users who violate policy **so that** the platform stays safe.

**Acceptance Criteria**:
- Suspend action disables login immediately
- Reason logged with audit trail
- User emailed with reason
- Ban can be temporary (with expiry) or permanent
- Appeals process tracked

#### E11-3: Transaction Auditing (5 pts)
**As an** admin, **I can** view all transactions with filter by date/amount/status **so that** I audit revenue.

**Acceptance Criteria**:
- Transaction log: buyer, seller, amount, type, status
- Date range filter
- Amount filter (min/max)
- Status filter (pending, completed, refunded, disputed)
- CSV export
- Refund action available

#### E11-4: Content Moderation Queue (3 pts)
**As an** admin, **I can** view content flagged for review **so that** I moderate effectively.

**Acceptance Criteria**:
- Flag queue with context (why flagged, who flagged)
- Content preview without leaving queue
- Actions: approve, remove, escalate
- Batch processing for similar content
- Auto-flagging rules configurable

#### E11-5: Platform Announcements (5 pts)
**As an** admin, **I can** send platform-wide announcements and emails **so that** I communicate with users.

**Acceptance Criteria**:
- Announcement form with WYSIWYG editor
- Segment by: role, plan, all users
- Preview before send
- Schedule for later delivery
- Email and in-app notification options
- Delivery tracking (open rates)

#### E11-6: Subscription Plan Management (5 pts)
**As an** admin, **I can** manage subscription plans and pricing **so that** I adjust the business model.

**Acceptance Criteria**:
- Plan CRUD in admin
- Changes reflected in Stripe
- Existing subscriptions grandfathered
- Feature flags per plan
- Price change history

#### E11-7: System Health Metrics (5 pts)
**As an** admin, **I can** view system health metrics (uptime, latency, error rates) **so that** I catch issues early.

**Acceptance Criteria**:
- Grafana-style dashboard
- Real-time metrics: uptime, latency, error rates
- Alerting thresholds configurable
- Historical data (30 days)
- Integration with error tracking (Sentry)

### P1 Stories (Should Have)

#### E11-8: Feature Flags (3 pts)
**As an** admin, **I can** manage feature flags to roll out new features gradually **so that** I reduce risk.

**Acceptance Criteria**:
- Feature flag toggle per user segment
- Percentage rollout configurable
- A/B testing support
- Feature flag analytics

---

## Technical Architecture

### Database Schema Additions

```prisma
// Admin audit log
model AdminAction {
  id          String   @id @default(cuid())
  adminId     String
  admin       User     @relation(fields: [adminId], references: [id])
  
  action      String   // suspend_user, refund_transaction, etc.
  entityType  String   // user, transaction, track, etc.
  entityId    String
  
  details     Json     // Action-specific details
  reason      String?
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
  
  @@index([adminId])
  @@index([entityType, entityId])
  @@index([createdAt])
}

// Content moderation
model ModerationQueue {
  id          String   @id @default(cuid())
  
  contentType String   // track, user_profile, comment, etc.
  contentId   String
  contentUrl  String?  // Direct link to content
  
  flaggedBy   String   // user_id or 'system'
  flagReason  String   // spam, copyright, inappropriate, etc.
  flagDetails Json?    // Additional context
  
  status      ModerationStatus @default(PENDING)
  
  reviewedBy  String?
  reviewedAt  DateTime?
  reviewNotes String?
  
  createdAt   DateTime @default(now())
  
  @@index([status])
  @@index([contentType])
  @@index([createdAt])
}

// Platform announcements
model Announcement {
  id          String   @id @default(cuid())
  
  title       String
  content     String   // HTML content
  
  audience    Json     // { roles: [], plans: [], all: boolean }
  
  sendEmail   Boolean  @default(false)
  sendInApp   Boolean  @default(true)
  
  scheduledAt DateTime?
  sentAt      DateTime?
  
  createdBy   String
  createdAt   DateTime @default(now())
  
  @@index([sentAt])
  @@index([scheduledAt])
}

// Feature flags
model FeatureFlag {
  id          String   @id @default(cuid())
  
  key         String   @unique
  name        String
  description String?
  
  enabled     Boolean  @default(false)
  rolloutPercent Int   @default(0)  // 0-100
  
  // Targeting rules
  targetRoles String[] // Apply to specific roles
  targetPlans String[] // Apply to specific plans
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// System metrics (time-series)
model SystemMetric {
  id          String   @id @default(cuid())
  
  metric      String   // uptime, latency, error_rate, etc.
  value       Float
  unit        String   // percent, ms, count, etc.
  
  tags        Json?    // Additional context
  
  recordedAt  DateTime
  
  @@unique([metric, recordedAt])
  @@index([metric])
  @@index([recordedAt])
}
```

### API Endpoints

#### User Management
```
GET    /api/v1/admin/users              # List users (paginated)
GET    /api/v1/admin/users/:id          # User details
PATCH  /api/v1/admin/users/:id          # Update user (suspend, ban, role)
DELETE /api/v1/admin/users/:id          # Soft delete user
POST   /api/v1/admin/users/export       # Export CSV
```

#### Content Moderation
```
GET    /api/v1/admin/moderation         # Moderation queue
PATCH  /api/v1/admin/moderation/:id     # Approve/reject content
POST   /api/v1/admin/moderation/rules   # Configure auto-flag rules
```

#### Transactions
```
GET    /api/v1/admin/transactions       # List transactions
POST   /api/v1/admin/transactions/:id/refund  # Process refund
GET    /api/v1/admin/transactions/export      # Export CSV
```

#### Announcements
```
POST   /api/v1/admin/announcements      # Create announcement
GET    /api/v1/admin/announcements      # List announcements
GET    /api/v1/admin/announcements/:id  # Get announcement
PATCH  /api/v1/admin/announcements/:id  # Update/cancel
```

#### Feature Flags
```
GET    /api/v1/admin/feature-flags      # List feature flags
POST   /api/v1/admin/feature-flags      # Create flag
PATCH  /api/v1/admin/feature-flags/:id  # Update flag
DELETE /api/v1/admin/feature-flags/:id  # Delete flag
```

#### System Health
```
GET    /api/v1/admin/health             # Current health metrics
GET    /api/v1/admin/health/history     # Historical metrics
GET    /api/v1/admin/audit-log          # Admin action audit log
```

---

## UI Components Needed

### Admin Layout
- [ ] `AdminLayout` - Sidebar + header layout
- [ ] `AdminSidebar` - Navigation menu
- [ ] `AdminHeader` - Search, notifications, admin profile
- [ ] `StatCard` - Metric display cards
- [ ] `ChartWidget` - Charts for metrics

### User Management
- [ ] `UserDataTable` - Sortable, filterable table
- [ ] `UserFilters` - Filter panel
- [ ] `UserDetailModal` - Full user view
- [ ] `BulkActionsToolbar` - Multi-select actions
- [ ] `SuspendUserModal` - Suspend with reason

### Moderation
- [ ] `ModerationQueue` - Queue view
- [ ] `ContentPreview` - Inline content preview
- [ ] `FlagDetails` - Flag context display
- [ ] `ModerationActions` - Approve/reject buttons

### Transactions
- [ ] `TransactionTable` - Transaction list
- [ ] `TransactionFilters` - Date, amount, status filters
- [ ] `RefundModal` - Refund flow
- [ ] `TransactionDetail` - Full transaction view

### Announcements
- [ ] `AnnouncementEditor` - WYSIWYG editor
- [ ] `AudienceSelector` - Segment picker
- [ ] `AnnouncementPreview` - Preview mode
- [ ] `AnnouncementList` - Past announcements

### Feature Flags
- [ ] `FeatureFlagTable` - Flag list
- [ ] `FeatureFlagEditor` - Flag configuration
- [ ] `RolloutSlider` - Percentage rollout control
- [ ] `TargetingRules` - Role/plan targeting

---

## Implementation Phases

### Phase E11-A: User Management (Week 1)
- [ ] Database schema migration
- [ ] User list API with search/filter
- [ ] User management UI
- [ ] Suspend/ban functionality
- [ ] CSV export

### Phase E11-B: Moderation & Transactions (Week 2)
- [ ] Moderation queue
- [ ] Content flagging system
- [ ] Transaction auditing
- [ ] Refund processing

### Phase E11-C: Communications & Plans (Week 3)
- [ ] Announcement system
- [ ] Email delivery integration
- [ ] Subscription plan management
- [ ] Stripe plan sync

### Phase E11-D: Monitoring & Feature Flags (Week 4)
- [ ] System health metrics collection
- [ ] Metrics dashboard
- [ ] Feature flag system
- [ ] Audit logging

---

## Security Considerations

### Access Control
- Admin routes protected by RBAC middleware
- Role verification on every admin API call
- IP whitelisting option for admin access
- MFA required for all admin accounts

### Audit Trail
- Every admin action logged with:
  - Admin ID
  - Action type
  - Target entity
  - Timestamp
  - IP address
  - User agent
- Audit logs immutable (append-only)
- Audit log retention: 2 years

### Data Protection
- No sensitive user data in logs
- PII masked in admin views
- GDPR-compliant data export/deletion

---

## Monitoring & Alerting

### Key Metrics
- Admin dashboard load time < 2s
- Moderation queue processed within 24h
- Failed transactions flagged within 1h
- System uptime > 99.9%

### Alerts
- Error rate > 1%
- API latency > 500ms (p95)
- Failed payments spike
- Content flag queue > 100 items

---

## Dependencies

- E1: Authentication (✅ Complete) - For admin role verification
- E3: Licensing Marketplace - For transaction data
- E5: Payments - For refund processing

---

## Success Metrics

- Moderation queue SLA: < 24h average response
- Admin dashboard usage: daily active admins
- False positive rate for auto-flagging: < 5%
- System issue detection time: < 5 minutes

---

## Related Documents

- `docs/soundgrid-backlog.md` - Source backlog
- `.planning/IMPLEMENTATION_PLAN.md` - Overall plan
