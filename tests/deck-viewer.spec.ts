import { test, expect } from '@playwright/test';

test.describe('Deck viewer page', () => {
  test('shows 404 for non-existent deck', async ({ page }) => {
    const response = await page.goto('/d/non-existent-deck-id-xyz');
    // Next.js notFound() returns 404
    expect(response?.status()).toBe(404);
  });

  test('deck frame route returns 404 for non-existent deck', async ({ page }) => {
    const response = await page.goto('/d/non-existent-deck-id-xyz/frame');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Deck generation -> viewer navigation', () => {
  test('generated deck link navigates to viewer', async ({ page }) => {
    // Mock the generate API
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deckId: 'nav-test-deck',
          url: 'http://localhost:3000/d/nav-test-deck',
          title: 'Navigation Test Deck',
          slideCount: 5,
          theme: 'modern',
        }),
      });
    });

    await page.goto('/');
    await page.locator('textarea').fill('Navigation test deck prompt');
    await page.locator('button[type="submit"]').click();

    // Wait for result
    await expect(page.getByText('Your deck is ready!')).toBeVisible({ timeout: 10_000 });

    // The "Open Deck" link should have the correct URL
    const openLink = page.getByRole('link', { name: /Open Deck/ });
    await expect(openLink).toHaveAttribute('href', 'http://localhost:3000/d/nav-test-deck');
    await expect(openLink).toHaveAttribute('target', '_blank');

    // The URL should also be displayed
    await expect(
      page.getByText('http://localhost:3000/d/nav-test-deck')
    ).toBeVisible();
  });
});
