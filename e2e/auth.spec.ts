import { test, expect } from '@playwright/test';

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
        await page.click('text=Get started free');
        await expect(page).toHaveURL('/signup');

        // Fill signup form
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        
        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await page.waitForURL('/dashboard/**', { timeout: 10000 });
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('complete login flow', async ({ page }) => {
        // Navigate to login
        await page.goto('/login');
        
        // Fill login form
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        
        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await page.waitForURL('/dashboard/**', { timeout: 10000 });
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle invalid login', async ({ page }) => {
        await page.goto('/login');
        
        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'WrongPassword123');
        
        await page.click('button[type="submit"]');

        // Should show error
        await expect(page.locator('text=invalid')).toBeVisible({ timeout: 5000 });
        
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
        // First login
        await page.goto('/login');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**');
        
        // Find and click logout
        await page.click('text=Logout');
        
        // Should redirect to homepage or login
        await expect(page).toHaveURL(/\/(login)?$/);
        
        // Try to access dashboard again
        await page.goto('/dashboard');
        await expect(page).toHaveURL('/login');
    });

    test('password requirements validation', async ({ page }) => {
        await page.goto('/signup');
        
        // Try short password
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        
        // Should show validation error
        await expect(page.locator('text=invalid').or(page.locator('text=minimum'))).toBeVisible();
    });

    test('email validation', async ({ page }) => {
        await page.goto('/signup');
        
        // Try invalid email
        await page.fill('input[type="email"]', 'notanemail');
        await page.fill('input[type="password"]', 'ValidPassword123!');
        
        // Browser validation should prevent submission
        const emailInput = page.locator('input[type="email"]');
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(isValid).toBe(false);
    });
});