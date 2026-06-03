# Plan 02-03: Contract Versioning

**Wave**: 3  
**Status**: 📋 PLANNED  
**Duration**: 4-5 hours  
**Backlog Mapping**: E4-5 (Contract history), E3-3 (License versioning)

---

## Objective
Implement contract versioning and history tracking. Track changes, enable rollbacks, and provide diff viewing between versions.

---

## Requirements

### Functional Requirements
- [ ] Automatic version creation on contract modification
- [ ] Version numbering (v1.0, v1.1, v2.0)
- [ ] Diff viewer comparing versions
- [ ] Rollback to previous version
- [ ] Change summary required on save
- [ ] Version history in sidebar

### Version Types
- **Major**: Significant changes (terms, parties) → v1.0 → v2.0
- **Minor**: Small changes (dates, amounts) → v1.0 → v1.1
- **Patch**: Typos, formatting → v1.0 → v1.0.1

---

## Technical Architecture

### Database Schema

```prisma
// Contract versions
model ContractVersion {
  id          String   @id @default(cuid())
  
  contractId  String
  contract    Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  // Version info
  versionNumber String  // semantic version: "1.0", "1.1", "2.0"
  versionType   String  // major, minor, patch
  
  // Snapshot of contract state
  title       String
  terms       Json
  parties     Json     // Snapshot of parties at this version
  
  // Change tracking
  changeSummary String
  createdById   String
  createdBy     User   @relation(fields: [createdById], references: [id])
  
  // Document
  pdfUrl      String
  documentHash String
  
  createdAt   DateTime @default(now())
  
  @@unique([contractId, versionNumber])
  @@index([contractId])
  @@index([createdAt])
}

// Add to Contract model
model Contract {
  // ... existing fields ...
  
  versions    ContractVersion[]
  currentVersion String?      // Current version number
}
```

### API Endpoints

```
GET    /api/v1/contracts/:id/versions          # List versions
GET    /api/v1/contracts/:id/versions/:version # Get specific version
POST   /api/v1/contracts/:id/versions          # Create new version
POST   /api/v1/contracts/:id/versions/:version/restore  # Rollback
GET    /api/v1/contracts/:id/compare           # Compare two versions
```

### Version Comparison Response
```typescript
{
  fromVersion: "1.0",
  toVersion: "1.1",
  changed: {
    terms: {
      price: { from: 50000, to: 55000 },
      deliveryDate: { from: "2026-03-01", to: "2026-03-15" }
    },
    parties: {
      added: [],
      removed: [],
      modified: []
    }
  },
  summary: "Updated price and extended delivery date"
}
```

---

## Frontend Components

### Version History Panel
```typescript
// apps/web/app/components/ContractVersionHistory.tsx

interface VersionHistoryProps {
  contractId: string;
  versions: ContractVersion[];
  currentVersion: string;
}

export function ContractVersionHistory({ 
  contractId, 
  versions, 
  currentVersion 
}: VersionHistoryProps) {
  return (
    <div className="version-history">
      <h3 className="font-semibold mb-4">Version History</h3>
      <div className="space-y-2">
        {versions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            isCurrent={version.versionNumber === currentVersion}
            contractId={contractId}
          />
        ))}
      </div>
    </div>
  );
}
```

### Version Diff Viewer
```typescript
// apps/web/app/components/VersionDiff.tsx

interface VersionDiffProps {
  fromVersion: ContractVersion;
  toVersion: ContractVersion;
}

export function VersionDiff({ fromVersion, toVersion }: VersionDiffProps) {
  const diff = computeDiff(fromVersion, toVersion);
  
  return (
    <div className="version-diff">
      <h3>Changes from {fromVersion.versionNumber} to {toVersion.versionNumber}</h3>
      
      <div className="diff-section">
        <h4>Terms</h4>
        {Object.entries(diff.terms).map(([key, change]) => (
          <DiffRow 
            key={key}
            field={key}
            from={change.from}
            to={change.to}
          />
        ))}
      </div>
      
      <div className="diff-section">
        <h4>Parties</h4>
        {/* Party diff */}
      </div>
    </div>
  );
}
```

---

## Implementation Tasks

### Backend
- [ ] Create `ContractVersion` model and migration
- [ ] Add versioning logic to contract update
- [ ] Create version comparison utility
- [ ] Implement rollback functionality
- [ ] Add version endpoints
- [ ] Unit tests for version logic

### Frontend
- [ ] Create version history sidebar component
- [ ] Create version diff viewer
- [ ] Add version selector to contract view
- [ ] Create rollback confirmation modal
- [ ] Add change summary input on save
- [ ] Visual indicators for version status

---

## File Structure
```
apps/web/app/components/
├── ContractVersionHistory.tsx
├── VersionDiff.tsx
├── VersionItem.tsx
└── VersionRollbackModal.tsx

apps/api/src/soundgrid_api/
├── services/
│   └── version_service.py
└── routers/
    └── versions.py
```

---

## Success Criteria
- [ ] Every contract change creates a new version
- [ ] Users can view version history
- [ ] Users can compare any two versions
- [ ] Users can rollback to previous version
- [ ] Change summary required on save
- [ ] PDF generated for each version

---

## Dependencies
- Wave 2 (E-Signature) must be complete
- Contract editing functionality
