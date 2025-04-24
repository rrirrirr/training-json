"use client"

import { useRouter } from "next/navigation" // Ensure router is imported
import { Loader2 } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import WeeklyView from "@/components/weekly-view"
import BlockView from "@/components/block-view"
import { MobileScrollNav } from "@/components/mobile-scroll-nav"
import { useEffect, useRef, useState } from "react"
import type { TrainingPlanData } from "@/types/training-plan"

interface PlanViewerProps {
  plan: TrainingPlanData
  planId?: string
  isLoading?: boolean
}

export default function PlanViewer({
  plan,
  planId = "unknown",
  isLoading: isLoadingProp = false,
}: PlanViewerProps) {
  const router = useRouter() // Get router instance
  const [hasCheckedForMissingPlan, setHasCheckedForMissingPlan] = useState(false)

  // Get data and actions from Zustand store
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const isStoreLoading = usePlanStore((state) => state.isLoading)
  const error = usePlanStore((state) => state.error)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const mode = usePlanStore((state) => state.mode)

  // The plan is now passed directly as prop, no need to determine from mode

  const previousPlanIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (plan && (planId !== previousPlanIdRef.current || selectedWeek === null)) {
      if (plan.weeks && plan.weeks.length > 0) {
        const firstWeek = plan.weeks.sort((a, b) => a.weekNumber - b.weekNumber)[0].weekNumber
        if (selectedWeek !== firstWeek) {
          selectWeek(firstWeek)
        }
      } else if (plan.monthBlocks && plan.monthBlocks.length > 0) {
        const firstMonthId = plan.monthBlocks.sort((a, b) => a.id - b.id)[0].id
        if (selectedMonth !== firstMonthId) {
          selectMonth(firstMonthId)
        }
      }
    }

    previousPlanIdRef.current = planId
  }, [plan, planId, selectWeek, selectMonth]) // Keep select actions if needed by ESLint, but planId is key

  // Effect to handle redirection logic for missing plans
  useEffect(() => {
    if (!hasCheckedForMissingPlan && !plan && mode === "normal") {
      const timer = setTimeout(() => {
        setHasCheckedForMissingPlan(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [hasCheckedForMissingPlan, plan, mode])

  // Combined Loading State Check
  if (isLoadingProp || isStoreLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check if we should redirect after the delay and loading are finished
  if (
    hasCheckedForMissingPlan &&
    !plan &&
    mode === "normal" &&
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/plan/")
  ) {
    console.log("[PlanViewer] No plan to display after delay, redirecting to home page via router.")

    try {
      // Clear relevant localStorage items
      localStorage.removeItem("planStoreDraft_mode")
      localStorage.removeItem("planStoreDraft_plan")
      localStorage.removeItem("planStoreDraft_originalId")
      localStorage.removeItem("lastViewedPlanId")
      console.log("[PlanViewer] Cleared relevant localStorage keys.")
    } catch (error) {
      console.error("Error clearing localStorage keys:", error)
    }

    // Use router.replace instead of window.location.href
    router.replace("/") // Use replace to remove the invalid URL from history

    return (
      // Return loader during redirect
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

  // Handle empty plan
  if (plan && (!plan.weeks || plan.weeks.length === 0)) {
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
          {/* Consider adding Edit JSON button here if mode === 'edit' */}
        </div>
      </div>
    )
  }

  // Find the relevant data for the selected week or month
  const weekData =
    selectedWeek && plan ? plan.weeks.find((week) => week.weekNumber === selectedWeek) : null

  const monthData = plan && plan.monthBlocks.find((block) => block.id === selectedMonth)

  // Debug information
  console.log("[PlanViewer] Rendering with:", {
    planId,
    mode,
    viewMode,
    selectedWeek,
    selectedMonth,
    hasWeekData: !!weekData,
    hasMonthData: !!monthData,
  })

  return (
    <div className="p-4 pb-20 md:p-6 md:pb-6">
      {viewMode === "week" && weekData ? (
        <WeeklyView week={weekData} trainingPlan={plan} />
      ) : viewMode === "month" && monthData ? (
        <BlockView monthBlock={monthData} trainingPlan={plan} />
      ) : (
        // Fallback content
        <div className="text-center p-8 text-muted-foreground">
          <p>No data available for the selected view.</p>
          <p className="text-sm mt-2">
            {viewMode === "week"
              ? `Week ${selectedWeek} is not defined in the plan.`
              : `Month block ${selectedMonth} is not defined in the plan.`}
          </p>
        </div>
      )}

      {/* MobileScrollNav remains */}
      <MobileScrollNav />
    </div>
  )
}
