"use client"
import type { Block, TrainingPlanData, BlockDefinition, Week } from "@/types/training-plan" // Added Week
import { useRef } from "react"
import WeeklyView from "./weekly-view"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface BlockViewProps {
  block: Block | undefined | null // Allow potentially missing block too
  trainingPlan: TrainingPlanData | undefined | null // Allow potentially missing trainingPlan
}

export default function BlockView({ block, trainingPlan }: BlockViewProps) {
  const weekRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const { theme } = useTheme()

  // --- GUARD CLAUSES ---
  // Check if essential props are missing before trying to use them
  if (!trainingPlan || !trainingPlan.weeks || !block || !block.weeks) {
    console.error("BlockView: Missing required props", { block, trainingPlan })
    // Return null, a loading indicator, or an error message
    return (
      <div className="text-center p-8 text-red-500">
        Error: Training plan data or block data is missing or incomplete.
      </div>
    )
  }
  // --- END GUARD CLAUSES ---

  // Get all weeks for this block - now safe to access .weeks
  const weeksInBlock: Week[] = trainingPlan.weeks // Ensure weeksInBlock has a type
    .filter((week) => block.weeks.includes(week.weekNumber)) // block.weeks is checked above
    .sort((a, b) => a.weekNumber - b.weekNumber)

  // Get block definition if it exists
  const findBlockDefinition = (): BlockDefinition | undefined => {
    // No need to check trainingPlan.blocks again if trainingPlan itself is checked
    if (!trainingPlan.blocks) return undefined

    // First, try to find block by checking if any week in this block has a blockId
    if (weeksInBlock.length > 0) {
      const firstWeek = weeksInBlock[0]
      if (firstWeek.blockId) {
        // Use blockDef to avoid shadowing the block prop
        return trainingPlan.blocks.find((blockDef) => blockDef.id === firstWeek.blockId)
      }
    }

    // Fallback: try to match by name (if blockId isn't found)
    // Simplified fallback logic - adjust if the description check was intended differently
    return trainingPlan.blocks.find(
      // Use blockDef to avoid shadowing the block prop
      (blockDef) => blockDef.name === block.name
      // Original fallback logic commented out for reference:
      // (blockDef) =>
      //   blockDef.name === block.name ||
      //   (blockDef.description && block.name.includes(blockDef.description)) // This logic might need review if description matching is required
    )
  }

  const blockDefinition = findBlockDefinition()

  // Get theme-aware styling information
  const colorName = block.style?.colorName || blockDefinition?.style?.colorName
  const colorClasses = getThemeAwareColorClasses(colorName, theme)

  // Function to scroll to a specific week
  const scrollToWeek = (weekNumber: number) => {
    const element = weekRefs.current[weekNumber]
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start", // Or "center", "end", "nearest"
      })
    }
  }

  // This check might become redundant if you handle missing data above,
  // but it's fine to keep for clarity if weeksInBlock could still be empty
  // due to the filter logic.
  if (weeksInBlock.length === 0) {
    return (
      <div className="text-center p-8">
        {/* Message in Swedish */}
        <p className="text-gray-500">Inga veckor hittades för detta block.</p>
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
          colorClasses?.bg || "bg-card", // Use calculated theme-aware background
          colorClasses?.border || "border-primary/20", // Use calculated theme-aware border
          colorClasses?.text // Use calculated theme-aware text color (optional)
        )}
      >
        {/* Block title */}
        <h2 className="mb-1 font-oswald font-light uppercase tracking-wide text-3xl underline">
          {blockDefinition?.name || block.name}
        </h2>

        {/* Block Description (Optional - Add if needed) */}
        {(blockDefinition?.description || block.description) && (
          <p className="mt-1 text-sm opacity-90">
            {blockDefinition?.description || block.description}
          </p>
        )}

        {/* Clickable week links */}
        <div className="mt-3 flex flex-wrap gap-2">
          {weeksInBlock.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => scrollToWeek(week.weekNumber)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded border transition-colors",
                "hover:bg-primary hover:text-primary-foreground", // Example hover effect
                colorClasses?.border || "border-primary/30", // Use block's border color
                colorClasses?.text // Use block's text color (optional)
                // Add a class for the background if needed, maybe slightly lighter than the header bg
                // e.g., colorClasses?.bg ? `${colorClasses.bg} opacity-80` : 'bg-background'
              )}
            >
              Week {week.weekNumber}
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
          id={`week-${week.weekNumber}`} // Add ID for scrolling
          className="scroll-mt-20" // Add scroll margin top if you have a fixed header
        >
          <WeeklyView week={week} trainingPlan={trainingPlan} compact={true} />
        </div>
      ))}
    </div>
  )
}
