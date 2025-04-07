"use client"

import React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ExerciseInstance, TrainingPlanData } from "@/types/training-plan"
import { combineExerciseData } from "@/utils/exercise-utils"

interface ExerciseTableProps {
  exercises: ExerciseInstance[]
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function ExerciseTable({ exercises, trainingPlan, compact = false }: ExerciseTableProps) {
  const [expandedExercise, setExpandedExercise] = useState<string | number | null>(null)

  const toggleExpand = (exerciseId: string | number) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId)
  }

  if (exercises.length === 0) {
    return <p className="text-gray-500 text-center py-4">Inga övningar planerade</p>
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Övning</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Set</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Intensitet
            </th>
            {!compact && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kommentar
              </th>
            )}
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-transparent divide-y divide-gray-200">
          {exercises.map((exercise, index) => {
            const combinedData = combineExerciseData(exercise, trainingPlan)
            // Use exerciseId if available, otherwise use index as fallback
            const exerciseIdentifier = "exerciseId" in exercise ? exercise.exerciseId : index
            const isExpanded = expandedExercise === exerciseIdentifier

            return (
              <React.Fragment key={`${exerciseIdentifier}-${index}`}>
                <tr className={index % 2 === 0 ? "bg-white bg-opacity-50" : "bg-gray-50 bg-opacity-50"}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={combinedData.isMainLift ? "font-bold" : ""}>{combinedData.name}</span>
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">{exercise.sets}</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">{exercise.reps}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <LoadDisplay load={exercise.load} loadStyle={exercise.loadStyle} />
                  </td>
                  {!compact && (
                    <td className="px-3 py-2 text-sm">
                      <CommentDisplay comment={exercise.comment || ""} commentStyle={exercise.commentStyle} />
                    </td>
                  )}
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleExpand(exerciseIdentifier)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>

                {/* Expanded details row */}
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="text-sm">
                        {exercise.comment && (
                          <div className="mb-2">
                            <span className="font-medium">Kommentar:</span> {exercise.comment}
                          </div>
                        )}

                        {combinedData.targetMuscles && combinedData.targetMuscles.length > 0 && (
                          <div className="mb-2">
                            <span className="font-medium">Målmuskler:</span> {combinedData.targetMuscles.join(", ")}
                          </div>
                        )}

                        {exercise.targetRPE && (
                          <div className="mb-2">
                            <span className="font-medium">Mål RPE:</span> {exercise.targetRPE}
                          </div>
                        )}

                        {(exercise.tips || combinedData.generalTips) && (
                          <div className="mb-2">
                            <span className="font-medium">Tips:</span> {exercise.tips || combinedData.generalTips}
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
                              Se video <ExternalLink className="h-3 w-3 ml-1" />
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
  )
}

// Helper component to format and highlight the load
function LoadDisplay({ load, loadStyle }: { load: string; loadStyle?: ExerciseInstance["loadStyle"] }) {
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
function CommentDisplay({
  comment,
  commentStyle,
}: { comment: string; commentStyle?: ExerciseInstance["commentStyle"] }) {
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

