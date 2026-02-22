import { test, expect } from '@playwright/test';

test.describe('Error states', () => {
  test('shows error when API returns 500', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to generate deck. Please try again.' }),
      });
    });

    await page.goto('/');
    await page.locator('textarea').fill('A failing prompt that triggers a server error');
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText('Failed to generate deck. Please try again.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows error when API returns 429 (rate limit)', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Usage limit reached' }),
      });
    });

    await page.goto('/');
    await page.locator('textarea').fill('Trigger rate limit');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Usage limit reached')).toBeVisible({ timeout: 10_000 });
  });

  test('shows error when API returns 503 (not configured)', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service not configured. Please try again later.' }),
      });
    });

    await page.goto('/');
    await page.locator('textarea').fill('Trigger service unavailable');
    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText('Service not configured. Please try again later.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows error when network fails', async ({ page }) => {
    await page.route('/api/generate-deck', (route) => {
      route.abort('connectionrefused');
    });

    await page.goto('/');
    await page.locator('textarea').fill('Network failure test');
    await page.locator('button[type="submit"]').click();

    // The catch block should produce "Something went wrong" or fetch error
    await expect(page.locator('.bg-red-950')).toBeVisible({ timeout: 10_000 });
  });

  test('does not submit with empty prompt', async ({ page }) => {
    let apiCalled = false;
    await page.route('/api/generate-deck', (route) => {
      apiCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');

    // Button should be disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Force click should not trigger API
    await submitButton.click({ force: true });
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test('does not submit with whitespace-only prompt', async ({ page }) => {
    let apiCalled = false;
    await page.route('/api/generate-deck', (route) => {
      apiCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');
    await page.locator('textarea').fill('   ');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    await submitButton.click({ force: true });
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test('error clears when new generation starts', async ({ page }) => {
    let callCount = 0;
    await page.route('/api/generate-deck', (route) => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'First attempt failed' }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            deckId: 'retry-123',
            url: 'http://localhost:3000/d/retry-123',
            title: 'Retry Success',
            slideCount: 5,
            theme: 'modern',
          }),
        });
      }
    });

    await page.goto('/');

    // First attempt - should fail
    await page.locator('textarea').fill('First attempt');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('First attempt failed')).toBeVisible({ timeout: 10_000 });

    // Second attempt - error should clear, then succeed
    await page.locator('textarea').fill('Second attempt succeeds');
    await page.locator('button[type="submit"]').click();

    // Error should disappear
    await expect(page.getByText('First attempt failed')).not.toBeVisible({ timeout: 5_000 });
    // Success should appear
    await expect(page.getByText('Your deck is ready!')).toBeVisible({ timeout: 10_000 });
  });
});
