"use client"

import type { Week, MonthBlock } from "@/types/training-plan"
import { Calendar, List, Plus, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTrainingPlans } from "@/contexts/training-plan-context"

interface SidebarProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  months: MonthBlock[]
  selectedMonth: number
  onSelectMonth: (monthId: number) => void
  trainingData: Week[]
  viewMode: "week" | "month"
  onViewModeChange: (mode: "week" | "month") => void
}

export default function Sidebar({
  weeks,
  selectedWeek,
  onSelectWeek,
  months,
  selectedMonth,
  onSelectMonth,
  trainingData,
  viewMode,
  onViewModeChange,
}: SidebarProps) {
  const { currentPlan } = useTrainingPlans()
  // Function to get week type (A/B) and special status (deload/test)
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold">Träningsplan</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Create new training plan"
            onClick={() => window.dispatchEvent(new CustomEvent("new-training-plan"))}
          >
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          {currentPlan ? currentPlan.name : "Träningsöversikt"}
        </p>
      </div>

      {/* View mode toggle */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            title="Månadsvy"
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" /> Månadsvy
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            title="Veckovy"
            className="flex-1"
          >
            <List className="h-4 w-4 mr-2" /> Veckovy
          </Button>
        </div>
      </div>

      {/* Dynamic content based on view mode */}
      <div className="flex-1 overflow-auto">
        {viewMode === "month" ? (
          /* Month selection */
          <div className="p-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Månader
            </h2>
            <div className="space-y-1">
              {months.map((month) => (
                <button
                  key={month.id}
                  onClick={() => onSelectMonth(month.id)}
                  className={`
                    w-full p-2 rounded text-left text-sm transition-colors
                    ${selectedMonth === month.id ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"}
                  `}
                >
                  {month.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Week selection */
          <nav className="p-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Veckor
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {weeks.map((week) => {
                const { type, isDeload, isTest } = getWeekInfo(week)
                return (
                  <button
                    key={week}
                    onClick={() => onSelectWeek(week)}
                    className={`
                      p-2 rounded text-center text-sm transition-colors
                      ${selectedWeek === week ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"}
                      ${isDeload ? "border-l-4 border-yellow-500" : ""}
                      ${isTest ? "border-l-4 border-green-500" : ""}
                    `}
                  >
                    <div className="font-medium">{week}</div>
                    {type && <div className="text-xs opacity-75">{type}</div>}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 mt-auto border-t border-gray-700">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
          <span className="text-xs text-gray-400">DELOAD vecka</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
          <span className="text-xs text-gray-400">TEST vecka</span>
        </div>
      </div>
    </div>
  )
}
