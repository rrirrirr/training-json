"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import WeeklyView from "@/components/weekly-view"
import BlockView from "@/components/block-view"
import { MobileScrollNav } from "@/components/mobile-scroll-nav"
import PlanHeader from "@/components/plan-header"

interface PlanViewerProps {
  planId: string
}

export default function PlanViewer({ planId }: PlanViewerProps) {
  const router = useRouter()

  // Get data and actions from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const isLoading = usePlanStore((state) => state.isLoading)
  const error = usePlanStore((state) => state.error)

  // Commented because probably not needed but might be
  // Redirect if the active plan ID doesn't match the URL ID
  // useEffect(() => {
  //   if (activePlanId && activePlanId !== planId) {
  // router.replace(`/plan/${activePlanId}`)
  //   }
  // }, [activePlanId, planId, router])

  // Handle loading state
  if (isLoading || !activePlan) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-foreground/80 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  // Handle empty plan (no weeks)
  if (activePlan.weeks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">
            Empty Plan
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This training plan doesn't have any weeks defined yet. Edit the plan JSON or import a
            different one.
          </p>
        </div>
      </div>
    )
  }

  // Find the relevant data for the selected week or month
  const weekData = selectedWeek
    ? activePlan.weeks.find((week) => week.weekNumber === selectedWeek)
    : null

  const monthData = activePlan.monthBlocks.find((block) => block.id === selectedMonth)

  return (
    <>
      {/* Content View with bottom padding on mobile */}
      <div className="p-4 pb-20 md:p-6 md:pb-6">
        {viewMode === "week" && weekData ? (
          <WeeklyView week={weekData} trainingPlan={activePlan} />
        ) : viewMode === "month" && monthData ? (
          <BlockView monthBlock={monthData} trainingPlan={activePlan} />
        ) : (
          // Fallback if data is somehow missing
          <div className="text-center p-8 text-muted-foreground">
            Please select a week or block to view.
          </div>
        )}
      </div>

      {/* Floating Mobile Nav Button - only appears when scrolling on mobile */}
      <MobileScrollNav />
    </>
  )
}
