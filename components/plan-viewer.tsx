"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import WeeklyView from "@/components/weekly-view"
import BlockView from "@/components/block-view"
import { MobileScrollNav } from "@/components/mobile-scroll-nav"
import { PlanModeMenu } from "@/components/plan-mode-menu"
import { usePlanMode } from "@/contexts/plan-mode-context"

interface PlanViewerProps {
  planId: string
}

export default function PlanViewer({ planId }: PlanViewerProps) {
  const router = useRouter()

  // Get data and actions from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const isLoading = usePlanStore((state) => state.isLoading)
  const error = usePlanStore((state) => state.error)
  
  // Get plan mode data from context
  const { mode, draftPlan } = usePlanMode()

  // Determine which plan to show based on mode
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan

  // Handle loading state
  if (isLoading || (!planToDisplay && mode === "normal")) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle error state
  if (error && mode === "normal") {
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
  if (planToDisplay && planToDisplay.weeks.length === 0) {
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
  const weekData = selectedWeek && planToDisplay
    ? planToDisplay.weeks.find((week) => week.weekNumber === selectedWeek)
    : null

  const monthData = planToDisplay && planToDisplay.monthBlocks.find(
    (block) => block.id === selectedMonth
  )

  return (
    <>
      {/* Show mode menu when in edit or view mode */}
      <PlanModeMenu />
      
      {/* Content View with bottom padding on mobile */}
      <div className="p-4 pb-20 md:p-6 md:pb-6">
        {viewMode === "week" && weekData ? (
          <WeeklyView week={weekData} trainingPlan={planToDisplay} />
        ) : viewMode === "month" && monthData ? (
          <BlockView monthBlock={monthData} trainingPlan={planToDisplay} />
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