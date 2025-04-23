import { test, expect } from '@playwright/test';
import { waitForAppLoaded, setupTestPlans } from './app-loaded-detection';

// Set up a test fixture for our app
test.beforeEach(async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Wait for the app to be loaded
  await waitForAppLoaded(page);
  
  // Set up test data
  await setupTestPlans(page);
});

test.describe('Plan Edit Mode', () => {
  test('entering edit mode for existing plan sets hasUnsavedChanges to false', async ({ page }) => {
    // Navigate to an existing plan (assuming we have a test plan)
    await page.goto('/plan/test-plan-id');
    
    // Click the edit button
    await page.click('[data-testid="edit-button"]');
    
    // Verify URL changed to edit page
    await expect(page).toHaveURL(/\/plan\/test-plan-id\/edit/);
    
    // Verify edit mode indicator is visible
    await expect(page.locator('[data-testid="edit-mode-indicator"]')).toBeVisible();
    
    // Verify unsaved changes indicator is not visible
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible();
  });
  
  test('making changes sets hasUnsavedChanges to true', async ({ page }) => {
    // Navigate to plan edit page
    await page.goto('/plan/test-plan-id/edit');
    
    // Make a change to the plan
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Verify unsaved changes indicator appears
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).toBeVisible();
  });
  
  test('clicking same plan in sidebar navigates to edit page', async ({ page }) => {
    // Navigate to plan edit page and make a change
    await page.goto('/plan/test-plan-id/edit');
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Navigate to home
    await page.goto('/');
    
    // Find and click the same plan in sidebar
    await page.click('[data-testid="plan-item"][data-plan-id="test-plan-id"]');
    
    // Should navigate to edit page without warning
    await expect(page).toHaveURL(/\/plan\/test-plan-id\/edit/);
    
    // Verify our changes are still there
    await expect(page.locator('[data-testid="plan-name-input"]')).toHaveValue('Modified Plan Name');
  });
  
  test('clicking different plan shows warning dialog', async ({ page }) => {
    // Navigate to plan edit page and make a change
    await page.goto('/plan/test-plan-id/edit');
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Find and click a different plan
    await page.click('[data-testid="plan-item"][data-plan-id="other-plan-id"]');
    
    // Warning dialog should appear
    await expect(page.locator('[data-testid="discard-warning-dialog"]')).toBeVisible();
    
    // Test cancel button
    await page.click('[data-testid="cancel-button"]');
    
    // Should stay on edit page
    await expect(page).toHaveURL(/\/plan\/test-plan-id\/edit/);
    
    // Try again and confirm this time
    await page.click('[data-testid="plan-item"][data-plan-id="other-plan-id"]');
    await page.click('[data-testid="confirm-button"]');
    
    // Should navigate to other plan
    await expect(page).toHaveURL(/\/plan\/other-plan-id/);
  });
  
  test('page refresh preserves edit state', async ({ page }) => {
    // Navigate to plan edit page and make a change
    await page.goto('/plan/test-plan-id/edit');
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Reload the page
    await page.reload();
    
    // Should still be in edit mode
    await expect(page).toHaveURL(/\/plan\/test-plan-id\/edit/);
    
    // Changes should be preserved
    await expect(page.locator('[data-testid="plan-name-input"]')).toHaveValue('Modified Plan Name');
    
    // Unsaved changes indicator should still be visible
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).toBeVisible();
  });
  
  test('saving clears unsaved changes state', async ({ page }) => {
    // Navigate to plan edit page and make a change
    await page.goto('/plan/test-plan-id/edit');
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Save the plan
    await page.click('[data-testid="save-button"]');
    
    // Should navigate to view mode
    await expect(page).toHaveURL(/\/plan\/test-plan-id$/);
    
    // Saved notification should be visible
    await expect(page.locator('[data-testid="saved-notification"]')).toBeVisible();
    
    // Plan name should be updated
    await expect(page.locator('[data-testid="plan-name"]')).toHaveText('Modified Plan Name');
  });
  
  test('discarding changes reverts to original state', async ({ page }) => {
    // Get original plan name first
    await page.goto('/plan/test-plan-id');
    const originalName = await page.textContent('[data-testid="plan-name"]');
    
    // Enter edit mode and change name
    await page.click('[data-testid="edit-button"]');
    await page.fill('[data-testid="plan-name-input"]', 'Modified Plan Name');
    
    // Discard changes
    await page.click('[data-testid="discard-button"]');
    
    // Confirm discard
    await page.click('[data-testid="confirm-discard-button"]');
    
    // Should return to view mode
    await expect(page).toHaveURL(/\/plan\/test-plan-id$/);
    
    // Plan name should be reverted to original
    await expect(page.locator('[data-testid="plan-name"]')).toHaveText(originalName);
  });
});
