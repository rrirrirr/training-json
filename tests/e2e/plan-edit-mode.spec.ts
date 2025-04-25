// tests/e2e/local-plan-edit-mode.spec.ts
import { test, expect } from "@playwright/test"
import { waitForAppLoaded } from "./app-loaded-detection"
import { TEST_PLAN_ID, OTHER_PLAN_ID, verifyTestData } from "../helpers/test-data"

const baseURL = "http://localhost:3000"

// Make sure test data exists before running tests
test.beforeAll(async () => {
  // Verify the test data exists in the local database
  const dataExists = await verifyTestData()
  test.skip(
    !dataExists,
    "Test data not found or could not be created. Please run `npm run supabase:reset` first."
  )
})

// Run before each test
test.beforeEach(async ({ page }) => {
  // do we need to clear local storage?

  // Navigate to the home page
  await page.goto("/")

  // Wait for the app to be loaded
  await waitForAppLoaded(page)
})

// ----- TESTS -----
test.describe("Plan Edit Mode with Local Database", () => {
  test("entering edit mode for plan via JSON editor from plan route", async ({ page }) => {
    await page.goto(`/plan/${TEST_PLAN_ID}`)

    await page.getByRole("button", { name: "Test Training Plan" }).click()
    await page.getByRole("button", { name: "Actions for Test Training Plan" }).click()
    await page.getByRole("menuitem", { name: "View/Edit JSON" }).click()
    await page.getByRole("button", { name: "Update Plan" }).click()

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)

    await expect(page.getByTestId("save-button")).toBeVisible()
    await expect(page.getByTestId("discard-button")).toBeVisible()
    await expect(page.getByText("EDITING PLAN")).toBeVisible()

    // ONLY DESKTOP
    await expect(page.getByRole("button", { name: "Test Training Plan" })).toBeVisible()

    // not implemented yet!
    // await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible()
  })

  test("entering edit mode for plan via JSON editor from /", async ({ page }) => {
    // make sure we have plan in store so it is visible in plan switcher
    await page.goto(`/plan/${TEST_PLAN_ID}`)
    await page.goto(`/`)

    await page.getByRole("button", { name: "Actions for Test Training Plan" }).click()
    await page.getByRole("menuitem", { name: "View/Edit JSON" }).click()
    await page.getByRole("button", { name: "Update Plan" }).click()

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)

    await expect(page.getByTestId("save-button")).toBeVisible()
    await expect(page.getByTestId("discard-button")).toBeVisible()
    await expect(page.getByText("EDITING PLAN")).toBeVisible()
    await expect(page.getByTestId("plan-name")).toBeVisible()

    // ONLY DESKTOP
    await expect(page.getByRole("button", { name: "Test Training Plan" })).toBeVisible()

    // not implemented yet!
    // await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible()
  })

  test("entering edit mode for plan via URL", async ({ page }) => {
    // make sure we have plan in store so it is visible in plan switcher
    await page.goto(`/plan/${TEST_PLAN_ID}/edit`)

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)

    await expect(page.getByTestId("save-button")).toBeVisible()
    await expect(page.getByTestId("discard-button")).toBeVisible()
    await expect(page.getByText("EDITING PLAN")).toBeVisible()
    await expect(page.getByTestId("plan-name")).toBeVisible()

    // ONLY DESKTOP
    await expect(page.getByRole("button", { name: "Test Training Plan" })).toBeVisible()

    // not implemented yet!
    // await expect(page.locator('[data-testid="unsaved-changes-indicator"]')).not.toBeVisible()
  })

  test("Exiting edit mode correctly via discard button", async ({ page }) => {
    await page.goto(`/plan/${TEST_PLAN_ID}/edit`)

    await page.getByTestId("discard-button").click()
    await page.getByTestId("confirm-discard-button").click()

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)

    await expect(page.getByTestId("save-button")).not.toBeVisible()
    await expect(page.getByTestId("discard-button")).not.toBeVisible()
    await expect(page.getByText("EDITING PLAN")).not.toBeVisible()
  })

  test("Exiting edit mode via plan switching should show warning dialog and take us to the correct plan", async ({
    page,
  }) => {
    // put other plan in store
    await page.goto(`/plan/${OTHER_PLAN_ID}`)
    await page.goto(`/plan/${TEST_PLAN_ID}/edit`)

    await page.getByRole("button", { name: "Test Training Plan" }).click()
    await page.getByRole("link", { name: "Other Training Plan" }).click()
    await expect(page.getByRole("button", { name: "Discard & switch" })).toBeVisible()
    await page.getByRole("button", { name: "Discard & switch" }).click()

    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}`)
  })

  test("Going from and edit page to / should show unsaved changes in plan switcher and an alert", async ({
    page,
  }) => {})

  test("Entering a plan that has unsaved changes via plan switcher should take us to edit page", async ({
    page,
  }) => {})

  test("Entering a plan that has unsaved changes via url should take us to edit page", async ({
    page,
  }) => {})

  test("Entering a plans edit page via url when we have unsaved changes we should be shown a warning that we are discarding changes before loading", async ({
    page,
  }) => {})

  test("Trying to enter edit mode via editor while having unsaved changes elsewhere should show us discard warning", async ({
    page,
  }) => {})

  test("Switching between blocks and week view in edit mode should work", async ({ page }) => {})

  test("We should see all weeks in edit mode", async ({ page }) => {})

  test("We should see all blocks in edit mode", async ({ page }) => {})

  test("Changes to weeks should be visible in update mode", async ({ page }) => {})

  test("Changes to blocks should be visible in update mode", async ({ page }) => {})

  test("Adding a week should be visible in update mode", async ({ page }) => {})

  test("Adding a block should be visible in update mode", async ({ page }) => {})

  test("Changing name should be visible", async ({ page }) => {})

  test("Canceling unsaved changes should", async ({ page }) => {})

  test("Saving changes should exit edit mode and take us to the new plan id page", async ({
    page,
  }) => {})

  test("Creating new plan should put us in edit mode", async ({ page }) => {})

  test("Saving new plan should redirect us to plan page", async ({ page }) => {})
})
