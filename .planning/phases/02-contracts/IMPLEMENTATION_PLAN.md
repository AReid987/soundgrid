# Phase 2 Implementation Plan

## Status
✅ Research Complete  
✅ Architecture Planned  
📝 Implementation Waves Documented  
⏳ Awaiting Migration Execution

---

## Pre-Implementation: Architecture Migration

**Must be completed first:** See `ARCHITECTURE_MIGRATION_PLAN.md`

**Duration**: 6-9 hours  
**Blocker**: All subsequent work depends on this

---

## Wave 1: Custom E-Signature System (8-10 hours)

### Objective
Build legally-compliant e-signature system to replace DocuSign.

### 1.1 Backend: Cryptographic Infrastructure (2-3 hours)

**Location**: `apps/api/src/soundgrid_api/services/signature_service.py`

**Tasks**:
- [ ] Implement RSA key pair generation
- [ ] Create key storage (encrypted in database)
- [ ] Implement document hashing (SHA-256)
- [ ] Create signature verification
- [ ] Build audit logging

**Code Structure**:
```python
# services/signature_service.py
class SignatureService:
    def generate_key_pair(self, user_id: str) -> tuple[str, str]:
        """Generate RSA key pair for user."""
        
    def sign_document(self, document: bytes, private_key: str) -> str:
        """Cryptographically sign document."""
        
    def verify_signature(self, document: bytes, signature: str, public_key: str) -> bool:
        """Verify document signature."""
        
    def hash_document(self, document: bytes) -> str:
        """Generate document hash for integrity."""
```

**Tests**:
```python
# tests/test_signature_service.py
def test_key_generation():
def test_sign_and_verify():
def test_tamper_detection():
def test_hash_consistency():
```

### 1.2 Backend: PDF Generation Service (2-3 hours)

**Location**: `apps/api/src/soundgrid_api/services/pdf_service.py`

**Tasks**:
- [ ] Install reportlab
- [ ] Create contract template renderer
- [ ] Add signature fields to PDF
- [ ] Implement visual signature overlay
- [ ] Generate final signed PDF

**Code Structure**:
```python
# services/pdf_service.py
class PDFService:
    def generate_contract_pdf(self, contract: Contract) -> bytes:
        """Generate PDF from contract data."""
        
    def add_signature_field(self, pdf: bytes, field_name: str) -> bytes:
        """Add signature field to PDF."""
        
    def overlay_signature(self, pdf: bytes, signature_image: bytes, position: tuple) -> bytes:
        """Overlay visual signature on PDF."""
        
    def add_audit_page(self, pdf: bytes, audit_trail: list) -> bytes:
        """Add audit trail page to final PDF."""
```

### 1.3 Backend: Signature API Endpoints (2 hours)

**Location**: `apps/api/src/soundgrid_api/routers/signatures.py`

**Endpoints**:
```python
# routers/signatures.py
@router.post("/request")
async def request_signature(
    contract_id: str,
    party_id: str,
    db: AsyncSession = Depends(get_db)
) -> SignatureRequestResponse:
    """Request signature from a party."""

@router.post("/sign")
async def submit_signature(
    contract_id: str,
    signature_image: UploadFile,
    signed_hash: str,
    current_user: User = Depends(get_current_user)
) -> SignatureResponse:
    """Submit signature for a contract."""

@router.get("/{signature_id}/verify")
async def verify_signature(
    signature_id: str,
    db: AsyncSession = Depends(get_db)
) -> VerificationResponse:
    """Verify a signature's validity."""

@router.get("/contract/{contract_id}/status")
async def get_signature_status(
    contract_id: str,
    db: AsyncSession = Depends(get_db)
) -> SignatureStatusResponse:
    """Get signature status for all parties."""
```

### 1.4 Frontend: SignaturePad Component (2 hours)

**Location**: `apps/web/components/signature/signature-pad.tsx`

**Features**:
- [ ] Canvas-based signature capture
- [ ] Touch and mouse support
- [ ] Clear/undo functionality
- [ ] Export to PNG/SVG

**Props Interface**:
```typescript
interface SignaturePadProps {
  onChange: (signature: string | null) => void
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
}
```

### 1.5 Frontend: Signing Ceremony Flow (2 hours)

**Location**: `apps/web/app/(app)/contracts/[id]/sign/page.tsx`

**Flow**:
1. Display contract PDF
2. Show signature pad
3. Capture signature
4. Submit to API
5. Show confirmation

**Components**:
- ContractPDFViewer
- SignatureCaptureModal
- SigningProgress
- SuccessConfirmation

### 1.6 Database Migrations

**New Tables**:
```sql
-- signatures table
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id),
  signature_image_url TEXT NOT NULL,
  public_key TEXT NOT NULL,
  signed_hash TEXT NOT NULL,
  signed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB
);

-- signing_keys table (for RSA key pairs)
CREATE TABLE signing_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,  -- AES encrypted
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

-- Update contracts table
ALTER TABLE contracts ADD COLUMN final_pdf_url TEXT;
ALTER TABLE contracts ADD COLUMN signed_at TIMESTAMP;
ALTER TABLE contracts ADD COLUMN audit_trail JSONB DEFAULT '[]';
```

### 1.7 Legal Compliance Documentation

**Document**: `apps/api/docs/ESIGN_COMPLIANCE.md`

**Requirements**:
- Intent to sign
- Consent to electronic records
- Association of signature with record
- Record retention
- Accuracy and accessibility

**Implementation Checklist**:
- [ ] Clear "Sign Document" button
- [ ] Consent checkbox before signing
- [ ] Document hash linked to signature
- [ ] 7-year retention in S3
- [ ] Download capability after signing

---

## Wave 2: Contract Versioning (4-5 hours)

### Objective
Track contract changes and enable version history.

### 2.1 Backend: Version Service (2 hours)

**Location**: `apps/api/src/soundgrid_api/services/version_service.py`

**Code Structure**:
```python
class VersionService:
    def create_version(
        self, 
        contract_id: str, 
        changes: dict,
        user_id: str
    ) -> ContractVersion:
        """Create new contract version."""
        
    def get_version_history(self, contract_id: str) -> list[ContractVersion]:
        """Get all versions of a contract."""
        
    def compare_versions(
        self, 
        version_a_id: str, 
        version_b_id: str
    ) -> VersionDiff:
        """Compare two versions and show differences."""
        
    def rollback_to_version(
        self, 
        contract_id: str, 
        version_id: str,
        user_id: str
    ) -> Contract:
        """Rollback contract to specific version."""
```

### 2.2 API Endpoints (1 hour)

```python
@router.get("/contracts/{contract_id}/versions")
async def get_contract_versions(contract_id: str) -> list[VersionResponse]:
    """Get version history."""

@router.post("/contracts/{contract_id}/versions")
async def create_version(
    contract_id: str,
    data: VersionCreateRequest
) -> VersionResponse:
    """Create new version."""

@router.post("/contracts/{contract_id}/rollback/{version_id}")
async def rollback_contract(
    contract_id: str,
    version_id: str
) -> ContractResponse:
    """Rollback to specific version."""
```

### 2.3 Frontend: Version History UI (2 hours)

**Components**:
- VersionHistoryPanel
- VersionDiffViewer
- RollbackConfirmationModal

**Location**: `apps/web/app/(app)/contracts/[id]/versions/page.tsx`

### 2.4 Database

```sql
CREATE TABLE contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  terms JSONB,
  pdf_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  change_summary TEXT,
  UNIQUE(contract_id, version_number)
);

-- Add version tracking to contracts
ALTER TABLE contracts ADD COLUMN current_version INTEGER DEFAULT 1;
ALTER TABLE contracts ADD COLUMN version_count INTEGER DEFAULT 1;
```

---

## Wave 3: DAW Integration (6-8 hours)

### Objective
Trigger contract drafts from DAW sessions.

### 3.1 Backend: DAW Webhook Service (2 hours)

**Location**: `apps/api/src/soundgrid_api/services/daw_service.py`

**Code Structure**:
```python
class DAWService:
    def process_session_start(
        self,
        user_id: str,
        daw_name: str,
        project_name: str,
        metadata: dict
    ) -> DAWSession:
        """Record session start."""
        
    def process_session_end(
        self,
        session_id: str,
        tracks: list[str],
        exports: list[str]
    ) -> list[ContractDraft]:
        """Process session end and suggest contracts."""
        
    def generate_draft_contracts(
        self,
        session: DAWSession
    ) -> list[ContractDraft]:
        """Generate contract drafts based on session data."""
```

### 3.2 Webhook Endpoints (1 hour)

```python
@router.post("/webhooks/daw")
async def daw_webhook(
    event: DAWEvent,
    signature: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> WebhookResponse:
    """Receive DAW events."""

@router.get("/daw/sessions")
async def get_user_sessions(
    current_user: User = Depends(get_current_user)
) -> list[SessionResponse]:
    """Get user's DAW sessions."""

@router.get("/daw/drafts")
async def get_draft_contracts(
    current_user: User = Depends(get_current_user)
) -> list[ContractDraftResponse]:
    """Get contract drafts from DAW sessions."""
```

### 3.3 Frontend: DAW Integration UI (2 hours)

**Components**:
- DAWConnectionSettings
- SessionActivityFeed
- DraftContractCard

**Location**: 
- `apps/web/app/(app)/settings/daw/page.tsx`
- `apps/web/app/(app)/daw-sessions/page.tsx`

### 3.4 Database

```sql
CREATE TABLE daw_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  daw_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  tracks TEXT[],
  exports TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update contracts with source
ALTER TABLE contracts ADD COLUMN source TEXT DEFAULT 'manual';
ALTER TABLE contracts ADD COLUMN source_id UUID;
ALTER TABLE contracts ADD COLUMN source_metadata JSONB;
```

### 3.5 DAW Plugin/SDK (Optional, 3 hours)

**Languages**: JavaScript (for web-based DAWs), Python (for desktop)

**Features**:
- Session tracking
- Export detection
- Auto-trigger webhooks

**Supported DAWs (Phase 1)**:
- Ableton Live (via Max for Live)
- FL Studio (via Python script)
- Logic Pro (via AppleScript)

---

## Wave 4: Integration & Polish (5-6 hours)

### 4.1 Email Notifications (2 hours)

**Service**: `apps/api/src/soundgrid_api/services/email_service.py`

**Triggers**:
- Contract created
- Signature requested
- Contract signed
- Payment received
- Status changes

**Provider**: Resend (free tier: 3,000 emails/month)

### 4.2 Real-time Updates (1 hour)

**WebSocket** or **Server-Sent Events** for:
- Signature status changes
- Contract status updates
- Payment notifications

### 4.3 Dashboard Enhancements (2 hours)

**New Widgets**:
- Pending signatures
- Recent contracts
- Action items
- DAW activity

### 4.4 Performance Optimization (1 hour)

**Tasks**:
- [ ] PDF caching
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Lazy loading

---

## Testing Strategy

### Unit Tests

**Backend**:
```bash
cd apps/api
pdm run test
```

**Coverage Targets**:
- Signature service: 95%
- PDF service: 90%
- Version service: 90%

### Integration Tests

**Contract Signing Flow**:
1. Create contract
2. Request signature
3. Submit signature
4. Verify final PDF
5. Check audit trail

### E2E Tests

**Playwright tests**:
```bash
cd apps/web
pnpm test:e2e
```

**Scenarios**:
- Complete signing flow
- Version rollback
- DAW integration

---

## Database Migration Strategy

### Migration Order

1. **Wave 0 (Migration)**: Move existing schema
2. **Wave 1**: Add signature tables
3. **Wave 2**: Add version tables
4. **Wave 3**: Add DAW tables

### Commands

```bash
# Generate migration
pnpm db:migrate --name add_signatures

# Apply migration
pnpm db:push

# Verify
pnpm db:studio
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] S3 buckets created
- [ ] Stripe webhooks configured

### Deployment Order
1. Database migrations
2. API deployment
3. Web app deployment
4. Verify health checks
5. Smoke tests

### Post-deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify email delivery
- [ ] Test signing flow

---

## Success Metrics

### Performance
- Contract creation: < 2 seconds
- PDF generation: < 3 seconds
- Signature submission: < 1 second
- Page load: < 1 second

### Legal
- ESIGN Act compliance: 100%
- Audit trail completeness: 100%
- Signature verification: 100%

### User Experience
- Signing flow completion rate: > 90%
- Time to sign: < 5 minutes
- Error rate: < 1%

---

## Documentation to Create

### Technical Docs
- [ ] `apps/api/docs/ESIGN_COMPLIANCE.md`
- [ ] `apps/api/docs/API_REFERENCE.md`
- [ ] `apps/api/docs/DEPLOYMENT.md`

### User Docs
- [ ] `docs/CONTRACT_SIGNING.md`
- [ ] `docs/DAW_INTEGRATION.md`
- [ ] `docs/FAQ.md`

---

## Timeline Summary

| Wave | Duration | Start | End |
|------|----------|-------|-----|
| 0: Architecture Migration | 6-9 hrs | Day 1 | Day 1-2 |
| 1: E-Signature | 8-10 hrs | Day 2 | Day 2-3 |
| 2: Versioning | 4-5 hrs | Day 3 | Day 3-4 |
| 3: DAW Integration | 6-8 hrs | Day 4 | Day 4-5 |
| 4: Polish | 5-6 hrs | Day 5 | Day 5-6 |
| **Testing & Buffer** | 8 hrs | Day 6 | Day 7 |

**Total: 37-52 hours over 7 days**

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| E-signature legal issues | Low | High | Legal review, ESIGN compliance |
| DAW integration complexity | Medium | Medium | Start with webhooks, plugins later |
| Performance issues | Low | Medium | Load testing, caching |
| Migration bugs | Medium | Medium | Comprehensive testing, rollback plan |

---

## Next Steps

1. **Review this plan** - Ensure all requirements covered
2. **Execute architecture migration** - See ARCHITECTURE_MIGRATION_PLAN.md
3. **Implement Wave 1** - E-signature system
4. **Test thoroughly** - Legal compliance critical
5. **Deploy and monitor** - Production readiness

---

## Approval Required

- [ ] Architecture migration approved
- [ ] E-signature approach approved
- [ ] Timeline approved
- [ ] Resource allocation approved

**Ready to proceed?**
