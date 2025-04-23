"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

/**
 * Component to show a success toast when a plan is saved
 * 
 * This is a helper component that adds a data-testid for testing
 */
export function SavedPlanToast({ planName }: { planName: string }) {
  const { toast } = useToast()

  useEffect(() => {
    toast({
      title: "Plan Saved",
      description: (
        <div data-testid="saved-notification">
          {planName || "Plan"} saved successfully!
        </div>
      ),
      duration: 3000,
    })
  }, [planName, toast])

  return null
}
