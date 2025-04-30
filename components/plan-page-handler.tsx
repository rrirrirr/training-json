// File: components/plan-page-handler.tsx
import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
import { Loader2 } from "lucide-react"
import { PlanModeMenu } from "@/components/plan-mode-menu"
import PlanViewer from "@/components/plan-viewer"
import { Button } from "./ui/button"
import { useUIState } from "@/contexts/ui-context" // Re-add UIState import for conflict dialog

interface PlanPageHandlerProps {
  planId: string | null
  editIntent: boolean
}

export default function PlanPageHandler({ planId, editIntent }: PlanPageHandlerProps) {
  const router = useRouter()
  
  // Import UI state for showing conflict dialog
  const { openSwitchWarningDialog } = useUIState()

  // --- Select state from Zustand Store ---
  const mode = usePlanStore((state) => state.mode)
  const activePlan = usePlanStore((state) => state.activePlan)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const isStoreLoading = usePlanStore((state) => state.isLoading)
  const storeError = usePlanStore((state) => state.error)
  const loadPlanAndSetMode = usePlanStore((state) => state.loadPlanAndSetMode)
  const startNewPlanEdit = usePlanStore((state) => state.startNewPlanEdit)
  const activePlanId = usePlanStore((state) => state.activePlanId) // Needed for comparisons

  const isMounted = useRef(true) // Use ref for mount status

  useEffect(() => {
    isMounted.current = true
    let isActive = true

    console.log(
      `[PlanPageHandler] Effect running. Target planId: ${planId}, editIntent: ${editIntent}`
    )

    const processPlan = async () => {
      // Call the appropriate store action based on props
      // For new plans or plan edit page
      if (planId === null && editIntent) {
        // Check if we already have a draft plan in edit mode
        // This happens when JSON is uploaded via the enhanced modal
        if (mode === "edit" && draftPlan !== null && originalPlanId === null) {
          console.log("[PlanPageHandler] Using existing draft plan in edit mode")
          // We already have the right state, do nothing
        } else {
          // Otherwise, start fresh edit with a new plan template
          console.log("[PlanPageHandler] No existing draft, creating new plan template")
          await startNewPlanEdit()
        }
      } else if (planId) {
        await loadPlanAndSetMode(planId, editIntent)
      } else {
        console.error("[PlanPageHandler] Invalid props combination. Navigating home.")
        if (isActive && isMounted.current) router.replace("/")
      }

      // --- Post-load Checks (Redirect/Conflict Handling) ---
      // Get the *latest* state after load attempt
      if (isActive && isMounted.current) {
        const latestState = usePlanStore.getState()

        // 1. Handle Redirect: View Route -> Edit State
        if (
          !editIntent &&
          planId &&
          latestState.mode === "edit" &&
          latestState.originalPlanId === planId
        ) {
          console.log(
            `[PlanPageHandler] Redirecting: View route requested but edit mode set for ${planId}. Navigating to edit page.`
          )
          router.replace(`/plan/${planId}/edit`)
          return // Stop further processing in this effect run
        }

        // 2. Handle Edit Conflict Error (Optional: Show specific UI or just rely on error message)
        if (latestState.error?.startsWith("EDIT_CONFLICT")) {
          console.warn(`[PlanPageHandler] Edit conflict detected by store: ${latestState.error}`)
          // Optionally trigger a UI state notification here if needed,
          // but the main error display below should handle it.
          // Example: openConflictDialog(targetPlanId) if using UI context for dialogs
        }
      }
    }

    processPlan()

    return () => {
      isActive = false
      isMounted.current = false
    }
    // Dependencies: Rerun only when the target plan or intent changes
  }, [planId, editIntent, loadPlanAndSetMode, startNewPlanEdit, router])

  // --- Render Logic ---

  if (isStoreLoading) {
    console.log(`[PlanPageHandler] Rendering Loader. StoreLoading: ${isStoreLoading}`)
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle Edit Conflict Error specifically by showing dialog
  if (storeError?.startsWith("EDIT_CONFLICT")) {
    const targetId = storeError.split(":")[1]
    console.warn(`[PlanPageHandler] Opening conflict dialog for target ${targetId} with edit intent: ${editIntent}`)
    console.warn(`[PlanPageHandler] targetId value and type: ${targetId} (${typeof targetId})`)
    
    // Use the UI context to open the switch warning dialog with edit intent
    openSwitchWarningDialog(targetId, editIntent)
    
    // Return null to prevent rendering anything else while dialog is shown
    return null
  }

  // Handle Generic Errors (including conflict if not handled above)
  if (storeError) {
    console.log(`[PlanPageHandler] Rendering Error: ${storeError}`)
    // Specific handling for "not found" errors if needed
    if (storeError.includes("not found")) {
      // Redirect home after a short delay if plan not found
      setTimeout(() => {
        if (isMounted.current) router.replace("/")
      }, 50)
      return (
        <div className="flex h-full items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    // Generic error display
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-foreground/80 mb-6">
            {storeError.startsWith("EDIT_CONFLICT")
              ? "You have unsaved changes in another plan. Save or discard them before editing this one."
              : storeError}
          </p>
          <Button onClick={() => router.push("/")} variant="destructive">
            Go Home
          </Button>
          {/* Optionally add buttons to resolve conflict if error == 'EDIT_CONFLICT' */}
        </div>
      </div>
    )
  }

  // Determine which plan data to display based on the final mode
  const planToDisplay = mode === "normal" ? activePlan : draftPlan
  const currentDisplayId = mode === "normal" ? activePlanId : originalPlanId

  // Handle state where loading is done, no error, but plan is still null
  // This could happen if navigation/state updates are slightly out of sync briefly
  if (!planToDisplay) {
    console.log("[PlanPageHandler] No plan data available to display after load, showing loader.")
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle empty plan (no weeks) - Render menu first if applicable
  if (!planToDisplay.weeks || planToDisplay.weeks.length === 0) {
    console.log("[PlanPageHandler] Plan has no weeks, rendering empty state.")
    return (
      <>
        {mode !== "normal" && <PlanModeMenu />}
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center max-w-lg p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">
              Empty Plan
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This training plan doesn't have any weeks defined yet.
              {mode === "edit"
                ? " Add weeks via the JSON editor."
                : " Import a different plan or ask the owner to add content."}
            </p>
          </div>
        </div>
      </>
    )
  }

  // --- Render Actual Content ---
  console.log(
    `[PlanPageHandler] Rendering PlanViewer for planId: ${currentDisplayId ?? planId}, mode: ${mode}`
  )
  return (
    <>
      {/* Render menu only if not in normal mode */}
      {mode !== "normal" && <PlanModeMenu />}
      {/* Pass the correct plan data based on mode */}
      <PlanViewer
        plan={planToDisplay}
        planId={planId ?? "new-plan"} // Use original prop for context if needed
        isLoading={isStoreLoading} // Pass store loading state
      />
    </>
  )
}
