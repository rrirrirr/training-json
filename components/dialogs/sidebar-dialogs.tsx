/* File: /components/dialogs/sidebar-dialogs.tsx */
"use client"

import { useUIState } from "@/contexts/ui-context"
import { usePlanStore } from "@/store/plan-store"
import { usePlanMode } from "@/contexts/plan-mode-context"
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
    closeSwitchWarningDialog,
    isJsonEditorOpen,
    planToViewJson,
    closeJsonEditor,
  } = useUIState()

  const { mode, originalPlanId, exitMode } = usePlanMode()
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

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
      const success = await removeLocalPlan(id)
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

  const handleConfirmSwitch = () => {
    if (planToSwitchToId) {
      // Ensure edit mode is exited cleanly before switching
      if (mode === "edit") {
        exitMode({ navigateTo: false }) // Exit mode state without navigating
      }
      console.log("[SidebarDialogs] Switching plan via router.push to:", planToSwitchToId)
      router.push(planToSwitchToId) // Use router.push
      closeSwitchWarningDialog()
    }
  }

  return (
    <>
      {/* JSON Editor Dialog */}
      <JsonEditor isOpen={isJsonEditorOpen} onClose={closeJsonEditor} plan={planToViewJson} />

      {/* Delete Plan Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{planToDelete?.name}"? This action cannot be undone.
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
            <AlertDialogCancel onClick={closeSwitchWarningDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch} // Triggers navigation via router.push
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
