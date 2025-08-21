import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set a consistent viewport for screenshots
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('homepage visual test', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Take a full page screenshot
        await expect(page).toHaveScreenshot('homepage.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('login page visual test', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('login-page.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('signup page visual test', async ({ page }) => {
        await page.goto('/signup');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('signup-page.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('dashboard visual test', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('projects page visual test', async ({ page }) => {
        // Navigate to projects page
        await page.goto('/dashboard/projects');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('projects-page.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('responsive mobile view', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('homepage-mobile.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('dark mode visual test', async ({ page }) => {
        // Set dark mode preference
        await page.emulateMedia({ colorScheme: 'dark' });
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot('homepage-dark.png', {
            fullPage: true,
            animations: 'disabled',
        });
    });

    test('form states visual test', async ({ page }) => {
        await page.goto('/login');
        
        // Focus state
        await page.focus('input[type="email"]');
        await expect(page.locator('input[type="email"]')).toHaveScreenshot('input-focused.png');
        
        // Error state
        await page.fill('input[type="email"]', 'invalid');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
        
        await expect(page.locator('form')).toHaveScreenshot('form-error.png');
    });

    test('modal/dialog visual test', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        // Open create project modal
        await page.click('text=New Project');
        await page.waitForSelector('[role="dialog"]');
        
        await expect(page.locator('[role="dialog"]')).toHaveScreenshot('modal.png');
    });

    test('loading states visual test', async ({ page }) => {
        // Simulate slow network
        await page.route('**/api/**', route => {
            setTimeout(() => route.continue(), 2000);
        });
        
        await page.goto('/dashboard');
        
        // Capture loading state
        await expect(page).toHaveScreenshot('loading-state.png', {
            animations: 'disabled',
        });
    });

    test('hover states visual test', async ({ page }) => {
        await page.goto('/');
        
        // Hover over button
        await page.hover('button:has-text("Get Started")');
        await expect(page.locator('button:has-text("Get Started")')).toHaveScreenshot('button-hover.png');
        
        // Hover over link
        await page.hover('a:has-text("Login")');
        await expect(page.locator('a:has-text("Login")')).toHaveScreenshot('link-hover.png');
    });

    test('accessibility focus indicators', async ({ page }) => {
        await page.goto('/login');
        
        // Tab through elements to show focus
        await page.keyboard.press('Tab');
        await expect(page).toHaveScreenshot('focus-first-element.png');
        
        await page.keyboard.press('Tab');
        await expect(page).toHaveScreenshot('focus-second-element.png');
    });
});

test.describe('Cross-browser Visual Tests', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
        test(`homepage in ${browserName}`, async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
            await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
                fullPage: true,
                animations: 'disabled',
            });
        });
    });
});

test.describe('Component Visual Tests', () => {
    test('button variations', async ({ page }) => {
        await page.goto('/');
        
        const buttons = page.locator('button');
        const count = await buttons.count();
        
        for (let i = 0; i < Math.min(count, 5); i++) {
            await expect(buttons.nth(i)).toHaveScreenshot(`button-${i}.png`);
        }
    });

    test('card components', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        const cards = page.locator('[data-testid*="project-card"]');
        const count = await cards.count();
        
        if (count > 0) {
            await expect(cards.first()).toHaveScreenshot('project-card.png');
        }
    });

    test('table component', async ({ page }) => {
        await page.goto('/dashboard/api-keys');
        
        const table = page.locator('table').first();
        if (await table.isVisible()) {
            await expect(table).toHaveScreenshot('table-component.png');
        }
    });
});