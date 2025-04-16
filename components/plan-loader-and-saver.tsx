"use client"
import { useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"
import { usePlanMode } from "@/contexts/plan-mode-context"

type PlanLoaderAndSaverProps = {
  planData: TrainingPlanData | null
  planId: string
}

export function PlanLoaderAndSaver({ planData, planId }: PlanLoaderAndSaverProps) {
  const setActivePlan = usePlanStore((state) => state.setActivePlan)
  const clearActivePlan = usePlanStore((state) => state.clearActivePlan)
  const currentStoreActiveId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  
  // Get plan mode context
  const { mode, enterViewMode } = usePlanMode()

  useEffect(() => {
    // Make sure we have the plan metadata list
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
      return; // Wait for metadata to load before proceeding
    }
    
    if (!planData) {
      console.warn(`[PlanLoaderAndSaver] No planData received for page ID: ${planId}.`)
      
      if (currentStoreActiveId === planId) {
        // If the store thinks this (non-existent) plan is active, clear it
        console.warn(`[PlanLoaderAndSaver] Clearing active plan for non-existent plan: ${planId}`)
        clearActivePlan()
      }
      return;
    }
    
    // Don't do anything if we're already in a special mode
    if (mode !== "normal") {
      console.log(`[PlanLoaderAndSaver] Already in ${mode} mode, not setting active plan.`)
      return;
    }
    
    // Check if this plan exists in the user's plan list
    const planExistsInStoreList = planMetadataList.some((meta) => meta.id === planId)
    
    if (!planExistsInStoreList) {
      // This plan doesn't belong to the user, enter view mode
      console.log(`[PlanLoaderAndSaver] Plan ${planId} not in user's list, entering view mode.`)
      enterViewMode(planData, planId)
      return;
    }
    
    // If we get here, the plan belongs to the user, so we should set it as active
    if (currentStoreActiveId !== planId) {
      console.log(`[PlanLoaderAndSaver] Setting plan ${planId} as active.`)
      setActivePlan(planData, planId)
    } else {
      console.log(`[PlanLoaderAndSaver] Plan ${planId} is already active.`)
    }
  }, [
    planData, 
    planId, 
    mode,
    currentStoreActiveId, 
    planMetadataList, 
    setActivePlan, 
    clearActivePlan, 
    fetchPlanMetadata,
    enterViewMode
  ])

  return null
}