import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
    const testEmail = `e2e-project${Date.now()}@example.com`;
    const testPassword = 'E2ETestPassword123!';

    test.beforeEach(async ({ page }) => {
        // Setup: Create user and login
        // Signup
        await page.goto('/signup');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**', { timeout: 10000 });
    });

    test('should create a new project', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        // Click new project button
        await page.click('text=New Project');
        
        // Fill project name
        const projectName = `E2E Test Project ${Date.now()}`;
        await page.fill('input[placeholder*="project name"]', projectName);
        
        // Create project
        await page.click('text=Create Project');
        
        // Verify project appears in list
        await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 5000 });
    });

    test('should rename a project', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        // Find edit button for the project
        const projectCard = page.locator('text=E2E Test Project').first().locator('../..');
        await projectCard.locator('button[aria-label*="edit"]').click();
        
        // Fill new name
        const newName = `Renamed Project ${Date.now()}`;
        await page.fill('input[value*="E2E Test Project"]', newName);
        
        // Save
        await page.click('text=Save');
        
        // Verify renamed
        await expect(page.locator(`text=${newName}`)).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to environments page', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        // Click on environments button
        const projectCard = page.locator('text=Renamed Project').first().locator('../..');
        await projectCard.locator('text=View Environments').click();
        
        // Should navigate to environments page
        await expect(page).toHaveURL(/\/dashboard\/environments/);
        await expect(page.locator('text=Environments')).toBeVisible();
    });

    test('should show project statistics', async ({ page }) => {
        await page.goto('/dashboard/projects');
        
        // Check for statistics display
        const projectCard = page.locator('text=Renamed Project').first().locator('../..');
        
        // Should show environment count
        await expect(projectCard.locator('text=Environments')).toBeVisible();
        
        // Should show last activity
        await expect(projectCard.locator('text=Last Activity')).toBeVisible();
    });

    test('should handle empty project list', async ({ page }) => {
        // Create new user with no projects
        const emptyUserEmail = `empty${Date.now()}@example.com`;
        
        await page.goto('/signup');
        await page.fill('input[type="email"]', emptyUserEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**');
        await page.goto('/dashboard/projects');
        
        // Should show empty state
        await expect(page.locator('text=No projects yet')).toBeVisible();
        await expect(page.locator('text=Create Your First Project')).toBeVisible();
    });

    test('should delete a project', async ({ page }) => {
        // Login back to user with projects
        await page.goto('/login');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL('/dashboard/**');
        await page.goto('/dashboard/projects');
        
        // Find delete button
        const projectCard = page.locator('text=Renamed Project').first().locator('../..');
        await projectCard.locator('button[aria-label*="delete"]').click();
        
        // Confirm deletion
        await page.click('text=Delete', { timeout: 5000 });
        
        // Project should be removed
        await expect(page.locator('text=Renamed Project').first()).not.toBeVisible({ timeout: 5000 });
    });
});