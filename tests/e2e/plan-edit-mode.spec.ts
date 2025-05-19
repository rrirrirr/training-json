// tests/e2e/local-plan-edit-mode.spec.ts
import { test, expect, Page } from "@playwright/test"
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
  // await planEditHelpers.loadPlanToStore(page, TEST_PLAN_ID)
  // await planEditHelpers.loadPlanToStore(page, OTHER_PLAN_ID)
  // Go back home to start tests from a consistent place
  // await planEditHelpers.goToHomePage(page)

  await planEditHelpers.setupLocalStorageWithPlans(page, TEST_PLAN_ID, OTHER_PLAN_ID)
  await page.reload()
  await planEditHelpers.waitForAppLoaded(page)
})

test.describe("Plan Edit Mode with Local Database (using testid)", () => {
  test("entering edit mode for plan via JSON editor menu from plan page", async ({ page }) => {
    // Setup: Go to the owned plan page
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID)
    await expectNormalModeUI(page) // Verify normal mode

    // Action: Use the trigger helper
    await planEditHelpers.triggerEditViaJsonMenu(page, TEST_PLAN_ID)

    // Assertions
    const expectedEditUrl = `${baseURL}/plan/${TEST_PLAN_ID}/edit`
    await page.waitForURL(expectedEditUrl)
    await expect(page).toHaveURL(expectedEditUrl)
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

  test("entering edit mode for plan via JSON editor menu from / while in edit mode", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    // we might have to make changes
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = "Discard Test Name"
      return json
    })

    // Setup: Already on home page via beforeEach, plans are loaded to store
    await planEditHelpers.goToHomePage(page) // Ensure we are at '/'

    // Action: Use the trigger helper (it finds the plan in the switcher)
    await planEditHelpers.triggerEditViaJsonMenu(page, TEST_PLAN_ID)

    // Assertions
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Discard Test Name")
  })

  // make sure this workse later
  test("entering edit mode for plan via JSON editor menu from / while in edit mode for another should show warning", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    // we might have to make changes
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = "Discard Test Name"
      return json
    })

    // Setup: Already on home page via beforeEach, plans are loaded to store
    await planEditHelpers.goToHomePage(page) // Ensure we are at '/'

    // Action: Use the trigger helper (it finds the plan in the switcher)
    await planEditHelpers.triggerEditViaJsonMenu(page, OTHER_PLAN_ID)

    await expect(page.getByRole("button", { name: "Discard & switch" })).toBeVisible()

    await page.getByRole("button", { name: "Cancel" }).click()

    await expect(page).toHaveURL(`${baseURL}/`)
  })

  test("entering edit mode for plan via URL", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Test Training Plan")
  })

  test("Exiting edit mode correctly via discard button with no changes", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await page.getByTestId("discard-button").click()
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
    await expect(page.getByText("Test Training Plan")).toBeVisible()
  })

  test("Exiting edit mode via plan switching should show warning dialog and take us to the correct plan", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")

    // Use testids for switching
    await planEditHelpers.switchPlanViaSwitcher(page, OTHER_PLAN_ID)

    await expect(page.getByRole("alertdialog", { name: "Discard unsaved changes?" })).toBeVisible()
    const discardButton = page.getByRole("button", { name: "Discard & switch" })
    if (await discardButton.isVisible({ timeout: 2000 })) {
      console.log("[Helper] Discard dialog detected, confirming switch.")
      await discardButton.click()
    }

    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(page.getByText("Other Training Plan")).toBeVisible()
  })

  test("Going from an edit page to / should show unsaved changes indicator", async ({ page }) => {
    // dont delete. we will implement this later
    // await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    // const modifiedName = "Modified Plan Name On Home"
    // await planEditHelpers.makeUnsavedChange(page, (json) => {
    //   json.metadata.planName = modifiedName
    //   return json
    // })
    // await planEditHelpers.goToHomePage(page)
    // // Assuming switcher trigger shows current (unsaved) name
    // await expect(page.getByTestId("plan-switcher-trigger")).toHaveText(modifiedName)
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible()
    // Assert alert/warning dialog...
  })

  test("Entering a plan that has unsaved changes via sidebar should take us to edit page", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const modifiedName = "Unsaved Plan Switcher Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = modifiedName
      return json
    })

    await planEditHelpers.goToHomePage(page)

    // Switch back using testids
    const targetPlanLink = page.getByTestId(`plan-link-${TEST_PLAN_ID}`)
    await targetPlanLink.click()

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

    await planEditHelpers.goToHomePage(page)
    await planEditHelpers.goToPlanPage(page, TEST_PLAN_ID) // Navigate back via view URL

    await expect(page).toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}/edit`) // Should redirect
    await expectEditModeUI(page, modifiedName)
    // await expect(page.getByTestId("unsaved-changes-indicator")).toBeVisible();
  })

  test("Entering another plan's edit page via url when we have unsaved changes should show conflict dialog (click discard)", async ({
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
    // await expect(page.getByRole("dialog", { name: /Edit Conflict/i })).toBeVisible()
    await expect(page.getByRole("alertdialog", { name: "Discard unsaved changes?" })).toBeVisible()
    const discardButton = page.getByRole("button", { name: "Discard & switch" })
    await expect(discardButton).toBeVisible()
    await discardButton.click()

    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}/edit`)
    await expectEditModeUI(page, "Other Training Plan")
  })

  test("Entering another plan's edit page via url when we have unsaved changes should show conflict dialog (click cancel)", async ({
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
    await expect(page.getByRole("alertdialog", { name: "Discard unsaved changes?" })).toBeVisible()
    const cancel = page.getByRole("button", { name: "Cancel" })
    await cancel.click()

    await expect(page).toHaveURL(`${baseURL}/`)
  })

  // NOT IMPLEMENTED
  test("Clicking another plan in sidebar when we have unsaved changes should show conflict dialog", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const unsavedName = "First Plan Unsaved Conflict"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = unsavedName
      return json
    })
    await planEditHelpers.goToHomePage(page)
    const targetPlanLink = page.getByTestId(`plan-link-${OTHER_PLAN_ID}`)
    await targetPlanLink.click()

    // Assert dialog appears
    await expect(page.getByRole("alertdialog", { name: "Discard unsaved changes?" })).toBeVisible()
  })

  test("Switching between blocks and week view in edit mode should work (starting from weekly)", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")

    const blockViewButton = page.getByRole("button", { name: "Block View" })
    const weeklyViewButton = page.getByRole("button", { name: "Weekly View" })
    const blockViewContainer = page.getByTestId("block-view-container")
    const weekViewContainer = page.getByTestId("week-view-container")

    console.log("Verifying initial state (Weekly View Active)...")

    await expect(weekViewContainer).toBeVisible()
    await expect(blockViewContainer).not.toBeVisible()

    console.log("Clicking Block View button...")
    await blockViewButton.click()

    console.log("Verifying state after clicking Block View...")
    await expect(blockViewContainer).toBeVisible()
    await expect(weekViewContainer).not.toBeVisible()

    console.log("Clicking Weekly View button...")
    await weeklyViewButton.click()

    console.log("Verifying state after clicking Weekly View again...")
    await expect(weekViewContainer).toBeVisible()
    await expect(blockViewContainer).not.toBeVisible()
  })

  test("We should see all weeks in edit mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await page.getByRole("button", { name: "Weekly View" }).click()

    await expect(page.getByText("Week 1")).toBeVisible()
  })

  test("We should see all blocks in edit mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    await expectEditModeUI(page, "Test Training Plan")
    await page.getByRole("button", { name: "Block View" }).click()

    await expect(page.getByText("First Block")).toBeVisible()
  })

  test("Changes to weeks should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newDescription = "Modified Week Type"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      if (!json.weeks || json.weeks.length === 0) test.skip(true, "Test plan has no weeks.")
      json.weeks[0].weekType = newDescription
      return json
    })
    await page.getByRole("button", { name: "Weekly View" }).click()
    await expect(page.getByText(newDescription).first()).toBeVisible()
  })

  test("Changes to blocks should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newBlockName = "Updated Block Name In Test"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      if (!json.blocks || json.blocks.length === 0) test.skip(true, "Test plan has no blocks.")
      json.blocks[0].name = newBlockName
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
      if (json.blocks && json.blocks.length > 0) {
        if (!json.blocks[0].weekNumbers) json.blocks[0].weekNumbers = []
        json.blocks[0].weekNumbers.push(newWeekNumber)
        if (!json.blocks[0].weeks) json.blocks[0].weeks = []
        json.blocks[0].weeks.push(newWeekNumber)
      } else {
        test.skip(true, "Test plan has no blocks to add week to.")
      }
      return json
    })
    await page.getByRole("button", { name: "Weekly View" }).click()
    // Assuming week selection uses role button with name `Week N`
    await page.getByRole("button", { name: `${newWeekNumber}` }).click()
    await expect(page.getByRole("heading", { name: `Week ${newWeekNumber}` })).toBeVisible()
  })

  test("Adding a block should be visible in update mode", async ({ page }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)
    const newBlockName = "New Test Block Added"
    await planEditHelpers.makeUnsavedChange(page, (json) => {
      const nextBlockId = (json.blocks?.length || 0) + 1
      const newBlock = { id: nextBlockId, name: newBlockName, weeks: [] }
      json.blocks = [...(json.blocks || []), newBlock]
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
    await expect(page.getByText("Test Training Plan")).toBeVisible()
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
    await expect(page).not.toHaveURL(`${baseURL}/plan/${TEST_PLAN_ID}`)
    await expectNormalModeUI(page)
    await expect(
      page.getByTestId("plan-switcher-trigger").filter({ hasText: savedName })
    ).toBeVisible({ timeout: 5000 })
  })

  test("Creating new plan should put us in edit mode and then create a new ID", async ({
    page,
  }) => {
    const data = {
      metadata: {
        planName: "The New Plan ", // Consider trimming whitespace if unintentional
        creationDate: "2023-01-01T00:00:00.000Z",
      },
      weekTypes: [{ id: 1, name: "Regular", colorName: "blue" }],
      exerciseDefinitions: [{ id: "ex1", name: "Squat", category: "Legs" }],
      weeks: [{ weekNumber: 1, weekType: "Regular", weekTypeIds: [1], sessions: [] }],
      blocks: [{ id: 1, name: "First Block", weekNumbers: [1] }],
    }

    const jsonDataString = JSON.stringify(data)

    // click new plan
    await page.getByRole("button", { name: "Create AI-Powered Plan" }).click()
    await page.getByRole("button", { name: "Open JSON Uploader & Import" }).click()
    const textArea = page.getByRole("textbox", { name: "Paste your JSON data here..." })

    await textArea.fill(jsonDataString)

    await page.getByRole("button", { name: "View Plan" }).click()

    await expect(page).toHaveURL(`${baseURL}/plan/edit`) // Allow optional subpaths on edit? Or be more strict?
    await expectEditModeUI(page, "The New Plan ", true) // Pass expected plan name

    // Save the plan
    await page.getByRole("button", { name: "Save Plan" }).click()

    // Wait for navigation to the final plan URL (which now has a real ID)
    const finalPlanUrlRegex = new RegExp(`${baseURL}/plan/[^/]+$`) // Regex to match /plan/ followed by some ID
    await page.waitForURL(finalPlanUrlRegex)

    // Assert the final state
    await expect(page).toHaveURL(finalPlanUrlRegex) // Check it matches the pattern
    await expect(page).not.toHaveURL(new RegExp(`${baseURL}/plan/edit(/.*)?$`)) // Ensure '/edit' is gone
    await expectNormalModeUI(page) // Check UI is back to normal mode
  })

  test("Deleting a plan that has unsaved changes and is in edit mode should remove unsaved changes and put us out of edit mode", async ({
    page,
  }) => {
    await planEditHelpers.goToPlanEditPage(page, TEST_PLAN_ID)

    await planEditHelpers.makeUnsavedChange(page, (json) => {
      json.metadata.planName = "Some Unsaved Changes"
      return json
    })

    await expectEditModeUI(page, "Some Unsaved Changes")

    await planEditHelpers.goToHomePage(page)

    await planEditHelpers.deletePlan(page, TEST_PLAN_ID)

    await page.getByRole("button", { name: "Delete" }).click()

    await expect(page).toHaveURL(`${baseURL}/`)

    await page.getByTestId(`plan-link-${OTHER_PLAN_ID}`).click()

    await expect(page).toHaveURL(`${baseURL}/plan/${OTHER_PLAN_ID}`)

    await expectNormalModeUI(page)
  })
})
