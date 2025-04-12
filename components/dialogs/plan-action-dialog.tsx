"use client"

import { useUIState } from "@/contexts/ui-context"
import { usePlanStore } from "@/store/plan-store"
import JsonEditor from "@/components/json-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function PlanActionDialog() {
  const { isPlanActionDialogOpen, planActionType, planActionTarget, closePlanActionDialog } = useUIState()
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  // Function to handle deletion
  const handleConfirmDelete = () => {
    if (planActionTarget?.id && typeof removeLocalPlan === "function") {
      removeLocalPlan(planActionTarget.id)
    }
    closePlanActionDialog()
  }

  // If it's an edit dialog, render the JSON editor
  if (planActionType === 'edit' && planActionTarget) {
    return (
      <JsonEditor
        isOpen={isPlanActionDialogOpen} 
        onClose={closePlanActionDialog}
        plan={planActionTarget}
      />
    )
  }

  // If it's a delete dialog
  if (planActionType === 'delete' && planActionTarget) {
    return (
      <Dialog open={isPlanActionDialogOpen} onOpenChange={(open) => !open && closePlanActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete JSON Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {planActionTarget?.metadata?.planName || planActionTarget?.name || "this plan"}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePlanActionDialog}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Fallback for when no plan is selected
  return null
}