"use client" // Mark as a Client Component

import { useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"

type PlanLoaderAndSaverProps = {
  planData: TrainingPlanData | null // The plan fetched by the server page
  planId: string // The ID of the plan being loaded
}

// Consistent key for local storage
const LOCAL_STORAGE_KEY = "activeTrainingPlan"

export function PlanLoaderAndSaver({ planData, planId }: PlanLoaderAndSaverProps) {
  // Get the action function from the Zustand store
  const setActivePlan = usePlanStore((state) => state.setActivePlan)

  useEffect(() => {
    // This effect runs on the client after mount and when planData/planId change
    if (planData) {
      console.log(`Client: Handling fetched plan ${planId}.`)

      // 1. Save the fetched plan to Local Storage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planData))
        console.log(`Client: Plan ${planId} saved to local storage.`)
      } catch (error) {
        console.error("Client: Error saving plan to local storage:", error)
        // You could show a user notification here
      }

      // 2. Update the Zustand store ("Switch" to this plan)
      setActivePlan(planData)
    } else {
      // Optional: What happens if planData is null (e.g., plan not found)?
      // You might want to clear the active plan in the store and local storage
      // if the user navigates to an invalid plan ID.
      console.log(`Client: Received null planData for ${planId}.`)
      // Example: Clear state if plan not found
      // setActivePlan(null);
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    // Ensure setActivePlan is stable or included if it might change,
    // though Zustand setters are usually stable.
  }, [planData, planId, setActivePlan])

  // This component doesn't render any UI itself
  return null
}
