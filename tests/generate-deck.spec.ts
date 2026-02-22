import { test, expect } from '@playwright/test';

test.describe('Deck generation flow', () => {
  test('successful generation shows result card', async ({ page }) => {
    // Mock the API to return a successful response
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deckId: 'test-deck-123',
          url: 'http://localhost:3000/d/test-deck-123',
          title: 'AI in Healthcare',
          slideCount: 8,
          theme: 'modern',
        }),
      });
    });

    await page.goto('/');

    const textarea = page.locator('textarea');
    await textarea.fill('AI in healthcare trends');
    await page.locator('button[type="submit"]').click();

    // Result card should appear
    await expect(page.getByText('Your deck is ready!')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('AI in Healthcare', { exact: true })).toBeVisible();
    await expect(page.getByText('8 slides')).toBeVisible();

    // "Open Deck" link should point to the deck
    const openLink = page.getByRole('link', { name: /Open Deck/ });
    await expect(openLink).toBeVisible();
    await expect(openLink).toHaveAttribute('href', 'http://localhost:3000/d/test-deck-123');
  });

  test('shows loading state while generating', async ({ page }) => {
    // Delay the API response to observe loading state
    await page.route('/api/generate-deck', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deckId: 'test-123',
          url: 'http://localhost:3000/d/test-123',
          title: 'Test',
          slideCount: 5,
          theme: 'modern',
        }),
      });
    });

    await page.goto('/');
    await page.locator('textarea').fill('A sample deck topic');
    await page.locator('button[type="submit"]').click();

    // Loading indicator should be visible
    await expect(page.getByText('Building your deck...')).toBeVisible();

    // Submit button should show loading icon and textarea should be disabled
    const textarea = page.locator('textarea');
    await expect(textarea).toBeDisabled();

    // Example prompts should be hidden during loading
    await expect(page.getByText('Try one of these:')).not.toBeVisible();
  });

  test('hides example prompts after successful generation', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deckId: 'test-456',
          url: 'http://localhost:3000/d/test-456',
          title: 'Remote Work',
          slideCount: 6,
          theme: 'minimal',
        }),
      });
    });

    await page.goto('/');
    await expect(page.getByText('Try one of these:')).toBeVisible();

    await page.locator('textarea').fill('Remote work challenges');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Your deck is ready!')).toBeVisible({ timeout: 10_000 });
    // Example prompts should stay hidden after result is shown
    await expect(page.getByText('Try one of these:')).not.toBeVisible();
  });

  test('Enter key submits form', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          deckId: 'enter-test',
          url: 'http://localhost:3000/d/enter-test',
          title: 'Enter Key Test',
          slideCount: 4,
          theme: 'modern',
        }),
      });
    });

    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('Testing enter key submission');
    await textarea.press('Enter');

    await expect(page.getByText('Your deck is ready!')).toBeVisible({ timeout: 10_000 });
  });

  test('Shift+Enter does NOT submit form (allows newlines)', async ({ page }) => {
    let apiCalled = false;
    await page.route('/api/generate-deck', (route) => {
      apiCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('First line');
    await textarea.press('Shift+Enter');

    // Wait a bit to make sure it didn't fire
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });
});
