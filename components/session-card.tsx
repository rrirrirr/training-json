"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData } from "@/types/training-plan"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"

// --- Helper component: LoadDisplay (Using Shadcn Foreground/Muted) ---
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: any }) {
  if (load === "-") return <span className="text-muted-foreground">-</span>

  // Base style - use CSS variable for potential override, default to foreground
  const baseStyle: React.CSSProperties = {
    color: loadStyle?.color ? loadStyle.color : "hsl(var(--foreground))", // Default to foreground color
  }
  // Muted style for secondary text
  const mutedStyle: React.CSSProperties = {
    color: "hsl(var(--muted-foreground))", // Always use muted for secondary info
  }

  // Check if the load contains a kg value
  const hasKg = typeof load === "string" && load.toLowerCase().includes("kg")

  if (hasKg) {
    const match = load.match(/(\d+(?:\.\d+)?\s*kg)(.*)/i)
    if (match) {
      return (
        <span style={baseStyle}>
          <span className={cn(loadStyle?.strong && "font-semibold")}>{match[1]}</span>
          {match[2] && (
            <span style={mutedStyle} className="ml-1">
              {match[2].trim()}
            </span>
          )}
        </span>
      )
    }
  }

  // Default rendering if no kg or match
  return (
    <span style={baseStyle} className={cn(loadStyle?.strong && "font-semibold")}>
      {load}
    </span>
  )
}

// --- Helper component: CommentDisplay (Using Shadcn Muted Foreground) ---
function CommentDisplay({ comment, commentStyle }: { comment: string; commentStyle?: any }) {
  if (!comment) return null

  // Apply custom styling if provided, otherwise default to muted foreground
  const style: React.CSSProperties = {
    color: commentStyle?.color ? commentStyle.color : "hsl(var(--muted-foreground))",
    fontStyle: commentStyle?.fontStyle ? commentStyle.fontStyle : "normal", // Default fontStyle
  }

  return <span style={style}>{comment}</span>
}

// --- Interface remains the same ---
interface SessionCardProps {
  session: Session
  trainingPlan: TrainingPlanData
  compact?: boolean
}

// --- Refactored SessionCard component ---
export default function SessionCard({ session, trainingPlan, compact = false }: SessionCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { sessionName, sessionType, sessionStyle, exercises } = session

  // Determine background/border *classes* using CSS variables
  const getSessionColorClasses = () => {
    switch (sessionType) {
      case "Gym":
        // Use oklch() here now!
        return "bg-[oklch(var(--session-gym-bg))] border-[oklch(var(--session-gym-border))]"
      case "Barmark":
        // Use oklch() here now!
        return "bg-[oklch(var(--session-barmark-bg))] border-[oklch(var(--session-barmark-border))]"
      case "Eget/Vila":
        // Use oklch() here now!
        return "bg-[oklch(var(--session-egen-vila-bg))] border-[oklch(var(--session-egen-vila-border))]"
      default:
        // Use oklch() for defaults too, pulling from the stored values
        // Note: Tailwind needs the function name if the variable only holds values
        // Using bg-card and border directly might be simpler if variables match exactly.
        return "bg-[oklch(var(--session-default-bg-values))] border-[oklch(var(--session-default-border-values))]"
      // Simpler Alternative if --session-default-bg IS --card and --session-default-border IS --border:
      // return "bg-card border";
    }
  }

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetails(!showDetails)
  }

  return (
    // Use cn to combine base card styles, session colors, and custom styles
    // Note: Shadcn's <Card> already includes 'border bg-card text-card-foreground shadow-sm'
    // We might be overriding some defaults here. Let's be explicit.
    <Card
      className={cn(
        "transition-colors duration-200 hover:shadow-lg max-w-full overflow-hidden", // Base transitions/layout
        "border", // Use Shadcn's default border color variable (--border) via the 'border' class
        getSessionColorClasses(), // Apply specific background using CSS vars
        sessionStyle?.styleClass // Apply session-specific layout/non-color styles
      )}
    >
      {/* CardHeader already uses Card's foreground color */}
      <CardHeader className="flex flex-row justify-between items-start pb-4 border-b">
        {" "}
        {/* Use default border color */}
        <div>
          {/* CardTitle uses card-foreground */}
          <CardTitle>{sessionName}</CardTitle>
          {/* CardDescription uses muted-foreground */}
          {sessionStyle?.note && (
            <CardDescription className="mt-1 italic">{sessionStyle.note}</CardDescription>
          )}
        </div>
        {/* Button variant='ghost' uses theme colors, remove explicit text colors */}
        <Button
          variant="ghost"
          size="sm"
          // className="text-muted-foreground hover:text-foreground" // Let variant handle colors
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

      {/* CardContent uses Card's foreground color by default */}
      <CardContent className="p-4" id={`session-details-${sessionName.replace(/\s+/g, "-")}`}>
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const combinedData = combineExerciseData(exercise, trainingPlan)
            const exerciseIdentifier =
              "exerciseId" in exercise ? exercise.exerciseId : `custom-${index}`

            return (
              <div
                key={`${exerciseIdentifier}`}
                // Use subtle alternating background with muted color
                className={cn(
                  "p-3 rounded border", // Use default border color
                  index % 2 !== 0 && "bg-muted/50" // Apply muted bg only to odd rows for alternation
                )}
              >
                {/* Row 1: Exercise Name, Sets, Reps */}
                <div className="flex justify-between items-center mb-2 text-sm">
                  {/* Default text uses card-foreground */}
                  <span className={cn(combinedData.isMainLift && "font-semibold")}>
                    {combinedData.name}
                  </span>
                  {/* Use muted-foreground for labels */}
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
                  {/* Use muted-foreground for label */}
                  <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                    Intensitet:
                  </span>
                  {/* LoadDisplay now handles its own defaults */}
                  <LoadDisplay load={exercise.load} loadStyle={exercise.loadStyle} />
                </div>

                {/* Row 3: Comment (only if not compact) */}
                {!compact && exercise.comment && (
                  <div className="text-sm mb-2">
                    {/* Use muted-foreground for label */}
                    <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                      Kommentar:
                    </span>
                    {/* CommentDisplay now handles its own defaults */}
                    <CommentDisplay
                      comment={exercise.comment || ""}
                      commentStyle={exercise.commentStyle}
                    />
                  </div>
                )}

                {/* Details Section (Conditionally Rendered) */}
                {showDetails && (
                  // Use muted-foreground for details text, foreground for labels/links
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
                          // Use primary color for links
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
