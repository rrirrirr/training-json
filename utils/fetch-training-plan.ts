import type { TrainingPlanData } from "@/types/training-plan"

export async function fetchTrainingPlan(): Promise<TrainingPlanData> {
  try {
    const response = await fetch("/data/training-plan.json")

    if (!response.ok) {
      // If the file doesn't exist or there's an error, return empty data
      return {
        exerciseDefinitions: [],
        weeks: [],
        monthBlocks: [],
      }
    }

    const data = await response.json()

    // Ensure exerciseDefinitions exists
    if (!data.exerciseDefinitions) {
      data.exerciseDefinitions = []
    }

    return data
  } catch (error) {
    console.error("Error fetching training plan:", error)
    // Return empty data structure if fetch fails
    return {
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: [],
    }
  }
}

