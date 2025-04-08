"use client"

import { useState, useEffect, useMemo } from "react" // Added useMemo
import type { TrainingPlanData, MonthBlock } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import WeeklyView from "@/components/weekly-view"
import MonthlyView from "@/components/monthly-view"
import { MobileNavBar } from "@/components/mobile-navbar"
import { Loader2 } from "lucide-react"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import WelcomeScreen from "@/components/welcome-screen"

// Main content component (Simplified)
function TrainingPlanContent() {
  // Get plan data AND UI state from context
  const {
    currentPlan,
    addPlan, // Existing plan data/actions
    selectedWeek,
    selectWeek, // Get UI state and actions from context
    selectedMonth,
    selectMonth, // Get UI state and actions from context
    viewMode,
    changeViewMode, // Get UI state and actions from context
    weeksForSidebar,
    monthsForSidebar, // Get derived data if needed (e.g., for MobileNavBar)
  } = useTrainingPlans()

  // Minimal local state for loading/error
  const [loading, setLoading] = useState(false) // Or manage this in context too
  const [error, setError] = useState<string | null>(null)

  // This useEffect might be removed if context handles loading initial plan state
  useEffect(() => {
    setLoading(true)
    // Simulate loading or wait for context hydration
    const timer = setTimeout(() => {
      if (!currentPlan) {
        // Handle no plan selected state if needed
      }
      setLoading(false)
    }, 100) // Adjust timing as needed
    return () => clearTimeout(timer)
  }, [currentPlan])

  // Handler for loading example (calls context action)
  const handleLoadExample = () => {
    addPlan("Example Plan", exampleTrainingPlan)
  }

  // Handler for creating new plan (calls context action)
  const handleCreateNewPlan = (name: string) => {
    const emptyPlan: TrainingPlanData = { exerciseDefinitions: [], weeks: [], monthBlocks: [] }
    addPlan(name, emptyPlan)
  }

  // Data finding logic uses state from context
  const trainingPlan = currentPlan?.data
  const weekData = useMemo(() => {
    return selectedWeek && trainingPlan
      ? trainingPlan.weeks.find((week) => week.weekNumber === selectedWeek)
      : null
  }, [selectedWeek, trainingPlan])

  const monthData = useMemo(() => {
    return trainingPlan?.monthBlocks.find((block) => block.id === selectedMonth)
  }, [selectedMonth, trainingPlan])

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        {" "}
        {/* Use h-full within main */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Welcome screen if no plan is selected/loaded
  if (!currentPlan || !trainingPlan) {
    return (
      <WelcomeScreen
        onLoadExample={handleLoadExample}
        onCreateNewPlan={handleCreateNewPlan}
        // onImportData might need context integration or local handling
        onImportData={(importedData) => {
          console.log("Import TBD", importedData)
        }}
      />
    )
  }

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

  // Handle case where plan exists but has no weeks
  if (trainingPlan.weeks.length === 0 && !loading) {
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
          {/* Optional: Button to edit JSON or load example */}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="md:hidden sticky top-0 z-20 bg-background border-b">
        {/* Pass context state and actions */}
        <MobileNavBar
          months={monthsForSidebar} // Use derived data from context
          weeks={weeksForSidebar} // Use derived data from context
          selectedMonth={selectedMonth} // Use state from context
          selectedWeek={selectedWeek} // Use state from context
          onWeekChange={selectWeek} // Use context action
          // Adapt onJumpToSelection to call context actions
          onJumpToSelection={(monthId, weekId) => {
            if (weekId !== null) {
              selectWeek(weekId) // This also sets viewMode='week' and potentially month
            } else {
              selectMonth(monthId) // This sets viewMode='month'
            }
          }}
        />
      </div>

      {/* Content View (Add padding here) */}
      <div className="p-4 md:p-6">
        {" "}
        {/* Added responsive padding */}
        {viewMode === "week" && weekData ? (
          <WeeklyView week={weekData} trainingPlan={trainingPlan} />
        ) : viewMode === "month" && monthData ? (
          <MonthlyView monthBlock={monthData} trainingPlan={trainingPlan} />
        ) : (
          // Better fallback if data is somehow missing despite checks
          <div className="text-center p-8 text-muted-foreground">
            Please select a week or month to view.
          </div>
        )}
      </div>
    </>
  )
}

// Main export for the page
export default function Page() {
  return <TrainingPlanContent />
}
