# SoundGrid Architecture

## Overview

SoundGrid is a monorepo built with Turborepo, using pnpm for package management. The system consists of a Next.js frontend and a Python FastAPI backend.

## Monorepo Structure

```
soundgrid/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   └── api/                    # FastAPI backend
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared React components
│   ├── config/                 # Shared ESLint, TS, Tailwind configs
│   └── python-shared/          # Shared Python utilities
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace config
└── pyproject.toml              # PDM + uv configuration (root)
```

## Technology Stack

### Frontend (apps/web)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn/ui
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Auth**: NextAuth.js v5

### Backend (apps/api)
- **Framework**: FastAPI (with FastAPI CLI)
- **Python**: 3.12+
- **Package Manager**: PDM with uv
- **Database**: PostgreSQL (via Prisma ORM - used by both)
- **Migrations**: Prisma (single source of truth)

### Shared Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Python Build**: uv (via PDM scripts)
- **Database**: Neon PostgreSQL
- **Cache**: Redis (for sessions/cache)
- **Storage**: AWS S3 (for documents)

## Backend Architecture (Python/FastAPI)

### Project Structure (apps/api)
```
apps/api/
├── src/
│   ├── soundgrid_api/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry
│   │   ├── config.py          # Settings management
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── contracts.py   # Contract management
│   │   │   ├── payments.py    # Stripe integration
│   │   │   ├── signatures.py  # Custom e-signature
│   │   │   └── webhooks.py    # Webhook handlers
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── contract_service.py
│   │   │   ├── signature_service.py
│   │   │   └── payment_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── schemas.py     # Pydantic models
│   │   │   └── database.py    # SQLAlchemy models (mirror Prisma)
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── pdf_generator.py
│   │       └── crypto.py
│   └── tests/
├── pyproject.toml             # PDM config
├── pdm.lock
└── README.md
```

### PDM + uv Configuration

pyproject.toml:
```toml
[project]
name = "soundgrid-api"
version = "0.1.0"
description = "SoundGrid API"
requires-python = ">=3.12"
dependencies = [
    "fastapi[standard]>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.9.0",
    "pydantic-settings>=2.6.0",
    "sqlalchemy>=2.0.36",
    "asyncpg>=0.30.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.17",
    "stripe>=11.0.0",
    "boto3>=1.35.0",
    "reportlab>=4.2.0",
    "pypdf>=5.0.0",
    "cryptography>=43.0.0",
    "structlog>=24.4.0",
]

[tool.pdm]
distribution = false

[tool.pdm.scripts]
dev = "uv run fastapi dev src/soundgrid_api/main.py --reload"
start = "uv run fastapi run src/soundgrid_api/main.py"
test = "uv run pytest"
lint = "uv run ruff check ."
format = "uv run ruff format ."
typecheck = "uv run mypy src/"
```

## Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {}
  }
}
```

## Custom E-Signature Solution

Since DocuSign has API costs, we'll build a custom e-signature system:

### Components

1. **PDF Generation** (reportlab/pypdf)
   - Generate contracts from templates
   - Add signature fields
   - Create final PDF with signatures

2. **Signature Capture**
   - Canvas-based signature pad (React)
   - Store signature as SVG/PNG
   - Cryptographic signing with RSA keys

3. **Audit Trail**
   - Timestamp each action
   - Hash document at each stage
   - Store in database with signatures

4. **Legal Validity**
   - ESIGN Act compliance
   - Tamper-evident PDFs
   - Identity verification via Stripe

### Signature Flow

```
1. Contract Created (DRAFT)
   ↓
2. PDF Generated from Template
   ↓
3. Party A Reviews
   ↓
4. Party A Signs (cryptographic + visual)
   ↓
5. Party B Reviews
   ↓
6. Party B Signs (cryptographic + visual)
   ↓
7. Final PDF Generated with Both Signatures
   ↓
8. Stored in S3 (immutable)
   ↓
9. Status: SIGNED
```

### Technical Implementation

**Frontend (React)**:
- SignaturePad component (react-signature-canvas)
- PDF viewer with signature placement
- Real-time collaboration (optional WebSocket)

**Backend (FastAPI)**:
- `/signatures/request` - Request signature
- `/signatures/sign` - Submit signature
- `/signatures/verify` - Verify signature
- PDF manipulation with pypdf/reportlab

**Security**:
- RSA key pairs per user
- Document hashing (SHA-256)
- Signature verification
- Audit logging

## API Communication

### Frontend → Backend
- REST API calls from Next.js Server Actions
- JWT authentication (shared secret)
- Webhook endpoints for async events

### Backend → Frontend
- Server-Sent Events for real-time updates (optional)
- Webhook callbacks

## Database Strategy

### Single Source of Truth
- Prisma schema defines all models
- Python uses SQLAlchemy with models mirroring Prisma
- Migrations run via Prisma

### Connection
- Next.js: Prisma Client
- FastAPI: asyncpg via SQLAlchemy async

## Environment Configuration

### Development
```bash
# Root .env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
STRIPE_SECRET_KEY="..."
JWT_SECRET="..."

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# apps/api/.env
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="..."
JWT_SECRET="..."
AWS_ACCESS_KEY_ID="..."
S3_BUCKET="soundgrid-dev"
```

## Build & Deployment

### Development
```bash
# Start all services
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter api dev

# Python specific
cd apps/api
pdm run dev
```

### Production Build
```bash
# Build all
pnpm build

# Type check all
pnpm typecheck

# Test all
pnpm test
```

## Migration Strategy

### From Current Structure
1. Move `soundgrid-web/` to `apps/web/`
2. Create `apps/api/` with FastAPI
3. Extract shared types to `packages/types/`
4. Set up pnpm workspace
5. Configure Turborepo
6. Update imports and paths

## Cost Optimization

### Free/ Low-Cost Services
- **Hosting**: Vercel (web), Fly.io/Railway (API)
- **Database**: Neon (free tier)
- **Storage**: AWS S3 (pay per use)
- **Auth**: NextAuth.js (free)
- **E-Signature**: Custom built (free)
- **Identity**: Stripe Identity (pay per verification)
- **Payments**: Stripe (transaction fees only)

### Avoided Costs
- DocuSign API → Custom e-signature
- Managed services → Self-hosted where possible

## Development Workflow

1. **Planning Phase**: Document waves and phases
2. **Research Phase**: Validate technical approaches
3. **Architecture Phase**: Finalize structure
4. **Implementation Phase**: Execute per wave
5. **Testing Phase**: Validate functionality
6. **Deployment Phase**: Production release

## Wave Planning Template

Each wave should include:
- Wave objective
- Success criteria
- Technical requirements
- API contracts
- Database changes
- Frontend requirements
- Testing strategy
- Estimated duration

---

## Architecture Notes

### Python Apps in Turborepo

**Requirement**: All apps in the `apps/` directory, including Python apps, MUST have a `package.json` file.

**Reason**: Turborepo discovers packages via `package.json`. Without it, the app won't be included in the workspace.

**Solution**: Create a minimal `package.json` that delegates to Python tooling:

```json
{
  "name": "@soundgrid/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pdm run dev",
    "test": "pdm run test"
  }
}
```

### Turborepo Configuration

**Use "tasks" not "pipeline"**: The `pipeline` key was deprecated in Turborepo 2.0. Use `tasks` instead:

```json
{
  "tasks": {
    "build": { ... },
    "dev": { ... }
  }
}
```

See `TURBOREPO_PYTHON.md` for more details.
