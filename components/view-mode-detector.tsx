"use client"

import { useEffect } from "react"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"
import type { TrainingPlanData } from "@/types/training-plan"

interface ViewModeDetectorProps {
  planData: TrainingPlanData
  planId: string
}

export default function ViewModeDetector({ planData, planId }: ViewModeDetectorProps) {
  const { mode, enterViewMode } = usePlanMode()
  const planMetadataList = usePlanStore(state => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore(state => state.fetchPlanMetadata)
  
  useEffect(() => {
    // Make sure we have the plan metadata list
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
    
    // Only proceed if not already in a special mode
    if (mode !== "normal") return
    
    // Check if this plan exists in user's plan list
    const planExists = planMetadataList.some(plan => plan.id === planId)
    
    // If it doesn't exist in metadata but we have the data, enter view mode
    if (!planExists && planData && planMetadataList.length > 0) {
      enterViewMode(planData, planId)
    }
  }, [
    mode, 
    planData, 
    planId, 
    planMetadataList, 
    fetchPlanMetadata, 
    enterViewMode
  ])
  
  return null
}
