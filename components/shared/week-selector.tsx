"use client"

import { cn } from "@/lib/utils"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import type { Week } from "@/types/training-plan"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface WeekSelectorProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  variant?: "sidebar" | "mobile"
  getWeekInfo?: (weekNumber: number) => {
    type: string
    isDeload: boolean
    isTest: boolean
    colorName?: string
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
  const { theme } = useTheme()

  // Default week info function if not provided
  const defaultGetWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
      colorName: weekData?.weekStyle?.colorName || 
                 (weekData?.isDeload ? "yellow" : 
                  weekData?.isTest ? "green" : undefined)
    }
  }

  // Use provided getWeekInfo or default
  const weekInfoFn = getWeekInfo || defaultGetWeekInfo

  // Determine if grid layout or list layout based on variant
  const containerClassName =
    variant === "sidebar" ? "grid grid-cols-4 gap-2" : "grid grid-cols-3 gap-2 sm:grid-cols-4"

  // Get button styles based on variant and week properties
  const getWeekButtonStyles = (weekNumber: number) => {
    const { type, isDeload, isTest, colorName } = weekInfoFn(weekNumber)
    const isSelected = selectedWeek === weekNumber

    // Get theme-aware color classes if colorName is specified
    const colorClasses = colorName && !isSelected 
      ? getThemeAwareColorClasses(colorName, theme)
      : null;

    return cn(
      "p-2 rounded text-center text-sm transition-colors",
      // If selected, use primary styles
      isSelected ? "bg-primary text-primary-foreground" : 
      // If not selected but has colorName, use theme-aware styling
      (colorClasses ? cn(colorClasses.bg, colorClasses.text) : "hover:bg-muted text-foreground"),
      // Always add indicators for special weeks
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