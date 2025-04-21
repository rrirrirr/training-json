"use client"

import { cn } from "@/lib/utils"
import { usePlanStore } from "@/store/plan-store"
import type { WeekType } from "@/types/training-plan"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"
import { usePlanMode } from "@/contexts/plan-mode-context"

interface WeekSelectorProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  variant?: "sidebar" | "mobile" // Kept for potential non-layout uses
  getWeekInfo?: (weekNumber: number) => {
    type: string
    weekTypeIds: string[]
    colorName?: string | undefined // Ensure undefined is possible
  }
}

export default function WeekSelector({
  weeks,
  selectedWeek,
  onSelectWeek,
  // variant = "sidebar", // Not used for layout logic here
  getWeekInfo,
}: WeekSelectorProps) {
  // Get active plan directly from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)

  // Get plan mode data from context
  const { mode, draftPlan } = usePlanMode()

  // Determine which plan to use
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan
  const trainingData = planToDisplay?.weeks || []

  const { theme } = useTheme()

  // Mapping function to get week type by ID
  const getWeekTypeById = (typeId: string): WeekType | undefined => {
    return planToDisplay?.weekTypes?.find((type) => type.id === typeId)
  }

  // Default week info function if not provided
  const defaultGetWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      weekTypeIds: weekData?.weekTypeIds || [],
      colorName: weekData?.weekStyle?.colorName, // Can be undefined
    }
  }

  // Use provided getWeekInfo or default
  const weekInfoFn = getWeekInfo || defaultGetWeekInfo

  // Responsive Grid Layout - items will be at least 5rem wide
  const containerClassName =
    "grid gap-2 grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] overflow-y-auto"

  // Get button styles - includes aspect-square and flex for uniform size
  const getWeekButtonStyles = (weekNumber: number) => {
    const { type, weekTypeIds, colorName } = weekInfoFn(weekNumber)
    const isSelected = selectedWeek === weekNumber

    // Styling logic for colors, borders, etc.
    let weekTypeColorName: string | undefined = undefined
    let firstWeekType: WeekType | undefined = undefined
    if (weekTypeIds && weekTypeIds.length > 0) {
      firstWeekType = getWeekTypeById(weekTypeIds[0])
      if (firstWeekType) {
        weekTypeColorName = firstWeekType.colorName
      }
    }
    const effectiveColorName = colorName || weekTypeColorName
    const colorClasses =
      effectiveColorName && !isSelected
        ? getThemeAwareColorClasses(effectiveColorName, theme)
        : null
    const hasBorderIndicator = firstWeekType !== undefined
    const borderColor = firstWeekType
      ? getThemeAwareColorClasses(firstWeekType.colorName, theme)?.border
      : undefined

    return cn(
      // Base styles & Layout:
      "p-1 rounded text-center text-sm transition-colors", // Adjusted padding
      "aspect-square flex flex-col items-center justify-center", // Force square aspect ratio and center content

      // State/Color styles:
      isSelected
        ? "bg-primary text-primary-foreground"
        : colorClasses
          ? cn(colorClasses.bg, colorClasses.text)
          : "hover:bg-muted text-foreground",
      // Indicator styles:
      hasBorderIndicator ? "border-l-4" : "",
      borderColor // e.g., "border-blue-500"
    )
  }

  return (
    <nav className="py-4">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Weeks
      </h2>
      {/* Apply the responsive Grid container class */}
      <div className={containerClassName}>
        {weeks.map((week) => {
          const { type, weekTypeIds } = weekInfoFn(week)
          let weekTypeName = ""
          if (weekTypeIds && weekTypeIds.length > 0) {
            const firstWeekType = getWeekTypeById(weekTypeIds[0])
            if (firstWeekType) {
              weekTypeName = firstWeekType.name
            }
          }

          return (
            <button
              key={week}
              onClick={() => onSelectWeek(week)}
              // Apply the updated styles for uniform size and centered content
              className={getWeekButtonStyles(week)}
            >
              {/* Content arrangement is handled by flex properties */}
              <div className="font-medium">{week}</div>
              {/* Conditionally render type and name if they exist and aren't empty/placeholder */}
              {type && type !== "-" && <div className="text-xs opacity-75">{type}</div>}
              {weekTypeName && <div className="text-xs font-medium mt-0.5">{weekTypeName}</div>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
