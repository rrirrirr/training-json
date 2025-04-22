"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { TrainingPlanData } from "@/types/training-plan" // Adjust path if needed
import { usePlanStore } from "@/store/plan-store" // Adjust path if needed
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

// LocalStorage keys
const DRAFT_MODE_KEY = "planModeDraft_mode"
const DRAFT_PLAN_KEY = "planModeDraft_plan"
const DRAFT_ORIGINAL_ID_KEY = "planModeDraft_originalId"

// Create the context with undefined default value
const PlanModeContext = createContext<PlanModeContextType | undefined>(undefined)

// Provider component for the plan mode context
export function PlanModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const createPlan = usePlanStore((state) => state.createPlan)
  const updatePlan = usePlanStore((state) => state.updatePlan)

  // Use initial state values that will be potentially overridden by localStorage
  const [mode, setModeState] = useState<PlanMode>("normal")
  const [draftPlan, setDraftPlanState] = useState<TrainingPlanData | null>(null)
  const [originalPlanId, setOriginalPlanIdState] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false) // Track initialization

  // Effect to load persisted state from localStorage on mount
  useEffect(() => {
    // This effect runs only on the client side
    try {
      const persistedMode = localStorage.getItem(DRAFT_MODE_KEY) as PlanMode | null
      const persistedPlanJson = localStorage.getItem(DRAFT_PLAN_KEY)
      const persistedOriginalId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY)

      // Only restore if mode is edit/view and plan data exists
      if (persistedMode && persistedMode !== "normal" && persistedPlanJson) {
        const persistedPlan = JSON.parse(persistedPlanJson) as TrainingPlanData

        // Validate that the plan still exists in the metadata list if we have an original ID
        const planMetadataList = usePlanStore.getState().planMetadataList
        const planStillExists = persistedOriginalId
          ? planMetadataList.some((plan) => plan.id === persistedOriginalId)
          : true // If there's no original ID, we can't validate

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
          // Clear localStorage and reset state
          localStorage.removeItem(DRAFT_MODE_KEY)
          localStorage.removeItem(DRAFT_PLAN_KEY)
          localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
        }
      }
    } catch (error) {
      console.error("Error reading draft state from localStorage:", error)
      // Clear potentially corrupted keys if parsing fails
      localStorage.removeItem(DRAFT_MODE_KEY)
      localStorage.removeItem(DRAFT_PLAN_KEY)
      localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
    } finally {
      setIsInitialized(true) // Mark as initialized
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Wrapper functions to update state AND localStorage
  const setMode = useCallback((newMode: PlanMode) => {
    setModeState(newMode)
    try {
      if (newMode === "normal") {
        // Remove the key when returning to normal mode
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
        // Remove the key when draftPlan is cleared
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
        // Remove the key when originalPlanId is cleared
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

  // Exit any special mode and clear storage
  const exitMode = useCallback(() => {
    console.log("[PlanModeContext] Exiting mode and clearing draft storage.")

    // Store originalPlanId before clearing it (for navigation if needed)
    const planIdToNavigateTo = originalPlanId

    try {
      localStorage.removeItem(DRAFT_MODE_KEY)
      localStorage.removeItem(DRAFT_PLAN_KEY)
      localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
      console.log("[PlanModeContext] Cleared all draft keys from localStorage.")
    } catch (error) {
      console.error("Error clearing draft state from localStorage:", error)
    }

    setMode("normal") // Uses the wrapper function
    setDraftPlan(null) // Uses the wrapper function
    setOriginalPlanId(null) // Uses the wrapper function
    
    // Force navigation when on edit pages
    if (typeof window !== "undefined") {
      const path = window.location.pathname
      const isOnEditPage = path === "/plan/edit" || /^\/plan\/[^/]+\/edit$/.test(path)

      if (isOnEditPage) {
        console.log("[PlanModeContext] Forcing navigation away from edit page")
        
        // Use window.location for a hard redirect that bypasses Next.js router
        if (planIdToNavigateTo) {
          // Small delay to ensure state is updated before navigation
          setTimeout(() => {
            window.location.href = `/plan/${planIdToNavigateTo}`
          }, 50)
        } else {
          setTimeout(() => {
            window.location.href = "/"
          }, 50)
        }
      }
    }
  }, [setMode, setDraftPlan, setOriginalPlanId, originalPlanId, router]) // Add setters as dependencies

  // Enter edit mode with a draft plan
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
      // Use the state setters that also update localStorage
      setDraftPlan(plan)
      setMode("edit")
      setOriginalPlanId(originalId ?? null) // Ensure null if undefined

      // Navigate to the dynamic edit page with ID if available
      if (originalId) {
        router.push(`/plan/${originalId}/edit`)
      } else {
        // If no original ID, we'll need to create a plan first to get an ID
        console.log("[PlanModeContext] No original ID provided, using fallback route")
        router.push("/plan/edit")
      }
    },
    [setMode, setDraftPlan, setOriginalPlanId, router]
  ) // Use setters as dependencies

  // Enter view mode for an external plan
  const enterViewMode = useCallback(
    (plan: TrainingPlanData, planId: string) => {
      console.log("[PlanModeContext] enterViewMode called with:", plan?.metadata?.planName, planId)
      // Use the state setters that also update localStorage
      setDraftPlan(plan)
      setOriginalPlanId(planId)
      setMode("view")
    },
    [setMode, setDraftPlan, setOriginalPlanId]
  ) // Use setters as dependencies

  // Update draft plan during editing
  const updateDraftPlan = useCallback(
    (updatedPlan: TrainingPlanData) => {
      console.log("[PlanModeContext] updateDraftPlan called.")
      // Directly use the localStorage-aware setter
      setDraftPlan(updatedPlan)
    },
    [setDraftPlan]
  ) // Dependency is the setter

  // Save draft plan to Supabase and make it active
  // Save draft plan to Supabase and make it active
  const saveDraftPlan = useCallback(async () => {
    if (!draftPlan) return null
    console.log("[PlanModeContext] saveDraftPlan called for:", draftPlan?.metadata?.planName)

    // Ensure plan has proper metadata
    const planToSave = {
      ...draftPlan,
      metadata: {
        ...(draftPlan.metadata || {}),
        planName: draftPlan.metadata?.planName || "My Training Plan",
        creationDate: draftPlan.metadata?.creationDate || new Date().toISOString(),
      },
    }

    let planId = null
    let success = false

    // Determine if we're updating an existing plan or creating a new one
    if (originalPlanId) {
      console.log(`[PlanModeContext] Updating existing plan with ID: ${originalPlanId}`)

      // Update the existing plan in Supabase
      success = await updatePlan(originalPlanId, planToSave)

      if (success) {
        console.log(`[PlanModeContext] Plan updated successfully: ${originalPlanId}`)
        planId = originalPlanId
      } else {
        console.error(`[PlanModeContext] Failed to update plan: ${originalPlanId}`)
      }
    } else {
      // Create a new plan in Supabase
      console.log(`[PlanModeContext] Creating new plan`)
      planId = await createPlan(planToSave.metadata.planName, planToSave)
      success = !!planId
    }

    if (success) {
      // Get the setActivePlan function from the store
      const setActivePlan = usePlanStore.getState().setActivePlan

      // Explicitly set the plan as active before navigation
      setActivePlan(planToSave, planId as string)

      // Clear the edit mode state
      try {
        localStorage.removeItem(DRAFT_MODE_KEY)
        localStorage.removeItem(DRAFT_PLAN_KEY)
        localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
        console.log("[PlanModeContext] Cleared all draft keys from localStorage.")
      } catch (error) {
        console.error("Error clearing draft state from localStorage:", error)
      }

      // Reset the context state
      setMode("normal")
      setDraftPlan(null)
      setOriginalPlanId(null)

      // Navigate to the plan view page
      router.push(`/plan/${planId}`)
    } else {
      console.error("[PlanModeContext] Failed to save draft plan.")
    }

    return planId
  }, [
    draftPlan,
    originalPlanId,
    createPlan,
    updatePlan,
    setMode,
    setDraftPlan,
    setOriginalPlanId,
    router,
  ])

  // Save a viewed plan to user's storage
  const saveViewedPlanToMyPlans = useCallback(async () => {
    if (!draftPlan) return null
    console.log(
      "[PlanModeContext] saveViewedPlanToMyPlans called for:",
      draftPlan?.metadata?.planName
    )

    try {
      // Create a copy with the same name (no "(Copy)" suffix)
      const planToSave = {
        ...draftPlan,
        metadata: {
          ...(draftPlan.metadata || {}),
          planName: draftPlan.metadata?.planName || "Shared Plan",
          creationDate: new Date().toISOString(),
        },
      }

      // Save to user's storage using the Zustand store action
      const planId = await createPlan(planToSave.metadata.planName, planToSave)
      if (planId) {
        console.log(`[PlanModeContext] Viewed plan saved successfully. New Plan ID: ${planId}.`)

        // Get the setActivePlan function from the store
        const setActivePlan = usePlanStore.getState().setActivePlan

        // Explicitly set the plan as active before navigation
        setActivePlan(planToSave, planId)

        // Clear the edit mode state
        try {
          localStorage.removeItem(DRAFT_MODE_KEY)
          localStorage.removeItem(DRAFT_PLAN_KEY)
          localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
          console.log("[PlanModeContext] Cleared all draft keys from localStorage.")
        } catch (error) {
          console.error("Error clearing draft state from localStorage:", error)
        }

        // Reset the context state
        setMode("normal")
        setDraftPlan(null)
        setOriginalPlanId(null)
        // Use a more reliable navigation method
        if (typeof window !== "undefined") {
          // Use a small delay to ensure state updates before navigation
          setTimeout(() => {
            window.location.href = `/plan/${planId}`;
          }, 50);
        }
      } else {
        console.error(
          "[PlanModeContext] Failed to save viewed plan (createPlan returned null/undefined)."
        )
      }
    } catch (error) {
      console.error("[PlanModeContext] Error in saveViewedPlanToMyPlans:", error);
    }

    return planId
  }, [draftPlan, createPlan, setMode, setDraftPlan, setOriginalPlanId, router]) // Add exitMode dependency

  // Discard draft plan without saving
  const discardDraftPlan = useCallback(() => {
    console.log("[PlanModeContext] discardDraftPlan called.")
    exitMode()
  }, [exitMode])

  return (
    <PlanModeContext.Provider
      value={{
        mode, // Use the state variable
        draftPlan, // Use the state variable
        originalPlanId, // Use the state variable
        enterEditMode,
        enterViewMode,
        exitMode,
        updateDraftPlan,
        saveDraftPlan,
        saveViewedPlanToMyPlans,
        discardDraftPlan,
      }}
    >
      {/* Conditionally render children only after initialization from localStorage */}
      {isInitialized ? children : null /* Or a loading indicator */}
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
