"use client"

import type { MonthBlock, TrainingPlanData, BlockDefinition } from "@/types/training-plan"
import { useRef } from "react"
import WeeklyView from "./weekly-view" // Assuming this component exists and is correct
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface BlockViewProps {
  monthBlock: MonthBlock
  trainingPlan: TrainingPlanData
}

export default function BlockView({ monthBlock, trainingPlan }: BlockViewProps) {
  // Create refs for each week section
  const weekRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const { theme } = useTheme()

  // Get all weeks for this block
  const weeksInBlock = trainingPlan.weeks
    .filter((week) => monthBlock.weeks.includes(week.weekNumber))
    .sort((a, b) => a.weekNumber - b.weekNumber)

  // Get block definition if it exists
  const findBlockDefinition = (): BlockDefinition | undefined => {
    if (!trainingPlan.blocks) return undefined

    // First, try to find block by checking if any week in this block has a blockId
    if (weeksInBlock.length > 0) {
      const firstWeek = weeksInBlock[0]
      if (firstWeek.blockId) {
        return trainingPlan.blocks.find((block) => block.id === firstWeek.blockId)
      }
    }

    // Fallback: try to match by name (if blockId isn't found)
    // This fallback might be brittle, consider refining if needed
    return trainingPlan.blocks.find(
      (block) =>
        block.name === monthBlock.name ||
        (block.description && monthBlock.name.includes(block.description))
    )
  }

  const blockDefinition = findBlockDefinition()

  // Get theme-aware styling information
  const colorName = monthBlock.style?.colorName || blockDefinition?.style?.colorName
  const colorClasses = getThemeAwareColorClasses(colorName, theme)

  // Function to scroll to a specific week
  const scrollToWeek = (weekNumber: number) => {
    if (weekRefs.current[weekNumber]) {
      weekRefs.current[weekNumber]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  if (weeksInBlock.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Inga veckor hittades för detta block</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-8">
      {/* Block header */}
      <div
        className={cn(
          "py-3 px-4 rounded-lg border-2 mb-8 max-w-4xl mx-auto shadow-sm",
          // Use theme-aware styling
          colorClasses?.bg || "bg-card",
          colorClasses?.border || "border-primary/20", // Consider if border should use accent color
          colorClasses?.text // Apply base text color from theme
        )}
      >
        <div className="md:flex md:justify-between md:items-start">
          <div className="mb-3 md:mb-0">
            {/* Apply title styling here */}
            <h2 className="mb-1 font-oswald font-light uppercase tracking-wide text-2xl">
              {" "}
              {/* <-- Applied styles, removed text-xl/font-bold, added text-2xl */}
              {blockDefinition?.name || monthBlock.name}
            </h2>

            {blockDefinition?.focus && (
              // Use default body font (Inter probably) for details
              <div className="text-base font-medium">
                {/* Consider uppercasing the label for consistency? */}
                <span className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">
                  Fokus:
                </span>{" "}
                {blockDefinition.focus}
              </div>
            )}

            {blockDefinition?.description && (
              // Use default body font for description
              <p className="text-sm text-muted-foreground mt-1">{blockDefinition.description}</p>
            )}
          </div>

          {blockDefinition?.durationWeeks && (
            // Use default body font for duration badge
            <div className="text-sm bg-primary/5 px-3 py-1 rounded-md inline-block shrink-0 mt-2 md:mt-0">
              {blockDefinition.durationWeeks} veckor
            </div>
          )}
        </div>

        {/* Clickable week links */}
        <div className="mt-3 flex flex-wrap gap-2">
          {weeksInBlock.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => scrollToWeek(week.weekNumber)}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-primary/10 text-primary hover:bg-primary/20 transition-colors", // Maybe use accent color here?
                "focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              Vecka {week.weekNumber}
              {week.weekType && week.weekType !== "-" && ` (${week.weekType})`}
            </button>
          ))}
        </div>
      </div>

      {/* Week sections with refs for scrolling */}
      {weeksInBlock.map((week) => (
        <div
          key={week.weekNumber}
          ref={(el) => (weekRefs.current[week.weekNumber] = el)}
          id={`week-${week.weekNumber}`}
        >
          {/* Assuming WeeklyView component handles its own titles/styling */}
          <WeeklyView week={week} trainingPlan={trainingPlan} compact={true} />
        </div>
      ))}
    </div>
  )
}
