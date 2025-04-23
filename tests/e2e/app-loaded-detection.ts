/**
 * Helper functions for detecting app loaded state
 */

import { Page } from "@playwright/test";

/**
 * Waits for the app to be fully loaded
 */
export async function waitForAppLoaded(page: Page) {
  await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
}

/**
 * Sets up test data for plans
 */
export async function setupTestPlans(page: Page) {
  // Use localStorage to set up test plans
  await page.evaluate(() => {
    localStorage.setItem('planList', JSON.stringify([
      {
        id: 'test-plan-id',
        planName: 'Test Plan',
        creationDate: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'other-plan-id',
        planName: 'Other Plan',
        creationDate: '2023-01-02T00:00:00.000Z',
      }
    ]));
    
    // Also set active plan
    localStorage.setItem('activePlanId', 'test-plan-id');
    
    // Set up plan data
    localStorage.setItem('plan-test-plan-id', JSON.stringify({
      id: 'test-plan-id',
      metadata: {
        planName: 'Test Plan',
        creationDate: '2023-01-01T00:00:00.000Z',
      },
      weekTypes: [],
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: []
    }));

    // Set up other plan data
    localStorage.setItem('plan-other-plan-id', JSON.stringify({
      id: 'other-plan-id',
      metadata: {
        planName: 'Other Plan',
        creationDate: '2023-01-02T00:00:00.000Z',
      },
      weekTypes: [],
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: []
    }));
  });
}
