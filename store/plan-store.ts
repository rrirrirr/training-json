import { create } from "zustand"
import type { TrainingPlanData } from "@/types/training-plan"

// Define the state structure for your store
interface PlanState {
  activePlan: TrainingPlanData | null // Holds the currently viewed/active plan
  setActivePlan: (plan: TrainingPlanData | null) => void // Action to update the active plan
  // You can add more state and actions here as needed (e.g., loading status, editing state)
}

// Create the Zustand store
export const usePlanStore = create<PlanState>((set) => ({
  // Initial state
  activePlan: null,

  // Action to set the active plan
  setActivePlan: (plan) => {
    console.log("Zustand: Setting active plan", plan?.metadata?.planName || "null")
    set({ activePlan: plan })
    // Note: Saving to local storage is handled in the component effect
    // to keep the store logic focused on state management.
  },
}))
