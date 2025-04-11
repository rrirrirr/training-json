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
  variant?: "sidebar" | "mobile"
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
  variant = "sidebar",
  getWeekInfo,
}: WeekSelectorProps) {
  const { trainingData, currentPlan } = useTrainingPlans()
  const { theme } = useTheme()

  // Mapping function to get week type by ID
  const getWeekTypeById = (typeId: string): WeekType | undefined => {
    return currentPlan?.data?.weekTypes?.find(type => type.id === typeId);
  }

  // Default week info function if not provided
  const defaultGetWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      weekTypeIds: weekData?.weekTypeIds || [],
      colorName: weekData?.weekStyle?.colorName
    }
  }

  // Use provided getWeekInfo or default
  const weekInfoFn = getWeekInfo || defaultGetWeekInfo

  // Determine if grid layout or list layout based on variant
  const containerClassName =
    variant === "sidebar" ? "grid grid-cols-4 gap-2" : "grid grid-cols-3 gap-2 sm:grid-cols-4"

  // Get button styles based on variant and week properties
  const getWeekButtonStyles = (weekNumber: number) => {
    const { type, weekTypeIds, colorName } = weekInfoFn(weekNumber)
    const isSelected = selectedWeek === weekNumber

    // Try to get first week type for styling (if there are multiple)
    let weekTypeColorName: string | undefined = undefined;
    let firstWeekType: WeekType | undefined = undefined;
    
    if (weekTypeIds && weekTypeIds.length > 0) {
      firstWeekType = getWeekTypeById(weekTypeIds[0]);
      if (firstWeekType) {
        weekTypeColorName = firstWeekType.colorName;
      }
    }

    // Prioritize explicit week style, then type style
    const effectiveColorName = colorName || weekTypeColorName;

    // Get theme-aware color classes if colorName is specified
    const colorClasses =
      effectiveColorName && !isSelected ? getThemeAwareColorClasses(effectiveColorName, theme) : null;

    // Determine if we need a left border for the first week type
    const hasBorderIndicator = firstWeekType !== undefined;
    const borderColor = firstWeekType ? 
      getThemeAwareColorClasses(firstWeekType.colorName, theme)?.border : 
      undefined;

    return cn(
      "p-2 rounded text-center text-sm transition-colors",
      // If selected, use primary styles
      isSelected
        ? "bg-primary text-primary-foreground"
        : // If not selected but has colorName, use theme-aware styling
          colorClasses
          ? cn(colorClasses.bg, colorClasses.text)
          : "hover:bg-muted text-foreground",
      // Add indicator for week type (if any)
      hasBorderIndicator ? "border-l-4" : "",
      borderColor
    )
  }

  return (
    <nav className="py-4">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Veckor
      </h2>
      <div className={containerClassName}>
        {weeks.map((week) => {
          const { type, weekTypeIds } = weekInfoFn(week)
          
          // Get the first week type name (if any) to show as a label
          let weekTypeName = "";
          if (weekTypeIds && weekTypeIds.length > 0) {
            const firstWeekType = getWeekTypeById(weekTypeIds[0]);
            if (firstWeekType) {
              weekTypeName = firstWeekType.name;
            }
          }
          
          return (
            <button
              key={week}
              onClick={() => onSelectWeek(week)}
              className={getWeekButtonStyles(week)}
            >
              <div className="font-medium">{week}</div>
              {type && <div className="text-xs opacity-75">{type}</div>}
              {weekTypeName && (
                <div className="text-xs font-medium mt-1">{weekTypeName}</div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}