"use client"

import { useState, useEffect } from "react"
import type { TrainingPlanData, MonthBlock } from "@/types/training-plan" // Added MonthBlock import if needed elsewhere
// Assuming fetchTrainingPlan and exampleTrainingPlan handle data correctly
// import { fetchTrainingPlan } from "@/utils/fetch-training-plan"; // Uncomment if used directly
import { exampleTrainingPlan } from "@/utils/example-training-plan"
// Assuming these components exist and are imported correctly
import AppSidebar from "@/components/app-sidebar"
// import TabNavigation from "@/components/tab-navigation"; // Likely unused now
import WeeklyView from "@/components/weekly-view"
import MonthlyView from "@/components/monthly-view"
// import AppHeader from "@/components/app-header"; // Uncomment if used
import { MobileNavBar } from "@/components/mobile-navbar" // Import the new mobile navbar
import { Button } from "@/components/ui/button"
import { BookOpen, Loader2, Upload } from "lucide-react"
import { TrainingPlanProvider, useTrainingPlans } from "@/contexts/training-plan-context"
import { SidebarProvider } from "@/components/ui/sidebar" // Assuming this exists

// Main content component
function TrainingPlanContent() {
  const { currentPlan, addPlan } = useTrainingPlans()
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(1) // Default or load from context/storage
  // State to hold the actual plan data (either from context or example)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlanData | null>(null)
  const [loading, setLoading] = useState(false) // Consider setting true initially if fetching
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"week" | "month">("month") // Keep track of view mode

  // --- Handlers for MobileNavBar ---
  const handleWeekChange = (newWeek: number) => {
    setSelectedWeek(newWeek)
    // Update month if the new week falls into a different one
    const month = trainingPlan?.monthBlocks.find((block) => block.weeks.includes(newWeek))
    if (month && month.id !== selectedMonth) {
      setSelectedMonth(month.id)
    }
    // Optionally switch view mode when changing week via prev/next
    // setViewMode("week");
  }

  const handleJumpToSelection = (monthId: number, weekId: number | null) => {
    setSelectedMonth(monthId)
    setSelectedWeek(weekId)
    // Decide if viewMode should change based on selection
    if (weekId !== null) {
      setViewMode("week")
    } else {
      setViewMode("month")
    }
  }
  // --- End Handlers for MobileNavBar ---

  // Handle importing new data (from context or example)
  const handleImportData = (data: TrainingPlanData | null) => {
    setTrainingPlan(data)
    setError(null)

    // Reset selected week and month if data is present
    if (data && data.weeks.length > 0 && data.monthBlocks.length > 0) {
      const firstMonth = data.monthBlocks[0]
      const firstWeekInFirstMonth = firstMonth.weeks[0]

      setSelectedMonth(firstMonth.id)

      // Decide initial week selection logic (e.g., first week of first month, or null)
      if (firstWeekInFirstMonth !== undefined) {
        setSelectedWeek(firstWeekInFirstMonth)
        // setViewMode("week"); // Optionally start in week view
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
      setSelectedMonth(1) // Reset to default
      setViewMode("month")
    }
  }

  // Set training plan data from context on initial load or context change
  useEffect(() => {
    if (currentPlan) {
      handleImportData(currentPlan.data)
    } else {
      // Handle case where there's no plan in context initially
      // Maybe load example or show welcome screen until example is loaded
      handleImportData(null) // Ensure welcome screen shows if no plan initially
    }
  }, [currentPlan])

  // Handle custom events for creating new plan (keep as is)
  useEffect(() => {
    const handleCreatePlan = (e: CustomEvent) => {
      // ... (your existing create plan logic)
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
    // Directly add example plan to context (which triggers the useEffect above)
    // This assumes addPlan replaces if name exists or handles duplicates appropriately
    addPlan("Example Plan", exampleTrainingPlan)
    // Or, if you just want to view it without adding to context permanently:
    // handleImportData(exampleTrainingPlan);
  }

  // Find the week data for the selected week
  const weekData = selectedWeek
    ? trainingPlan?.weeks.find((week) => week.weekNumber === selectedWeek)
    : null

  // Find the month data for the selected month
  const monthData = trainingPlan?.monthBlocks.find((block) => block.id === selectedMonth)

  // Handlers for Desktop Sidebar (keep as is)
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
    // Maybe clear selected week when selecting a month directly?
    // setSelectedWeek(null);
  }

  // --- RENDER LOGIC ---

  // Loading state
  if (loading) {
    // Consider adding logic to set loading to true/false during fetch/context update
    return (
      <div className="flex h-screen items-center justify-center">
        {/* ... loading indicator ... */}
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Laddar träningsplan...</p>
      </div>
    )
  }

  // No data state - Welcome screen
  if (!trainingPlan || !currentPlan) {
    // Check if plan data is truly null/undefined
    return (
      <div className="flex flex-col h-screen w-screen">
        {/* ... Welcome screen content ... */}
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
                <BookOpen className="h-4 w-4 mr-2" /> Ladda Exempelplan
              </Button>
              <Button
                onClick={() => document.getElementById("import-button")?.click()}
                className="flex items-center justify-center"
              >
                <Upload className="h-4 w-4 mr-2" /> Importera Din Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state (keep as is)
  if (error) {
    return <div className="flex flex-col h-screen">{/* ... error display ... */}</div>
  }

  // No weeks in the plan state (keep as is)
  if (trainingPlan.weeks.length === 0) {
    return <div className="flex flex-col h-screen">{/* ... no weeks display ... */}</div>
  }

  // Get all week numbers (ensure plan exists)
  const allWeeks = trainingPlan.weeks.map((week) => week.weekNumber).sort((a, b) => a - b)

  // Main app view
  return (
    <div className="flex flex-col h-screen max-w-screen bg-background">
      {/* Optional Header could go here */}
      {/* <AppHeader /> */}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block h-full">
          <AppSidebar
            weeks={allWeeks}
            selectedWeek={selectedWeek}
            onSelectWeek={handleWeekSelect} // Use desktop handler
            months={trainingPlan.monthBlocks}
            selectedMonth={selectedMonth}
            onSelectMonth={handleMonthSelect} // Use desktop handler
            trainingData={trainingPlan.weeks}
            viewMode={viewMode}
            onViewModeChange={setViewMode} // Pass view mode setter
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* === NEW MOBILE NAVBAR AREA === */}
          <div className="md:hidden">
            {" "}
            {/* This makes it mobile-only */}
            <MobileNavBar
              months={trainingPlan.monthBlocks}
              weeks={allWeeks}
              selectedMonth={selectedMonth}
              selectedWeek={selectedWeek}
              onWeekChange={handleWeekChange} // Pass mobile handler
              onJumpToSelection={handleJumpToSelection} // Pass mobile handler
            />
            {/* Optionally add view mode toggle buttons here if not inside MobileNavBar's sheet */}
            {/* <div className="p-2 border-b flex justify-end space-x-2">
                <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('month')}>Month</Button>
                <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
            </div> */}
          </div>
          {/* === END NEW MOBILE NAVBAR AREA === */}

          {/* Content View */}
          <div className="flex-1 overflow-auto p-4">
            {viewMode === "week" && weekData ? (
              <WeeklyView week={weekData} trainingPlan={trainingPlan} />
            ) : viewMode === "month" && monthData ? (
              <MonthlyView monthBlock={monthData} trainingPlan={trainingPlan} /> // Render monthly view
            ) : (
              // Fallback if viewMode or data mismatch
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

// Wrap component with providers (keep as is)
export default function TrainingPlanApp() {
  return (
    <TrainingPlanProvider>
      <SidebarProvider>
        <TrainingPlanContent />
      </SidebarProvider>
    </TrainingPlanProvider>
  )
}
