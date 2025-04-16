"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import WelcomeScreen from "@/components/welcome-screen"
import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import { usePlanStore } from "@/store/plan-store"
import { supabase } from "@/lib/supa-client"

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false) // Changed from true to false as we don't need initial loading
  const [creatingPlan, setCreatingPlan] = useState(false)
  // Removed the useEffect that checked localStorage and redirected

  // Handler for loading example
  const handleLoadExample = async () => {
    setCreatingPlan(true)
    try {
      // Insert the example plan into Supabase
      const { data, error } = await supabase
        .from("training_plans")
        .insert({
          plan_data: exampleTrainingPlan
        })
        .select("id")
        .single()

      if (error) throw error
      // Redirect to the newly created plan
      if (data?.id) {
        // Store the ID in localStorage for future visits
        localStorage.setItem("lastViewedPlanId", data.id)
        router.push(`/plan/${data.id}`)
      }
    } catch (error) {
      console.error("Error creating example plan:", error)
      setCreatingPlan(false)
    }
  }

  // Handler for importing plan data
  const handleImportPlan = async (data: TrainingPlanData) => {
    setCreatingPlan(true)
    try {
      // Make sure data has metadata with plan name
      if (!data.metadata) {
        data.metadata = { planName: `Imported Plan ${new Date().toLocaleDateString()}` }
      } else if (!data.metadata.planName) {
        data.metadata.planName = `Imported Plan ${new Date().toLocaleDateString()}`
      }
      
      // Insert the imported plan into Supabase
      const { data: createdPlan, error } = await supabase
        .from("training_plans")
        .insert({
          plan_data: data
        })
        .select("id")
        .single()

      if (error) throw error

      // Redirect to the newly created plan
      if (createdPlan?.id) {
        // Store the ID in localStorage for future visits
        localStorage.setItem("lastViewedPlanId", createdPlan.id)
        router.push(`/plan/${createdPlan.id}`)
      }
    } catch (error) {
      console.error("Error creating imported plan:", error)
      setCreatingPlan(false)
    }
  }

  // Listen for plan-created-from-json event (AI generation)
  useEffect(() => {
    const handlePlanCreatedFromJson = async (e: CustomEvent<{ data: TrainingPlanData }>) => {
      const data = e.detail.data
      await handleImportPlan(data)
    }

    // @ts-ignore - Custom event type
    window.addEventListener("plan-created-from-json", handlePlanCreatedFromJson)

    return () => {
      // @ts-ignore - Custom event type
      window.removeEventListener("plan-created-from-json", handlePlanCreatedFromJson)
    }
  }, [])

  if (creatingPlan) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
          <h2 className="text-xl font-medium">Creating Plan...</h2>
          <p className="text-muted-foreground">
            Please wait while we set up your training plan
          </p>
        </div>
      </div>
    )
  }

  // Show welcome screen if no plan is selected/loaded
  return <WelcomeScreen onLoadExample={handleLoadExample} onImportData={handleImportPlan} />
}