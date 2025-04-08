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
    color?: string // Can be Tailwind color like "blue-500" or hex/rgb
  }
  commentStyle?: {
    color?: string // Can be Tailwind color like "blue-500" or hex/rgb
    fontStyle?: string
  }
  targetRPE?: number
  tips?: string
}

export type SessionStyle = {
  styleClass?: string
  icon?: string
  note?: string
  backgroundColor?: string // Can be Tailwind color like "blue-50" or hex/rgb
  borderColor?: string // Can be Tailwind color like "blue-200" or hex/rgb
  textColor?: string // Can be Tailwind color like "blue-800" or hex/rgb
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
  backgroundColor?: string // Can be Tailwind color like "blue-50" or hex/rgb
  borderColor?: string // Can be Tailwind color like "blue-200" or hex/rgb
  textColor?: string // Can be Tailwind color like "blue-800" or hex/rgb
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
  style?: {
    backgroundColor?: string // Can be Tailwind color like "blue-50" or hex/rgb
    textColor?: string // Can be Tailwind color like "blue-800" or hex/rgb
    borderColor?: string // Can be Tailwind color like "blue-200" or hex/rgb
  }
}

export type TrainingPlanData = {
  exerciseDefinitions: ExerciseDefinition[]
  weeks: Week[]
  monthBlocks: MonthBlock[]
}
