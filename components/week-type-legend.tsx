"use client"

import { useTheme } from "next-themes"
import { WeekType } from "@/types/training-plan"
import { cn } from "@/lib/utils"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface WeekTypeLegendProps {
  weekTypes: WeekType[]
  className?: string
}

export default function WeekTypeLegend({ weekTypes, className }: WeekTypeLegendProps) {
  const { theme } = useTheme()

  if (!weekTypes || weekTypes.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {weekTypes.map((weekType) => {
        const colorClasses = getThemeAwareColorClasses(weekType.colorName, theme)
        
        return (
          <div key={weekType.id} className="flex items-center">
            <div 
              className={cn(
                "w-4 h-4 border-l-4 mr-2 shrink-0", 
                colorClasses?.border || `border-${weekType.colorName}-500`
              )}
              title={weekType.description}
            />
            <span>{weekType.name} week</span>
          </div>
        )
      })}
    </div>
  )
}