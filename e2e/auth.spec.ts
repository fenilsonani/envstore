import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
    let page: Page;
    const testEmail = `e2e${Date.now()}@example.com`;
    const testPassword = 'E2ETestPassword123!';

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        await page.goto('/');
    });

    test('should display homepage with login/signup options', async () => {
        await expect(page).toHaveTitle(/EnvStore/);
        await expect(page.locator('text=Get Started')).toBeVisible();
        await expect(page.locator('text=Login')).toBeVisible();
    });

    test('complete signup flow', async () => {
        // Navigate to signup
        await page.click('text=Get Started');
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

    test('complete login flow', async () => {
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

    test('should handle invalid login', async () => {
        await page.goto('/login');
        
        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'WrongPassword123');
        
        await page.click('button[type="submit"]');

        // Should show error
        await expect(page.locator('text=invalid')).toBeVisible({ timeout: 5000 });
        
        // Should stay on login page
        await expect(page).toHaveURL('/login');
    });

    test('should protect dashboard routes', async () => {
        // Try to access dashboard without auth
        await page.goto('/dashboard');
        
        // Should redirect to login
        await expect(page).toHaveURL('/login');
    });

    test('logout flow', async () => {
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

    test('password requirements validation', async () => {
        await page.goto('/signup');
        
        // Try short password
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', '123');
        await page.click('button[type="submit"]');
        
        // Should show validation error
        await expect(page.locator('text=invalid').or(page.locator('text=minimum'))).toBeVisible();
    });

    test('email validation', async () => {
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