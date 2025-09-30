"use client"

import { useUIState } from "@/contexts/ui-context"
import { usePlanStore } from "@/store/plan-store"
import JsonEditor from "@/components/json-editor"
import { DeletePlanDialog } from "@/components/dialogs/delete-plan-dialog"

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
      <DeletePlanDialog
        isOpen={isPlanActionDialogOpen}
        onClose={closePlanActionDialog}
        onConfirm={handleConfirmDelete}
        planName={planActionTarget?.metadata?.planName || planActionTarget?.name}
        title="Delete JSON Plan"
      />
    )
  }

  // Fallback for when no plan is selected
  return null
}
