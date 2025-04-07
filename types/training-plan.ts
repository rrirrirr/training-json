// Exercise definition (normalized)
export type ExerciseDefinition = {
  id: string | number
  name: string
  isMainLift?: boolean
  isAccessory?: boolean
  targetMuscles?: string[]
  videoUrl?: string
  generalTips?: string
}

// Exercise instance (used in sessions)
export type ExerciseInstance = {
  exerciseId: string | number
  sets: number | string
  reps: string | number
  load: string
  comment?: string
  loadStyle?: {
    strong?: boolean
    color?: string
  }
  commentStyle?: {
    color?: string
    fontStyle?: string
  }
  targetRPE?: number
  tips?: string
}

export type SessionStyle = {
  styleClass?: string
  icon?: string
  note?: string
}

export type Session = {
  sessionName: string
  sessionType: "Gym" | "Barmark" | "Eget/Vila"
  sessionStyle?: SessionStyle
  exercises: ExerciseInstance[]
}

export type WeekStyle = {
  styleClass?: string
  note?: string
  backgroundColor?: string
  borderColor?: string
}

export type Week = {
  weekNumber: number
  weekType?: "A" | "B" | "-"
  blockInfo?: string
  gymDays?: number
  barmarkDays?: number
  isDeload?: boolean
  isTest?: boolean
  weekStyle?: WeekStyle
  tm?: Record<string, number>
  sessions: Session[]
}

export type MonthBlock = {
  id: number
  name: string
  weeks: number[]
}

export type TrainingPlanData = {
  exerciseDefinitions: ExerciseDefinition[]
  weeks: Week[]
  monthBlocks: MonthBlock[]
}

