# Architecture Migration Plan

## Overview

Complete migration from single Next.js app to Turborepo monorepo with FastAPI backend.

**Duration**: 6-9 hours  
**Risk Level**: Medium (requires careful coordination)  
**Rollback Strategy**: Git branches, parallel development

---

## Pre-Migration Checklist

### Prerequisites
- [ ] Node.js 20+ installed
- [ ] pnpm 9+ installed (`npm install -g pnpm`)
- [ ] Python 3.12+ installed
- [ ] PDM installed (`pip install pdm`)
- [ ] uv installed (`pip install uv`)
- [ ] Git working directory clean
- [ ] Database backup (if production)

### Verification Commands
```bash
node --version    # >= 20
pnpm --version    # >= 9
python --version  # >= 3.12
pdm --version     # any
uv --version      # any
```

---

## Phase 1: Repository Structure (1-1.5 hours)

### 1.1 Create Root Configuration

**Files to create:**
- `package.json` (root)
- `turbo.json`
- `pnpm-workspace.yaml`
- `.npmrc`

**package.json:**
```json
{
  "name": "soundgrid",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate",
    "db:push": "turbo db:push",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "@soundgrid/prettier-config": "workspace:*",
    "prettier": "^3.4.0",
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^db:generate"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**.npmrc:**
```
auto-install-peers=true
node-linker=hoisted
```

**Verification:**
```bash
pnpm install
pnpm turbo --version
```

### 1.2 Create Directory Structure

```bash
mkdir -p apps
mkdir -p packages/config
mkdir -p packages/types
mkdir -p packages/ui
```

---

## Phase 2: Move Web App (1.5-2 hours)

### 2.1 Move Existing Code

```bash
# Move soundgrid-web to apps/web
mv soundgrid-web apps/web

# Rename in package.json
cd apps/web
```

### 2.2 Update Web App package.json

```json
{
  "name": "@soundgrid/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "start": "next start"
  },
  "dependencies": {
    "@auth/nextjs": "5.0.0-beta.25",
    "@soundgrid/database": "workspace:*",
    "@tanstack/react-query": "^5.6.0",
    "@stripe/stripe-js": "^5.2.0",
    "docusign-esign": "^8.0.0",
    "lucide-react": "^0.460.0",
    "next": "16.1.6",
    "next-auth": "5.0.0-beta.25",
    "next-themes": "^0.4.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "stripe": "^17.4.0",
    "zod": "^4.3.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@soundgrid/typescript-config": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/stripe": "^8.0.417",
    "babel-plugin-react-compiler": "19.0.0-beta-21e868a-20241227",
    "eslint": "^8",
    "eslint-config-next": "16.1.6",
    "typescript": "^5.7.0"
  }
}
```

### 2.3 Update Import Paths

**Current imports:**
```typescript
import { prisma } from "@/lib/db/client"
```

**Change to workspace imports:**
```typescript
import { prisma } from "@soundgrid/database"
```

**Files to update:**
- All server actions
- All API routes
- Components using database

### 2.4 Update tsconfig.json

Add to `apps/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@soundgrid/database": ["../../packages/database/src"],
      "@soundgrid/types": ["../../packages/types/src"],
      "@soundgrid/ui": ["../../packages/ui/src"]
    }
  }
}
```

---

## Phase 3: Create Database Package (1-1.5 hours)

### 3.1 Package Structure

```bash
mkdir -p packages/database/src
mkdir -p packages/database/prisma
```

### 3.2 Move Prisma Schema

```bash
# Move schema
mv apps/web/prisma/schema.prisma packages/database/prisma/
mv apps/web/prisma/migrations packages/database/prisma/

# Remove old prisma
rm -rf apps/web/prisma
```

### 3.3 Database Package package.json

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
    "db:studio": "prisma studio",
    "db:format": "prisma format"
  },
  "dependencies": {
    "@prisma/client": "^7.4.0"
  },
  "devDependencies": {
    "@soundgrid/typescript-config": "workspace:*",
    "prisma": "^7.4.0",
    "typescript": "^5.7.0"
  }
}
```

### 3.4 Create Database Client Export

**packages/database/src/index.ts:**
```typescript
export { PrismaClient } from '@prisma/client'

// Re-export for convenience
export * from '@prisma/client'
```

### 3.5 Create Prisma Configuration

**packages/database/prisma/schema.prisma:**
```prisma
// Update datasource

datasource db {
  provider = "postgresql"
}

// Rest of schema unchanged
```

**packages/database/prisma.config.ts:**
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## Phase 4: Create FastAPI App (2-2.5 hours)

### 4.1 Initialize Python Project

```bash
mkdir -p apps/api/src/soundgrid_api
cd apps/api

# Initialize PDM
pdm init --non-interactive

# Set Python version
pdm use python3.12
```

### 4.2 pyproject.toml

```toml
[project]
name = "soundgrid-api"
version = "0.1.0"
description = "SoundGrid API - FastAPI backend"
readme = "README.md"
requires-python = ">=3.12"
license = {text = "MIT"}
authors = [
    {name = "SoundGrid Team"}
]
keywords = ["fastapi", "api", "music", "contracts"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.12",
]
dependencies = [
    "fastapi[standard]>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.9.0",
    "pydantic-settings>=2.6.0",
    "sqlalchemy>=2.0.36",
    "asyncpg>=0.30.0",
    "alembic>=1.14.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.17",
    "python-dotenv>=1.0.0",
    "stripe>=11.0.0",
    "boto3>=1.35.0",
    "reportlab>=4.2.0",
    "pypdf>=5.0.0",
    "cryptography>=43.0.0",
    "structlog>=24.4.0",
    "httpx>=0.27.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-asyncio>=0.24.0",
    "pytest-cov>=6.0.0",
    "ruff>=0.8.0",
    "mypy>=1.13.0",
    "black>=24.10.0",
    "respx>=0.21.0",
]

[tool.pdm]
distribution = false

[tool.pdm.scripts]
dev = "uv run fastapi dev src/soundgrid_api/main.py --reload --port 8000"
start = "uv run fastapi run src/soundgrid_api/main.py"
test = "uv run pytest"
test-cov = "uv run pytest --cov=src --cov-report=term-missing"
lint = "uv run ruff check ."
lint-fix = "uv run ruff check . --fix"
format = "uv run ruff format ."
typecheck = "uv run mypy src/"
format-check = "uv run ruff format . --check"
all-checks = { composite = ["lint", "format-check", "typecheck"] }

[tool.ruff]
target-version = "py312"
line-length = 100
select = [
    "E",   # pycodestyle errors
    "F",   # Pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "W",   # pycodestyle warnings
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "SIM", # flake8-simplify
]
ignore = ["E501"]  # Line too long (handled by formatter)

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"

[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = false
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --tb=short"
```

### 4.3 Install Dependencies

```bash
cd apps/api
pdm install --group dev
```

### 4.4 Create FastAPI Structure

**apps/api/src/soundgrid_api/__init__.py:**
```python
"""SoundGrid API - FastAPI backend for music industry contracts."""

__version__ = "0.1.0"
```

**apps/api/src/soundgrid_api/main.py:**
```python
"""FastAPI application entry point."""

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from soundgrid_api.config import Settings

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Load settings
settings = Settings()

# Create FastAPI app
app = FastAPI(
    title="SoundGrid API",
    description="Backend API for SoundGrid - Commercial OS for Music Professionals",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "message": "SoundGrid API",
        "docs": "/docs",
        "version": "0.1.0",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "soundgrid_api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
```

**apps/api/src/soundgrid_api/config.py:**
```python
"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://localhost/soundgrid"
    
    # Security
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = "soundgrid-dev"
    S3_REGION: str = "us-east-1"
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@soundgrid.io"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
```

### 4.5 Create Directory Structure

```bash
mkdir -p apps/api/src/soundgrid_api/routers
mkdir -p apps/api/src/soundgrid_api/services
mkdir -p apps/api/src/soundgrid_api/models
mkdir -p apps/api/src/soundgrid_api/utils
mkdir -p apps/api/tests
```

---

## Phase 5: Shared Configuration Packages (1 hour)

### 5.1 TypeScript Config Package

**packages/config/typescript/package.json:**
```json
{
  "name": "@soundgrid/typescript-config",
  "version": "0.1.0",
  "private": true,
  "main": "index.js",
  "files": ["*.json"]
}
```

**packages/config/typescript/base.json:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src", "."],
  "exclude": ["node_modules"]
}
```

### 5.2 ESLint Config Package

**packages/config/eslint/package.json:**
```json
{
  "name": "@soundgrid/eslint-config",
  "version": "0.1.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "eslint-config-next": "^16.0.0"
  }
}
```

### 5.3 Prettier Config Package

**packages/config/prettier/package.json:**
```json
{
  "name": "@soundgrid/prettier-config",
  "version": "0.1.0",
  "private": true,
  "main": "index.js"
}
```

**packages/config/prettier/index.js:**
```javascript
module.exports = {
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
  arrowParens: "always",
  endOfLine: "lf",
}
```

---

## Phase 6: Environment Configuration (30 mins)

### 6.1 Root .env.example

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soundgrid"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"
```

### 6.2 apps/web/.env.local.example

```bash
# Next.js
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long"

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 6.3 apps/api/.env.example

```bash
# App
DEBUG=true
ENVIRONMENT=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soundgrid"

# Security
JWT_SECRET="your-secret-key-min-32-chars-long"

# CORS
CORS_ORIGINS='["http://localhost:3000"]'

# AWS
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET="soundgrid-dev"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY=""
```

---

## Phase 7: Verification & Testing (30-45 mins)

### 7.1 Install All Dependencies

```bash
# From root
pnpm install

# Verify Python deps
cd apps/api && pdm install
```

### 7.2 Test Build Pipeline

```bash
# Generate Prisma client
pnpm db:generate

# Build all packages
pnpm build

# Type check
pnpm typecheck
```

### 7.3 Test Dev Servers

```bash
# Terminal 1 - Start all
cd /Users/antonioreid/CODE/00_PROJECTS/00_APPS/soundgrid
pnpm dev

# Or separately:
# Terminal 1 - Web
pnpm --filter @soundgrid/web dev

# Terminal 2 - API
cd apps/api && pdm run dev
```

### 7.4 Verify Endpoints

```bash
# Test API health
curl http://localhost:8000/health

# Test web app
curl http://localhost:3000
```

---

## Post-Migration Tasks

### Update Documentation
- [ ] Update README.md with new structure
- [ ] Document development workflow
- [ ] Update deployment guides

### Clean Up
- [ ] Remove old node_modules
- [ ] Remove old package-lock.json
- [ ] Verify .gitignore includes all build artifacts

### CI/CD Updates
- [ ] Update GitHub Actions for Turborepo
- [ ] Update build scripts
- [ ] Update deployment workflows

---

## Rollback Plan

If migration fails:

1. **Preserve Git History**
   ```bash
   git checkout -b backup/pre-migration
   git add .
   git commit -m "Backup before migration"
   ```

2. **Quick Rollback**
   ```bash
   git checkout main
   git reset --hard HEAD~1  # If needed
   ```

3. **Database**
   - Schema unchanged (still using same Prisma schema)
   - Migrations remain compatible

---

## Success Criteria

- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts both web and API
- [ ] `pnpm build` completes successfully
- [ ] `pnpm typecheck` passes
- [ ] API responds at http://localhost:8000
- [ ] Web app responds at http://localhost:3000
- [ ] Database connections work from both apps
- [ ] All existing functionality preserved

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1: Repository Structure | 1-1.5 hrs | 1-1.5 hrs |
| 2: Move Web App | 1.5-2 hrs | 2.5-3.5 hrs |
| 3: Database Package | 1-1.5 hrs | 3.5-5 hrs |
| 4: FastAPI App | 2-2.5 hrs | 5.5-7.5 hrs |
| 5: Shared Configs | 1 hr | 6.5-8.5 hrs |
| 6: Environment Config | 30 min | 7-9 hrs |
| 7: Verification | 30-45 min | 7.5-9.75 hrs |

**Total: 7.5 - 9.75 hours**
