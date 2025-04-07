import type { ExerciseDefinition, ExerciseInstance, TrainingPlanData } from "@/types/training-plan"

// Get the full exercise definition from an exercise instance
export function getExerciseDefinition(
  exerciseInstance: ExerciseInstance,
  trainingPlan: TrainingPlanData,
): ExerciseDefinition | undefined {
  // Check if exerciseDefinitions exists before trying to find
  if (!trainingPlan.exerciseDefinitions) {
    return undefined
  }
  return trainingPlan.exerciseDefinitions.find((def) => def.id === exerciseInstance.exerciseId)
}

// Combine exercise instance and definition data for display
export function combineExerciseData(exerciseInstance: ExerciseInstance, trainingPlan: TrainingPlanData) {
  const definition = getExerciseDefinition(exerciseInstance, trainingPlan)

  // Handle legacy format where name is directly on the exercise instance
  const name = "name" in exerciseInstance ? (exerciseInstance as any).name : definition?.name || "Unknown Exercise"

  return {
    ...exerciseInstance,
    name,
    isMainLift: definition?.isMainLift || false,
    isAccessory: definition?.isAccessory || false,
    targetMuscles: definition?.targetMuscles || [],
    videoUrl: definition?.videoUrl || "",
    generalTips: definition?.generalTips || "",
  }
}

