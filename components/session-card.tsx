"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData, ColorName } from "@/types/training-plan"
import { Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getSessionStyling } from "@/utils/session-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip" // Assuming path is correct
import { getThemeAwareColorClasses } from "@/utils/color-utils"

// Helper component for load display with theme-aware styling
function LoadDisplay({
  load,
  loadStyle,
}: {
  load: string
  loadStyle?: { strong?: boolean; color?: ColorName }
}) {
  const { theme } = useTheme()

  if (load === "-") return <span className="text-muted-foreground">-</span>

  const colorClasses = loadStyle?.color
    ? getThemeAwareColorClasses(loadStyle.color, theme)
    : undefined

  const hasKg = typeof load === "string" && load.toLowerCase().includes("kg")
  if (hasKg) {
    const match = load.match(/(\d+(?:\.\d+)?\s*kg)(.*)/i)
    if (match) {
      return (
        <span className={colorClasses?.text || ""}>
          <span className={cn(loadStyle?.strong && "font-semibold")}>{match[1]}</span>
          {match[2] && <span className="ml-1 text-muted-foreground">{match[2].trim()}</span>}
        </span>
      )
    }
  }

  return (
    <span className={cn(colorClasses?.text, loadStyle?.strong && "font-semibold")}>{load}</span>
  )
}

// Helper component for comment display with theme-aware styling
function CommentDisplay({
  comment,
  commentStyle,
}: {
  comment: string
  commentStyle?: { color?: ColorName; fontStyle?: string }
}) {
  const { theme } = useTheme()

  if (!comment) return null

  const colorClasses = commentStyle?.color
    ? getThemeAwareColorClasses(commentStyle.color, theme)
    : undefined

  return (
    <span
      className={cn(
        "text-muted-foreground",
        colorClasses?.text,
        commentStyle?.fontStyle === "italic" && "italic"
      )}
    >
      {comment}
    </span>
  )
}

interface SessionCardProps {
  session: Session // Original interface, does not explicitly allow undefined/null
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function SessionCard({ session, trainingPlan, compact = false }: SessionCardProps) {
  // No check for undefined session here

  const [showDetails, setShowDetails] = useState(false)
  // Destructuring happens immediately - this will error if session is undefined
  const { sessionName, exercises } = session
  const { theme } = useTheme()

  const sessionStyling = getSessionStyling(session, trainingPlan, theme)
  const displaySessionType = sessionStyling.sessionTypeName

  const toggleDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowDetails(!showDetails)
  }

  return (
    <Card
      onClick={() => toggleDetails()}
      className={cn(
        "transition-colors duration-200 hover:shadow-lg max-w-full overflow-hidden border cursor-pointer",
        sessionStyling.colorClasses?.bg || "bg-card",
        sessionStyling.colorClasses?.border || "border-border",
        session.sessionStyle?.styleClass // This could also error if session is undefined
      )}
    >
      <CardHeader className="relative flex flex-row justify-between items-start pb-4 border-b pr-10 pt-4">
        <div>
          {/* Apply Oswald font and light weight + uppercase + tracking */}
          <CardTitle className="font-oswald font-light uppercase tracking-wide">
            {sessionName}
          </CardTitle>
          <CardDescription className="mt-1">
            {displaySessionType}
            {session.sessionStyle?.note && ( // This could also error
              <span className="ml-2 italic">{session.sessionStyle.note}</span>
            )}
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-3 right-3 text-muted-foreground">
                {showDetails ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {showDetails ? "Details Visible" : "Details Hidden"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      {/* Use sessionName in ID - this could also error */}
      <CardContent className="p-4" id={`session-details-${sessionName.replace(/\s+/g, "-")}`}>
        <div className="space-y-4">
          {/* Mapping exercises - this could also error */}
          {exercises.map((exercise, index) => {
            const combinedData = combineExerciseData(exercise, trainingPlan)
            const exerciseKey = `${exercise.exerciseId || "ex"}-${index}`

            return (
              <div
                key={exerciseKey}
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

                {/* Row 3: Comment (except when compact) */}
                {!compact && exercise.comment && (
                  <div className="text-sm mb-2">
                    <span className="font-medium text-xs text-muted-foreground uppercase mr-2">
                      Kommentar:
                    </span>
                    <CommentDisplay
                      comment={exercise.comment}
                      commentStyle={exercise.commentStyle}
                    />
                  </div>
                )}

                {/* Details Section (shown when expanded) */}
                {showDetails && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                    {compact && exercise.comment && (
                      <div>
                        <span className="font-semibold text-foreground">Kommentar:</span>{" "}
                        <CommentDisplay
                          comment={exercise.comment}
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
          {/* Add message if no exercises */}
          {(!Array.isArray(exercises) || exercises.length === 0) && (
            <p className="text-sm text-muted-foreground italic">No exercises in this session.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
