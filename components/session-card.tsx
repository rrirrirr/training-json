"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData, SessionTypeDefinition } from "@/types/training-plan"
import { Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getSessionStyling } from "@/utils/session-utils"

// Function to handle color values (for backward compatibility)
const getColorValue = (
  color: string | undefined,
  prefix: string,
  defaultClass: string
): { className: string; style: React.CSSProperties } => {
  const style: React.CSSProperties = {}
  if (!color) return { className: defaultClass, style }
  if (color.startsWith("#") || color.startsWith("rgb")) {
    if (prefix === "bg-") style.backgroundColor = color
    else if (prefix === "border-") style.borderColor = color
    else if (prefix === "text-") style.color = color
    return { className: "", style }
  }
  if (color.startsWith(prefix)) return { className: color, style }
  return { className: `${prefix}${color}`, style }
}

// Helper component: LoadDisplay (Keep as is)
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: any }) {
  if (load === "-") return <span className="text-muted-foreground">-</span>
  const { className: colorClass, style: colorStyle } = loadStyle?.color
    ? getColorValue(loadStyle.color, "text-", "")
    : { className: "", style: {} }
  const hasKg = typeof load === "string" && load.toLowerCase().includes("kg")
  if (hasKg) {
    const match = load.match(/(\d+(?:\.\d+)?\s*kg)(.*)/i)
    if (match) {
      return (
        <span style={colorStyle} className={cn(colorClass)}>
          <span className={cn(loadStyle?.strong && "font-semibold")}>{match[1]}</span>
          {match[2] && <span className="ml-1 text-muted-foreground">{match[2].trim()}</span>}
        </span>
      )
    }
  }
  return (
    <span style={colorStyle} className={cn(colorClass, loadStyle?.strong && "font-semibold")}>
      {load}
    </span>
  )
}

// Helper component: CommentDisplay (Keep as is)
function CommentDisplay({ comment, commentStyle }: { comment: string; commentStyle?: any }) {
  if (!comment) return null
  const { className: colorClass, style: colorStyle } = commentStyle?.color
    ? getColorValue(commentStyle.color, "text-", "text-muted-foreground")
    : { className: "text-muted-foreground", style: {} }
  if (commentStyle?.fontStyle) colorStyle.fontStyle = commentStyle.fontStyle
  return (
    <span style={colorStyle} className={cn(colorClass)}>
      {comment}
    </span>
  )
}

interface SessionCardProps {
  session: Session
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function SessionCard({ session, trainingPlan, compact = false }: SessionCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { sessionName, exercises } = session
  const { theme } = useTheme() // Get current theme
  
  // Get styling information using the new utility
  const sessionStyling = getSessionStyling(session, trainingPlan, theme)
  const displaySessionType = sessionStyling.sessionTypeName
  
  // Toggle function remains the same
  const toggleDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowDetails(!showDetails)
  }

  return (
    <Card
      onClick={() => toggleDetails()}
      className={cn(
        "transition-colors duration-200 hover:shadow-lg max-w-full overflow-hidden border cursor-pointer",
        // Use the theme-aware color classes
        sessionStyling.colorClasses?.bg,
        sessionStyling.colorClasses?.border,
        session.sessionStyle?.styleClass,
        // For backward compatibility, include the old styling approach
        !sessionStyling.colorName && sessionStyling.backgroundColor ? 
          getColorValue(sessionStyling.backgroundColor, "bg-", "bg-card").className : "",
        !sessionStyling.colorName && sessionStyling.borderColor ? 
          getColorValue(sessionStyling.borderColor, "border-", "border-border").className : ""
      )}
      // Include inline styles for older styling method (only if not using colorName)
      style={!sessionStyling.colorName ? {
        backgroundColor: sessionStyling.backgroundColor?.startsWith('#') || sessionStyling.backgroundColor?.startsWith('rgb') 
          ? sessionStyling.backgroundColor : undefined,
        borderColor: sessionStyling.borderColor?.startsWith('#') || sessionStyling.borderColor?.startsWith('rgb') 
          ? sessionStyling.borderColor : undefined,
      } : undefined}
    >
      <CardHeader className="relative flex flex-row justify-between items-start pb-4 border-b pr-10 pt-4">
        {/* Title and Description */}
        <div>
          <CardTitle>{sessionName}</CardTitle>
          <CardDescription className="mt-1">
            {displaySessionType}
            {session.sessionStyle?.note && <span className="ml-2 italic">{session.sessionStyle.note}</span>}
          </CardDescription>
        </div>
        {/* Absolutely positioned icon container */}
        <div className="absolute top-3 right-3 text-muted-foreground">
          {showDetails ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </div>
      </CardHeader>
      {/* CardContent is ALWAYS rendered */}
      <CardContent className="p-4" id={`session-details-${sessionName.replace(/\s+/g, "-")}`}>
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const combinedData = combineExerciseData(exercise, trainingPlan)
            const exerciseIdentifier =
              "exerciseId" in exercise ? exercise.exerciseId : `custom-${index}`

            return (
              <div
                key={`${exerciseIdentifier}`}
                className={cn("p-3 rounded border", index % 2 !== 0 && "bg-muted/50")}
              >
                {/* Row 1: Exercise Name, Sets, Reps (Always Visible) */}
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className={cn(combinedData.isMainLift && "font-semibold")}>
                    {combinedData.name}
                  </span>
                  <div className="text-sm text-center space-x-4">
                    <span>
                      <span className="text-xs text-muted-foreground mr-1">Set:</span>
                      {exercise.sets}
                    </span>
                    <span>
                      <span className="text-xs text-muted-foreground mr-1">Reps:</span>
                      {exercise.reps}
                    </span>
                  </div>
                </div>
                {/* Row 2: Intensity (Always Visible) */}
                <div className="text-sm mb-2">
                  <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                    Intensitet:
                  </span>
                  <LoadDisplay load={exercise.load} loadStyle={exercise.loadStyle} />
                </div>
                {/* Row 3: Comment (Always Visible, except when compact) */}
                {!compact && exercise.comment && (
                  <div className="text-sm mb-2">
                    <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                      Kommentar:
                    </span>
                    <CommentDisplay
                      comment={exercise.comment || ""}
                      commentStyle={exercise.commentStyle}
                    />
                  </div>
                )}
                {/* *** Details Section: Conditionally rendered based on showDetails *** */}
                {showDetails && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                    {/* Compact comment shown here only when details are open */}
                    {compact && exercise.comment && (
                      <div>
                        <span className="font-semibold text-foreground">Kommentar:</span>{" "}
                        <CommentDisplay
                          comment={exercise.comment || ""}
                          commentStyle={exercise.commentStyle}
                        />
                      </div>
                    )}
                    {/* Other details */}
                    {combinedData.targetMuscles && combinedData.targetMuscles.length > 0 && (
                      <div>
                        <span className="font-semibold text-foreground">Målmuskler:</span>{" "}
                        {combinedData.targetMuscles.join(", ")}
                      </div>
                    )}
                    {exercise.targetRPE && (
                      <div>
                        <span className="font-semibold text-foreground">Mål RPE:</span>{" "}
                        {exercise.targetRPE}
                      </div>
                    )}
                    {(exercise.tips || combinedData.generalTips) && (
                      <div>
                        <span className="font-semibold text-foreground">Tips:</span>{" "}
                        {exercise.tips || combinedData.generalTips}
                      </div>
                    )}
                    {combinedData.videoUrl && (
                      <div>
                        <a
                          href={combinedData.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/90 inline-flex items-center font-medium"
                        >
                          Se video <span className="ml-1">→</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}