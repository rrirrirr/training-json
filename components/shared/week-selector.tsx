"use client"

import { cn } from "@/lib/utils"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import type { WeekType } from "@/types/training-plan"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface WeekSelectorProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  variant?: "sidebar" | "mobile" // Kept for potential non-layout uses
  getWeekInfo?: (weekNumber: number) => {
    type: string
    weekTypeIds: string[]
    colorName?: string
  }
}

export default function WeekSelector({
  weeks,
  selectedWeek,
  onSelectWeek,
  // variant = "sidebar", // Not used for layout logic here
  getWeekInfo,
}: WeekSelectorProps) {
  const { trainingData, currentPlan } = useTrainingPlans()
  const { theme } = useTheme()

  // Mapping function to get week type by ID
  const getWeekTypeById = (typeId: string): WeekType | undefined => {
    return currentPlan?.data?.weekTypes?.find((type) => type.id === typeId)
  }

  // Default week info function if not provided
  const defaultGetWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      weekTypeIds: weekData?.weekTypeIds || [],
      colorName: weekData?.weekStyle?.colorName,
    }
  }

  // Use provided getWeekInfo or default
  const weekInfoFn = getWeekInfo || defaultGetWeekInfo

  // --- Refactored Layout ---
  // Use CSS Grid with auto-fit and minmax.
  // This creates a responsive grid where columns wrap automatically,
  // have a minimum size, and grow equally to fill space, ensuring all
  // items are the same size.
  // - grid: Establishes the grid container.
  // - gap-2: Defines spacing between grid items.
  // - grid-cols-[repeat(auto-fit,minmax(4rem,1fr))]:
  //   - `repeat()`: Creates repeating column definitions.
  //   - `auto-fit`: Fits as many columns as possible in the container width. If items wrap, it collapses empty tracks, ensuring items stretch to fill space.
  //   - `minmax(4rem, 1fr)`: Each column (and thus button) will be at least `4rem` (64px) wide. The `1fr` allows them to grow equally to fill any remaining horizontal space. Adjust '4rem' if needed.
  const containerClassName = "grid gap-2 grid-cols-[repeat(auto-fit,minmax(4rem,1fr))]" // <-- UPDATED GRID LAYOUT

  // Get button styles - sizing is now controlled by the grid container
  const getWeekButtonStyles = (weekNumber: number) => {
    const { type, weekTypeIds, colorName } = weekInfoFn(weekNumber)
    const isSelected = selectedWeek === weekNumber

    // Styling logic for colors, borders, etc. (unchanged)
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

    // --- Refactored Styling ---
    // Sizing classes like flex-1, min-w-* are REMOVED from the button itself.
    // The button will naturally fill the grid cell defined by the container.
    return cn(
      "p-2 rounded text-center text-sm transition-colors", // Base styles
      // State/Color styles:
      isSelected
        ? "bg-primary text-primary-foreground"
        : colorClasses
          ? cn(colorClasses.bg, colorClasses.text)
          : "hover:bg-muted text-foreground",
      // Indicator styles:
      hasBorderIndicator ? "border-l-4" : "",
      borderColor // Note: Ensure borderColor gives a valid class string like "border-blue-500"
    )
  }

  return (
    <nav className="py-4">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Veckor
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
              // Button styles are now simpler, without explicit sizing
              className={getWeekButtonStyles(week)}
            >
              {/* Content remains the same */}
              <div className="font-medium">{week}</div>
              {type && <div className="text-xs opacity-75">{type}</div>}
              {weekTypeName && <div className="text-xs font-medium mt-1">{weekTypeName}</div>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
