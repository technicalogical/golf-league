import { test, expect } from '@playwright/test';

test.describe('Teams Page - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Note: You'll need to handle authentication before running these tests
    // For now, assuming user is authenticated
    await page.goto('/teams');
  });

  test('should display teams page in light mode correctly', async ({ page }) => {
    // Ensure light mode is active
    await page.emulateMedia({ colorScheme: 'light' });

    // Check header background is white
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Check main title is dark in light mode
    const title = page.getByRole('heading', { name: 'Team Management' });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('color', 'rgb(17, 24, 39)'); // gray-900
  });

  test('should display teams page in dark mode correctly', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });

    // Check header background is dark
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(31, 41, 55)'); // gray-800

    // Check main title is white in dark mode
    const title = page.getByRole('heading', { name: 'Team Management' });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('color', 'rgb(255, 255, 255)'); // white

    // Check background is dark
    const body = page.locator('div.min-h-screen').first();
    await expect(body).toHaveCSS('background-color', 'rgb(17, 24, 39)'); // gray-900
  });

  test('should display empty state correctly in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // If empty state is visible
    const emptyStateHeading = page.getByRole('heading', { name: 'No Teams Yet' });

    if (await emptyStateHeading.isVisible()) {
      // Check heading is white
      await expect(emptyStateHeading).toHaveCSS('color', 'rgb(255, 255, 255)');

      // Check description text is gray-300
      const description = page.getByText('Get started by creating your first team.');
      await expect(description).toHaveCSS('color', 'rgb(209, 213, 219)'); // gray-300
    }
  });

  test('should display team cards correctly in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Find team cards (if any exist)
    const teamCards = page.locator('a[href^="/teams/"]').filter({ hasText: 'View Details' });
    const count = await teamCards.count();

    if (count > 0) {
      const firstCard = teamCards.first();

      // Check card background is gray-800
      await expect(firstCard).toHaveCSS('background-color', 'rgb(31, 41, 55)');

      // Check team name heading is white
      const teamName = firstCard.locator('h3').first();
      await expect(teamName).toHaveCSS('color', 'rgb(255, 255, 255)');

      // Check info text is gray-300
      const infoText = firstCard.locator('div.space-y-2');
      await expect(infoText).toHaveCSS('color', 'rgb(209, 213, 219)');
    }
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    const title = page.getByRole('heading', { name: 'Team Management' });

    // Start with light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(title).toHaveCSS('color', 'rgb(17, 24, 39)'); // gray-900

    // Switch to dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(title).toHaveCSS('color', 'rgb(255, 255, 255)'); // white

    // Switch back to light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(title).toHaveCSS('color', 'rgb(17, 24, 39)'); // gray-900
  });
});
