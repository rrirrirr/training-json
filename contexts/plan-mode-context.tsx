"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"

// Define the possible modes for the plan viewer
type PlanMode = "normal" | "edit" | "view"

// Define the context interface
interface PlanModeContextType {
  mode: PlanMode
  draftPlan: TrainingPlanData | null
  originalPlanId: string | null
  enterEditMode: (plan: TrainingPlanData, originalId?: string) => void
  enterViewMode: (plan: TrainingPlanData, planId: string) => void
  exitMode: () => void
  updateDraftPlan: (updatedPlan: TrainingPlanData) => void
  saveDraftPlan: () => Promise<string | null>
  saveViewedPlanToMyPlans: () => Promise<string | null>
  discardDraftPlan: () => void
}

// Create the context with undefined default value
const PlanModeContext = createContext<PlanModeContextType | undefined>(undefined)

// Provider component for the plan mode context
export function PlanModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mode, setMode] = useState<PlanMode>("normal")
  const [draftPlan, setDraftPlan] = useState<TrainingPlanData | null>(null)
  const [originalPlanId, setOriginalPlanId] = useState<string | null>(null)
  
  // Get the createPlan action from the plan store
  const createPlan = usePlanStore(state => state.createPlan)
  
  // Enter edit mode with a draft plan
  const enterEditMode = useCallback((plan: TrainingPlanData, originalId?: string) => {
    setDraftPlan(plan)
    setMode("edit")
    if (originalId) {
      setOriginalPlanId(originalId)
    }
  }, [])
  
  // Enter view mode for an external plan
  const enterViewMode = useCallback((plan: TrainingPlanData, planId: string) => {
    setDraftPlan(plan)
    setOriginalPlanId(planId)
    setMode("view")
  }, [])
  
  // Exit any special mode
  const exitMode = useCallback(() => {
    setMode("normal")
    setDraftPlan(null)
    setOriginalPlanId(null)
  }, [])
  
  // Update draft plan during editing
  const updateDraftPlan = useCallback((updatedPlan: TrainingPlanData) => {
    setDraftPlan(updatedPlan)
  }, [])
  
  // Save draft plan to Supabase and make it active
  const saveDraftPlan = useCallback(async () => {
    if (!draftPlan) return null
    
    // Ensure plan has proper metadata
    const planToSave = {
      ...draftPlan,
      metadata: {
        ...draftPlan.metadata || {},
        planName: draftPlan.metadata?.planName || "My Training Plan",
        creationDate: draftPlan.metadata?.creationDate || new Date().toISOString()
      }
    }
    
    // Save plan to Supabase
    const planId = await createPlan(planToSave.metadata.planName, planToSave)
    
    if (planId) {
      // Exit edit mode
      exitMode()
      
      // Navigate to the saved plan
      router.push(`/plan/${planId}`)
    }
    
    return planId
  }, [draftPlan, createPlan, exitMode, router])
  
  // Save a viewed plan to user's storage
  const saveViewedPlanToMyPlans = useCallback(async () => {
    if (!draftPlan) return null
    
    // Create a copy with updated name
    const planToSave = {
      ...draftPlan,
      metadata: {
        ...draftPlan.metadata || {},
        planName: `${draftPlan.metadata?.planName || "Shared Plan"} (Copy)`,
        creationDate: new Date().toISOString()
      }
    }
    
    // Save to user's storage
    const planId = await createPlan(planToSave.metadata.planName, planToSave)
    
    if (planId) {
      // Exit view mode
      exitMode()
      
      // Navigate to the saved plan
      router.push(`/plan/${planId}`)
    }
    
    return planId
  }, [draftPlan, createPlan, exitMode, router])
  
  // Discard draft plan without saving
  const discardDraftPlan = useCallback(() => {
    exitMode()
  }, [exitMode])
  
  return (
    <PlanModeContext.Provider
      value={{
        mode,
        draftPlan,
        originalPlanId,
        enterEditMode,
        enterViewMode,
        exitMode,
        updateDraftPlan,
        saveDraftPlan,
        saveViewedPlanToMyPlans,
        discardDraftPlan
      }}
    >
      {children}
    </PlanModeContext.Provider>
  )
}

// Custom hook to use the plan mode context
export function usePlanMode() {
  const context = useContext(PlanModeContext)
  if (context === undefined) {
    throw new Error("usePlanMode must be used within a PlanModeProvider")
  }
  return context
}
