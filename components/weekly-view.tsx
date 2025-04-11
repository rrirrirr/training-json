"use client"

import type { Week, TrainingPlanData, WeekType } from "@/types/training-plan"
import SessionCard from "./session-card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getBlockInfo, getWeekTypes } from "@/utils/block-utils"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface WeeklyViewProps {
  week: Week
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function WeeklyView({ week, trainingPlan, compact = false }: WeeklyViewProps) {
  const { theme } = useTheme()

  const { weekNumber, weekType, gymDays, barmarkDays, sessions, weekStyle } = week

  // Get block information using the updated utility
  const blockInfo = getBlockInfo(week, trainingPlan, theme)
  const blockDescription = blockInfo.description || ""
  const blockFocus = blockInfo.focus || ""
  
  // Get the week types for this week
  const weekTypes = getWeekTypes(week, trainingPlan)

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Weekly Header */}
      <div
        className={cn(
          "mb-6 p-4 rounded-lg shadow-md border",
          blockInfo.colorClasses?.bg || "bg-card",
          blockInfo.colorClasses?.border || "border-border",
          weekStyle?.styleClass
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
              Vecka {weekNumber}
              {weekType && weekType !== "-" && (
                <span className="text-sm font-normal px-2 py-0.5 bg-muted rounded-full">
                  Typ {weekType}
                </span>
              )}
              
              {/* Week Type Badges */}
              {weekTypes.map((weekType) => {
                const typeColorClasses = getThemeAwareColorClasses(weekType.colorName, theme)
                return (
                  <span
                    key={weekType.id}
                    className={cn(
                      "text-sm font-normal px-2 py-0.5 rounded-full",
                      typeColorClasses?.bg || `bg-${weekType.colorName}-200`,
                      typeColorClasses?.text || `text-${weekType.colorName}-800`
                    )}
                    title={weekType.description}
                  >
                    {weekType.name}
                  </span>
                )
              })}
            </h1>
            {blockDescription && (
              <p className={cn("mt-1", blockInfo.colorClasses?.text)}>{blockDescription}</p>
            )}
            {blockFocus && (
              <div className={cn("text-sm mt-1", blockInfo.colorClasses?.text)}>
                <span className="font-medium">Focus: </span>
                {blockFocus}
              </div>
            )}
            {weekStyle?.note && (
              <p className="text-sm italic text-muted-foreground mt-1">{weekStyle.note}</p>
            )}
          </div>
          <div className="flex gap-3">
            {gymDays !== undefined && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Gympass</span>
                <p className="text-xl font-semibold">{gymDays}</p>
              </div>
            )}
            {barmarkDays && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Barmark</span>
                <p className="text-xl font-semibold">{barmarkDays}</p>
              </div>
            )}
          </div>
        </div>

        {/* Training Maxes */}
        {week.tm && Object.keys(week.tm).length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tränings Max (TM) för veckan:
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(week.tm).map(([lift, weight]) => (
                <div key={lift} className="bg-muted/50 px-3 py-1 rounded-lg">
                  <span className="font-medium">{lift}:</span> {weight} kg
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="grid gap-6 md:grid-cols-2">
        {sessions.map((session, index) => (
          <SessionCard
            key={index}
            session={session}
            trainingPlan={trainingPlan}
            compact={compact}
          />
        ))}
      </div>
    </div>
  )
}