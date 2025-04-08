"use client"

import { useState, useEffect } from "react"
import type { TrainingPlanData, MonthBlock } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import AppSidebar from "@/components/app-sidebar"
import WeeklyView from "@/components/weekly-view"
import MonthlyView from "@/components/monthly-view"
import { MobileNavBar } from "@/components/mobile-navbar"
import { Loader2 } from "lucide-react"
import { TrainingPlanProvider, useTrainingPlans } from "@/contexts/training-plan-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import WelcomeScreen from "@/components/welcome-screen"

// Main content component
function TrainingPlanContent() {
  const { currentPlan, addPlan } = useTrainingPlans()
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"week" | "month">("month")

  // --- Handlers for MobileNavBar ---
  const handleWeekChange = (newWeek: number) => {
    setSelectedWeek(newWeek)
    // Update month if the new week falls into a different one
    const month = trainingPlan?.monthBlocks.find((block) => block.weeks.includes(newWeek))
    if (month && month.id !== selectedMonth) {
      setSelectedMonth(month.id)
    }
  }

  const handleJumpToSelection = (monthId: number, weekId: number | null) => {
    setSelectedMonth(monthId)
    setSelectedWeek(weekId)
    if (weekId !== null) {
      setViewMode("week")
    } else {
      setViewMode("month")
    }
  }

  // Handle importing new data (from context or example)
  const handleImportData = (data: TrainingPlanData | null) => {
    setTrainingPlan(data)
    setError(null)

    // Reset selected week and month if data is present
    if (data && data.weeks.length > 0 && data.monthBlocks.length > 0) {
      const firstMonth = data.monthBlocks[0]
      const firstWeekInFirstMonth = firstMonth.weeks[0]

      setSelectedMonth(firstMonth.id)

      if (firstWeekInFirstMonth !== undefined) {
        setSelectedWeek(firstWeekInFirstMonth)
      } else {
        setSelectedWeek(null)
        setViewMode("month")
      }
    } else if (data) {
      // Data exists but might be empty
      setSelectedMonth(data.monthBlocks[0]?.id || 1)
      setSelectedWeek(null)
      setViewMode("month")
    } else {
      // No data at all
      setSelectedWeek(null)
      setSelectedMonth(1)
      setViewMode("month")
    }
  }

  // Set training plan data from context on initial load or context change
  useEffect(() => {
    if (currentPlan) {
      handleImportData(currentPlan.data)
    } else {
      handleImportData(null)
    }
  }, [currentPlan])

  // Handle custom events for creating new plan
  useEffect(() => {
    const handleCreatePlan = (e: CustomEvent) => {
      const { name } = e.detail || {}
      if (name) {
        const emptyPlan = { exerciseDefinitions: [], weeks: [], monthBlocks: [] }
        addPlan(name, emptyPlan)
      }
    }
    window.addEventListener("create-training-plan", handleCreatePlan as EventListener)
    return () => {
      window.removeEventListener("create-training-plan", handleCreatePlan as EventListener)
    }
  }, [addPlan])

  // Handle loading example data
  const handleLoadExample = () => {
    addPlan("Example Plan", exampleTrainingPlan)
  }

  // Create a new empty plan
  const handleCreateNewPlan = (name: string, emptyPlan: TrainingPlanData) => {
    addPlan(name, emptyPlan)
  }

  // Find the week data for the selected week
  const weekData = selectedWeek
    ? trainingPlan?.weeks.find((week) => week.weekNumber === selectedWeek)
    : null

  // Find the month data for the selected month
  const monthData = trainingPlan?.monthBlocks.find((block) => block.id === selectedMonth)

  // Handlers for Desktop Sidebar
  const handleWeekSelect = (weekNumber: number) => {
    setSelectedWeek(weekNumber)
    setViewMode("week")
    const month = trainingPlan?.monthBlocks.find((block) => block.weeks.includes(weekNumber))
    if (month && month.id !== selectedMonth) {
      setSelectedMonth(month.id)
    }
  }

  const handleMonthSelect = (monthId: number) => {
    setSelectedMonth(monthId)
    setViewMode("month")
  }

  // --- RENDER LOGIC ---

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Laddar träningsplan...</p>
      </div>
    )
  }

  // No data state - Welcome screen
  if (!trainingPlan || !currentPlan) {
    return (
      <WelcomeScreen 
        onLoadExample={handleLoadExample}
        onImportData={handleImportData}
        onCreateNewPlan={handleCreateNewPlan}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-lg p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Ett fel uppstod</h2>
          <p className="text-gray-700 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  // No weeks in the plan state
  if (trainingPlan.weeks.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-lg p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">Inga veckor hittades</h2>
          <p className="text-gray-700 mb-6">
            Denna träningsplan innehåller inga veckor. Prova att importera en annan plan eller ladda exempelplanen.
          </p>
        </div>
      </div>
    )
  }

  // Get all week numbers (ensure plan exists)
  const allWeeks = trainingPlan.weeks.map((week) => week.weekNumber).sort((a, b) => a - b)

  // Main app view
  return (
    <div className="flex flex-col h-screen max-w-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block h-full">
          <AppSidebar
            weeks={allWeeks}
            selectedWeek={selectedWeek}
            onSelectWeek={handleWeekSelect}
            months={trainingPlan.monthBlocks}
            selectedMonth={selectedMonth}
            onSelectMonth={handleMonthSelect}
            trainingData={trainingPlan.weeks}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile Navigation Bar */}
          <div className="md:hidden">
            <MobileNavBar
              months={trainingPlan.monthBlocks}
              weeks={allWeeks}
              selectedMonth={selectedMonth}
              selectedWeek={selectedWeek}
              onWeekChange={handleWeekChange}
              onJumpToSelection={handleJumpToSelection}
            />
          </div>

          {/* Content View */}
          <div className="flex-1 overflow-auto p-4">
            {viewMode === "week" && weekData ? (
              <WeeklyView week={weekData} trainingPlan={trainingPlan} />
            ) : viewMode === "month" && monthData ? (
              <MonthlyView monthBlock={monthData} trainingPlan={trainingPlan} />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">
                  {weekData === null && viewMode === "week"
                    ? `Kunde inte hitta data för vecka ${selectedWeek}.`
                    : monthData === null && viewMode === "month"
                    ? `Kunde inte hitta data för månad ${selectedMonth}.`
                    : "Välj en månad eller vecka för att visa träningsplanen."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrap component with providers
export default function TrainingPlanApp() {
  return (
    <TrainingPlanProvider>
      <SidebarProvider>
        <TrainingPlanContent />
      </SidebarProvider>
    </TrainingPlanProvider>
  )
}