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
import { BookOpen, Loader2, Upload } from "lucide-react"
import { exampleTrainingPlan } from "@/utils/example-training-plan"

export default function TrainingPlanApp() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"week" | "month">("month")

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
  const weekData = selectedWeek
    ? trainingPlan?.weeks.find((week) => week.weekNumber === selectedWeek)
    : null

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

  // No data state - Welcome screen
  if (!trainingPlan) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader onImportData={handleImportData} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-lg p-8 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Välkommen till Träningsplan</h2>
            <p className="text-gray-700 mb-6">
              Börja genom att importera din egen träningsplan eller ladda ett exempelprogram för att
              utforska applikationen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                onClick={handleLoadExample}
                variant="outline"
                className="flex items-center justify-center"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Ladda Exempelplan
              </Button>
              <Button
                onClick={() => document.getElementById("import-button")?.click()}
                className="flex items-center justify-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importera Din Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader onImportData={handleImportData} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-2">Ett fel uppstod</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button onClick={handleLoadExample} className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Ladda Exempelplan
              </Button>
              <Button
                onClick={() => document.getElementById("import-button")?.click()}
                variant="outline"
              >
                Försök Igen
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No weeks in the plan
  if (trainingPlan.weeks.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <AppHeader onImportData={handleImportData} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-700 mb-2">Ingen träningsplan laddad</h2>
            <p className="text-gray-700 mb-4">
              Den importerade JSON-filen innehåller inga träningsveckor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button onClick={handleLoadExample} className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Ladda Exempelplan
              </Button>
              <Button
                onClick={() => document.getElementById("import-button")?.click()}
                variant="outline"
              >
                Importera Annan Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get all week numbers for the sidebar
  const allWeeks = trainingPlan.weeks.map((week) => week.weekNumber).sort((a, b) => a - b)

  // Main app view
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AppHeader onImportData={handleImportData} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block h-full">
          <Sidebar
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
          {/* Mobile-only Tab Navigation */}
          <div className="md:hidden">
            <TabNavigation
              months={trainingPlan.monthBlocks}
              selectedMonth={selectedMonth}
              onSelectMonth={handleMonthSelect}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

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
                <p className="text-gray-500">
                  Välj en månad eller vecka för att visa träningsplanen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
