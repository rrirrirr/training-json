import type { Week, TrainingPlanData } from "@/types/training-plan"
import SessionCard from "./session-card"
import { cn } from "@/lib/utils"

interface WeeklyViewProps {
  week: Week
  trainingPlan: TrainingPlanData
  compact?: boolean
}

// Function to handle color values, returning both class and inline style
const getColorValue = (
  color: string | undefined,
  prefix: string,
  defaultClass: string
): { className: string; style: React.CSSProperties } => {
  const style: React.CSSProperties = {}

  if (!color) {
    return { className: defaultClass, style }
  }

  // Handle direct color values (hex, rgb, etc.)
  if (color.startsWith("#") || color.startsWith("rgb")) {
    if (prefix === "bg-") {
      style.backgroundColor = color
    } else if (prefix === "border-") {
      style.borderColor = color
    } else if (prefix === "text-") {
      style.color = color
    }
    return { className: "", style }
  }

  // If the color already has the correct prefix
  if (color.startsWith(prefix)) {
    return { className: color, style }
  }

  // Otherwise, add the prefix to the color value
  return { className: `${prefix}${color}`, style }
}

export default function WeeklyView({ week, trainingPlan, compact = false }: WeeklyViewProps) {
  const {
    weekNumber,
    weekType,
    blockInfo,
    gymDays,
    barmarkDays,
    isDeload,
    isTest,
    sessions,
    weekStyle,
  } = week

  // Get default background based on week type
  const getDefaultBg = () => {
    if (isDeload) return "bg-yellow-50"
    if (isTest) return "bg-green-50"
    return "bg-white"
  }

  // Get default border based on week type
  const getDefaultBorder = () => {
    if (isDeload) return "border-yellow-200"
    if (isTest) return "border-green-200"
    return "border-gray-200"
  }

  // Get background style and class
  const { className: bgClass, style: bgStyle } = weekStyle?.backgroundColor
    ? getColorValue(weekStyle.backgroundColor, "bg-", getDefaultBg())
    : { className: getDefaultBg(), style: {} }

  // Get border style and class
  const { className: borderClass, style: borderStyle } = weekStyle?.borderColor
    ? getColorValue(weekStyle.borderColor, "border-", getDefaultBorder())
    : { className: getDefaultBorder(), style: {} }

  // Combine styles
  const combinedStyle = {
    ...bgStyle,
    ...borderStyle,
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Weekly Header */}
      <div
        className={cn(
          "mb-6 p-4 rounded-lg shadow-md border",
          bgClass,
          borderClass,
          weekStyle?.styleClass || ""
        )}
        style={combinedStyle}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
              Vecka {weekNumber}
              {weekType && weekType !== "-" && (
                <span className="text-sm font-normal px-2 py-0.5 bg-gray-200 rounded-full">
                  Typ {weekType}
                </span>
              )}
              {isDeload && (
                <span className="text-sm font-normal px-2 py-0.5 bg-yellow-200 rounded-full">
                  DELOAD
                </span>
              )}
              {isTest && (
                <span className="text-sm font-normal px-2 py-0.5 bg-green-200 rounded-full">
                  TEST
                </span>
              )}
            </h1>
            {blockInfo && <p className="text-gray-600 mt-1">{blockInfo}</p>}
            {weekStyle?.note && (
              <p className="text-sm italic text-gray-500 mt-1">{weekStyle.note}</p>
            )}
          </div>
          <div className="flex gap-3">
            {gymDays !== undefined && (
              <div className="text-center">
                <span className="text-sm text-gray-500">Gympass</span>
                <p className="text-xl font-semibold">{gymDays}</p>
              </div>
            )}
            {barmarkDays && (
              <div className="text-center">
                <span className="text-sm text-gray-500">Barmark</span>
                <p className="text-xl font-semibold">{barmarkDays}</p>
              </div>
            )}
          </div>
        </div>

        {/* Training Maxes */}
        {week.tm && Object.keys(week.tm).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Tränings Max (TM) för veckan:
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(week.tm).map(([lift, weight]) => (
                <div key={lift} className="bg-gray-100 px-3 py-1 rounded-lg">
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
