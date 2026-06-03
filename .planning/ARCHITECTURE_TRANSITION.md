# Architecture Transition Summary

## Current State

### What Exists (Single App Architecture)
```
soundgrid/
├── soundgrid-web/          # Next.js 15 app (current)
│   ├── app/                # Routes
│   ├── lib/                # Utilities, actions
│   ├── components/         # React components
│   ├── prisma/             # Database schema
│   └── package.json        # NPM dependencies
├── .planning/              # Project planning docs
│   ├── phases/
│   │   ├── 01-foundation/  # ✅ Complete
│   │   └── 02-contracts/   # 📝 Documented
│   └── ...
└── DESIGN.md, SITEMAP.md
```

### What's Complete
- ✅ Phase 1: Foundation & Identity (4/4 plans)
- ✅ Contract Wizard UI (Plan 02-01)
- ✅ Prisma schema with all models
- ✅ Next.js app with auth, personas, contracts

## Target State

### What We Need (Turborepo Architecture)
```
soundgrid/
├── apps/
│   ├── web/                # Next.js 15 (moved from soundgrid-web)
│   └── api/                # NEW: FastAPI backend
│       ├── src/soundgrid_api/
│       ├── pyproject.toml  # PDM + uv
│       └── pdm.lock
├── packages/
│   ├── database/           # Prisma schema + client
│   ├── types/              # Shared TypeScript types
│   ├── ui/                 # Shared React components
│   └── config/             # Shared ESLint, TS configs
├── turbo.json              # Turborepo pipeline
├── pnpm-workspace.yaml     # pnpm workspace
├── package.json            # Root package.json
├── pyproject.toml          # Root PDM config
└── .planning/              # (unchanged)
```

## Why This Change?

### Requirements from User
1. **Turborepo + pnpm** - Better monorepo management
2. **FastAPI backend** - Python for e-signature service
3. **PDM + uv** - Modern Python package management
4. **Custom e-signature** - No DocuSign API costs
5. **Full planning before implementation** - Document waves first

### Benefits
- Clear separation of frontend/backend
- Shared packages reduce duplication
- Better build caching with Turbo
- Python ecosystem for PDF/crypto operations
- Cost savings (no DocuSign fees)

## Implementation Plan

### Phase 0: Architecture Setup (BEFORE any feature work)

**Step 1: Initialize Turborepo (2-3 hours)**
```bash
# Create root package.json
# Create turbo.json
# Create pnpm-workspace.yaml
# Move soundgrid-web to apps/web
# Update all imports to use workspace packages
```

**Step 2: Create FastAPI App (2-3 hours)**
```bash
# mkdir apps/api
# pdm init
# Add all Python dependencies
# Create basic FastAPI structure
# Set up database connection
```

**Step 3: Shared Packages (1-2 hours)**
```bash
# Create packages/database (Prisma)
# Create packages/types
# Create packages/ui
# Update apps to use workspace deps
```

**Step 4: Pipeline Configuration (1 hour)**
```bash
# Configure turbo.json pipeline
# Add dev/build/test scripts
# Verify everything starts correctly
```

**Total Setup Time: 6-9 hours**

### Phase 1: Custom E-Signature (Wave 2)

After architecture is complete:

1. **Backend (FastAPI)**
   - RSA key pair generation
   - PDF generation service (reportlab)
   - Cryptographic signing endpoints
   - S3 document storage
   - Audit trail logging

2. **Frontend (Next.js)**
   - SignaturePad component
   - PDF preview with placement
   - Signing ceremony flow
   - Status tracking

### Phase 2: Contract Versioning (Wave 3)
- Version history
- Diff viewer
- Rollback capability

### Phase 3: DAW Integration (Wave 4)
- Webhook endpoints
- Session tracking
- Auto-draft generation

## DocuSign → Custom E-Signature

### Why Custom?
- DocuSign API costs money per envelope
- User has no budget for API fees
- Custom solution is feasible with modern crypto libraries

### How It Works
1. **PDF Generation**: reportlab creates contract PDF
2. **Signature Capture**: HTML5 Canvas captures signature
3. **Cryptographic Signing**: RSA keys sign document hash
4. **Audit Trail**: Timestamps, IPs, actions logged
5. **Final PDF**: Signed PDF with visual signatures

### Legal Validity
- ESIGN Act compliant (US)
- Tamper-evident (hash verification)
- Identity verified (via Stripe Identity)
- Audit trail maintained

## Next Actions

### Immediate (Architecture)
1. Run the Turborepo setup commands
2. Move existing code to new structure
3. Verify build pipeline works
4. Test dev servers start

### After Setup
1. Implement custom e-signature (Wave 2)
2. Implement contract versioning (Wave 3)
3. Implement DAW integration (Wave 4)
4. Polish and optimize (Wave 5)

## Files Created for Planning

- `.planning/ARCHITECTURE.md` - Full architecture specification
- `.planning/phases/02-contracts/WAVES.md` - Implementation waves
- `.planning/phases/02-contracts/SETUP_INSTRUCTIONS.md` - Migration guide
- `.planning/ARCHITECTURE_TRANSITION.md` - This file

## Questions?

Key decisions made:
1. ✅ Turborepo + pnpm (not npm/yarn)
2. ✅ FastAPI (not Django/Flask)
3. ✅ PDM + uv (not pip/poetry)
4. ✅ Custom e-signature (not DocuSign)
5. ✅ Full planning first (not iterative)

Ready to proceed with architecture migration?
