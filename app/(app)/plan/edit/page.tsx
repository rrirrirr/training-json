"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import PlanViewer from "@/components/plan-viewer"
import { usePlanMode } from "@/contexts/plan-mode-context"

export default function PlanEditPage() {
  const router = useRouter()
  const { mode, draftPlan, originalPlanId } = usePlanMode()

  // On mount, check if we should redirect to the new URL format
  useEffect(() => {
    // If we have an originalPlanId, redirect to the new URL format
    if (mode === "edit" && draftPlan && originalPlanId) {
      console.log(`[PlanEditPage] Redirecting to new URL format: /plan/${originalPlanId}/edit`)
      router.replace(`/plan/${originalPlanId}/edit`)
      return
    }

    // If we're not in edit mode or don't have a draft plan, redirect to home
    if (mode !== "edit" || !draftPlan) {
      console.log("[PlanEditPage] Invalid state detected, redirecting:", { mode, hasDraftPlan: !!draftPlan })
      router.replace("/")
    }
  }, [mode, draftPlan, originalPlanId, router])

  // While checking mode or if the draftPlan is loading, show loading state
  if (mode !== "edit" || !draftPlan) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // PlanViewer is responsible for rendering the editor UI, 
  // and the PlanModeMenu will be shown automatically when in edit mode
  return <PlanViewer planId="edit-mode-draft" />
}