"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import PlanViewer from "@/components/plan-viewer"
import { usePlanMode } from "@/contexts/plan-mode-context"

export default function PlanEditPage() {
  const router = useRouter()
  const { mode, draftPlan, originalPlanId } = usePlanMode()
  
  // Use a ref to track mounted state to avoid state updates during unmount
  const isMounted = useRef(true)
  
  // State to control when to show content
  const [isLoading, setIsLoading] = useState(true)
  
  // Setup effect with consistent hook calls
  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true
    
    console.log("[PlanEditPage] Initial state:", { 
      mode, 
      hasDraftPlan: !!draftPlan, 
      hasOriginalId: !!originalPlanId
    })
    
    // Special case: original plan ID exists, redirect to specific edit URL
    if (mode === "edit" && draftPlan && originalPlanId) {
      console.log(`[PlanEditPage] Redirecting to specific edit URL: /plan/${originalPlanId}/edit`)
      router.replace(`/plan/${originalPlanId}/edit`)
      return
    }
    
    // Check if we can show the editor
    if (mode === "edit" && draftPlan) {
      console.log("[PlanEditPage] Valid edit mode, showing editor after short delay")
      // Small delay to ensure state is stable
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }, 50)
      
      return () => {
        clearTimeout(timer)
      }
    } else {
      // Invalid state, redirect to home
      console.log("[PlanEditPage] Invalid state, redirecting to home")
      router.replace("/")
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false
    }
  }, [mode, draftPlan, originalPlanId, router])
  
  // Always render the same structure, only change what's inside
  return (
    <>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      ) : (
        <PlanViewer planId="edit-mode-draft" />
      )}
    </>
  )
}