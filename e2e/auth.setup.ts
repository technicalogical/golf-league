import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Only run if we have credentials
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.log('Skipping auth setup - TEST_USER_EMAIL and TEST_USER_PASSWORD not set');
    return;
  }

  console.log('Setting up authentication...');

  // Navigate to the app
  await page.goto('http://localhost:4000');

  // Click login button (adjust selector as needed)
  await page.waitForLoadState('networkidle');

  // If already logged in, we're done
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/teams')) {
    console.log('Already authenticated');
    await page.context().storageState({ path: authFile });
    return;
  }

  // Look for login button/link
  const loginButton = page.getByRole('link', { name: /log in|sign in/i }).first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }

  // Wait for Auth0 login page
  await page.waitForURL(/auth0\.com/, { timeout: 10000 });

  // Fill in Auth0 login form
  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Click submit
  await page.getByRole('button', { name: /continue|log in|sign in/i }).click();

  // Wait for redirect back to app
  await page.waitForURL(/localhost:4000/, { timeout: 15000 });

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');

  // Verify we're logged in by checking for user-specific content
  await expect(page.url()).not.toContain('auth0.com');

  console.log('Authentication successful!');

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
