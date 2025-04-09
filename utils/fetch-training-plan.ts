import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"

export async function fetchTrainingPlan(): Promise<TrainingPlanData> {
  try {
    // Check if localStorage has any saved plans first
    const savedPlansJson = typeof window !== 'undefined' ? localStorage.getItem("trainingPlans") : null
    
    if (savedPlansJson) {
      try {
        const savedPlans = JSON.parse(savedPlansJson)
        // If there are saved plans, return the first one
        if (Array.isArray(savedPlans) && savedPlans.length > 0) {
          const currentPlanId = localStorage.getItem("currentTrainingPlanId")
          // Try to find the current plan first
          if (currentPlanId) {
            const currentPlan = savedPlans.find(plan => plan.id === currentPlanId)
            if (currentPlan && currentPlan.data) {
              return currentPlan.data
            }
          }
          // If no current plan found, return the first one
          if (savedPlans[0].data) {
            return savedPlans[0].data
          }
        }
      } catch (e) {
        console.error("Error parsing saved plans:", e)
      }
    }

    // If no saved plans or couldn't parse them, return the example plan
    return exampleTrainingPlan
  } catch (error) {
    console.error("Error fetching training plan:", error)
    // Return example plan as fallback
    return exampleTrainingPlan
  }
}
