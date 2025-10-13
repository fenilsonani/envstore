import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Authentication Flow', () => {
    const testEmail = `e2e${Date.now()}@example.com`;
    const testPassword = 'E2ETestPassword123!';

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display homepage with login/signup options', async ({ page }) => {
        await expect(page).toHaveTitle(/EnvStore/);
        // Check for either "Get started" or signup link
        const getStartedLink = page.locator('a[href="/signup"]').first();
        await expect(getStartedLink).toBeVisible();
    });

    test('complete signup flow', async ({ page }) => {
        // Navigate to signup
        await page.goto('/signup');
        await expect(page).toHaveURL('/signup');

        // Wait for client-side hydration
        await page.waitForLoadState('networkidle');

        // Fill signup form using IDs
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);

        // Submit form using text content - wait for navigation
        await Promise.all([
            page.waitForNavigation({ url: /\/dashboard/, timeout: 15000 }),
            page.click('button:has-text("Create account")')
        ]);

        // Verify we're on dashboard
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('complete login flow', async ({ page }) => {
        // Navigate to login
        await page.goto('/login');

        // Wait for client-side hydration
        await page.waitForLoadState('networkidle');

        // Fill login form using IDs
        await page.fill('#email', testEmail);
        await page.fill('#password', testPassword);

        // Submit form using text content - wait for navigation
        await Promise.all([
            page.waitForNavigation({ url: /\/dashboard/, timeout: 15000 }),
            page.click('button:has-text("Sign in")')
        ]);

        // Verify we're on dashboard
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle invalid login', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'WrongPassword123');

        await page.click('button:has-text("Sign in")');

        // Should show error
        await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });

        // Should stay on login page
        await expect(page).toHaveURL('/login');
    });

    test('should protect dashboard routes', async ({ page }) => {
        // Try to access dashboard without auth
        await page.goto('/dashboard');
        
        // Should redirect to login
        await expect(page).toHaveURL('/login');
    });

    test('logout flow', async ({ page }) => {
        // This test relies on the user created in earlier tests
        // Ensure we're logged in first
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Check if already logged in by checking current URL after navigation attempt
        const currentUrl = page.url();
        if (!currentUrl.includes('/dashboard')) {
            // Not logged in, need to login
            await page.fill('#email', testEmail);
            await page.fill('#password', testPassword);

            await Promise.all([
                page.waitForNavigation({ url: /\/dashboard/, timeout: 15000 }),
                page.click('button:has-text("Sign in")')
            ]);
        }

        // Now we're on dashboard, find and click logout
        await page.click('text=Logout');

        // Should redirect to logout page, login, or homepage
        await expect(page).toHaveURL(/\/(logout|login)?$/, { timeout: 10000 });

        // Try to access dashboard again (should redirect to login)
        await page.goto('/dashboard');
        await expect(page).toHaveURL('/login');
    });

    test('password requirements validation', async ({ page }) => {
        await page.goto('/signup');
        await page.waitForLoadState('networkidle');

        // Try short password
        await page.fill('#email', 'test@example.com');
        await page.fill('#password', '123');

        // Button should be disabled due to validation
        const button = page.locator('button:has-text("Create account")');
        await expect(button).toBeDisabled();
    });

    test('email validation', async ({ page }) => {
        await page.goto('/signup');
        await page.waitForLoadState('networkidle');

        // Try invalid email
        await page.fill('#email', 'notanemail');
        await page.fill('#password', 'ValidPassword123!');

        // Browser validation should prevent submission
        const emailInput = page.locator('#email');
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(isValid).toBe(false);
    });
});