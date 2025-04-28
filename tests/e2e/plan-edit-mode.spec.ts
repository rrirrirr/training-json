// tests/e2e/local-plan-edit-mode.spec.ts
import { test, expect, Page } from "@playwright/test"
import { waitForAppLoaded } from "./app-loaded-detection"
import { TEST_PLAN_ID, OTHER_PLAN_ID, verifyTestData } from "../helpers/test-data"
import * as planEditHelpers from "../helpers/e2e-helpers"

const baseURL = "http://localhost:3000"

// --- Assertion Helpers ---
async function expectEditModeUI(page: Page, planName?: string, isNewPlan = false) {
  await expect(page.getByTestId("save-button"), "Save button should be visible").toBeVisible()
  await expect(page.getByTestId("discard-button"), "Discard button should be visible").toBeVisible()
  await expect(
    page.getByText("EDITING PLAN"),
    "'EDITING PLAN' text should be visible"
  ).toBeVisible()
  const planNameLocator = page.getByTestId("plan-name")
  await expect(planNameLocator, "Plan name display should be visible").toBeVisible()
  if (planName) {
    await expect(planNameLocator).toContainText(planName)
    // Example: Assuming switcher trigger has testid `plan-switcher-trigger`
    await expect(
      page.getByTestId("plan-switcher-trigger"),
      "Switcher trigger should show plan name"
    ).toHaveText(planName)
  } else if (isNewPlan) {
    await expect(planNameLocator).toContainText("New Training Plan")
  }
}

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

test.describe("Plan Edit Mode with Local Database (using testid)", () => {
  test("entering edit mode for plan via JSON editor menu from plan page", async ({ page }) => {
    // Setup: Go to the owned plan page
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)
    await expectNormalModeUI(page) // Verify normal mode

    // Action: Use the trigger helper
    await planEditHelpers.triggerEditViaJsonMenu(page, TEST_PLAN_ID)

    // Assertions
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Test Training Plan")
  })

  test("entering edit mode for plan via JSON editor menu from /", async ({ page }) => {
    // Setup: Already on home page via beforeEach, plans are loaded to store
    await planEditHelpers.goToHomePage(page) // Ensure we are at '/'

    // Action: Use the trigger helper (it finds the plan in the switcher)
    await planEditHelpers.triggerEditViaJsonMenu(page, TEST_PLAN_ID)

    // Assertions
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Test Training Plan")
  })

  test("entering edit mode for plan via URL", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Test Training Plan")
  })

  test("Exiting edit mode correctly via discard button with no changes", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await planEditHelpers.discardChanges(page)
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    await expectNormalModeUI(page)
  })

  test("Exiting edit mode correctly via discard button when we have changes", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = "Discard Test Name"
      return json
    })
    await expect(page.getByTestId("plan-name")).toContainText("Discard Test Name")
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();

    await planEditHelpers.discardChanges(page)

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(page.getByRole("heading", { name: "Test Training Plan" })).toBeVisible()
  })

  test("Exiting edit mode via plan switching should show warning dialog and take us to the correct plan", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")

    // Use testids for switching
    await planEditHelpers.switchPlanViaSwitcher(
      page,
      `plan-switcher-trigger`, // Assumes this ID is on the trigger showing current plan name
      `plan-item-${OTHER_PLAN_ID}`, // Assumes this ID is on the list item for the target plan
      OTHER_PLAN_ID
    )

    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(page.getByRole("heading", { name: "Other Training Plan" })).toBeVisible()
  })

  test("Going from an edit page to / should show unsaved changes indicator", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const modifiedName = "Modified Plan Name On Home"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = modifiedName
      return json
    })
    await planEditHelpers.goToHomePage(page)

    // Assuming switcher trigger shows current (unsaved) name
    await expect(page.getByTestId("plan-switcher-trigger")).toHaveText(modifiedName)
    await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible()

    // Assert alert/warning dialog...
  })

  test("Entering a plan that has unsaved changes via plan switcher should take us to edit page", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const modifiedName = "Unsaved Plan Switcher Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = modifiedName
      return json
    })
    await planEditHelpers.goToPlanPage(page, OTHER_PLAN_ID) // Go elsewhere

    // Switch back using testids
    await planEditHelpers.switchPlanViaSwitcher(
      page,
      `plan-switcher-trigger`,
      `plan-item-${TEST_PLAN_ID}`,
      TEST_PLAN_ID
    )

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, modifiedName)
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();
  })

  test("Entering a plan that has unsaved changes via url should take us to edit page", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const modifiedName = "Unsaved Plan URL Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = modifiedName
      return json
    })
    await planEditHelpers.goToPlanPage(page, OTHER_PLAN_ID) // Go elsewhere
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID) // Navigate back via view URL

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`) // Should redirect
    await expectEditModeUI(page, modifiedName)
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();
  })

  test("Entering another plan's edit page via url when we have unsaved changes should show conflict dialog", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const unsavedName = "First Plan Unsaved Conflict"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = unsavedName
      return json
    })
    await page.goto(`/plan/${OTHER_PLAN_ID}/edit`) // Try direct nav

    // Assert dialog appears
    await expect(page.getByRole("dialog", { name: /Edit Conflict/i })).toBeVisible()
    await expect(page.getByText(/You have unsaved changes/)).toBeVisible()
    const discardButton = page.getByRole("button", { name: "Discard Changes" })
    const keepEditingButton = page.getByRole("button", { name: "Keep Editing" })
    await expect(discardButton).toBeVisible()
    await expect(keepEditingButton).toBeVisible()

    await discardButton.click() // Test discarding

    // Assert now on the target edit page
    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Other Training Plan")
  })

  test("Trying to enter edit mode via editor while having unsaved changes elsewhere should show conflict dialog", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const unsavedName = "Unsaved Conflict Editor Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = unsavedName
      return json
    })
    await planEditHelpers.goToPlanPage(page, OTHER_PLAN_ID) // Go elsewhere

    // Attempt trigger edit for OTHER plan
    const actionsTriggerOther = page.getByTestId(`plan-actions-trigger-${OTHER_PLAN_ID}`)
    try {
      // Try direct click first
      await actionsTriggerOther.click({ timeout: 5000 })
    } catch (e) {
      // Fallback to switcher
      await page.getByTestId("plan-switcher-trigger").click()
      await page.getByTestId(`plan-item-${OTHER_PLAN_ID}"]`).waitFor()

      await actionsTriggerOther.click()
    }
    await page.getByTestId(`edit-json-menu-item-${OTHER_PLAN_ID}`).click()

    // Assert conflict dialog appears
    await expect(page.getByRole("dialog", { name: /Edit Conflict/i })).toBeVisible()
    await expect(page.getByText(/You have unsaved changes/)).toBeVisible()
    const discardButton = page.getByRole("button", { name: "Discard Changes" })
    const keepEditingButton = page.getByRole("button", { name: "Keep Editing" })
    await expect(discardButton).toBeVisible()
    await expect(keepEditingButton).toBeVisible()

    await keepEditingButton.click() // Test keeping edits

    // Assert redirected back to FIRST plan's edit page
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, unsavedName)
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();
  })

  test("Switching between blocks and week view in edit mode should work", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")

    const monthViewButton = page.getByRole("button", { name: "Block View" })
    const weekViewButton = page.getByRole("button", { name: "Weekly View" })

    await expect(monthViewButton).toHaveAttribute("data-state", "active")
    await expect(weekViewButton).toHaveAttribute("data-state", "inactive")
    await expect(page.getByTestId("month-view-container")).toBeVisible()

    await weekViewButton.click()
    await expect(monthViewButton).toHaveAttribute("data-state", "inactive")
    await expect(weekViewButton).toHaveAttribute("data-state", "active")
    await expect(page.getByTestId("week-view-container")).toBeVisible()

    await monthViewButton.click()
    await expect(monthViewButton).toHaveAttribute("data-state", "active")
    await expect(weekViewButton).toHaveAttribute("data-state", "inactive")
    await expect(page.getByTestId("month-view-container")).toBeVisible()
  })

  test("We should see all weeks in edit mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await page.getByRole("button", { name: "Weekly View" }).click()

    await expect(page.getByText("Week 1")).toBeVisible()
    await expect(page.getByTestId("week-view-container")).toBeVisible()
    await expect(page.getByRole("button", { name: "Previous" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible()
  })

  test("We should see all blocks in edit mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await page.getByRole("button", { name: "Block View" }).click()

    await expect(page.getByText("First Block")).toBeVisible()
    await expect(page.getByTestId("month-view-container")).toBeVisible()
  })

  test("Changes to weeks should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newDescription = "Modified Week Description In Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      if (!json.weeks || json.weeks.length === 0) test.skip(true, "Test plan has no weeks.")
      json.weeks[0].description = newDescription
      return json
    })
    await page.getByRole("button", { name: "Weekly View" }).click()
    await expect(page.getByText(newDescription)).toBeVisible()
  })

  test("Changes to blocks should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newBlockName = "Updated Block Name In Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      if (!json.monthBlocks || json.monthBlocks.length === 0)
        test.skip(true, "Test plan has no blocks.")
      json.monthBlocks[0].name = newBlockName
      return json
    })
    await page.getByRole("button", { name: "Block View" }).click()
    await expect(page.getByText(newBlockName)).toBeVisible()
  })

  test("Adding a week should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    let newWeekNumber = 0
    const newWeekDescription = "Newly Added Week In Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      newWeekNumber = (json.weeks?.length || 0) + 1
      const newWeek = {
        weekNumber: newWeekNumber,
        weekTypeIds: [],
        sessions: [],
        description: newWeekDescription,
      }
      json.weeks = [...(json.weeks || []), newWeek]
      if (json.monthBlocks && json.monthBlocks.length > 0) {
        if (!json.monthBlocks[0].weekNumbers) json.monthBlocks[0].weekNumbers = []
        json.monthBlocks[0].weekNumbers.push(newWeekNumber)
        if (!json.monthBlocks[0].weeks) json.monthBlocks[0].weeks = []
        json.monthBlocks[0].weeks.push(newWeekNumber)
      } else {
        test.skip(true, "Test plan has no blocks to add week to.")
      }
      return json
    })
    await page.getByRole("button", { name: "Weekly View" }).click()
    // Assuming week selection uses role button with name `Week N`
    await page.getByRole("button", { name: `Week ${newWeekNumber}` }).click()
    await expect(page.getByText(newWeekDescription)).toBeVisible()
  })

  test("Adding a block should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newBlockName = "New Test Block Added"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      const nextBlockId = (json.monthBlocks?.length || 0) + 1
      const newBlock = { id: nextBlockId, name: newBlockName, weeks: [] }
      json.monthBlocks = [...(json.monthBlocks || []), newBlock]
      return json
    })
    await page.getByRole("button", { name: "Block View" }).click()
    // Navigate or check presence (needs reliable selector for blocks)
    await expect(page.getByText(newBlockName)).toBeVisible()
  })

  test("Changing name should be visible", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newName = "Renamed Plan In Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = newName
      return json
    })
    await expect(page.getByTestId("plan-name")).toContainText(newName)
    await expect(page.getByTestId("plan-switcher-trigger")).toHaveText(newName)
  })

  test("Canceling unsaved changes should revert UI", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const tempName = "This Name Should Be Reverted"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = tempName
      return json
    })
    await expect(page.getByTestId("plan-name")).toContainText(tempName)
    await planEditHelpers.discardChanges(page)
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(page.getByText(tempName)).not.toBeVisible()
    await expect(page.getByRole("heading", { name: "Test Training Plan" })).toBeVisible()
  })

  test("Saving changes should exit edit mode and take us to the plan view page", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const savedName = "Plan To Be Saved Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = savedName
      return json
    })
    await planEditHelpers.savePlan(page)
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(page.getByRole("heading", { name: savedName })).toBeVisible()
  })

  test("Creating new plan should put us in edit mode", async ({ page }) => {
    await page.goto("/plan/edit")
    await planEditHelpers.waitForAppLoaded(page)
    await expect(page).toHaveURL(`${baseURL}/plan/edit`)
    await expectEditModeUI(page, undefined, true)
  })

  test("Saving new plan should redirect us to plan page with new ID", async ({ page }) => {
    await page.goto("/plan/edit")
    await planEditHelpers.waitForAppLoaded(page)
    await expectEditModeUI(page, undefined, true)
    const newPlanName = "Brand New Plan Saved Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = newPlanName
      if (!json.weeks) json.weeks = []
      if (!json.monthBlocks) json.monthBlocks = []
      if (!json.exerciseDefinitions) json.exerciseDefinitions = []
      if (!json.weekTypes) json.weekTypes = []
      return json
    })
    await planEditHelpers.savePlan(page)
    await page.waitForURL(new RegExp(`${baseURL}/plan/[^/]+$`))
    await expect(page).toHaveURL(new RegExp(`${baseURL}/plan/[^/]+$`))
    await expect(page).not.toHaveURL(`${baseURL}/plan/edit`)
    await expectNormalModeUI(page)
    await expect(page.getByRole("heading", { name: newPlanName })).toBeVisible()
  })
}) // End describe block
