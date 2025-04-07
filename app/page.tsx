"use client"

import { useState, useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"
import { fetchTrainingPlan } from "@/utils/fetch-training-plan"
import Sidebar from "@/components/sidebar"
import TabNavigation from "@/components/tab-navigation"
import WeeklyView from "@/components/weekly-view"
import MonthlyView from "@/components/monthly-view"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2 } from "lucide-react"
import { exampleTrainingPlan } from "@/utils/example-training-plan"

export default function TrainingPlanApp() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"week" | "month">("month")

  // Fetch training plan data
  useEffect(() => {
    async function loadTrainingPlan() {
      try {
        setLoading(true)
        const data = await fetchTrainingPlan()
        setTrainingPlan(data)

        // Set initial selections
        if (data.weeks.length > 0) {
          setSelectedWeek(data.weeks[0].weekNumber)
        }

        if (data.monthBlocks.length > 0) {
          setSelectedMonth(data.monthBlocks[0].id)
        }

        setError(null)
      } catch (err) {
        setError("Failed to load training plan. Please import a JSON file.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadTrainingPlan()
  }, [])

  // Handle importing new data
  const handleImportData = (data: TrainingPlanData) => {
    setTrainingPlan(data)
    setError(null)

    // Reset selected week and month to first available
    if (data.weeks.length > 0) {
      const firstWeek = data.weeks[0].weekNumber
      setSelectedWeek(firstWeek)

      // Find the month that contains this week
      const month = data.monthBlocks.find((block) => block.weeks.includes(firstWeek))
      if (month) {
        setSelectedMonth(month.id)
      }
    }
  }

  // Handle loading example data
  const handleLoadExample = () => {
    handleImportData(exampleTrainingPlan)
  }

  // Find the week data for the selected week
  const weekData = selectedWeek ? trainingPlan?.weeks.find((week) => week.weekNumber === selectedWeek) : null

  // Find the month data for the selected month
  const monthData = trainingPlan?.monthBlocks.find((block) => block.id === selectedMonth)

  // Handle week selection
  const handleWeekSelect = (weekNumber: number) => {
    setSelectedWeek(weekNumber)
    setViewMode("week")

    // Update the selected month based on the selected week
    const month = trainingPlan?.monthBlocks.find((block) => block.weeks.includes(weekNumber))
    if (month) {
      setSelectedMonth(month.id)
    }
  }

  // Handle month selection
  const handleMonthSelect = (monthId: number) => {
    setSelectedMonth(monthId)
    setViewMode("month")
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Laddar träningsplan...</p>
        </div>
      </div>
    )
  }

  // Error or no data state
  if (error || !trainingPlan || trainingPlan.weeks.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader onImportData={handleImportData} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-bold text-blue-700 mb-2">
              {error ? "Ett fel uppstod" : "Ingen träningsplan laddad"}
            </h2>
            <p className="text-gray-700 mb-4">{error || "Importera en träningsplan för att komma igång."}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button onClick={handleLoadExample} className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Load Example Plan
              </Button>
              <Button onClick={() => document.getElementById("import-button")?.click()}>Import Your Own Plan</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get all week numbers for the sidebar
  const allWeeks = trainingPlan.weeks.map((week) => week.weekNumber).sort((a, b) => a - b)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AppHeader onImportData={handleImportData} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block">
          <Sidebar
            weeks={allWeeks}
            selectedWeek={selectedWeek}
            onSelectWeek={handleWeekSelect}
            trainingData={trainingPlan.weeks}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <TabNavigation
            months={trainingPlan.monthBlocks}
            selectedMonth={selectedMonth}
            onSelectMonth={handleMonthSelect}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Mobile Week Selector */}
          <div className="md:hidden p-2 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-500">Välj vecka:</span>
              <select
                className="bg-white border border-gray-300 rounded-md text-sm p-1"
                value={selectedWeek || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    handleWeekSelect(Number(value))
                  }
                }}
              >
                {allWeeks.map((week) => (
                  <option key={week} value={week}>
                    Vecka {week}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content View */}
          <div className="flex-1 overflow-auto p-4">
            {viewMode === "week" && weekData ? (
              <WeeklyView week={weekData} trainingPlan={trainingPlan} />
            ) : viewMode === "month" && monthData ? (
              <MonthlyView monthBlock={monthData} trainingPlan={trainingPlan} />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500">Välj en månad eller vecka för att visa träningsplanen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

