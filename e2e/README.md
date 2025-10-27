# E2E Testing with Playwright

## Authentication Setup

Most pages in this application require Auth0 authentication. To run E2E tests:

### Option 1: Manual Login (Quick Test)
1. Start the dev server: `npm run dev`
2. Log in manually at `http://localhost:4000`
3. Run tests in headed mode: `npm run test:e2e:headed`

### Option 2: Auth State Storage (Recommended for CI)
1. Create an auth setup script that logs in and stores the session
2. Reuse the stored auth state in tests

Example setup script (`e2e/auth.setup.ts`):
```typescript
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:4000');
  // Perform login steps
  await page.getByRole('button', { name: 'Log In' }).click();
  // Fill Auth0 form...
  // Wait for redirect
  await page.waitForURL('http://localhost:4000/dashboard');
  await page.context().storageState({ path: authFile });
});
```

Then use in tests:
```typescript
test.use({ storageState: authFile });
```

### Option 3: Mock Auth (Development)
Mock the Auth0 session cookie for testing without actual authentication.

## Current Tests

### `teams-dark-mode.spec.ts`
Tests dark mode styling on the teams page. **Currently skipped** due to auth requirements.

To enable:
1. Set up authentication using one of the options above
2. Remove the `test.skip()` call in the beforeEach hook
3. Run tests

## Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed
```
