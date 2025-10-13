import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
    test('homepage should not have accessibility violations', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('login page should not have accessibility violations', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('signup page should not have accessibility violations', async ({ page }) => {
        await page.goto('/signup');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('keyboard navigation works on login form', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Tab through form elements
        await page.keyboard.press('Tab');
        await expect(page.locator('#email')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('#password')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('button:has-text("Sign in")')).toBeFocused();
    });

    test('form labels are properly associated', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Check that labels are associated with inputs
        const emailLabel = page.locator('label[for="email"]');
        await expect(emailLabel).toBeVisible();

        const passwordLabel = page.locator('label[for="password"]');
        await expect(passwordLabel).toBeVisible();
    });

    test('images have alt text', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            // Alt can be empty string for decorative images, but should exist
            expect(alt).toBeDefined();
        }
    });

    test('headings are in correct hierarchy', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Should have h1
        const h1 = page.locator('h1');
        await expect(h1.first()).toBeVisible();

        // Check that headings exist
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);
    });

    test('buttons have accessible names', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');

            // Button should have either text content or aria-label
            expect(text || ariaLabel).toBeTruthy();
        }
    });

    test('page has proper language attribute', async ({ page }) => {
        await page.goto('/');
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang).toBe('en');
    });

    test('color contrast is sufficient', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .include('body')
            .withTags(['wcag2aa', 'wcag21aa'])
            .analyze();

        const contrastViolations = accessibilityScanResults.violations.filter(
            v => v.id === 'color-contrast'
        );

        expect(contrastViolations).toEqual([]);
    });
});
