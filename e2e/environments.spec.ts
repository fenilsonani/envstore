import { test, expect } from '@playwright/test';

test.describe('Environment Management', () => {
    const testEmail = `e2e-env${Date.now()}@example.com`;
    const testPassword = 'E2ETestPassword123!';

    test.beforeEach(async ({ page }) => {
        // Setup: Create user, login, and create project
        // Signup
        await page.goto('/signup');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**');
        
        // Create a project
        await page.goto('/dashboard/projects');
        await page.click('text=New Project');
        await page.fill('input[placeholder*="project name"]', 'E2E Env Test Project');
        await page.click('text=Create Project');
        
        await page.waitForTimeout(2000);
    });

    test('should upload environment file', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Select project if dropdown exists
        const projectSelect = page.locator('select[name="project"]');
        if (await projectSelect.isVisible()) {
            await projectSelect.selectOption({ label: 'E2E Env Test Project' });
        }
        
        // Select environment
        await page.selectOption('select[name="environment"]', 'development');
        
        // Fill environment content
        const envContent = `DATABASE_URL=postgres://localhost:5432/test
API_KEY=test-api-key-123
NODE_ENV=development`;
        
        await page.fill('textarea[placeholder*="env"]', envContent);
        
        // Fill passphrase
        await page.fill('input[placeholder*="passphrase"]', 'test-passphrase-123');
        
        // Upload
        await page.click('button:has-text("Upload")');
        
        // Should show success
        await expect(page.locator('text=Successfully uploaded')).toBeVisible({ timeout: 5000 });
    });

    test('should list uploaded environments', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Should show the uploaded environment
        await expect(page.locator('text=development')).toBeVisible();
        await expect(page.locator('text=Version 1')).toBeVisible();
    });

    test('should show encryption status', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Should indicate encrypted status
        await expect(page.locator('text=Encrypted').or(page.locator('[aria-label*="encrypted"]'))).toBeVisible();
    });

    test('should handle multiple environments', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Upload staging environment
        await page.selectOption('select[name="environment"]', 'staging');
        
        const stagingContent = `DATABASE_URL=postgres://staging:5432/test
API_KEY=staging-api-key
NODE_ENV=staging`;
        
        await page.fill('textarea[placeholder*="env"]', stagingContent);
        await page.fill('input[placeholder*="passphrase"]', 'staging-passphrase');
        await page.click('button:has-text("Upload")');
        
        // Should show both environments
        await expect(page.locator('text=development')).toBeVisible();
        await expect(page.locator('text=staging')).toBeVisible();
    });

    test('should handle environment versions', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Upload new version of development
        await page.selectOption('select[name="environment"]', 'development');
        
        const v2Content = `DATABASE_URL=postgres://localhost:5432/test_v2
API_KEY=test-api-key-v2
NODE_ENV=development
NEW_FEATURE=enabled`;
        
        await page.fill('textarea[placeholder*="env"]', v2Content);
        await page.fill('input[placeholder*="passphrase"]', 'test-passphrase-123');
        await page.click('button:has-text("Upload")');
        
        // Should show version 2
        await expect(page.locator('text=Version 2')).toBeVisible({ timeout: 5000 });
    });

    test('should decrypt environment file', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Click on an environment to decrypt
        await page.click('text=View').first();
        
        // Enter passphrase in modal/drawer
        await page.fill('input[placeholder*="passphrase"]', 'test-passphrase-123');
        await page.click('button:has-text("Decrypt")');
        
        // Should show decrypted content
        await expect(page.locator('text=DATABASE_URL')).toBeVisible({ timeout: 5000 });
    });

    test('should handle wrong passphrase', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Click on an environment
        await page.click('text=View').first();
        
        // Enter wrong passphrase
        await page.fill('input[placeholder*="passphrase"]', 'wrong-passphrase');
        await page.click('button:has-text("Decrypt")');
        
        // Should show error
        await expect(page.locator('text=incorrect').or(page.locator('text=failed'))).toBeVisible({ timeout: 5000 });
    });

    test('should copy environment to clipboard', async ({ page }) => {
        await page.goto('/dashboard/environments');
        
        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        
        // Decrypt first
        await page.click('text=View').first();
        await page.fill('input[placeholder*="passphrase"]', 'test-passphrase-123');
        await page.click('button:has-text("Decrypt")');
        
        // Click copy button
        await page.click('button[aria-label*="copy"]');
        
        // Should show copied confirmation
        await expect(page.locator('text=Copied')).toBeVisible({ timeout: 5000 });
    });

    test('should filter environments by project', async ({ page }) => {
        // Create another project
        await page.goto('/dashboard/projects');
        await page.click('text=New Project');
        await page.fill('input[placeholder*="project name"]', 'Second Project');
        await page.click('text=Create Project');
        
        await page.goto('/dashboard/environments');
        
        // Select first project
        await page.selectOption('select[name="project"]', { label: 'E2E Env Test Project' });
        
        // Should show environments for first project
        await expect(page.locator('text=development')).toBeVisible();
        
        // Select second project
        await page.selectOption('select[name="project"]', { label: 'Second Project' });
        
        // Should show empty state for second project
        await expect(page.locator('text=No environments')).toBeVisible();
    });
});