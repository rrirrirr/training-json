"use client"

import type { Week, TrainingPlanData } from "@/types/training-plan"
import SessionCard from "./session-card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getBlockInfo } from "@/utils/block-utils"

interface WeeklyViewProps {
  week: Week
  trainingPlan: TrainingPlanData
  compact?: boolean
}

export default function WeeklyView({ week, trainingPlan, compact = false }: WeeklyViewProps) {
  const { theme } = useTheme()
  
  const {
    weekNumber,
    weekType,
    gymDays,
    barmarkDays,
    isDeload,
    isTest,
    sessions,
    weekStyle
  } = week

  // Get block information using the updated utility
  const blockInfo = getBlockInfo(week, trainingPlan, theme)
  const blockDescription = blockInfo.description || ""
  const blockFocus = blockInfo.focus || ""

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Weekly Header */}
      <div
        className={cn(
          "mb-6 p-4 rounded-lg shadow-md border",
          blockInfo.colorClasses?.bg,
          blockInfo.colorClasses?.border,
          weekStyle?.styleClass
        )}
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
            {blockDescription && (
              <p className={cn("mt-1", blockInfo.colorClasses?.text)}>
                {blockDescription}
              </p>
            )}
            {blockFocus && (
              <div className={cn("text-sm mt-1", blockInfo.colorClasses?.text)}>
                <span className="font-medium">Focus: </span>{blockFocus}
              </div>
            )}
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