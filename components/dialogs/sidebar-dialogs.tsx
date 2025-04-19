"use client"

import { useUIState } from "@/contexts/ui-context"
import { usePlanStore } from "@/store/plan-store"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { 
    isDeleteDialogOpen, 
    planToDelete, 
    closeDeleteDialog,
    isSwitchWarningOpen,
    planToSwitchToId,
    closeSwitchWarningDialog,
    isJsonEditorOpen,
    planToViewJson,
    closeJsonEditor
  } = useUIState()
  
  const { mode, originalPlanId, exitMode } = usePlanMode()
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      const id = planToDelete.id
      const active = usePlanStore.getState().activePlanId === id
      const editing = mode !== "normal" && originalPlanId === id
      
      if (editing) {
        exitMode()
      } else {
        try {
          localStorage.removeItem("planModeDraft_mode")
          localStorage.removeItem("planModeDraft_plan")
          localStorage.removeItem("planModeDraft_originalId")
        } catch (e) {
          console.error(e)
        }
      }
      
      if (localStorage.getItem("lastViewedPlanId") === id) {
        localStorage.removeItem("lastViewedPlanId")
      }
      
      await removeLocalPlan(id)
      closeDeleteDialog()
      
      if (active || editing) {
        window.location.href = "/"
      }
    }
  }

  const handleConfirmSwitch = () => {
    if (planToSwitchToId) {
      exitMode()
      router.push(`/plan/${planToSwitchToId}`)
      closeSwitchWarningDialog()
    }
  }

  return (
    <>
      {/* JSON Editor Dialog */}
      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={closeJsonEditor}
        plan={planToViewJson}
      />
      
      {/* Delete Plan Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{planToDelete?.name}"? This only removes it locally.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
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
            <AlertDialogCancel onClick={closeSwitchWarningDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch}
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