"use client"

import { useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"

type PlanLoaderAndSaverProps = {
  planData: TrainingPlanData | null
  planId: string
}

export function PlanLoaderAndSaver({ planData, planId }: PlanLoaderAndSaverProps) {
  // Get actions from the Zustand store
  const setActivePlan = usePlanStore((state) => state.setActivePlan)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const clearActivePlan = usePlanStore((state) => state.clearActivePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)

  // Load the plan into store on mount or when props change
  useEffect(() => {
    if (planData) {
      // Set the active plan in the store with its ID
      setActivePlan(planData, planId)
      
      // Fetch metadata for all plans (for navigation)
      fetchPlanMetadata()
      
      // Log for debugging
      console.log(`Plan loaded: ${planData.metadata?.planName || "Unnamed Plan"} (ID: ${planId})`)
    } else {
      console.log(`No plan data found for ID: ${planId}`)
      
      // If we were previously viewing this plan, clear it
      if (activePlanId === planId) {
        clearActivePlan()
      }
    }
  }, [planData, planId, setActivePlan, fetchPlanMetadata, clearActivePlan, activePlanId])

  // This component doesn't render any UI itself
  return null
}
