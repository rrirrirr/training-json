"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react" // Keep loader import if PlanViewer doesn't import it
import PlanViewer from "@/components/plan-viewer"
import { usePlanMode } from "@/contexts/plan-mode-context"

export default function PlanEditPage() {
  const router = useRouter()
  const { mode, draftPlan, originalPlanId } = usePlanMode()
  const isMounted = useRef(true)
  // State to control when the viewer is ready to display content
  const [isReadyToShowViewer, setIsReadyToShowViewer] = useState(false)

  useEffect(() => {
    isMounted.current = true
    console.log("[PlanEditPage] Initial state:", {
      mode,
      hasDraftPlan: !!draftPlan,
      hasOriginalId: !!originalPlanId,
    })

    // Redirect existing plan edits immediately
    if (mode === "edit" && draftPlan && originalPlanId) {
      console.log(`[PlanEditPage] Redirecting to specific edit URL: /plan/${originalPlanId}/edit`)
      router.replace(`/plan/${originalPlanId}/edit`)
      return // Exit useEffect early
    }

    // Handle the case for /plan/edit (new plan edit)
    if (mode === "edit" && draftPlan && !originalPlanId) {
      // Valid state for NEW plan edit at /plan/edit
      console.log("[PlanEditPage] Valid new plan edit mode, preparing viewer.")
      // Set viewer ready after a minimal delay to ensure state consistency
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setIsReadyToShowViewer(true)
        }
      }, 50) // Adjust delay if needed
      return () => clearTimeout(timer) // Cleanup timer
    }

    // If state is invalid for this page (e.g., not in edit mode, no draft), redirect
    console.log("[PlanEditPage] Invalid state for /plan/edit, redirecting to home.")
    if (isMounted.current) {
      // Prevent updates on unmounted component
      router.replace("/")
    }

    // Cleanup ref on unmount
    return () => {
      isMounted.current = false
    }
  }, [mode, draftPlan, originalPlanId, router])

  // Render PlanViewer unconditionally, passing the loading state
  // PlanViewer must be updated to handle this isLoading prop internally
  return (
    <PlanViewer
      planId="edit-mode-draft" // ID for new drafts
      isLoading={!isReadyToShowViewer} // Pass the loading state down
    />
  )
}
