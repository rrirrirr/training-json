"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import WelcomeScreen from "@/components/welcome-screen"
import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import { usePlanStore } from "@/store/plan-store" // Import Zustand store hook
import { usePlanMode } from "@/contexts/plan-mode-context" // Keep plan mode context
import { db } from "@/lib/db-client" // Use our db abstraction

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false) // Initialize to false
  const [creatingPlan, setCreatingPlan] = useState(false)

  // Get necessary functions from contexts/stores
  const { mode, exitMode } = usePlanMode()
  const clearActivePlan = usePlanStore((state) => state.clearActivePlan) // Get clear function
  const activePlanId = usePlanStore((state) => state.activePlanId) // Get current active ID

  // Effect to clear modes and active plan state when navigating TO home page
  useEffect(() => {
    // Add check to see if we're about to navigate to the edit page
    // If localStorage has draft plan data but we haven't navigated yet, don't clear state
    const isDraftPlanInLocalStorage = localStorage.getItem("planModeDraft_plan") !== null;
    const isDraftModeInLocalStorage = localStorage.getItem("planModeDraft_mode") === "edit";
    
    // If we have draft plan data and in edit mode, we're likely in the process of navigating to edit page
    // Don't clear state in this case
    if (isDraftPlanInLocalStorage && isDraftModeInLocalStorage) {
      console.log("[HomePage] Draft plan in localStorage detected, likely navigating to edit page. Not clearing state.");
      return;
    }
    
    let didClear = false
    // Exit view/edit mode if applicable
    if (mode !== "normal") {
      console.log("[HomePage] Exiting non-normal mode:", mode)
      exitMode() // Clears plan mode context state and its localStorage keys
      didClear = true
    }
    // Also clear the active plan from the main Zustand store
    if (activePlanId !== null) {
      console.log("[HomePage] Clearing active plan in Zustand store.")
      clearActivePlan() // Clears Zustand active plan state and lastViewedPlanId localStorage
      didClear = true
    }

    if (didClear) {
      console.log("[HomePage] State cleared on mount.")
    }
  }, [mode, exitMode, activePlanId, clearActivePlan]) // Dependencies ensure this runs if mode/activePlanId changes

  // Handler for loading example (keep as is)
  const handleLoadExample = async () => {
    setCreatingPlan(true)
    try {
      const { data, error } = await db
        .from("training_plans")
        .insert({ plan_data: exampleTrainingPlan })
        .select("id")
        .single()
      if (error) throw error
      if (data?.id) {
        localStorage.setItem("lastViewedPlanId", data.id) // Store immediately for next load
        router.push(`/plan/${data.id}`)
      }
    } catch (error) {
      console.error("Error creating example plan:", error)
      setCreatingPlan(false)
    }
  }

  // Handler for importing plan data - now uses edit mode instead of direct database save
  const handleImportPlan = async (data: TrainingPlanData) => {
    console.log("[HomePage] handleImportPlan called - this should not happen with the new flow");
    console.log("[HomePage] Plans should now enter edit mode directly instead of saving immediately");
    
    // Ensure metadata is present and has a planName
    if (!data.metadata) {
      data.metadata = { planName: `Imported Plan ${new Date().toLocaleDateString()}` }
    } else if (!data.metadata.planName) {
      data.metadata.planName = `Imported Plan ${new Date().toLocaleDateString()}`
    }
    
    // Enter edit mode directly instead of saving to database
    console.log("[HomePage] Entering edit mode with imported plan");
    enterEditMode(data);
  }

  // Event listener for AI creation (keep as is)
  useEffect(() => {
    const handlePlanCreatedFromJson = async (e: CustomEvent<{ data: TrainingPlanData }>) => {
      const data = e.detail.data
      
      // Ensure metadata is present and has a planName
      if (!data.metadata) {
        data.metadata = { planName: `AI-Generated Plan ${new Date().toLocaleDateString()}` }
      } else if (!data.metadata.planName) {
        data.metadata.planName = `AI-Generated Plan ${new Date().toLocaleDateString()}`
      }
      
      // Enter edit mode directly instead of saving to database
      console.log("[HomePage] Entering edit mode with AI-generated plan");
      // Use the enterEditMode function from the plan mode context
      enterEditMode(data);
    }
    // @ts-ignore
    window.addEventListener("plan-created-from-json", handlePlanCreatedFromJson)
    return () => {
      // @ts-ignore
      window.removeEventListener("plan-created-from-json", handlePlanCreatedFromJson)
    }
  }, []) // Empty dependency array is correct here

  if (creatingPlan) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
          <h2 className="text-xl font-medium">Creating Plan...</h2>
          <p className="text-muted-foreground"> Please wait while we set up your training plan </p>
        </div>
      </div>
    )
  }

  // Show welcome screen if no plan is selected/loaded
  return <WelcomeScreen onLoadExample={handleLoadExample} onImportData={handleImportPlan} />
}