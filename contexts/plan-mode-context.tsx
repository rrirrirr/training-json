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
  enterEditMode: (plan: TrainingPlanData, originalId?: string) => void
  enterViewMode: (plan: TrainingPlanData, planId: string) => void
  exitMode: (options?: { navigateTo?: string | false }) => void
  updateDraftPlan: (updatedPlan: TrainingPlanData) => void
  saveDraftPlan: () => Promise<string | null>
  saveViewedPlanToMyPlans: () => Promise<string | null>
  discardDraftPlan: () => void
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

  // Exit mode function remains the same
  const exitMode = useCallback(
    (options?: { navigateTo?: string | false }) => {
      console.log("[PlanModeContext] Exiting mode and clearing draft storage.")

      let targetUrl: string | null = null
      if (options?.navigateTo !== false) {
        const currentOriginalId = originalPlanId
        targetUrl = options?.navigateTo ?? (currentOriginalId ? `/plan/${currentOriginalId}` : "/")
      }
      const shouldNavigate = targetUrl !== null

      try {
        localStorage.removeItem(DRAFT_MODE_KEY)
        localStorage.removeItem(DRAFT_PLAN_KEY)
        localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
        console.log("[PlanModeContext] Cleared all draft keys from localStorage.")
      } catch (error) {
        console.error("Error clearing draft state from localStorage:", error)
      }

      setMode("normal")
      setDraftPlan(null)
      setOriginalPlanIdState(null)

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
    [originalPlanId, setMode, setDraftPlan, setOriginalPlanIdState, router]
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

      const targetUrl = originalId ? `/plan/${originalId}/edit` : "/plan/edit"
      console.log(`[PlanModeContext] Navigating via router.push to: ${targetUrl}`)
      router.push(targetUrl)
    },
    [setMode, setDraftPlan, setOriginalPlanId, router]
  )

  // enterViewMode remains the same
  const enterViewMode = useCallback(
    (plan: TrainingPlanData, planId: string) => {
      console.log("[PlanModeContext] enterViewMode called with:", plan?.metadata?.planName, planId)
      setDraftPlan(plan)
      setOriginalPlanId(planId)
      setMode("view")
    },
    [setMode, setDraftPlan, setOriginalPlanId]
  )

  // updateDraftPlan remains the same
  const updateDraftPlan = useCallback(
    (updatedPlan: TrainingPlanData) => {
      console.log("[PlanModeContext] updateDraftPlan called.")
      setDraftPlan(updatedPlan)
    },
    [setDraftPlan]
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

      // Clear the edit mode state using exitMode WITHOUT navigation
      // This triggers React state updates synchronously
      exitMode({ navigateTo: false })
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
  }, [draftPlan, originalPlanId, createPlan, updatePlan, exitMode, router])

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

      // Clear the view mode state using exitMode WITHOUT navigation
      exitMode({ navigateTo: false })
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
  }, [draftPlan, createPlan, exitMode, router])

  // Discard draft plan (no changes here)
  const discardDraftPlan = useCallback(() => {
    console.log("[PlanModeContext] discardDraftPlan called.")
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
        discardDraftPlan,
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
