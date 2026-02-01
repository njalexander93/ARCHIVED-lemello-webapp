# Webapp Testing

## Test Layers

- **Unit tests**: Isolated component logic and rendering checks.
- **Integration tests**: Page-level and multi-component behavior.
- **E2E tests**: Full browser flow in Playwright.

## Commands

```bash
# Lint and typecheck
npm run lint
npm run typecheck

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Unit + integration (CI)
npm run test:ci

# E2E tests
npm run test:e2e
npm run test:e2e:ci
```
