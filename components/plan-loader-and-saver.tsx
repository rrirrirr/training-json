"use client"
import { useEffect, useRef } from "react"
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
  const { mode, enterViewMode, exitMode } = usePlanMode()
  
  // Use a ref to track if we've already exited mode for this render cycle
  const hasExitedModeRef = useRef(false);
  // Use a ref to track if we've processed the plan loading
  const hasPlanProcessedRef = useRef(false);

  // First effect - handle mode exiting only
  useEffect(() => {
    // If we've already exited mode in this component instance, don't do it again
    if (hasExitedModeRef.current) return;
    
    // Make sure we have the plan metadata list
    if (planMetadataList.length === 0) {
      fetchPlanMetadata();
      return;
    }
    
    // First, check if we're in edit or view mode and exit if needed
    if (mode !== "normal") {
      console.log(`[PlanLoaderAndSaver] Exiting ${mode} mode before processing plan.`);
      hasExitedModeRef.current = true;
      exitMode();
    } else {
      // If we're already in normal mode, mark mode handling as complete
      hasExitedModeRef.current = true;
    }
  }, [mode, exitMode, planMetadataList, fetchPlanMetadata]);

  // Second effect - handle plan loading (only runs after mode is handled)
  useEffect(() => {
    // Don't process the plan until mode exit is complete
    if (!hasExitedModeRef.current) return;
    
    // Don't process the plan more than once
    if (hasPlanProcessedRef.current) return;
    
    // Make sure we have the plan metadata list
    if (planMetadataList.length === 0) {
      fetchPlanMetadata();
      return;
    }
    
    if (!planData) {
      console.warn(`[PlanLoaderAndSaver] No planData received for page ID: ${planId}.`);
      
      if (currentStoreActiveId === planId) {
        // If the store thinks this (non-existent) plan is active, clear it
        console.warn(`[PlanLoaderAndSaver] Clearing active plan for non-existent plan: ${planId}`);
        clearActivePlan();
      }
      
      hasPlanProcessedRef.current = true;
      return;
    }
    
    // Check if this plan exists in the user's plan list
    const planExistsInStoreList = planMetadataList.some((meta) => meta.id === planId);
    
    if (!planExistsInStoreList) {
      // This plan doesn't belong to the user, enter view mode
      console.log(`[PlanLoaderAndSaver] Plan ${planId} not in user's list, entering view mode.`);
      enterViewMode(planData, planId);
    } else if (currentStoreActiveId !== planId) {
      // If we get here, the plan belongs to the user, so we should set it as active
      console.log(`[PlanLoaderAndSaver] Setting plan ${planId} as active.`);
      setActivePlan(planData, planId);
    } else {
      console.log(`[PlanLoaderAndSaver] Plan ${planId} is already active.`);
    }
    
    // Mark plan processing as complete
    hasPlanProcessedRef.current = true;
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
  ]);

  return null;
}