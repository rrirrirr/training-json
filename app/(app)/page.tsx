"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import WelcomeScreen from "@/components/welcome-screen"
import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import { usePlanStore } from "@/store/plan-store" // Import Zustand store hook
import { usePlanMode } from "@/contexts/plan-mode-context" // Keep plan mode context
import { supabase } from "@/lib/supa-client"

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
    /* ... as before ... */
    setCreatingPlan(true)
    try {
      const { data, error } = await supabase
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

  // Handler for importing plan data (keep as is)
  const handleImportPlan = async (data: TrainingPlanData) => {
    /* ... as before ... */
    setCreatingPlan(true)
    try {
      if (!data.metadata)
        data.metadata = { planName: `Imported Plan ${new Date().toLocaleDateString()}` }
      else if (!data.metadata.planName)
        data.metadata.planName = `Imported Plan ${new Date().toLocaleDateString()}`
      const { data: createdPlan, error } = await supabase
        .from("training_plans")
        .insert({ plan_data: data })
        .select("id")
        .single()
      if (error) throw error
      if (createdPlan?.id) {
        localStorage.setItem("lastViewedPlanId", createdPlan.id) // Store immediately
        router.push(`/plan/${createdPlan.id}`)
      }
    } catch (error) {
      console.error("Error creating imported plan:", error)
      setCreatingPlan(false)
    }
  }

  // Event listener for AI creation (keep as is)
  useEffect(() => {
    /* ... as before ... */
    const handlePlanCreatedFromJson = async (e: CustomEvent<{ data: TrainingPlanData }>) => {
      const data = e.detail.data
      await handleImportPlan(data)
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
      /* ... loading indicator ... */
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
