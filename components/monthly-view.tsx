import type { MonthBlock, TrainingPlanData } from "@/types/training-plan"
import WeeklyView from "./weekly-view"

interface MonthlyViewProps {
  monthBlock: MonthBlock
  trainingPlan: TrainingPlanData
}

export default function MonthlyView({ monthBlock, trainingPlan }: MonthlyViewProps) {
  // Get all weeks for this month
  const weeksInMonth = trainingPlan.weeks
    .filter((week) => monthBlock.weeks.includes(week.weekNumber))
    .sort((a, b) => a.weekNumber - b.weekNumber)

  if (weeksInMonth.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Inga veckor hittades för denna månad</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">{monthBlock.name}</h2>

      {weeksInMonth.map((week) => (
        <WeeklyView key={week.weekNumber} week={week} trainingPlan={trainingPlan} compact={true} />
      ))}
    </div>
  )
}

