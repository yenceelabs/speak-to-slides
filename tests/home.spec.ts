import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders brand and headline', async ({ page }) => {
    await expect(page.getByText('SpeakToSlides', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Speak.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Slide.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Share.');
  });

  test('renders subtitle', async ({ page }) => {
    await expect(
      page.getByText('Describe your presentation in text or voice')
    ).toBeVisible();
  });

  test('renders textarea with placeholder', async ({ page }) => {
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute(
      'placeholder',
      /Describe your presentation/
    );
  });

  test('submit button is disabled when textarea is empty', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('submit button enables when text is entered', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('AI in healthcare trends 2024');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test('renders example prompt buttons', async ({ page }) => {
    const examples = [
      'Why AI is transforming healthcare in 2024',
      'Startup pitch deck for a food delivery app',
      'The future of remote work and its challenges',
      '10 reasons to invest in renewable energy',
    ];

    for (const example of examples) {
      await expect(page.getByRole('button', { name: example })).toBeVisible();
    }
  });

  test('clicking example prompt fills textarea', async ({ page }) => {
    const exampleText = 'Why AI is transforming healthcare in 2024';
    await page.getByRole('button', { name: exampleText }).click();
    const textarea = page.locator('textarea');
    await expect(textarea).toHaveValue(exampleText);
  });

  test('renders features section', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Everything you need to present' })
    ).toBeVisible();
    await expect(page.getByText('Instant generation')).toBeVisible();
    await expect(page.getByText('Conversational builder')).toBeVisible();
    await expect(page.getByText('3 beautiful themes')).toBeVisible();
    await expect(page.getByText('Surgical editing')).toBeVisible();
  });

  test('renders footer with Yencee Labs link', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Yencee Labs');
    const link = footer.getByRole('link', { name: 'Yencee Labs' });
    await expect(link).toHaveAttribute('href', 'https://yenceelabs.com');
  });

  test('mic button is visible', async ({ page }) => {
    const micButton = page.getByTitle('Start voice input');
    await expect(micButton).toBeVisible();
  });
});
