"use client"

import { cn } from "@/lib/utils"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import type { Week } from "@/types/training-plan"

interface WeekSelectorProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  variant?: "sidebar" | "mobile"
  getWeekInfo?: (weekNumber: number) => {
    type: string
    isDeload: boolean
    isTest: boolean
  }
}

export default function WeekSelector({
  weeks,
  selectedWeek,
  onSelectWeek,
  variant = "sidebar",
  getWeekInfo,
}: WeekSelectorProps) {
  const { trainingData } = useTrainingPlans()

  // Default week info function if not provided
  const defaultGetWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  // Use provided getWeekInfo or default
  const weekInfoFn = getWeekInfo || defaultGetWeekInfo

  // Determine if grid layout or list layout based on variant
  const containerClassName =
    variant === "sidebar" ? "grid grid-cols-4 gap-2" : "grid grid-cols-3 gap-2 sm:grid-cols-4"

  // Get button styles based on variant and week properties
  const getWeekButtonStyles = (weekNumber: number) => {
    const { type, isDeload, isTest } = weekInfoFn(weekNumber)
    const isSelected = selectedWeek === weekNumber

    return cn(
      "p-2 rounded text-center text-sm transition-colors",
      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground",
      isDeload ? "border-l-4 border-yellow-500" : "",
      isTest ? "border-l-4 border-green-500" : ""
    )
  }

  return (
    <nav className="p-4">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Veckor
      </h2>
      <div className={containerClassName}>
        {weeks.map((week) => {
          const { type, isDeload, isTest } = weekInfoFn(week)
          return (
            <button
              key={week}
              onClick={() => onSelectWeek(week)}
              className={getWeekButtonStyles(week)}
            >
              <div className="font-medium">{week}</div>
              {type && <div className="text-xs opacity-75">{type}</div>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
