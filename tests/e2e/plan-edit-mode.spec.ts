// tests/e2e/local-plan-edit-mode.spec.ts
import { test, expect } from "@playwright/test"
import { waitForAppLoaded } from "./app-loaded-detection"
import { TEST_PLAN_ID, OTHER_PLAN_ID, verifyTestData } from "../helpers/test-data"

// Make sure test data exists before running tests
test.beforeAll(async () => {
  // Verify the test data exists in the local database
  // maybe clear local storage here? is it even needed?
  const dataExists = await verifyTestData()
  test.skip(
    !dataExists,
    "Test data not found or could not be created. Please run `npm run supabase:reset` first."
  )
})

// Run before each test
test.beforeEach(async ({ page }) => {
  // Navigate to the home page
  await page.goto("/")

  // Wait for the app to be loaded
  await waitForAppLoaded(page)
})

// ----- TESTS -----
test.describe("Plan Edit Mode with Local Database", () => {
  test("entering edit mode for existing plan sets url to .../edit", async ({ page }) => {
    // Navigate to the plan ID
    await page.goto(`/plan/${TEST_PLAN_ID}`)

    await page.getByRole("button", { name: "Test Training Plan" }).click()
    await page.getByRole("button", { name: "Actions for Test Training Plan" }).click()
    await page.getByRole("menuitem", { name: "View/Edit JSON" }).click()
    await page.getByRole("button", { name: "Update Plan" }).click()

    // Verify URL changed to edit page
    await expect(page).toHaveURL(new RegExp(`/plan/${TEST_PLAN_ID}/edit`))

    // Verifying local storage? is this a e2e thing or a unit/integration test?
    // e2e should be as close as to users experienc as possible?

    // Verify edit mode indicator is visible
    await expect(page.locator('[data-testid="edit-mode-indicator"]')).toBeVisible()

    // Verify unsaved changes indicator is not visible
    await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible()
  })

  test("making changes sets hasUnsavedChanges to true", async ({ page }) => {
    // Navigate to plan edit page
    // await page.goto(`/plan/${TEST_PLAN_ID}/edit`)
    // Make a change to the plan
    // await page.fill('[data-testid="plan-name-input"]', "Modified Plan Name")
    // Verify unsaved changes indicator appears
    // await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).toBeVisible()
  })
})
