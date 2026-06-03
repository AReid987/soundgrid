# Technology Stack Research

## Date: 2026-02-26
## Researcher: Architecture Team
## Status: COMPLETE

---

## 1. Monorepo Tools Research

### Turborepo vs Nx vs Rush

| Criteria | Turborepo | Nx | Rush |
|----------|-----------|-----|------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Build Caching** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Remote Caching** | ✅ Free Vercel | ✅ Paid | ✅ Paid |
| **TypeScript** | Native | Native | Good |
| **Python Support** | Via scripts | Via plugins | Via scripts |
| **Community** | Growing fast | Large | Microsoft |
| **Documentation** | Excellent | Good | Good |

**Decision: Turborepo**
- Best in class build caching
- Free remote caching on Vercel
- Simple configuration
- Great for mixed TS/Python projects

---

## 2. Package Manager Research

### pnpm vs npm vs yarn

| Criteria | pnpm | npm | yarn |
|----------|------|-----|------|
| **Disk Space** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Monorepo** | Native workspaces | Native | Workspaces |
| **Lockfile** | Fast, reliable | Good | Good |
| **Content-Addressable** | ✅ Yes | ❌ No | ❌ No |

**Decision: pnpm**
- Content-addressable storage (saves disk)
- Fastest installation
- Native workspace support
- Recommended by Turborepo

---

## 3. Python Framework Research

### FastAPI vs Django vs Flask

| Criteria | FastAPI | Django | Flask |
|----------|---------|--------|-------|
| **Async Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Type Safety** | ⭐⭐⭐⭐⭐ (Pydantic) | ⭐⭐ | ⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | Moderate | Steep | Low |
| **Auto-generated API Docs** | ✅ Yes | ❌ No | ❌ No |

**Decision: FastAPI**
- Native async/await for high performance
- Pydantic for type safety
- Automatic OpenAPI docs
- Perfect for microservices/APIs
- Best for our PDF/crypto operations

---

## 4. Python Package Management

### PDM + uv vs Poetry vs pip + venv

| Criteria | PDM + uv | Poetry | pip + venv |
|----------|----------|--------|------------|
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **PEP 582** | ✅ Yes | ❌ No | ❌ No |
| **Lockfile** | ✅ Yes | ✅ Yes | ❌ No |
| **Build Backend** | Modern | Modern | Legacy |
| **Virtualenv** | Optional | Required | Required |

**Decision: PDM + uv**
- `uv` is 10-100x faster than pip
- PDM follows PEP standards
- No virtualenv needed (can use)
- Modern pyproject.toml

**uv Benefits:**
- Written in Rust
- Parallel package installation
- Aggressive caching
- Drop-in pip replacement

---

## 5. Database & ORM

### Prisma vs SQLAlchemy vs Django ORM

**Frontend (Next.js):**
- **Prisma** - Already implemented, excellent TypeScript support

**Backend (FastAPI):**
- **SQLAlchemy 2.0** with async support
- Mirrors Prisma schema
- Asyncpg for PostgreSQL

**Decision:**
- Keep Prisma as schema source of truth
- SQLAlchemy models mirror Prisma
- Single migration path via Prisma

---

## 6. E-Signature Technical Research

### Options Analysis

| Option | Cost | Control | Complexity | Legal Validity |
|--------|------|---------|------------|----------------|
| **DocuSign** | $$$$ | Low | Low | ✅ Yes |
| **HelloSign** | $$$ | Low | Low | ✅ Yes |
| **Custom (Our Choice)** | Free | High | Medium | ✅ Yes* |

*Legal validity requires proper implementation

### Custom E-Signature Components

**Cryptographic Signing:**
- Algorithm: RSA-2048 or RSA-4096
- Hash: SHA-256
- Library: `cryptography` (Python)

**PDF Generation:**
- Library: `reportlab` (Python)
- Features: Templates, fields, signatures
- Alternative: `pypdf` for manipulation

**Signature Capture:**
- Frontend: `react-signature-canvas`
- Format: SVG or PNG
- Storage: S3

**Audit Trail:**
- PostgreSQL table
- Fields: timestamp, IP, user agent, action, hash

### Legal Requirements (ESIGN Act)

1. **Intent to Sign** - Clear UI indicating signature
2. **Consent** - User agrees to electronic signing
3. **Association** - Signature linked to document
4. **Retention** - Document stored and accessible
5. **Accuracy** - Tamper-evident (hashing)

**Implementation:**
- ✅ Show document before signing
- ✅ Record IP and timestamp
- ✅ Hash document at each stage
- ✅ Store in immutable storage (S3 with versioning)
- ✅ Provide download after signing

---

## 7. File Storage

### AWS S3 vs Cloudflare R2 vs MinIO

| Criteria | AWS S3 | Cloudflare R2 | MinIO |
|----------|--------|---------------|-------|
| **Cost** | Pay per use | $0 egress | Self-hosted |
| **Setup** | Easy | Easy | Complex |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Depends |
| **Free Tier** | 5GB | 10GB | Unlimited |

**Decision: AWS S3**
- Industry standard
- Excellent SDK support
- Free tier sufficient for MVP
- Object Lock for immutability

---

## 8. Development Tools

### Linting & Formatting

**TypeScript/JavaScript:**
- ESLint (already configured)
- Prettier (already configured)

**Python:**
- Ruff (linting + formatting)
- MyPy (type checking)
- Both via PDM scripts

### Testing

**Frontend:**
- Vitest (unit)
- Playwright (E2E)

**Backend:**
- pytest (async support)
- pytest-asyncio
- HTTPX (async HTTP client)

---

## 9. Deployment Targets

### Frontend (Next.js)
- **Primary**: Vercel (free tier)
- **Alternative**: Netlify, Railway

### Backend (FastAPI)
- **Primary**: Railway (free tier)
- **Alternative**: Fly.io, Render
- **Docker**: Single container deployment

### Database
- **Neon** (serverless PostgreSQL, free tier)

---

## 10. Final Stack Decision

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7+
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS 4.0
- **UI**: shadcn/ui
- **State**: Zustand
- **Auth**: NextAuth.js v5

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12+
- **Package Manager**: PDM + uv
- **Server**: Uvicorn (async)
- **Database**: SQLAlchemy 2.0 + asyncpg

### Infrastructure
- **Monorepo**: Turborepo
- **Database**: Neon PostgreSQL
- **Cache**: Redis (Upstash)
- **Storage**: AWS S3
- **Email**: Resend (free tier)

### Development
- **Lint**: ESLint + Ruff
- **Format**: Prettier + Ruff
- **Test**: Vitest + pytest
- **Type Check**: TypeScript + MyPy

---

## Research Sources

1. **Turborepo Docs** - https://turbo.build
2. **FastAPI Docs** - https://fastapi.tiangolo.com
3. **PDM Docs** - https://pdm.fming.dev
4. **uv Docs** - https://github.com/astral-sh/uv
5. **ESIGN Act** - https://www.govinfo.gov/content/pkg/PLAW-106publ229/html/PLAW-106publ229.htm
6. **AWS S3 Pricing** - https://aws.amazon.com/s3/pricing/

---

## Risks Identified

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Custom e-signature legal challenges | Low | High | Follow ESIGN Act, document thoroughly |
| Python/TypeScript integration complexity | Medium | Medium | Clear API contracts, shared types |
| Migration downtime | Low | Medium | Parallel development, feature flags |
| uv/PDM stability | Low | Low | Fallback to poetry if needed |

---

## Research Conclusion

The proposed architecture (Turborepo + FastAPI + PDM/uv) is:
- ✅ Technically sound
- ✅ Cost-effective
- ✅ Scalable
- ✅ Modern and maintainable
- ✅ Well-documented ecosystem

Ready for implementation planning phase.
