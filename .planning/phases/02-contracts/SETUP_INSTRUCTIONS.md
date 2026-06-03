# Phase 2 Setup Instructions

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.12+
- PDM (`pip install pdm`)
- uv (`pip install uv`)

## Migration Steps

### Step 1: Initialize Turborepo

```bash
# Install dependencies
pnpm install

# Verify turbo works
pnpm turbo --version
```

### Step 2: Move Web App

```bash
# Create structure
mkdir -p apps
mv soundgrid-web apps/web

# Update web app package.json
# (Remove Prisma dependency - will be managed at root)
```

### Step 3: Create FastAPI App

```bash
# Create API directory
mkdir -p apps/api/src/soundgrid_api

# Initialize PDM
cd apps/api
pdm init

# Add dependencies
pdm add fastapi[standard] uvicorn[standard] pydantic pydantic-settings
pdm add sqlalchemy asyncpg
pdm add python-jose[cryptography] passlib[bcrypt]
```

### Step 4: Configure pnpm Workspace

```bash
# Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF
```

### Step 5: Configure Turbo

```bash
# turbo.json already created
# Verify with:
pnpm turbo run build --dry
```

### Step 6: Database at Root

```bash
# Move Prisma to root
mkdir -p packages/database/prisma
mv apps/web/prisma/schema.prisma packages/database/prisma/

# Create database package
# (see packages/database/package.json below)
```

## Package Structure

### Root package.json
```json
{
  "name": "soundgrid",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:push": "turbo db:push"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  }
}
```

### apps/web/package.json
```json
{
  "name": "@soundgrid/web",
  "version": "0.1.0",
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@soundgrid/database": "workspace:*",
    "next": "^16.0.0",
    "react": "^19.0.0"
  }
}
```

### apps/api/pyproject.toml
```toml
[project]
name = "soundgrid-api"
version = "0.1.0"
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

[tool.pdm.scripts]
dev = "uv run fastapi dev src/soundgrid_api/main.py --reload --port 8000"
start = "uv run fastapi run src/soundgrid_api/main.py"
test = "uv run pytest"
lint = "uv run ruff check ."
format = "uv run ruff format ."
typecheck = "uv run mypy src/"
```

### packages/database/package.json
```json
{
  "name": "@soundgrid/database",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^7.4.0"
  },
  "devDependencies": {
    "prisma": "^7.4.0",
    "typescript": "^5.7.0"
  }
}
```

## Development Workflow

### Start all services
```bash
# From root
pnpm dev

# This starts:
# - Next.js on :3000
# - FastAPI on :8000
```

### Start specific app
```bash
# Web only
pnpm --filter @soundgrid/web dev

# API only
cd apps/api && pdm run dev
```

### Database operations
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema changes
pnpm db:push
```

## Environment Variables

### Root .env
```
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
```

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

### apps/api/.env
```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
STRIPE_SECRET_KEY="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET="soundgrid-dev"
```

## Next Steps

After setup is complete:

1. **Wave 2**: Implement custom e-signature system
   - RSA key generation
   - PDF signing service
   - Signature capture UI
   - Audit trail

2. **Wave 3**: Contract versioning
   - Version history
   - Diff viewer
   - Rollback functionality

3. **Wave 4**: DAW integration
   - Webhook endpoints
   - Session tracking
   - Auto-draft generation

4. **Wave 5**: Polish
   - Email notifications
   - Performance optimization
   - E2E testing
