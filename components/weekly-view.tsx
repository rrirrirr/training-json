"use client"

import type { Week, TrainingPlanData, WeekType } from "@/types/training-plan"
import SessionCard from "./session-card" // Assuming this component exists and is correct
import { BadgeWithTooltip } from "@/components/ui/badge-with-tooltip"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getBlockInfo, getWeekTypes } from "@/utils/block-utils" // Assuming these utils exist and are correct
import { getThemeAwareColorClasses } from "@/utils/color-utils" // Assuming this util exists and is correct

interface WeeklyViewProps {
  week: Week
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function WeeklyView({ week, trainingPlan, compact = false }: WeeklyViewProps) {
  const { theme } = useTheme()

  // Add basic check for week object
  if (!week) {
    // console.warn("WeeklyView rendered with undefined week"); // Optional debug
    return <div className="text-center p-4 text-red-500">Error: Week data missing.</div>
  }

  // Destructure after checking week exists
  const { weekNumber, weekType, gymDays, barmarkDays, sessions, weekStyle } = week

  // Get block information using the updated utility
  const blockInfo = getBlockInfo(week, trainingPlan, theme)
  // Provide default empty strings if blockInfo properties are potentially undefined
  const blockDescription = blockInfo?.description || ""
  const blockFocus = blockInfo?.focus || ""

  // Get the week types for this week
  const weekTypes = getWeekTypes(week, trainingPlan)

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Weekly Header */}
      <div
        className={cn(
          "mb-6 p-4 rounded-lg shadow-md border",
          blockInfo?.colorClasses?.bg || "bg-card", // Use optional chaining
          blockInfo?.colorClasses?.border || "border-border", // Use optional chaining
          weekStyle?.styleClass
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            {/* Apply title styling here */}
            <h1 className="text-3xl flex flex-wrap items-center gap-2 font-oswald font-light uppercase tracking-wide">
              {/* <-- Applied styles, removed font-bold, changed size */}
              Week {weekNumber}
              {/* Week Type and Badges - Using BadgeWithTooltip */}
              {weekType && weekType !== "-" && (
                <BadgeWithTooltip
                  className="text-sm font-normal px-2 py-0.5 bg-muted rounded-full normal-case tracking-normal font-sans text-primary"
                  tooltipContent={`This is a Type ${weekType} training week`}
                >
                  Type {weekType}
                </BadgeWithTooltip>
              )}
              {weekTypes.map((wt) => {
                const typeColorClasses = getThemeAwareColorClasses(wt.colorName, theme)
                return (
                  <BadgeWithTooltip
                    key={wt.id}
                    className={cn(
                      "text-sm font-normal px-2 py-0.5 rounded-full normal-case tracking-normal font-sans", // Reset styles for badge
                      typeColorClasses?.bg || `bg-${wt.colorName}-200`,
                      typeColorClasses?.text || `text-${wt.colorName}-800`
                    )}
                    tooltipContent={wt.description || `${wt.name} training week`}
                  >
                    {wt.name}
                  </BadgeWithTooltip>
                )
              })}
            </h1>
            {/* Block Description and Focus - Keep original styling */}
            {blockDescription && (
              <p className={cn("mt-1", blockInfo?.colorClasses?.text)}>{blockDescription}</p> // Use optional chaining
            )}
            {blockFocus && (
              <div className={cn("text-sm mt-1", blockInfo?.colorClasses?.text)}>
                {" "}
                {/* Use optional chaining */}
                <span className="font-medium">Focus: </span> {/* Consider uppercasing label */}
                {blockFocus}
              </div>
            )}
            {weekStyle?.note && (
              <p className="text-sm italic text-muted-foreground mt-1">{weekStyle.note}</p>
            )}
          </div>
          {/* Gym/Barmark Days - Keep original styling */}
          <div className="flex gap-3 shrink-0">
            {gymDays !== undefined && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Gympass</span>
                <p className="text-xl font-semibold">{gymDays}</p>
              </div>
            )}
            {barmarkDays !== undefined && ( // Check for undefined as well
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Barmark</span>
                <p className="text-xl font-semibold">{barmarkDays}</p>
              </div>
            )}
          </div>
        </div>

        {/* Training Maxes - Keep original styling */}
        {week.tm && Object.keys(week.tm).length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tränings Max (TM) för veckan:
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(week.tm).map(([lift, weight]) => (
                <div key={lift} className="bg-muted/50 px-3 py-1 rounded-lg text-sm">
                  {" "}
                  {/* Adjusted size */}
                  <span className="font-medium">{lift}:</span> {weight} kg
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      {/* Add check for sessions array */}
      {Array.isArray(sessions) && sessions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {sessions.map((session, index) => (
            // Pass potentially undefined session safely if needed, or filter upstream
            <SessionCard
              key={index} // Consider a more stable key if possible
              session={session}
              trainingPlan={trainingPlan}
              compact={compact}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground italic p-4">
          No sessions found for this week.
        </div>
      )}
    </div>
  )
}
