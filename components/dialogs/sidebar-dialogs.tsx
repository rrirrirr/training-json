/* File: /components/dialogs/sidebar-dialogs.tsx */
"use client"

import { useCallback } from "react"
import { useUIState } from "@/contexts/ui-context"
import { usePlanStore, type PlanData } from "@/store/plan-store" // Ensure PlanData is correctly typed if needed
import { useRouter } from "next/navigation" // Import useRouter
import JsonEditor from "@/components/json-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"

export function SidebarDialogs() {
  const router = useRouter() // Get router instance
  const {
    isDeleteDialogOpen,
    planToDelete,
    closeDeleteDialog,
    isSwitchWarningOpen,
    planToSwitchToId,
    isSwitchToEditMode,
    closeSwitchWarningDialog,
    openSwitchWarningDialog,
    isJsonEditorOpen,
    planToViewJson,
    closeJsonEditor,
  } = useUIState()

  const mode = usePlanStore((state) => state.mode)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const exitMode = usePlanStore((state) => state.exitMode)
  const loadPlanAndSetMode = usePlanStore((state) => state.loadPlanAndSetMode)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)
  const updateDraftPlan = usePlanStore((state) => state.updateDraftPlan)
  const _setModeState = usePlanStore((state) => state._setModeState)

  // New callback for JsonEditor's onUnsavedChange prop
  const handleJsonEditorUnsavedChange = useCallback((hasChanges: boolean) => {
    const currentStore = usePlanStore.getState();
    // Only update if in edit mode and the status actually needs changing
    if (currentStore.mode === 'edit' && currentStore.hasUnsavedChanges !== hasChanges) {
      console.log(`[SidebarDialogs] JsonEditor hasChanges: ${hasChanges}. Updating store.`);
      // Use the existing _setModeState to update the hasUnsavedChanges flag
      currentStore._setModeState(
        currentStore.mode,
        currentStore.draftPlan, // Keep current draftPlan
        currentStore.originalPlanId,
        hasChanges // Update the unsaved flag
      );
    }
  }, []);

  // New callback for JsonEditor's onSave prop
  const handleEditorSave = useCallback(
    async (updatedData: PlanData): Promise<boolean> => {
      console.log("[SidebarDialogs] handleEditorSave called")
      const currentStore = usePlanStore.getState()
      const currentMode = currentStore.mode
      const currentOriginalId = currentStore.originalPlanId
      const hasUnsavedChanges = currentStore.hasUnsavedChanges
      const planId = planToViewJson?.id

      if (!planId) {
        console.error("[SidebarDialogs] Cannot save, plan ID missing.")
        return false
      }

      console.log(`[SidebarDialogs] Current URL: ${window.location.pathname}`)
      console.log(`[SidebarDialogs] Current mode: ${currentMode}`)
      console.log(`[SidebarDialogs] Current originalId: ${currentOriginalId}`)
      console.log(`[SidebarDialogs] Target planId: ${planId}`)
      console.log(`[SidebarDialogs] Has unsaved changes: ${hasUnsavedChanges}`)

      try {
        // Check if we're in edit mode with unsaved changes and trying to edit a different plan
        if (currentMode === "edit" && hasUnsavedChanges && currentOriginalId !== planId) {
          console.log("[SidebarDialogs] Showing switch warning dialog for plan:", planId)

          // Close the JSON editor first
          closeJsonEditor()

          // Then open the switch warning dialog
          openSwitchWarningDialog(planId)

          return true // Consider this a "success" from the dialog's perspective
        }

        const targetUrl = `/plan/${planId}/edit`

        if (currentMode === "edit" && currentOriginalId === planId) {
          // We're already editing this plan, just update the draft
          console.log("[SidebarDialogs] Updating draft plan in store")
          updateDraftPlan(updatedData)

          // Always navigate even if we're conceptually already on the right page
          // This handles the case where we navigated away from the edit page
          console.log(`[SidebarDialogs] Navigating to ${targetUrl} (same plan)`)
          router.push(targetUrl)
        } else if (currentMode === "edit" && currentOriginalId !== planId && !hasUnsavedChanges) {
          // We're editing a different plan but don't have unsaved changes
          console.log("[SidebarDialogs] Exiting edit mode for current plan before editing new plan")

          // Exit current edit mode without navigation
          exitMode({ navigateTo: false })

          // Now set mode for the new plan
          console.log("[SidebarDialogs] Entering edit mode for new plan")
          _setModeState("edit", updatedData, planId.toString(), true)

          // Navigate to the new plan's edit page
          console.log(`[SidebarDialogs] Navigating to ${targetUrl} (different plan)`)
          router.push(targetUrl)
        } else {
          // Normal case - not in edit mode, just entering edit mode for this plan
          console.log("[SidebarDialogs] Entering edit mode via editor save")

          // Set the mode state first
          _setModeState("edit", updatedData, planId.toString(), true)

          // Navigate to the edit page
          console.log(`[SidebarDialogs] Navigating to ${targetUrl} (new edit)`)
          router.push(targetUrl)
        }
      } catch (error) {
        console.error("[SidebarDialogs] Error saving from editor:", error)
        return false // Indicate failure
      }
    },
    [
      planToViewJson,
      updateDraftPlan,
      _setModeState,
      router,
      exitMode,
      closeJsonEditor,
      openSwitchWarningDialog,
    ]
  )

  // Make the handler async
  const handleConfirmDelete = async () => {
    if (planToDelete) {
      const id = planToDelete.id
      // Check if the plan being deleted is the one currently viewed/edited
      const isActiveOrEditing =
        usePlanStore.getState().activePlanId === id || (mode !== "normal" && originalPlanId === id)

      if (mode !== "normal" && originalPlanId === id) {
        console.log("[SidebarDialogs] Exiting mode before deleting editing plan:", id)
        exitMode({ navigateTo: false }) // Exit mode without navigating yet
      } else {
        // Ensure any draft state related to non-editing modes is cleared if necessary
        // (this might be redundant if exitMode already handles this based on mode)
        try {
          localStorage.removeItem("planModeDraft_mode")
          localStorage.removeItem("planModeDraft_plan")
          localStorage.removeItem("planModeDraft_originalId")
        } catch (e) {
          console.error("Error clearing draft keys during delete:", e)
        }
      }

      // Wait for the plan to be removed from the store
      console.log("[SidebarDialogs] Awaiting removeLocalPlan for:", id)
      // Ensure id is passed as string if expected by removeLocalPlan
      const success = await removeLocalPlan(id.toString())
      console.log("[SidebarDialogs] removeLocalPlan completed, success:", success)

      // Close the dialog regardless of success, as the item is gone locally
      closeDeleteDialog()

      // If the deleted plan was the one being viewed/edited, navigate home
      if (isActiveOrEditing && success) {
        console.log("[SidebarDialogs] Deleted plan was active/editing, navigating to /")
        router.push("/") // Use router.push for client-side navigation
      } else if (!success) {
        console.error("[SidebarDialogs] Failed to remove plan from store state for ID:", id)
        // Optionally show an error toast to the user here
      } else {
        console.log("[SidebarDialogs] Deleted plan was not active/editing, no navigation needed.")
        // Consider forcing a metadata refresh if the current page relies on the list
        // usePlanStore.getState().fetchPlanMetadata(true);
      }
    } else {
      console.warn("[SidebarDialogs] handleConfirmDelete called with no planToDelete.")
      closeDeleteDialog() // Close dialog even if something went wrong
    }
  }
  const handleConfirmSwitch = async () => {
    if (planToSwitchToId) {
      try {
        console.log(`[SidebarDialogs] handleConfirmSwitch for plan: ${planToSwitchToId}`)

        // Check if planToSwitchToId already contains 'plan/' prefix and remove it
        const planId = planToSwitchToId.startsWith("/plan/")
          ? planToSwitchToId.substring(6) // Remove '/plan/' prefix
          : planToSwitchToId.startsWith("plan/")
            ? planToSwitchToId.substring(5) // Remove 'plan/' prefix
            : planToSwitchToId

        console.log(`[SidebarDialogs] Original planToSwitchToId: ${planToSwitchToId}`)
        console.log(`[SidebarDialogs] Cleaned planId: ${planId}`)

        // First exit any current edit mode
        if (mode === "edit") {
          console.log(`[SidebarDialogs] Exiting current edit mode...`)
          exitMode({ navigateTo: false })
        }
        
        // Close the dialog
        closeSwitchWarningDialog()
        
        // Determine the target URL and perform a full page reload
        const targetUrl = isSwitchToEditMode ? `/plan/${planId}/edit` : `/plan/${planId}`
        console.log(`[SidebarDialogs] Hard reloading page to: ${targetUrl}`)
        
        // Use window.location.href for a full page reload 
        // This is more reliable than router.push for complex state changes
        window.location.href = targetUrl
      } catch (error) {
        console.error(`[SidebarDialogs] Error in handleConfirmSwitch:`, error)
      }
    }
  }
  return (
    <>
      {/* JSON Editor Dialog */}
      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={closeJsonEditor}
        plan={planToViewJson} // Pass the plan data to the editor
        onSave={handleEditorSave} // Pass the save handler
        onUnsavedChange={handleJsonEditorUnsavedChange} // Add the onUnsavedChange handler
      />

      {/* Delete Plan Dialog */}
      {/* Add the missing Dialog wrapper with open state and close handler */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              {/* Use optional chaining for safety */}
              Are you sure you want to remove "{planToDelete?.name ?? "this plan"}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            {/* Button triggers the async handler */}
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Warning Dialog */}
      <AlertDialog
        open={isSwitchWarningOpen}
        onOpenChange={(open) => !open && closeSwitchWarningDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You're currently editing a plan. Switching will discard unsaved changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                closeSwitchWarningDialog()
                // Navigate home when Cancel is clicked, as expected by the test
                // Use window.location.href for a full page reload
                window.location.href = "/"
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch} // Now uses window.location.href for reliable reload
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard & switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
