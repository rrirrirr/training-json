"use client"

import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"

interface EditButtonProps {
  planId: string
  className?: string
}

export function EditButton({ planId, className }: EditButtonProps) {
  const router = useRouter()
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById)

  const handleEditClick = async () => {
    // Instead of directly calling enterEditMode, we'll navigate to the edit page
    // The PlanPageHandler will handle loading the plan and setting the mode
    router.push(`/plan/${planId}/edit`)
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