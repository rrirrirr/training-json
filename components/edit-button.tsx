"use client"

import { Button } from "@/components/ui/button"
import { Edit, Loader2 } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface EditButtonProps {
  planId: string
  className?: string
}

export function EditButton({ planId, className }: EditButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get the startEditingPlan function from the store
  const startEditingPlan = usePlanStore((state) => state.startEditingPlan)

  const handleEditClick = async () => {
    if (!planId) return
    
    setIsLoading(true)
    try {
      // Use the centralized function to handle the edit logic
      const success = await startEditingPlan(planId)
      
      if (success) {
        // If successful, navigate to the edit page
        router.push(`/plan/${planId}/edit`)
      } else {
        // If there was an error (like a conflict), show a toast
        const storeError = usePlanStore.getState().error
        toast({
          title: "Could not edit plan",
          description: storeError || "An error occurred while trying to edit the plan.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[EditButton] Error starting edit mode:", error)
      toast({
        title: "Edit Error",
        description: "Could not start editing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleEditClick} 
      className={className}
      variant="outline"
      size="sm"
      data-testid="edit-button"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </>
      )}
    </Button>
  )
}