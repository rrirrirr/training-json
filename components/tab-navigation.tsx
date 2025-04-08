"use client"

import type { MonthBlock } from "@/types/training-plan"
import { Button } from "@/components/ui/button"
import { Calendar, List } from "lucide-react"

interface TabNavigationProps {
  months: MonthBlock[]
  selectedMonth: number
  onSelectMonth: (monthId: number) => void
  viewMode: "week" | "month"
  onViewModeChange: (mode: "week" | "month") => void
}

export default function TabNavigation({
  months,
  selectedMonth,
  onSelectMonth,
  viewMode,
  onViewModeChange,
}: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 flex justify-between items-center">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {months.map((month) => (
            <button
              key={month.id}
              onClick={() => onSelectMonth(month.id)}
              className={`
                px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  selectedMonth === month.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {month.name}
            </button>
          ))}
        </nav>

        <div className="flex space-x-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            title="Månadsvy"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            title="Veckovy"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
