// File: components/plan-mode-menu.tsx
import React, { useState } from "react"
import { usePlanStore } from "@/store/plan-store"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Edit, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { SavedPlanToast } from "@/components/saved-plan-toast"
import { useRouter } from "next/navigation"
import { useUIState } from "@/contexts/ui-context" // Import useUIState from UIContext

export function PlanModeMenu() {
  const router = useRouter()
  const { openJsonEditor } = useUIState() // Use the UIContext's openJsonEditor function

  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const hasUnsavedChanges = usePlanStore((state) => state.hasUnsavedChanges)
  const discardDraftPlan = usePlanStore((state) => state.discardDraftPlan) // Action only resets state now
  const saveDraftOrViewedPlan = usePlanStore((state) => state.saveDraftOrViewedPlan)

  const [isSaving, setIsSaving] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [savedPlanName, setSavedPlanName] = useState<string | null>(null)

  const planName = draftPlan?.metadata?.planName || "Unnamed Plan"

  // --- Event Handlers ---
  const handleSave = async () => {
    setIsSaving(true)
    setSavedPlanName(null) // Reset saved name state
    const savedId = await saveDraftOrViewedPlan() // Call store action

    if (savedId) {
      console.log("[PlanModeMenu] Save successful, ID:", savedId)
      setSavedPlanName(planName) // Set name for toast

      const targetUrl = `/plan/${savedId}`
      console.log(`[PlanModeMenu] Navigating to ${targetUrl} after save.`)
      router.replace(targetUrl) // Use replace to go to the view page

      // No need to setIsSaving(false) here, navigation will unmount/rerender
    } else {
      console.error("[PlanModeMenu] Save failed.")
      // Optionally show an error toast here
      setIsSaving(false) // Allow retry if save failed
    }
  }

  const handleBackClick = () => {
    // Get current state directly for this check
    const currentStoreState = usePlanStore.getState()
    if (currentStoreState.mode === "edit" && currentStoreState.hasUnsavedChanges) {
      setShowExitConfirm(true)
    } else {
      // Exit mode AND navigate immediately if no unsaved changes
      const targetUrl = "/"

      discardDraftPlan() // Reset state
      router.replace(targetUrl) // Navigate immediately
    }
  }

  const confirmDiscardChanges = () => {
    console.log("[PlanModeMenu] Confirming discard changes...")
    setShowExitConfirm(false)
    const planIdToNavigateTo = usePlanStore.getState().originalPlanId // Get ID before resetting

    discardDraftPlan() // Reset state via store action

    // *** Perform navigation AFTER state reset ***
    const targetUrl = planIdToNavigateTo ? `/plan/${planIdToNavigateTo}` : "/"
    console.log(`[PlanModeMenu] State reset. Navigating to: ${targetUrl}`)
    router.replace(targetUrl)
  }

  const cancelDiscardChanges = () => {
    console.log("[PlanModeMenu] Cancelling discard changes.")
    setShowExitConfirm(false)
  }

  const handleOpenJsonEditor = () => {
    if (draftPlan) {
      // Use the centralized JSON editor from UIContext
      openJsonEditor({
        id: originalPlanId || "draft-plan",
        name: draftPlan.metadata?.planName || "Draft Plan",
        data: draftPlan,
      })
    }
  }

  // --- Render Logic (remains the same) ---
  if (mode === "normal") {
    return null
  }
  const backButtonText =
    mode === "edit" ? (hasUnsavedChanges ? "Cancel Edits" : "Exit Edit Mode") : "Back"

  return (
    <>
      {/* Header Area */}
      <div
        id="plan-mode-menu-anchor"
        className={cn(
          mode === "edit"
            ? "bg-edit-mode-bg text-edit-mode-text hover:text-edit-mode-hover-text"
            : "bg-view-mode-bg text-view-mode-text hover:text-view-mode-hover-text"
        )}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
          {/* Back Button */}
          <Button
            variant="link"
            size="sm"
            onClick={handleBackClick}
            data-testid="discard-button"
            className={cn(
              "-ml-2 p-1",
              mode === "edit"
                ? "text-edit-mode-text hover:text-edit-mode-hover-text"
                : "text-view-mode-text hover:text-view-mode-hover-text"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {backButtonText}
          </Button>

          {/* Main Content Row */}
          <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Left Section: Status and Plan Name */}
            <div className="flex flex-col gap-1 min-w-0">
              <div
                className={cn(
                  "flex items-center text-sm font-oswald font-light uppercase tracking-wide",
                  mode === "edit" ? "text-edit-mode-text" : "text-view-mode-text"
                )}
              >
                {mode === "edit" ? (
                  <>
                    <Edit className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> <span>Editing Plan</span>
                  </>
                ) : (
                  <span>Viewing Plan</span> /* Or handle View mode specific icon */
                )}
                {mode === "edit" && hasUnsavedChanges && (
                  <span
                    className="ml-2 text-red-600 dark:text-red-400 font-bold flex-shrink-0"
                    title="Unsaved changes"
                  >
                    *
                  </span>
                )}
              </div>
              <h1
                className="text-xl sm:text-2xl text-foreground truncate font-oswald font-light uppercase tracking-wide"
                data-testid="plan-name"
              >
                {planName}
              </h1>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex w-full items-center justify-start gap-2 sm:w-auto flex-shrink-0">
              {mode === "edit" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenJsonEditor}
                  disabled={!draftPlan}
                  className={cn(
                    "w-full sm:w-auto",
                    "border-edit-mode-border text-edit-mode-text",
                    "hover:bg-edit-mode-hover-bg hover:text-edit-mode-hover-text"
                  )}
                >
                  <Edit className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Edit JSON</span>
                  <span className="sm:hidden">JSON</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || (mode === "edit" && !hasUnsavedChanges)}
                data-testid="save-button"
                className={cn(
                  "w-full sm:w-auto",
                  mode === "edit"
                    ? "border-edit-mode-border bg-edit-mode-bg text-edit-mode-text hover:text-edit-mode-hover-text"
                    : "border-view-mode-border bg-view-mode-bg text-view-mode-text hover:text-view-mode-hover-text"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5 sm:mr-2" />{" "}
                    <span className="hidden sm:inline">
                      {mode === "edit" ? "Save Plan" : "Save to My Plans"}
                    </span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog for Discard Confirmation */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent
          className={cn(mode === "edit" ? "border-edit-mode-border" : "")}
          data-testid="discard-warning-dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(mode === "edit" ? "text-edit-mode-text" : "")}>
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDiscardChanges}
              className={cn(mode === "edit" ? "border-edit-mode-border text-edit-mode-text" : "")}
              data-testid="cancel-button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscardChanges}
              data-testid="confirm-discard-button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* JSON Editor is now managed by UIContext */}

      {/* Saved Plan Toast Notification */}
      {savedPlanName && <SavedPlanToast planName={savedPlanName} />}
    </>
  )
}
