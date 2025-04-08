"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData } from "@/types/training-plan"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"

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

// Helper component: LoadDisplay
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: any }) {
  if (load === "-") return <span className="text-muted-foreground">-</span>

  // Get color class and style
  const { className: colorClass, style: colorStyle } = loadStyle?.color
    ? getColorValue(loadStyle.color, "text-", "")
    : { className: "", style: {} }

  // Check if the load contains a kg value
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

  // Default rendering if no kg or match
  return (
    <span style={colorStyle} className={cn(colorClass, loadStyle?.strong && "font-semibold")}>
      {load}
    </span>
  )
}

// Helper component: CommentDisplay
function CommentDisplay({ comment, commentStyle }: { comment: string; commentStyle?: any }) {
  if (!comment) return null

  // Get color class and style
  const { className: colorClass, style: colorStyle } = commentStyle?.color
    ? getColorValue(commentStyle.color, "text-", "text-muted-foreground")
    : { className: "text-muted-foreground", style: {} }

  // Apply font style if specified
  if (commentStyle?.fontStyle) {
    colorStyle.fontStyle = commentStyle.fontStyle
  }

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
  const { sessionName, sessionType, sessionStyle, exercises } = session

  // Get background style and class
  const getDefaultBg = () => {
    switch (sessionType) {
      case "Gym":
        return "bg-blue-50"
      case "Barmark":
        return "bg-green-50"
      case "Eget/Vila":
        return "bg-gray-50"
      default:
        return "bg-card"
    }
  }

  const { className: bgClass, style: bgStyle } = sessionStyle?.backgroundColor
    ? getColorValue(sessionStyle.backgroundColor, "bg-", getDefaultBg())
    : { className: getDefaultBg(), style: {} }

  // Get border style and class
  const getDefaultBorder = () => {
    switch (sessionType) {
      case "Gym":
        return "border-blue-200"
      case "Barmark":
        return "border-green-200"
      case "Eget/Vila":
        return "border-gray-200"
      default:
        return "border-border"
    }
  }

  const { className: borderClass, style: borderStyle } = sessionStyle?.borderColor
    ? getColorValue(sessionStyle.borderColor, "border-", getDefaultBorder())
    : { className: getDefaultBorder(), style: {} }

  // Combine styles
  const combinedStyle = {
    ...bgStyle,
    ...borderStyle,
  }

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetails(!showDetails)
  }

  return (
    <Card
      className={cn(
        "transition-colors duration-200 hover:shadow-lg max-w-full overflow-hidden border",
        bgClass,
        borderClass,
        sessionStyle?.styleClass // Apply any additional custom classes
      )}
      style={combinedStyle}
    >
      <CardHeader className="flex flex-row justify-between items-start pb-4 border-b">
        <div>
          <CardTitle>{sessionName}</CardTitle>
          {sessionStyle?.note && (
            <CardDescription className="mt-1 italic">{sessionStyle.note}</CardDescription>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDetails}
          aria-expanded={showDetails}
          aria-controls={`session-details-${sessionName.replace(/\s+/g, "-")}`}
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Hide Details</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">View Details</span>
            </>
          )}
        </Button>
      </CardHeader>

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
                {/* Row 1: Exercise Name, Sets, Reps */}
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

                {/* Row 2: Intensity */}
                <div className="text-sm mb-2">
                  <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                    Intensitet:
                  </span>
                  <LoadDisplay load={exercise.load} loadStyle={exercise.loadStyle} />
                </div>

                {/* Row 3: Comment (only if not compact) */}
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

                {/* Details Section */}
                {showDetails && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                    {compact && exercise.comment && (
                      <div>
                        <span className="font-semibold text-foreground">Kommentar:</span>{" "}
                        <CommentDisplay
                          comment={exercise.comment || ""}
                          commentStyle={exercise.commentStyle}
                        />
                      </div>
                    )}
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
