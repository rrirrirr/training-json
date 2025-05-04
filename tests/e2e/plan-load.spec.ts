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

async function expectViewModeUI(page: Page) {
  await expect(page.getByTestId("save-button"), "Save button should be visible").toBeVisible()
  await expect(
    page.getByText("VIEWING PLAN"),
    "'VIEWING PLAN' text should be visible"
  ).toBeVisible()
}

// --- End Assertion Helpers ---

test.beforeAll(async () => {
  const dataExists = await verifyTestData()
  test.skip(!dataExists, "Test data not found.")
})

test.beforeEach(async ({ page }) => {
  await planEditHelpers.goToHomePage(page)
  // Ensure plans are "owned" using the UI flow helper
  await planEditHelpers.waitForAppLoaded(page)
})

test.describe("Loading plans with Local Database (using testid)", () => {
  test("Loading a plan in store puts us in normal mode", async ({ page }) => {
    await planEditHelpers.setupLocalStorageWithPlans(page, TEST_PLAN_ID, OTHER_PLAN_ID)
    await page.reload()
    await planEditHelpers.waitForAppLoaded(page)

    // Navigate to the test plan
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)

    // Verify we're in normal mode
    await expectNormalModeUI(page)

    // Verify plan name is visible
    await expect(page.getByText("Test Training Plan")).toBeVisible()
  })

  test("Loading a plan not in store puts us in view mode", async ({ page }) => {
    // Navigate directly to a plan that's not in our localStorage
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)
    await planEditHelpers.waitForAppLoaded(page)

    await expectViewModeUI(page)

    // We should see a save button to save this plan to our store
    await expect(page.getByTestId("save-button"), "Save button should be visible").toBeVisible()
  })

  test("A plan not in store shows weekly view on first load", async ({ page }) => {
    // Navigate directly to a plan that's not in our localStorage
    await planEditHelpers.setupLocalStorageWithPlans(page, TEST_PLAN_ID, OTHER_PLAN_ID)
    await page.reload()
    await planEditHelpers.waitForAppLoaded(page)

    // Go to a plan
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)

    // Check if weekly view is visible by default
    const weekViewContainer = page.getByTestId("week-view-container")
    await expect(weekViewContainer).toBeVisible()

    // Block view should not be visible
    const blockViewContainer = page.getByTestId("block-view-container")
    await expect(blockViewContainer).not.toBeVisible()
  })

  test("A plan with saved last viewed block should show that block on load", async ({ page }) => {
    // Setup local storage with plans
    await planEditHelpers.setupLocalStorageWithPlans(page, TEST_PLAN_ID, OTHER_PLAN_ID)

    // Set the last viewed state to block view using both the per-plan key and update the Zustand store
    await page.evaluate((planId) => {
      // Set the plan-specific view state
      const key = `plan-view-state-${planId}`
      const viewState = {
        viewMode: "block",
        selectedWeek: null,
        selectedBlock: 1,
      }
      localStorage.setItem(key, JSON.stringify(viewState))

      // Also update the Zustand store state directly for immediate effect
      const storageKey = "training-plan-storage-v2"
      try {
        const existingState = localStorage.getItem(storageKey)
        if (existingState) {
          const parsed = JSON.parse(existingState)
          if (!parsed.state) parsed.state = {}

          // Set the view state in the Zustand store
          parsed.state.viewMode = "block"
          parsed.state.selectedWeek = null
          parsed.state.selectedBlock = 1
          parsed.state.activePlanId = planId

          localStorage.setItem(storageKey, JSON.stringify(parsed))
        }
      } catch (e) {
        console.error("[Test] Error updating Zustand state:", e)
      }
    }, TEST_PLAN_ID)

    await page.reload()
    await planEditHelpers.waitForAppLoaded(page)

    // Navigate to the plan
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)

    // Add a short delay to ensure the UI has fully rendered
    await page.waitForTimeout(500)

    // Check for the block view container
    const blockViewContainer = page.getByTestId("block-view-container")
    await expect(blockViewContainer).toBeVisible()

    // First block should be visible (this is the core test assertion)
    await expect(page.getByText("First Block")).toBeVisible()
  })
})
