"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData, SessionTypeDefinition } from "@/types/training-plan"
import { Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getSessionStyling } from "@/utils/session-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

// Helper component for load display
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: any }) {
  if (load === "-") return <span className="text-muted-foreground">-</span>
  
  const hasKg = typeof load === "string" && load.toLowerCase().includes("kg")
  if (hasKg) {
    const match = load.match(/(\d+(?:\.\d+)?\s*kg)(.*)/i)
    if (match) {
      return (
        <span className={loadStyle?.color ? `text-${loadStyle.color}` : ""}>
          <span className={cn(loadStyle?.strong && "font-semibold")}>{match[1]}</span>
          {match[2] && <span className="ml-1 text-muted-foreground">{match[2].trim()}</span>}
        </span>
      )
    }
  }
  
  return (
    <span className={cn(loadStyle?.color ? `text-${loadStyle.color}` : "", loadStyle?.strong && "font-semibold")}>
      {load}
    </span>
  )
}

// Helper component for comment display
function CommentDisplay({ comment, commentStyle }: { comment: string; commentStyle?: any }) {
  if (!comment) return null
  
  return (
    <span className={cn(
      "text-muted-foreground", 
      commentStyle?.color ? `text-${commentStyle.color}` : "",
      commentStyle?.fontStyle === "italic" && "italic"
    )}>
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
  const { theme } = useTheme()

  // Get styling information using the updated utility
  const sessionStyling = getSessionStyling(session, trainingPlan, theme)
  const displaySessionType = sessionStyling.sessionTypeName

  // Toggle function for details
  const toggleDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowDetails(!showDetails)
  }

  return (
    <Card
      onClick={() => toggleDetails()}
      className={cn(
        "transition-colors duration-200 hover:shadow-lg max-w-full overflow-hidden border cursor-pointer",
        // Apply theme-aware styling
        sessionStyling.colorClasses?.bg,
        sessionStyling.colorClasses?.border,
        session.sessionStyle?.styleClass
      )}
    >
      <CardHeader className="relative flex flex-row justify-between items-start pb-4 border-b pr-10 pt-4">
        {/* Title and Description */}
        <div>
          <CardTitle>{sessionName}</CardTitle>
          <CardDescription className="mt-1">
            {displaySessionType}
            {session.sessionStyle?.note && (
              <span className="ml-2 italic">{session.sessionStyle.note}</span>
            )}
          </CardDescription>
        </div>
        {/* Toggle details icon */}
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
      
      {/* Session content */}
      <CardContent className="p-4" id={`session-details-${sessionName.replace(/\s+/g, "-")}`}>
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const combinedData = combineExerciseData(exercise, trainingPlan)
            const exerciseIdentifier = exercise.exerciseId || `custom-${index}`

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
                    {/* Compact comment shown here only when details are open */}
                    {compact && exercise.comment && (
                      <div>
                        <span className="font-semibold text-foreground">Kommentar:</span>{" "}
                        <CommentDisplay
                          comment={exercise.comment}
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