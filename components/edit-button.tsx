"use client"

import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"

interface EditButtonProps {
  planId: string
  className?: string
}

export function EditButton({ planId, className }: EditButtonProps) {
  const { enterEditMode } = usePlanMode()
  const getPlanById = usePlanStore((state) => state.getPlanById)

  const handleEditClick = async () => {
    const plan = await getPlanById(planId)
    if (plan) {
      enterEditMode(plan, planId)
    }
  }

  return (
    <Button 
      onClick={handleEditClick} 
      className={className}
      variant="outline"
      size="sm"
      data-testid="edit-button"
    >
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  )
}
