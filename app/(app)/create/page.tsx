"use client"

import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import PlanViewer from "@/components/plan-viewer"
import { PlanModeMenu } from "@/components/plan-mode-menu"
import { Loader2 } from "lucide-react"

export default function CreatePlanViewerPage() {
  const router = useRouter()
  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const isStoreLoading = usePlanStore((state) => state.isLoading)

  useEffect(() => {
    // If a user lands here directly without a plan being prepared (e.g., from decompression),
    // redirect them to the homepage to avoid showing a blank or broken page.
    if (!isStoreLoading && !draftPlan && mode === "normal") {
      router.replace("/")
    }
  }, [isStoreLoading, draftPlan, mode, router])

  // Show a loading indicator while the store is initializing or if there's no draft plan yet.
  if (isStoreLoading || !draftPlan) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading plan viewer...</p>
      </div>
    )
  }

  // Once the draft plan is available in the store, render the UI to display it.
  return (
    <>
      <PlanModeMenu />
      <PlanViewer plan={draftPlan} planId="new-shared-plan" />
    </>
  )
}
