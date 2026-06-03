# Plan 02-01: Guided Contract Wizard

**Wave**: 1  
**Status**: ✅ COMPLETE  
**Duration**: 4-5 hours  
**Backlog Mapping**: E4-5 (Contract generation from template)

---

## Objective
Create a 3-step wizard for generating music industry contracts with template selection, party configuration, and terms customization.

---

## Requirements

### Functional Requirements
- [x] Support 8 contract types (Beat License, Collaboration, Work-for-Hire, etc.)
- [x] Template-based contract generation
- [x] Multi-party support (up to 5 parties)
- [x] Dynamic form fields based on contract type
- [x] Real-time preview
- [x] Save as draft functionality

### Contract Types Supported
1. Beat License Agreement
2. Producer Collaboration
3. Work-for-Hire
4. Sync License
5. Distribution Agreement
6. Performance Agreement
7. Management Agreement
8. Custom Contract

---

## Technical Implementation

### Database Schema
```prisma
model Contract {
  id            String   @id @default(cuid())
  type          ContractType
  status        ContractStatus @default(DRAFT)
  
  // Creator
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  
  // Parties
  parties       ContractParty[]
  
  // Terms (JSON based on contract type)
  terms         Json
  
  // Generated documents
  pdfUrl        String?
  
  // Metadata
  title         String
  description   String?
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  expiresAt     DateTime?
  
  @@index([createdById])
  @@index([status])
}

model ContractParty {
  id          String   @id @default(cuid())
  contractId  String
  contract    Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  // Party details
  name        String
  email       String
  role        String   // Artist, Producer, Label, etc.
  
  // Signature
  signatureId String?
  signedAt    DateTime?
  
  // Identity verification
  stripeIdentityVerified Boolean @default(false)
  
  @@index([contractId])
}
```

### API Endpoints
```
POST   /api/contracts                 # Create contract
GET    /api/contracts                 # List contracts
GET    /api/contracts/:id             # Get contract
PATCH  /api/contracts/:id             # Update contract
POST   /api/contracts/:id/generate    # Generate PDF
DELETE /api/contracts/:id             # Delete contract

GET    /api/contracts/templates       # List templates
GET    /api/contracts/templates/:type # Get template schema
```

### Frontend Components
- [x] `ContractWizard` - Main wizard container
- [x] `StepIndicator` - Progress indicator
- [x] `TemplateSelector` - Contract type selection
- [x] `PartyConfigurator` - Add/edit parties
- [x] `TermsForm` - Dynamic form based on template
- [x] `ContractPreview` - Live PDF preview
- [x] `SaveDraftButton` - Save progress

---

## File Structure
```
apps/web/app/(dashboard)/contracts/
├── new/
│   └── page.tsx              # Wizard entry point
├── [id]/
│   └── page.tsx              # Contract detail/edit
├── components/
│   ├── ContractWizard.tsx    # Main wizard
│   ├── TemplateSelector.tsx  # Step 1
│   ├── PartyConfigurator.tsx # Step 2
│   ├── TermsForm.tsx         # Step 3
│   └── ContractPreview.tsx   # Preview panel
└── templates/
    ├── schemas.ts            # Zod schemas per type
    ├── renderers.ts          # PDF generation
    └── index.ts              # Template registry
```

---

## Deliverables
- [x] Contract wizard UI with 3 steps
- [x] 8 contract type templates
- [x] Multi-party configuration
- [x] PDF generation
- [x] Draft saving
- [x] Form validation with Zod

---

## Status: ✅ COMPLETE
All requirements met. See `02-01-contract-wizard-RESULT.md` for detailed output.
