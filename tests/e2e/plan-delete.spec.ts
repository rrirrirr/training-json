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
  await planEditHelpers.loadPlanToStore(page, TEST_PLAN_ID)
  await planEditHelpers.loadPlanToStore(page, OTHER_PLAN_ID)
  // Go back home to start tests from a consistent place
  await planEditHelpers.goToHomePage(page)
})

test.describe("Deleting plans with Local Database (using testid)", () => {
  // test("delete", async ({ page }) => {
  // Setup: Go to the owned plan page
  // await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)
  // await expectNormalModeUI(page) // Verify normal mode
  // // Action: Use the trigger helper
  // await planEditHelpers.triggerEditViaJsonMenu(page, TEST_PLAN_ID)
  // // Assertions
  // await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
  // await expectEditModeUI(page, "Test Training Plan")
  // })
})
