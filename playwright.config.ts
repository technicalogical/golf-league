import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Tests that don't require auth
    {
      name: 'public',
      testIgnore: /.*teams.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests that require auth
    {
      name: 'authenticated',
      testMatch: /.*teams.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Use signed-in state if it exists
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
