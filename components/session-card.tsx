"use client"

import { useState } from "react"
import type { Session, TrainingPlanData } from "@/types/training-plan"
import ExerciseTable from "./exercise-table"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SessionCardProps {
  session: Session
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function SessionCard({ session, trainingPlan, compact = false }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={`rounded-lg shadow-md border ${getBgColor()} ${sessionStyle?.styleClass || ""} transition-all duration-200 ${isExpanded ? "ring-2 ring-blue-300" : "hover:shadow-lg"} cursor-pointer`}
      onClick={toggleExpand}
    >
      <div className="p-4 border-b border-inherit flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{sessionName}</h3>
          {sessionStyle?.note && <p className="text-sm text-gray-600 mt-1 italic">{sessionStyle.note}</p>}
        </div>
        <div className="text-gray-500">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      <div className={`p-4 ${isExpanded ? "" : "max-h-[300px] overflow-hidden"}`}>
        {isExpanded ? (
          <div>
            <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Övningar</h4>
              <ExerciseTable exercises={exercises} trainingPlan={trainingPlan} compact={false} />
            </div>
          </div>
        ) : (
          <ExerciseTable exercises={exercises} trainingPlan={trainingPlan} compact={compact} />
        )}
      </div>
    </div>
  )
}

