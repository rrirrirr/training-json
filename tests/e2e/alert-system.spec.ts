import { test, expect } from '@playwright/test';

test.describe('Global Alert System', () => {
  // Setup a demo page for testing alerts
  // We'll add this page in the next step
  const alertDemoPath = '/alert-demo';

  test.beforeEach(async ({ page }) => {
    await page.goto(alertDemoPath);
    // Wait for the page to be fully loaded
    await page.waitForSelector('text=Global Alert Examples');
  });

  test('should show and hide different types of alerts', async ({ page }) => {
    // Test info alert with auto-close
    await page.click('text=Show Info Alert');
    await expect(page.locator('text=This is an information message.')).toBeVisible();
    
    // Info alert should disappear after 5 seconds (auto-close)
    await expect(page.locator('text=This is an information message.')).toBeVisible();
    await page.waitForTimeout(5500); // Wait a bit longer than 5 seconds to ensure it closes
    await expect(page.locator('text=This is an information message.')).not.toBeVisible();

    // Test warning alert
    await page.click('text=Show Warning Alert');
    await expect(page.locator('text=Warning! This action may have consequences.')).toBeVisible();
    
    // Test error alert (should replace warning alert)
    await page.click('text=Show Error Alert');
    await expect(page.locator('text=An error occurred while processing your request.')).toBeVisible();
    await expect(page.locator('text=Warning! This action may have consequences.')).not.toBeVisible();
    
    // Test manual dismissal using the X button
    await page.locator('[aria-label="Dismiss alert"]').click();
    await expect(page.locator('text=An error occurred while processing your request.')).not.toBeVisible();
    
    // Test edit mode alert
    await page.click('text=Show Edit Mode Alert');
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).toBeVisible();
    
    // Test manual dismissal using the button
    await page.click('text=Hide Current Alert');
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).not.toBeVisible();
  });

  test('should visually collapse and expand edit mode alerts on hover', async ({ page }) => {
    // Show edit mode alert
    await page.click('text=Show Edit Mode Alert');
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).toBeVisible();
    
    // Wait for collapse (should happen after 3 seconds)
    await page.waitForTimeout(3500);
    
    // After collapse, the text should not be visible
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).not.toBeVisible();
    
    // Hover over the alert
    await page.hover('[role="alert"]');
    
    // After hover, text should be visible again
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).toBeVisible();
    
    // Move mouse away
    await page.mouse.move(0, 0);
    
    // Text should be hidden again
    await expect(page.locator('text=You are in edit mode. Don\'t forget to save your changes!')).not.toBeVisible();
  });
});
