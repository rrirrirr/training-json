import { test, expect, Page } from "@playwright/test"
import { waitForAppLoaded } from "./app-loaded-detection"
import { TEST_PLAN_ID, OTHER_PLAN_ID, verifyTestData } from "../helpers/test-data"
import * as planEditHelpers from "../helpers/e2e-helpers"

const baseURL = "http://localhost:3000"

async function expectNormalModeUI(page: Page) {
  await expect(
    page.getByTestId("save-button"),
    "Save button should NOT be visible"
  ).not.toBeVisible()
  await expect(
    page.getByTestId("discard-button"),
    "Discard button should NOT be visible"
  ).not.toBeVisible()
  await expect(
    page.getByText("EDITING PLAN"),
    "'EDITING PLAN' text should NOT be visible"
  ).not.toBeVisible()
}
// --- End Assertion Helpers ---

test.beforeAll(async () => {
  const dataExists = await verifyTestData()
  test.skip(!dataExists, "Test data not found.")
})

test.beforeEach(async ({ page }) => {
  await planEditHelpers.goToHomePage(page)
  // Ensure plans are "owned" using the UI flow helper
  // Go back home to start tests from a consistent place

  await planEditHelpers.setupLocalStorageWithPlans(page, TEST_PLAN_ID, OTHER_PLAN_ID)
  await page.reload()
  await planEditHelpers.waitForAppLoaded(page)
})

test.describe("Deleting plans with Local Database (using testid)", () => {
  test("delete should remove link from sidebar", async ({ page }) => {
    // Verify TEST_PLAN_ID is visible in sidebar initially
    const testPlanLink = page.getByTestId(`plan-link-${TEST_PLAN_ID}`)
    await expect(testPlanLink).toBeVisible()
    
    // Delete the plan
    await planEditHelpers.deletePlan(page, TEST_PLAN_ID)
    
    // Confirm deletion in dialog
    await page.getByRole("button", { name: "Delete" }).click()
    
    // Wait for the deletion to complete
    await page.waitForTimeout(500)
    
    // The plan link should no longer be visible in the sidebar
    await expect(testPlanLink).not.toBeVisible({ timeout: 5000 })
    
    // Other plan should still be visible
    const otherPlanLink = page.getByTestId(`plan-link-${OTHER_PLAN_ID}`)
    await expect(otherPlanLink).toBeVisible()
  })

  test("deleting the plan you are currently viewing should redirect to / and remove plan", async ({
    page,
  }) => {
    // Navigate to the test plan
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)
    
    // Verify we're on the plan page
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    
    // Delete the plan (from the plan actions menu)
    await planEditHelpers.deletePlan(page, TEST_PLAN_ID)
    
    // Confirm deletion in dialog
    await page.getByRole("button", { name: "Delete" }).click()
    
    // We should be redirected to the home page
    await expect(page).toHaveURL(`${baseURL}/`)
    
    // The plan link should no longer be visible in the sidebar
    const testPlanLink = page.getByTestId(`plan-link-${TEST_PLAN_ID}`)
    await expect(testPlanLink).not.toBeVisible({ timeout: 5000 })
  })
})