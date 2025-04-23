"use client"

import { useEffect, useState, useRef } from "react" // Added useRef
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import PlanViewer from "@/components/plan-viewer"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"

export default function PlanEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { mode, draftPlan, originalPlanId, enterEditMode } = usePlanMode() // Get originalPlanId too
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById)
  const isStoreLoading = usePlanStore((state) => state.isLoading) // Zustand loading state
  const [isComponentLoading, setIsComponentLoading] = useState(true) // Component-level loading
  const isMounted = useRef(true) // Ref to track mount status

  // Get planId from params once
  const planIdFromParams = params.id

  useEffect(() => {
    isMounted.current = true // Mark as mounted
    let isActive = true // Flag to prevent state updates after unmount or early exit

    const loadAndSetup = async () => {
      console.log(`[PlanEditPage ${planIdFromParams}] Running effect. Current mode: ${mode}`)

      // *** CRITICAL CHECK: If mode is already normal, it means exitMode was likely called (e.g., after save). Do nothing. ***
      if (mode === "normal") {
        console.log(
          `[PlanEditPage ${planIdFromParams}] Mode is 'normal'. Skipping effect to allow navigation.`
        )
        setIsComponentLoading(false) // Ensure loader hides if we somehow stay on this page
        return
      }

      // If we are already editing the correct plan, we are good.
      if (mode === "edit" && originalPlanId === planIdFromParams) {
        console.log(`[PlanEditPage ${planIdFromParams}] Already in correct edit mode.`)
        if (isActive) setIsComponentLoading(false)
        return
      }

      // If we are in edit mode but for a *different* plan, or not in edit mode at all,
      // we need to load the correct plan and enter edit mode.
      console.log(
        `[PlanEditPage ${planIdFromParams}] Mode is '${mode}', attempting to load plan and enter edit mode.`
      )
      setIsComponentLoading(true) // Show loader while fetching/setting up

      try {
        const planData = await fetchPlanById(planIdFromParams)

        if (!planData) {
          console.error(`[PlanEditPage ${planIdFromParams}] Plan not found.`)
          if (isActive) router.replace("/")
          return
        }

        // Only proceed if the effect is still active
        if (isActive) {
          console.log(
            `[PlanEditPage ${planIdFromParams}] Entering edit mode with fetched plan:`,
            planData.metadata?.planName
          )
          // Enter edit mode - This might trigger navigation itself if implemented differently,
          // but here we assume it just sets the context state.
          enterEditMode(planData, planIdFromParams)
          // We expect to be redirected or the component state to update,
          // keep loading true until the component potentially unmounts or re-renders in the correct state.
          // Setting isComponentLoading to false here might be premature if enterEditMode causes navigation.
          // Let subsequent renders handle the final loading state based on the context mode.
          // If enterEditMode *doesn't* navigate immediately, we need this:
          setIsComponentLoading(false)
        }
      } catch (error) {
        console.error(`[PlanEditPage ${planIdFromParams}] Error loading plan:`, error)
        if (isActive) router.replace("/")
      }
    }

    loadAndSetup()

    // Cleanup function
    return () => {
      isActive = false // Prevent state updates on unmount
      isMounted.current = false // Update ref on unmount
    }
  }, [planIdFromParams, mode, originalPlanId, fetchPlanById, enterEditMode, router]) // Add dependencies

  // Combine loading states
  const isLoading = isStoreLoading || isComponentLoading

  // Render loader while loading or if the mode check prevents setup
  if (isLoading || mode !== "edit" || originalPlanId !== planIdFromParams) {
    // Keep showing loader if the mode isn't 'edit' for the *correct* plan ID yet
    // This prevents rendering PlanViewer prematurely if enterEditMode is still processing
    // or if the initial mode check decided to skip setup.
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Render PlanViewer only when confirmed to be in edit mode for the correct plan
  return <PlanViewer planId={planIdFromParams} isLoading={false} /> // Pass isLoading as false since we handled it above
}
