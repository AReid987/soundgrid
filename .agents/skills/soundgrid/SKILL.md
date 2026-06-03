```markdown
# soundgrid Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `soundgrid` TypeScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. By following these guidelines, contributors can ensure consistency and maintainability across the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `audioProcessor.ts`, `soundGridManager.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { AudioProcessor } from './audioProcessor';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function processAudio(data: AudioData): ProcessedAudio { ... }
    export const SOUND_GRID_SIZE = 16;
    ```

### Commit Messages
- Follow the **conventional commit** format.
- Use the `chore` prefix for maintenance or setup tasks.
  - Example: `chore: update dependencies and fix lint warnings`

## Workflows

### Code Contribution
**Trigger:** When adding new features or fixing bugs  
**Command:** `/contribute`

1. Create a new branch from `main`.
2. Write code following the coding conventions.
3. Add or update tests in files matching `*.test.*`.
4. Commit changes using the conventional commit format.
5. Push your branch and open a pull request.

### Dependency Management
**Trigger:** When updating or adding dependencies  
**Command:** `/update-deps`

1. Update dependencies in `package.json`.
2. Run `npm install` or `yarn install`.
3. Commit changes with a message like `chore: update dependencies`.

### Testing
**Trigger:** Before submitting a pull request or merging changes  
**Command:** `/test`

1. Run the test suite using the project's test runner (framework unknown; try `npm test` or `yarn test`).
2. Ensure all tests in files matching `*.test.*` pass.
3. Fix any failing tests before proceeding.

## Testing Patterns

- Test files use the `*.test.*` naming pattern.
  - Example: `audioProcessor.test.ts`
- The testing framework is not specified; check for scripts in `package.json` or ask the maintainers.
- Place test files alongside the modules they test or in a dedicated `tests` directory.

**Example Test File:**
```typescript
import { processAudio } from './audioProcessor';

describe('processAudio', () => {
  it('should process audio data correctly', () => {
    const input = /* mock AudioData */;
    const output = processAudio(input);
    expect(output).toBeDefined();
    // Add more assertions as needed
  });
});
```

## Commands
| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| /contribute    | Start the code contribution workflow      |
| /update-deps   | Update or add project dependencies        |
| /test          | Run the test suite                        |
```