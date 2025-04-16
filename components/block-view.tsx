"use client"

import type { MonthBlock, TrainingPlanData, BlockDefinition, Week } from "@/types/training-plan" // Added Week
import { useRef } from "react"
import WeeklyView from "./weekly-view"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface BlockViewProps {
  monthBlock: MonthBlock | undefined | null // Allow potentially missing monthBlock too
  trainingPlan: TrainingPlanData | undefined | null // Allow potentially missing trainingPlan
}

export default function BlockView({ monthBlock, trainingPlan }: BlockViewProps) {
  const weekRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const { theme } = useTheme()

  // --- GUARD CLAUSES ---
  // Check if essential props are missing before trying to use them
  if (!trainingPlan || !trainingPlan.weeks || !monthBlock || !monthBlock.weeks) {
    console.error("BlockView: Missing required props", { monthBlock, trainingPlan })
    // Return null, a loading indicator, or an error message
    return (
      <div className="text-center p-8 text-red-500">
        Error: Training plan data or month block data is missing or incomplete.
      </div>
    )
  }
  // --- END GUARD CLAUSES ---

  // Get all weeks for this block - now safe to access .weeks
  const weeksInBlock: Week[] = trainingPlan.weeks // Ensure weeksInBlock has a type
    .filter((week) => monthBlock.weeks.includes(week.weekNumber)) // monthBlock.weeks is checked above
    .sort((a, b) => a.weekNumber - b.weekNumber)

  // Get block definition if it exists
  const findBlockDefinition = (): BlockDefinition | undefined => {
    // No need to check trainingPlan.blocks again if trainingPlan itself is checked
    if (!trainingPlan.blocks) return undefined

    // First, try to find block by checking if any week in this block has a blockId
    if (weeksInBlock.length > 0) {
      const firstWeek = weeksInBlock[0]
      if (firstWeek.blockId) {
        return trainingPlan.blocks.find((block) => block.id === firstWeek.blockId)
      }
    }

    // Fallback: try to match by name (if blockId isn't found)
    return trainingPlan.blocks.find(
      (block) =>
        block.name === monthBlock.name || // monthBlock.name is safe due to guard clause
        (block.description && monthBlock.name.includes(block.description))
    )
  }

  const blockDefinition = findBlockDefinition()

  // Get theme-aware styling information
  const colorName = monthBlock.style?.colorName || blockDefinition?.style?.colorName
  const colorClasses = getThemeAwareColorClasses(colorName, theme)

  // Function to scroll to a specific week
  const scrollToWeek = (weekNumber: number) => {
    // ... (rest of the function)
  }

  // This check might become redundant if you handle missing data above,
  // but it's fine to keep for clarity if weeksInBlock could still be empty
  // due to the filter logic.
  if (weeksInBlock.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Inga veckor hittades för detta block</p>
      </div>
    )
  }

  return (
    // --- Rest of your JSX ---
    <div className="space-y-12 pb-8">
      {/* Block header */}
      <div
        className={cn(
          "py-3 px-4 rounded-lg border-2 mb-8 max-w-4xl mx-auto shadow-sm",
          colorClasses?.bg || "bg-card",
          colorClasses?.border || "border-primary/20",
          colorClasses?.text
        )}
      >
        {/* ... header content ... */}
        <h2 className="mb-1 font-oswald font-light uppercase tracking-wide text-3xl underline">
          {/* Use optional chaining just in case blockDefinition is also undefined */}
          {blockDefinition?.name || monthBlock.name}
        </h2>
        {/* ... rest of header ... */}

        {/* Clickable week links */}
        <div className="mt-3 flex flex-wrap gap-2">
          {weeksInBlock.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => scrollToWeek(week.weekNumber)}
              // ... button classes ...
            >
              Vecka {week.weekNumber}
              {week.weekType && week.weekType !== "-" && ` (${week.weekType})`}
            </button>
          ))}
        </div>
      </div>

      {/* Week sections */}
      {weeksInBlock.map((week) => (
        <div
          key={week.weekNumber}
          ref={(el) => (weekRefs.current[week.weekNumber] = el)}
          id={`week-${week.weekNumber}`}
        >
          <WeeklyView week={week} trainingPlan={trainingPlan} compact={true} />
        </div>
      ))}
    </div>
  )
}
