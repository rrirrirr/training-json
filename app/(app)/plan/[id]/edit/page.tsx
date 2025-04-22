"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import PlanViewer from "@/components/plan-viewer"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"

export default function PlanEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { mode, draftPlan, enterEditMode } = usePlanMode()
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById)
  const isLoading = usePlanStore((state) => state.isLoading)
  
  // Store the ID in state to avoid direct params access in the render function
  const [planId, setPlanId] = useState<string>("")
  
  useEffect(() => {
    // Set the plan ID from params once
    if (params.id && !planId) {
      setPlanId(params.id);
    }
  }, [params.id, planId]);

  // On mount, load the plan and enter edit mode if not already there
  useEffect(() => {
    if (!planId) return; // Don't proceed until we have the ID
    
    const loadPlan = async () => {
      // If we're already in edit mode and have a draft plan, make sure we're editing the correct plan
      if (mode === "edit" && draftPlan) {
        // Check if we're already editing this plan
        const originalPlanId = localStorage.getItem("planModeDraft_originalId")
        if (originalPlanId === planId) {
          console.log("[PlanEditPage] Already editing the requested plan:", planId)
          return // We're already in the correct state
        }
      }

      // Load the plan if we need to
      try {
        // Fetch the plan by ID
        const planData = await fetchPlanById(planId)
        
        if (!planData) {
          console.error("[PlanEditPage] Plan not found:", planId)
          router.replace("/")
          return
        }

        // Enter edit mode with the loaded plan data
        console.log("[PlanEditPage] Entering edit mode with plan:", planData.metadata?.planName)
        enterEditMode(planData, planId)
      } catch (error) {
        console.error("[PlanEditPage] Error loading plan:", error)
        router.replace("/")
      }
    }

    // Only try to load the plan if we're not already in edit mode or have a different plan loaded
    if (mode !== "edit" || !draftPlan) {
      loadPlan()
    }
  }, [mode, draftPlan, planId, enterEditMode, fetchPlanById, router])

  // While checking mode or if the plan is loading, show loading state
  if (isLoading || (mode !== "edit" || !draftPlan) || !planId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // PlanViewer is responsible for rendering the editor UI, 
  // and the PlanModeMenu will be shown automatically when in edit mode
  return <PlanViewer planId={planId} />
}