# Plan 02-04: DAW Integration

**Wave**: 4  
**Status**: 📋 PLANNED  
**Duration**: 6-8 hours  
**Backlog Mapping**: E2-2 (Track upload), E4-10 (Setlist/rider)

---

## Objective
Basic DAW integration to trigger contract drafts from sessions. Capture session metadata, track collaborations, and auto-generate contract drafts based on project activity.

---

## Requirements

### Functional Requirements
- [ ] Webhook endpoint for DAW events
- [ ] Support major DAWs: Ableton Live, Logic Pro, FL Studio, Pro Tools
- [ ] Session start/end detection
- [ ] Track/exchange detection
- [ ] Auto-draft contract generation
- [ ] Session activity log
- [ ] Manual session entry for unsupported DAWs

### DAW Events
- `session_start`: User opens a project
- `session_end`: User closes a project
- `track_added`: New track created
- `audio_export`: Bounce/export created
- `collaborator_join`: Another user connects (for cloud DAWs)

---

## Technical Architecture

### Database Schema

```prisma
// DAW Sessions
model DawSession {
  id          String   @id @default(cuid())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // DAW info
  dawName     String   // ableton, logic, flstudio, protools
  dawVersion  String?
  
  // Project info
  projectName String
  projectPath String?  // Local path (hashed for privacy)
  
  // Session timing
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  duration    Int?     // Seconds
  
  // Session content
  trackCount  Int      @default(0)
  exports     String[] // Export file names
  
  // Metadata
  os          String?
  
  // Relations
  drafts      Contract[] @relation("DawSessionDrafts")
  
  @@index([userId])
  @@index([startedAt])
}

// DAW connections (user settings)
model DawConnection {
  id          String   @id @default(cuid())
  
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Enabled DAWs
  abletonEnabled   Boolean @default(false)
  logicEnabled     Boolean @default(false)
  flStudioEnabled  Boolean @default(false)
  proToolsEnabled  Boolean @default(false)
  
  // Auto-draft settings
  autoDraftEnabled Boolean @default(true)
  minSessionDuration Int @default(300) // 5 minutes
  minTrackCount    Int @default(2)
  
  // Webhook token
  webhookToken     String   @unique
  
  updatedAt        DateTime @updatedAt
}

// Add to Contract model
model Contract {
  // ... existing fields ...
  
  // Source tracking
  source         String   @default("manual") // manual, daw, template
  sourceSessionId String?
  sourceSession   DawSession? @relation(fields: [sourceSessionId], references: [id], name: "DawSessionDrafts")
}
```

### API Endpoints

```
// DAW webhook (public, token-based auth)
POST   /api/v1/webhooks/daw/:token

// DAW connections
GET    /api/v1/daw/connection          # Get user's DAW connection
POST   /api/v1/daw/connection          # Create/update connection
DELETE /api/v1/daw/connection          # Disconnect all DAWs

// Sessions
GET    /api/v1/daw/sessions            # List sessions
GET    /api/v1/daw/sessions/:id        # Get session details
POST   /api/v1/daw/sessions            # Manual session entry

// Drafts from sessions
GET    /api/v1/daw/drafts              # Get auto-generated drafts
POST   /api/v1/daw/drafts/:id/convert  # Convert draft to contract
```

### Webhook Payload
```typescript
// POST /api/v1/webhooks/daw/:token
{
  event: 'session_start' | 'session_end' | 'track_added' | 'audio_export',
  daw: {
    name: 'ableton' | 'logic' | 'flstudio' | 'protools',
    version: '11.0.1'
  },
  project: {
    name: 'Summer Hit 2026',
    path_hash: 'sha256:abc123...',  // Hashed for privacy
    bpm: 140,
    time_signature: '4/4'
  },
  session: {
    started_at: '2026-02-26T10:00:00Z',
    track_count: 5,
    duration_seconds: 3600
  },
  timestamp: '2026-02-26T11:00:00Z'
}
```

---

## DAW Integration Methods

### Option 1: Plugin/Extension (Long-term)
Develop plugins for each DAW that communicate directly with SoundGrid API.

**Pros**: Real-time, reliable, rich metadata  
**Cons**: Development overhead, distribution complexity

### Option 2: File System Watcher (Medium-term)
Desktop app that watches project folders for changes.

**Pros**: Works with all DAWs, easier to build  
**Cons**: Requires desktop app, less precise

### Option 3: Manual Webhook (Current)
Users manually trigger webhooks or use simple scripts.

**Pros**: Immediate implementation, no dependencies  
**Cons**: Requires user action, less automated

### Implementation: Hybrid Approach
Start with Option 3 (manual webhooks) and provide simple scripts:

```python
# daw_bridge.py - Simple script for users to run
def on_session_start():
    requests.post(WEBHOOK_URL, json={
        'event': 'session_start',
        'daw': {'name': detect_daw(), 'version': get_version()},
        'project': {'name': get_project_name()},
        'timestamp': datetime.utcnow().isoformat()
    })
```

---

## Frontend Components

### DAW Settings Page
```typescript
// apps/web/app/(dashboard)/settings/daw/page.tsx

export default function DawSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">DAW Integration</h1>
      
      <DawConnectionForm />
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Webhook Token</h2>
        <WebhookTokenDisplay />
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Auto-Draft Settings</h2>
        <AutoDraftSettings />
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
        <DawSetupInstructions />
      </div>
    </div>
  );
}
```

### Session Activity Feed
```typescript
// apps/web/app/components/DawActivityFeed.tsx

interface DawActivityFeedProps {
  sessions: DawSession[];
}

export function DawActivityFeed({ sessions }: DawActivityFeedProps) {
  return (
    <div className="activity-feed">
      <h3 className="font-semibold mb-4">Recent Sessions</h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            hasDraft={session.drafts.length > 0}
          />
        ))}
      </div>
    </div>
  );
}
```

### Draft Contracts from Sessions
```typescript
// apps/web/app/components/SessionDrafts.tsx

export function SessionDrafts() {
  const drafts = useSessionDrafts();
  
  return (
    <div className="session-drafts">
      <h3 className="font-semibold mb-4">Drafts from Sessions</h3>
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onConvert={() => convertToContract(draft.id)}
        />
      ))}
    </div>
  );
}
```

---

## Auto-Draft Generation Logic

```python
# apps/api/src/soundgrid_api/services/daw_service.py

class DawService:
    def generate_draft_from_session(self, session: DawSession) -> Contract:
        """Auto-generate contract draft from session"""
        
        # Determine contract type based on session
        contract_type = self.infer_contract_type(session)
        
        # Create draft contract
        draft = Contract(
            type=contract_type,
            status='draft',
            title=f"{session.project_name} - {contract_type.value}",
            terms=self.generate_terms(session, contract_type),
            source='daw',
            source_session_id=session.id,
            created_by_id=session.user_id
        )
        
        return draft
    
    def infer_contract_type(self, session: DawSession) -> ContractType:
        """Infer contract type from session metadata"""
        
        if session.track_count > 10:
            return ContractType.ALBUM_PRODUCTION
        elif 'collab' in session.project_name.lower():
            return ContractType.COLLABORATION
        elif 'beat' in session.project_name.lower():
            return ContractType.BEAT_LICENSE
        else:
            return ContractType.WORK_FOR_HIRE
    
    def generate_terms(self, session: DawSession, contract_type: ContractType) -> dict:
        """Generate default terms based on type"""
        
        templates = {
            ContractType.BEAT_LICENSE: {
                'price': 5000,  # $50 default
                'license_type': 'non_exclusive',
                'distribute_copies': 10000,
                'audio_streams': 100000
            },
            ContractType.COLLABORATION: {
                'revenue_split': {'producer': 50, 'artist': 50},
                'ownership': 'joint',
                'credit': 'co-produced'
            },
            # ... other templates
        }
        
        return templates.get(contract_type, {})
```

---

## Implementation Tasks

### Backend
- [ ] Create `DawSession` and `DawConnection` models
- [ ] Implement webhook endpoint with token auth
- [ ] Create DAW service for draft generation
- [ ] Add session aggregation logic
- [ ] Unit tests for draft generation
- [ ] Webhook security (signature verification)

### Frontend
- [ ] Create DAW settings page
- [ ] Create session activity feed
- [ ] Create draft conversion UI
- [ ] Add DAW connection status indicator
- [ ] Manual session entry form

### Documentation
- [ ] Webhook integration guide
- [ ] DAW-specific setup instructions
- [ ] Example scripts for common DAWs

---

## File Structure
```
apps/web/app/
├── (dashboard)/
│   ├── settings/daw/
│   │   └── page.tsx
│   └── sessions/
│       └── page.tsx
└── components/
    ├── DawActivityFeed.tsx
    ├── SessionCard.tsx
    ├── SessionDrafts.tsx
    └── DawConnectionForm.tsx

apps/api/src/soundgrid_api/
├── services/
│   └── daw_service.py
├── routers/
│   └── daw.py
└── models/
    └── daw.py
```

---

## Success Criteria
- [ ] Webhook receives events from DAWs
- [ ] Sessions tracked and displayed
- [ ] Auto-drafts generated from sessions
- [ ] Users can convert drafts to contracts
- [ ] Manual session entry works

---

## Dependencies
- Wave 2 (E-Signature) complete
- Wave 3 (Versioning) complete

---

## Future Enhancements
- Desktop app for file watching
- Native DAW plugins
- Cloud DAW integrations (BandLab, Soundtrap)
- AI-powered contract suggestions
