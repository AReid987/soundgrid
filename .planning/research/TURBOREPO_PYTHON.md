# Turborepo with Python Apps - Research

**Date**: 2026-02-26  
**Topic**: Using Python applications in a Turborepo monorepo

---

## Key Findings

### 1. Python Apps REQUIRE package.json

Per Turborepo documentation:
> "In the directory of the package, there must be a `package.json` to make the package discoverable to your package manager and `turbo`."

**Implication**: Even Python-only apps in `apps/` need a `package.json` so that:
- Turborepo can discover them in the workspace
- They can participate in the task pipeline
- They can be referenced by other packages

**Solution**: Create a minimal `package.json` that delegates to Python scripts:
```json
{
  "name": "@soundgrid/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pdm run dev",
    "test": "pdm run test",
    "lint": "pdm run lint"
  }
}
```

### 2. "pipeline" is Deprecated

**Old (Turborepo < 2.0)**:
```json
{
  "pipeline": {
    "build": { ... }
  }
}
```

**New (Turborepo 2.0+)**:
```json
{
  "tasks": {
    "build": { ... }
  }
}
```

**Migration**: Simply rename `pipeline` to `tasks` in `turbo.json`.

### 3. Python Package Structure in Turborepo

Recommended structure:
```
apps/
└── api/
    ├── package.json          # Required for Turborepo
    ├── pyproject.toml        # Python dependencies (PDM/poetry)
    ├── pdm.lock              # Python lockfile
    ├── src/                  # Python source
    │   └── soundgrid_api/
    │       ├── __init__.py
    │       └── main.py
    └── tests/                # Python tests
```

### 4. Task Orchestration

Turborepo can now run Python tasks alongside JavaScript tasks:

**turbo.json**:
```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

**Usage**:
```bash
# Runs dev in all apps (both Next.js and FastAPI)
pnpm turbo run dev

# Runs test in all packages
pnpm turbo run test
```

### 5. Dependency Management

- **JavaScript/TypeScript**: pnpm via `package.json`
- **Python**: PDM/poetry via `pyproject.toml`
- **Cross-language**: Use `dependsOn` in turbo.json

### 6. Caching Considerations

Python apps can use Turborepo caching:
```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tests/**"],
      "outputs": [".coverage/**"]
    }
  }
}
```

But note: Python virtual environments (`.venv/`) should be excluded from caching.

---

## Implementation Guidelines

### For Python Apps in Turborepo:

1. **Always create `package.json`**
   - Use it to expose Python scripts to Turborepo
   - Mark as `"private": true`

2. **Use `tasks` not `pipeline`**
   - Update to Turborepo 2.0+ syntax

3. **Keep Python tooling separate**
   - Use `pdm run`, `poetry run`, or `make` in package.json scripts
   - Don't try to mix npm packages with Python

4. **Document the architecture**
   - Add README explaining the dual package.json + pyproject.toml setup
   - Explain why both are needed

---

## References

- Turborepo Configuration: https://turbo.build/repo/docs/reference/configuration
- Structuring a Repository: https://turbo.build/repo/docs/crafting-your-repository/structuring-a-repository
- Running Tasks: https://turbo.build/repo/docs/crafting-your-repository/running-tasks
