"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import WeeklyView from "@/components/weekly-view"
import BlockView from "@/components/block-view"
import { MobileScrollNav } from "@/components/mobile-scroll-nav"
import { PlanModeMenu } from "@/components/plan-mode-menu"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { useEffect } from "react"

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
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const setViewMode = usePlanStore((state) => state.setViewMode)

  // Get plan mode data from context
  const { mode, draftPlan } = usePlanMode()

  // Determine which plan to show based on mode
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan

  // Effect to select default view when entering edit/view mode with a draft plan
  useEffect(() => {
    if (mode !== "normal" && draftPlan) {
      console.log("[PlanViewer] Setting default view for draft plan in", mode, "mode")

      // If plan has weeks, select the first week
      if (draftPlan.weeks && draftPlan.weeks.length > 0) {
        const firstWeek = draftPlan.weeks[0].weekNumber
        console.log("[PlanViewer] Selecting first week:", firstWeek)
        selectWeek(firstWeek)
      }
      // Otherwise select the first month block
      else if (draftPlan.monthBlocks && draftPlan.monthBlocks.length > 0) {
        const firstMonthId = draftPlan.monthBlocks[0].id
        console.log("[PlanViewer] Selecting first month:", firstMonthId)
        selectMonth(firstMonthId)
      }
    }
  }, [mode, draftPlan, selectWeek, selectMonth])

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Handle case when no plan is active
  if (!planToDisplay && mode === "normal") {
    console.log("[PlanViewer] No plan to display, redirecting to home page.")
    
    // Clear localStorage to ensure no attempt to restore a deleted plan
    try {
      localStorage.removeItem("planModeDraft_mode")
      localStorage.removeItem("planModeDraft_plan")
      localStorage.removeItem("planModeDraft_originalId")
      localStorage.removeItem("lastViewedPlanId") 
      console.log("[PlanViewer] Cleared PlanModeContext keys from localStorage.")
    } catch (error) {
      console.error("Error clearing localStorage keys:", error)
    }
    
    // Force a complete reload rather than using router.push
    // This ensures we don't get stuck in any lingering state
    window.location.href = "/"
    
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
  const weekData =
    selectedWeek && planToDisplay
      ? planToDisplay.weeks.find((week) => week.weekNumber === selectedWeek)
      : null

  const monthData =
    planToDisplay && planToDisplay.monthBlocks.find((block) => block.id === selectedMonth)

  // Debug information
  console.log("[PlanViewer] Rendering with:", {
    mode,
    planToDisplay: !!planToDisplay,
    selectedWeek,
    selectedMonth,
    viewMode,
    weekData: !!weekData,
    monthData: !!monthData,
  })

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
            <pre className="mt-4 p-4 bg-muted rounded text-xs text-left overflow-auto">
              Debug:{"\n"}
              Mode: {mode}
              {"\n"}
              View Mode: {viewMode}
              {"\n"}
              Selected Week: {selectedWeek}
              {"\n"}
              Selected Month: {selectedMonth}
              {"\n"}
              Has Plan Data: {!!planToDisplay}
              {"\n"}
              Weeks Count: {planToDisplay ? planToDisplay.weeks.length : 0}
              {"\n"}
              Blocks Count: {planToDisplay ? planToDisplay.monthBlocks.length : 0}
            </pre>
          </div>
        )}
      </div>

      {/* Floating Mobile Nav Button - only appears when scrolling on mobile */}
      <MobileScrollNav />
    </>
  )
}
