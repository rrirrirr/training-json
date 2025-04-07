"use client"

import React, { useState } from "react"
import type { Session, TrainingPlanData } from "@/types/training-plan"
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { combineExerciseData } from "@/utils/exercise-utils"
import { cn } from "@/lib/utils"

interface SessionCardProps {
  session: Session
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function SessionCard({ session, trainingPlan, compact = false }: SessionCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { sessionName, sessionType, sessionStyle, exercises } = session

  // Determine background color based on session type
  const getBgColor = () => {
    switch (sessionType) {
      case "Gym":
        return "bg-blue-50 border-blue-200"
      case "Barmark":
        return "bg-green-50 border-green-200"
      case "Eget/Vila":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering card expansion
    setShowDetails(!showDetails)
  }

  return (
    <div
      className={`rounded-lg shadow-md border ${getBgColor()} ${sessionStyle?.styleClass || ""} 
      transition-all duration-200 hover:shadow-lg max-w-full overflow-hidden`}
    >
      {/* Header area */}
      <div className="p-4 border-b border-inherit flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{sessionName}</h3>
          {sessionStyle?.note && (
            <p className="text-sm text-gray-600 mt-1 italic">{sessionStyle.note}</p>
          )}
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={toggleDetails}
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />{" "}
                <span className="hidden sm:inline">Hide Details</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />{" "}
                <span className="hidden sm:inline">View Details</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Exercises content */}
      <div className="p-4">
        {/* Custom Exercise Table */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Övning
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Set
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reps
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intensitet
                </th>
                {!compact && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kommentar
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-gray-200">
              {exercises.map((exercise, index) => {
                const combinedData = combineExerciseData(exercise, trainingPlan)
                const exerciseIdentifier = "exerciseId" in exercise ? exercise.exerciseId : index

                return (
                  <React.Fragment key={`${exerciseIdentifier}-${index}`}>
                    {/* Main exercise row */}
                    <tr
                      className={
                        index % 2 === 0 ? "bg-white bg-opacity-50" : "bg-gray-50 bg-opacity-50"
                      }
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={combinedData.isMainLift ? "font-bold" : ""}>
                          {combinedData.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">{exercise.sets}</td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">{exercise.reps}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <LoadDisplay load={exercise.load} loadStyle={exercise.loadStyle} />
                      </td>
                      {!compact && (
                        <td className="px-3 py-2 text-sm">
                          <CommentDisplay
                            comment={exercise.comment || ""}
                            commentStyle={exercise.commentStyle}
                          />
                        </td>
                      )}
                    </tr>

                    {/* Details row (only shown when showDetails is true) */}
                    {showDetails && (
                      <tr className="bg-gray-50 bg-opacity-70">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="text-sm">
                            {exercise.comment && (
                              <div className="mb-2">
                                <span className="font-medium">Kommentar:</span> {exercise.comment}
                              </div>
                            )}

                            {combinedData.targetMuscles &&
                              combinedData.targetMuscles.length > 0 && (
                                <div className="mb-2">
                                  <span className="font-medium">Målmuskler:</span>{" "}
                                  {combinedData.targetMuscles.join(", ")}
                                </div>
                              )}

                            {exercise.targetRPE && (
                              <div className="mb-2">
                                <span className="font-medium">Mål RPE:</span> {exercise.targetRPE}
                              </div>
                            )}

                            {(exercise.tips || combinedData.generalTips) && (
                              <div className="mb-2">
                                <span className="font-medium">Tips:</span>{" "}
                                {exercise.tips || combinedData.generalTips}
                              </div>
                            )}

                            {combinedData.videoUrl && (
                              <div>
                                <a
                                  href={combinedData.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center"
                                >
                                  Se video <span className="ml-1">→</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Helper component to format and highlight the load
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: any }) {
  if (load === "-") return <span>-</span>

  // Apply custom styling if provided
  const style: React.CSSProperties = {}
  if (loadStyle?.color) {
    style.color = loadStyle.color
  }

  // Check if the load contains a kg value
  const hasKg = load.toLowerCase().includes("kg")

  if (hasKg) {
    // Extract the kg value and the rest of the text
    const match = load.match(/(\d+(?:\.\d+)?\s*kg)(.*)/)
    if (match) {
      return (
        <span style={style}>
          <span className={loadStyle?.strong ? "font-bold" : ""}>{match[1]}</span>
          <span className="text-gray-500">{match[2]}</span>
        </span>
      )
    }
  }

  return (
    <span style={style} className={loadStyle?.strong ? "font-bold" : ""}>
      {load}
    </span>
  )
}

// Helper component to format and style comments
function CommentDisplay({ comment, commentStyle }: { comment: string; commentStyle?: any }) {
  if (!comment) return null

  // Apply custom styling if provided
  const style: React.CSSProperties = {}
  if (commentStyle?.color) {
    style.color = commentStyle.color
  }
  if (commentStyle?.fontStyle) {
    style.fontStyle = commentStyle.fontStyle
  }

  return (
    <span style={style} className="text-gray-600">
      {comment}
    </span>
  )
}
