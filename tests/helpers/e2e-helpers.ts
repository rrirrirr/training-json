// tests/helpers/plan-edit-helpers.ts

import { Page, Locator, expect } from "@playwright/test"

/**
 * Waits for the app-loaded marker element to be visible using locator.waitFor().
 * Assumes data-testid="app-loaded" exists.
 */
export async function waitForAppLoaded(page: Page) {
  console.log("[Helper] Waiting for app loaded marker...")
  const appLoadedMarker = page.getByTestId("app-loaded")
  try {
    await appLoadedMarker.waitFor({ state: "visible", timeout: 10000 })
    console.log("[Helper] App loaded marker found.")
  } catch (error) {
    console.error("[Helper] Timeout waiting for app loaded marker:", error)
    throw new Error(`Timeout waiting for [data-testid="app-loaded"] after 15000ms.`)
  }
}

/**
 * Navigates directly to a plan's edit page.
 */
export async function goToPlanEditPage(page: Page, planId: string) {
  console.log(`[Helper] Navigating to Edit page for plan: ${planId}`)
  await page.goto(`/plan/${planId}/edit`)
  await waitForAppLoaded(page)
}

/**
 * Opens the JSON editor dialog from the plan edit view.
 * Assumes data-testid="edit-json-button" exists on the trigger button.
 */
async function openJsonEditorDialog(page: Page) {
  console.log(`[Helper] Opening JSON Editor dialog`)
  // Assumes data-testid="edit-json-button" on the button in PlanModeMenu
  const editJsonButton = page.getByTestId("edit-json-button")
  await editJsonButton.click()
  // Assumes data-testid="json-editor-textarea" on the textarea inside the dialog
  await page.getByTestId("json-editor-textarea").waitFor({ state: "visible", timeout: 5000 })
}

/**
 * Makes an unsaved change to the current plan via the JSON editor.
 * Assumes the page is already in edit mode.
 */
export async function makeUnsavedChange(page: Page, modificationFn: (currentJson: any) => any) {
  console.log("[Helper] Making unsaved change via JSON editor")
  await openJsonEditorDialog(page) // Uses testid="edit-json-button"

  // Assumes data-testid="json-editor-textarea"
  const editorTextarea = page.getByTestId("json-editor-textarea")
  const jsonContent = await editorTextarea.inputValue()
  let jsonData
  try {
    jsonData = JSON.parse(jsonContent)
  } catch (e) {
    console.error("Failed to parse JSON from editor:", e)
    throw new Error("Could not parse JSON from editor to make changes.")
  }

  const modifiedData = modificationFn(jsonData)
  const modifiedContent = JSON.stringify(modifiedData, null, 2)

  await editorTextarea.fill(modifiedContent)
  // Assumes data-testid="update-plan-button" on the button inside the JSON editor dialog
  await page.getByTestId("save-draft").click()

  // Wait for editor textarea to become hidden
  await editorTextarea.waitFor({ state: "hidden", timeout: 5000 })
}

/**
 * Performs the UI clicks to enter edit mode via the JSON editor menu
 * starting from a plan's view page (in normal mode).
 * ASSUMES the page is already displaying the target plan in NORMAL mode.
 * Uses unique data-testid attributes.
 */
export async function triggerEditViaJsonMenu(page: Page, planId: string) {
  console.log(`[Helper] Triggering edit mode via JSON menu for plan: ${planId}`)

  const actionsTrigger = page.getByTestId(`plan-actions-trigger-${planId}`)

  try {
    // Try clicking the actions trigger directly (e.g., if in sidebar)
    await actionsTrigger.click({ timeout: 1000 })
    console.log("[Helper] Clicked actions trigger directly.")
  } catch (e) {
    // Fallback: Assume it's in the plan switcher dropdown
    console.log(
      "[Helper] Actions trigger not visible/clickable directly, trying switcher dropdown."
    )
    const switcherTrigger = page.getByTestId("plan-switcher-trigger")
    await switcherTrigger.click()
    // Use locator().waitFor() on the dropdown item
    const actionsTrigger = page.getByTestId(`plan-actions-trigger-${planId}`)
    await actionsTrigger.waitFor({ state: "visible", timeout: 5000 })
    await actionsTrigger.click()
  }

  // Click the menu item using its specific testid
  const editJsonMenuItem = page.getByTestId(`edit-json-menu-item-${planId}`)
  await editJsonMenuItem.click()

  // Click the button within the JSON editor dialog
  // Assumes data-testid="update-plan-button"
  await page.getByTestId("save-draft").click()
}

/**
 * Clicks the Discard button and confirms the action in the dialog.
 * Assumes data-testid="discard-button", data-testid="discard-warning-dialog",
 * and data-testid="confirm-discard-button".
 */
export async function discardChanges(page: Page) {
  console.log("[Helper] Discarding changes")
  await page.getByTestId("discard-button").click()
  const discardDialog = page.getByTestId("discard-warning-dialog")
  await discardDialog.waitFor({ state: "visible", timeout: 5000 })
  await page.getByTestId("confirm-discard-button").click()
  await discardDialog.waitFor({ state: "hidden", timeout: 5000 })
}

/**
 * Clicks the Save button (works for 'Save Plan' or 'Save to My Plans').
 * Assumes data-testid="save-button".
 */
export async function savePlan(page: Page) {
  console.log("[Helper] Clicking save button")
  const saveButton = page.getByTestId("save-button")
  // await saveButton.waitFor({ state: "visible", timeout: 10000 })
  await expect(saveButton, "Save button should be enabled before clicking").toBeEnabled({
    timeout: 5000,
  })
  await saveButton.click()
  // await page.waitForLoadState("networkidle", { timeout: 10000 })
}

/**
 * Navigates to a specific plan's view page.
 */
export async function goToPlanPage(page: Page, planId: string) {
  console.log(`[Helper] Navigating to plan page: ${planId}`)
  await page.goto(`/plan/${planId}`)
  await waitForAppLoaded(page)
}

/**
 * Navigates to the home page.
 */
export async function goToHomePage(page: Page) {
  console.log("[Helper] Navigating to home page")
  await page.goto("/")
  await waitForAppLoaded(page)
}

/**
 * Switches plans using the Plan Switcher UI.
 * Assumes unique data-testid attributes for plan items and the main trigger.
 */
export async function switchPlanViaSwitcher(page: Page, targetPlanTestId: string) {
  console.log(`[Helper] Switching plan to ${targetPlanTestId}`)
  // Assumes data-testid="plan-switcher-trigger" on the button opening the dropdown
  const switcherTrigger = page.getByTestId("plan-switcher-trigger")
  await switcherTrigger.click()
  // Use locator().waitFor() for the target item
  const targetPlanItemLocator = page.getByTestId(targetPlanTestId)
  await targetPlanItemLocator.waitFor({ state: "visible", timeout: 5000 })
  // Assuming the link is inside the item, adjust if the item itself is the link
  // Assumes data-testid={`plan-link-${planId}`} on the link inside the item
  const targetPlanLink = targetPlanItemLocator.locator(`[data-testid^="plan-link-"]`) // More general link selector within item
  await targetPlanLink.click()

  // Handle potential discard warning
  // Assumes data-testid="confirm-switch-button" on the confirmation button
  const discardButton = page.getByTestId("confirm-switch-button")
  if (await discardButton.isVisible({ timeout: 2000 })) {
    console.log("[Helper] Discard dialog detected, confirming switch.")
    await discardButton.click()
  }
}

/**
 * Ensures a specific plan is loaded and treated as "owned" in the application state
 * by navigating to it (forcing view mode if needed) and clicking "Save to My Plans".
 * Intended as a SETUP UTILITY. Assumes data-testid="save-button".
 */
export async function loadPlanToStore(page: Page, planId: string) {
  console.log(`[Helper] Ensuring plan ${planId} is loaded to store (via UI save).`)
  await page.goto(`/plan/${planId}`)
  await waitForAppLoaded(page)

  const saveButton = page.getByTestId("save-button")
  // Use isVisible which includes waiting
  if (await saveButton.isVisible({ timeout: 5000 })) {
    console.log(`[Helper] Plan ${planId} loaded in view mode. Clicking 'Save to My Plans'.`)
    await savePlan(page) // This helper already waits and clicks
    await waitForAppLoaded(page) // Re-wait after potential state change/navigation
    console.log(`[Helper] Plan ${planId} should now be in normal mode.`)
  } else {
    console.log(`[Helper] Plan ${planId} already loaded in normal mode.`)
  }
}
