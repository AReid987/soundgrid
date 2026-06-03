# SoundGrid API

FastAPI backend for SoundGrid - Commercial OS for Music Professionals.

## Setup

1. Install dependencies:
```bash
pdm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run development server:
```bash
pdm run dev
```

## Scripts

- `pdm run dev` - Start development server with hot reload
- `pdm run start` - Start production server
- `pdm run test` - Run tests
- `pdm run lint` - Run linter
- `pdm run format` - Format code
- `pdm run typecheck` - Run type checker

## API Documentation

When running locally:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
src/soundgrid_api/
├── main.py              # FastAPI application entry
├── config.py            # Settings configuration
├── dependencies.py      # FastAPI dependencies
├── routers/             # API route handlers
├── services/            # Business logic
├── models/              # Database models
└── utils/               # Utility functions
```
