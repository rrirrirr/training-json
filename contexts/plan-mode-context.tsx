/* File: /contexts/plan-mode-context.tsx */
"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"

// ... (Keep PlanMode, PlanModeContextType, keys, context creation as before) ...
interface PlanModeContextType {
  mode: PlanMode
  draftPlan: TrainingPlanData | null
  originalPlanId: string | null
  hasUnsavedChanges: boolean
  enterEditMode: (plan: TrainingPlanData, originalId?: string) => void
  enterViewMode: (plan: TrainingPlanData, planId: string) => void
  exitMode: (options?: { navigateTo?: string | false }) => void
  updateDraftPlan: (updatedPlan: TrainingPlanData) => void
  saveDraftPlan: () => Promise<string | null>
  saveViewedPlanToMyPlans: () => Promise<string | null>
  discardDraftPlan: () => void
  getPersistedDraftInfo: () => { mode: PlanMode | null; originalPlanId: string | null }
}

const PlanModeContext = createContext<PlanModeContextType | undefined>(undefined)

const DRAFT_MODE_KEY = "planModeDraft_mode"
const DRAFT_PLAN_KEY = "planModeDraft_plan"
const DRAFT_ORIGINAL_ID_KEY = "planModeDraft_originalId"

export function PlanModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const createPlan = usePlanStore((state) => state.createPlan)
  const updatePlan = usePlanStore((state) => state.updatePlan)
  const [mode, setModeState] = useState<PlanMode>("normal")
  const [draftPlan, setDraftPlanState] = useState<TrainingPlanData | null>(null)
  const [originalPlanId, setOriginalPlanIdState] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // ... (useEffect for initialization, state setters remain the same) ...
  // Effect to load persisted state from localStorage on mount (no changes here)
  useEffect(() => {
    try {
      const persistedMode = localStorage.getItem(DRAFT_MODE_KEY) as PlanMode | null
      const persistedPlanJson = localStorage.getItem(DRAFT_PLAN_KEY)
      const persistedOriginalId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY)

      if (persistedMode && persistedMode !== "normal" && persistedPlanJson) {
        const persistedPlan = JSON.parse(persistedPlanJson) as TrainingPlanData
        const planMetadataList = usePlanStore.getState().planMetadataList
        const planStillExists = persistedOriginalId
          ? planMetadataList.some((plan) => plan.id === persistedOriginalId)
          : true

        if (planStillExists) {
          console.log("[PlanModeContext Init] Restoring state:", {
            persistedMode,
            persistedPlan,
            persistedOriginalId,
          })
          setModeState(persistedMode)
          setDraftPlanState(persistedPlan)
          setOriginalPlanIdState(persistedOriginalId)
          // Set hasUnsavedChanges based on mode:
          // If it's edit mode, it has unsaved changes
          // If it's view mode, it doesn't have unsaved changes
          setHasUnsavedChanges(persistedMode === "edit")
        } else {
          console.log(
            "[PlanModeContext Init] Persisted plan no longer exists in metadata list. Resetting state."
          )
          localStorage.removeItem(DRAFT_MODE_KEY)
          localStorage.removeItem(DRAFT_PLAN_KEY)
          localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
        }
      }
    } catch (error) {
      console.error("Error reading draft state from localStorage:", error)
      localStorage.removeItem(DRAFT_MODE_KEY)
      localStorage.removeItem(DRAFT_PLAN_KEY)
      localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
    } finally {
      setIsInitialized(true) // Mark as initialized
    }
  }, [])

  // Wrapper functions to update state AND localStorage (no changes here)
  const setMode = useCallback((newMode: PlanMode) => {
    setModeState(newMode)
    try {
      if (newMode === "normal") {
        localStorage.removeItem(DRAFT_MODE_KEY)
        console.log("[PlanModeContext] Cleared mode from localStorage.")
      } else {
        localStorage.setItem(DRAFT_MODE_KEY, newMode)
        console.log(`[PlanModeContext] Saved mode '${newMode}' to localStorage.`)
      }
    } catch (error) {
      console.error("Error writing mode to localStorage:", error)
    }
  }, [])

  const setDraftPlan = useCallback((plan: TrainingPlanData | null) => {
    setDraftPlanState(plan)
    try {
      if (plan === null) {
        localStorage.removeItem(DRAFT_PLAN_KEY)
        console.log("[PlanModeContext] Cleared draftPlan from localStorage.")
      } else {
        localStorage.setItem(DRAFT_PLAN_KEY, JSON.stringify(plan))
        console.log("[PlanModeContext] Saved draftPlan to localStorage.")
      }
    } catch (error) {
      console.error("Error writing draftPlan to localStorage:", error)
    }
  }, [])

  const setOriginalPlanId = useCallback((id: string | null) => {
    setOriginalPlanIdState(id)
    try {
      if (id === null) {
        localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
        console.log("[PlanModeContext] Cleared originalPlanId from localStorage.")
      } else {
        localStorage.setItem(DRAFT_ORIGINAL_ID_KEY, id)
        console.log(`[PlanModeContext] Saved originalPlanId '${id}' to localStorage.`)
      }
    } catch (error) {
      console.error("Error writing originalPlanId to localStorage:", error)
    }
  }, [])
  
  // Helper to explicitly clear draft state from localStorage
  const clearDraftStorage = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_MODE_KEY)
      localStorage.removeItem(DRAFT_PLAN_KEY)
      localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
      console.log("[PlanModeContext] Cleared all draft keys from localStorage.")
    } catch (error) {
      console.error("Error clearing draft state from localStorage:", error)
    }
  }, []) // No dependencies needed
  
  // Modified exitMode - no longer clears localStorage by default
  const exitMode = useCallback(
    (options?: { navigateTo?: string | false }) => {
      console.log("[PlanModeContext] Exiting mode requested.")

      let targetUrl: string | null = null
      if (options?.navigateTo !== false) {
        const currentOriginalId = originalPlanId
        targetUrl = options?.navigateTo ?? (currentOriginalId ? `/plan/${currentOriginalId}` : "/")
      }
      const shouldNavigate = targetUrl !== null

      // Reset React state
      setMode("normal")
      setDraftPlan(null)
      setOriginalPlanIdState(null)
      setHasUnsavedChanges(false) // Reset unsaved flag

      if (shouldNavigate && typeof window !== "undefined") {
        const currentPath = window.location.pathname
        const isOnEditPage =
          currentPath === "/plan/edit" || /^\/plan\/[^/]+\/edit$/.test(currentPath)

        if (isOnEditPage) {
          console.log(`[PlanModeContext] Navigating via router.push to: ${targetUrl}`)
          router.push(targetUrl as string) // Use router.push here too
        } else {
          console.log("[PlanModeContext] Not on an edit page, skipping forced navigation on exit.")
        }
      } else {
        console.log("[PlanModeContext] Skipping navigation on exitMode call.")
      }
    },
    [originalPlanId, setMode, setDraftPlan, setOriginalPlanIdState, router, setHasUnsavedChanges]
  )

  // enterEditMode remains the same (already uses router.push)
  const enterEditMode = useCallback(
    (plan: TrainingPlanData, originalId?: string) => {
      console.log(
        "[PlanModeContext] enterEditMode called with:",
        plan?.metadata?.planName,
        originalId
      )
      if (!plan) {
        console.error("[PlanModeContext] enterEditMode called with null/undefined plan")
        return
      }
      setDraftPlan(plan)
      setMode("edit")
      setOriginalPlanId(originalId ?? null)
      // If it's a new plan (no originalId), it's inherently unsaved.
      // If it's an existing plan, assume it's initially not modified until updateDraftPlan is called.
      setHasUnsavedChanges(!originalId) // True if new plan, false if loading existing

      const targetUrl = originalId ? `/plan/${originalId}/edit` : "/plan/edit"
      console.log(`[PlanModeContext] Navigating via router.push to: ${targetUrl}`)
      router.push(targetUrl)
    },
    [setMode, setDraftPlan, setOriginalPlanId, router, setHasUnsavedChanges]
  )

  // enterViewMode function with updated hasUnsavedChanges handling
  const enterViewMode = useCallback(
    (plan: TrainingPlanData, planId: string) => {
      console.log("[PlanModeContext] enterViewMode called with:", plan?.metadata?.planName, planId)
      setDraftPlan(plan)
      setOriginalPlanId(planId)
      setMode("view")
      setHasUnsavedChanges(false) // View mode doesn't have unsaved changes
    },
    [setMode, setDraftPlan, setOriginalPlanId, setHasUnsavedChanges]
  )

  // updateDraftPlan remains the same
  const updateDraftPlan = useCallback(
    (updatedPlan: TrainingPlanData) => {
      console.log("[PlanModeContext] updateDraftPlan called.")
      setDraftPlan(updatedPlan)
      setHasUnsavedChanges(true) // Set unsaved flag to true
    },
    [setDraftPlan, setHasUnsavedChanges]
  )

  // Save draft plan
  // ** MODIFICATION: Use queueMicrotask for navigation **
  const saveDraftPlan = useCallback(async () => {
    if (!draftPlan) return null
    console.log("[PlanModeContext] saveDraftPlan called for:", draftPlan?.metadata?.planName)

    const planToSave = {
      /* ... (same as before) ... */ ...draftPlan,
      metadata: {
        ...(draftPlan.metadata || {}),
        planName: draftPlan.metadata?.planName || "My Training Plan",
        creationDate: draftPlan.metadata?.creationDate || new Date().toISOString(),
      },
    }

    let planId = originalPlanId
    let success = false

    try {
      if (originalPlanId) {
        console.log(`[PlanModeContext] Updating existing plan: ${originalPlanId}`)
        success = await updatePlan(originalPlanId, planToSave)
        if (!success) throw new Error(`Failed to update plan ${originalPlanId}`)
        console.log(`[PlanModeContext] Plan updated: ${originalPlanId}`)
      } else {
        console.log(`[PlanModeContext] Creating new plan`)
        const newPlanId = await createPlan(planToSave.metadata.planName, planToSave)
        if (!newPlanId) throw new Error("Failed to create new plan.")
        planId = newPlanId
        success = true
        console.log(`[PlanModeContext] New plan created. ID: ${planId}`)
      }

      // --- Post-Save Actions (only on success) ---
      const setActivePlan = usePlanStore.getState().setActivePlan
      setActivePlan(planToSave, planId as string) // Set active plan *immediately*

      // Clear storage and reset state
      clearDraftStorage() // Clear localStorage
      setHasUnsavedChanges(false) // Reset flag
      
      // Reset React state
      setMode("normal")
      setDraftPlan(null)
      setOriginalPlanId(null)
      console.log("[PlanModeContext] State reset to normal mode after save.")

      // Defer navigation slightly to allow state updates to process
      queueMicrotask(() => {
        console.log(`[PlanModeContext] Queued navigation via router.push to: /plan/${planId}`)
        router.push(`/plan/${planId}`)
      })

      return planId
    } catch (error) {
      console.error("[PlanModeContext] Error during saveDraftPlan:", error)
      return null // Indicate failure
    }
  }, [draftPlan, originalPlanId, createPlan, updatePlan, clearDraftStorage, setHasUnsavedChanges, setMode, setDraftPlan, setOriginalPlanId, router])

  // Save viewed plan
  // ** MODIFICATION: Use queueMicrotask for navigation **
  const saveViewedPlanToMyPlans = useCallback(async () => {
    if (!draftPlan) return null
    console.log(
      "[PlanModeContext] saveViewedPlanToMyPlans called for:",
      draftPlan?.metadata?.planName
    )

    let planId = null

    try {
      const planToSave = {
        /* ... (same as before) ... */ ...draftPlan,
        metadata: {
          ...(draftPlan.metadata || {}),
          planName: draftPlan.metadata?.planName || "Shared Plan",
          creationDate: new Date().toISOString(),
        },
      }

      const newPlanId = await createPlan(planToSave.metadata.planName, planToSave)
      if (!newPlanId) throw new Error("Failed to create copy of viewed plan.")
      planId = newPlanId
      console.log(`[PlanModeContext] Viewed plan saved. New ID: ${planId}.`)

      // --- Post-Save Actions ---
      const setActivePlan = usePlanStore.getState().setActivePlan
      setActivePlan(planToSave, planId) // Set active plan *immediately*

      // Clear storage and reset state
      clearDraftStorage() // Clear localStorage
      setHasUnsavedChanges(false) // Reset flag
      
      // Reset React state
      setMode("normal")
      setDraftPlan(null)
      setOriginalPlanId(null)
      console.log("[PlanModeContext] State reset to normal mode after saving viewed plan.")

      // Defer navigation slightly
      queueMicrotask(() => {
        console.log(`[PlanModeContext] Queued navigation via router.push to: /plan/${planId}`)
        router.push(`/plan/${planId}`)
      })

      return planId
    } catch (error) {
      console.error("[PlanModeContext] Error in saveViewedPlanToMyPlans:", error)
      return null // Indicate failure
    }
  }, [draftPlan, createPlan, clearDraftStorage, setHasUnsavedChanges, setMode, setDraftPlan, setOriginalPlanId, router])

  // Discard draft plan with explicit storage clearing
  const discardDraftPlan = useCallback(() => {
    console.log("[PlanModeContext] discardDraftPlan called.")
    const idToNavigateBackTo = originalPlanId
    clearDraftStorage() // Clear storage
    // exitMode will reset hasUnsavedChanges flag and other state
    exitMode({ navigateTo: idToNavigateBackTo ? `/plan/${idToNavigateBackTo}` : '/' })
  }, [exitMode, originalPlanId, clearDraftStorage])
  
  // Function to check localStorage directly for persisted draft info
  const getPersistedDraftInfo = useCallback((): { mode: PlanMode | null; originalPlanId: string | null } => {
    if (typeof window === 'undefined') {
      return { mode: null, originalPlanId: null }; // Cannot access localStorage server-side
    }
    try {
      const pMode = localStorage.getItem(DRAFT_MODE_KEY) as PlanMode | null;
      const pId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY);
      // Only return info if a draft mode is persisted
      return pMode && pMode !== 'normal' ? { mode: pMode, originalPlanId: pId } : { mode: null, originalPlanId: null };
    } catch (error) {
      console.error("Error reading persisted draft info:", error);
      return { mode: null, originalPlanId: null };
    }
  }, []); // No dependencies needed, reads directly from localStorage
  
  return (
    <PlanModeContext.Provider
      value={{
        mode,
        draftPlan,
        originalPlanId,
        hasUnsavedChanges,
        enterEditMode,
        enterViewMode,
        exitMode,
        updateDraftPlan,
        saveDraftPlan,
        saveViewedPlanToMyPlans,
        discardDraftPlan,
        getPersistedDraftInfo,
      }}
    >
      {isInitialized ? children : null}
    </PlanModeContext.Provider>
  )
}

// Custom hook remains the same
export function usePlanMode() {
  const context = useContext(PlanModeContext)
  if (context === undefined) {
    throw new Error("usePlanMode must be used within a PlanModeProvider")
  }
  return context
}
