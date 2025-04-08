// New Metadata type
export type Metadata = {
  planName: string;
  creationDate: string;
  description?: string;
  author?: string;
  version?: string;
}

// New SessionTypeDefinition type
export type SessionTypeDefinition = {
  id: string;
  name: string;
  defaultStyle: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  }
}

// New BlockDefinition type
export type BlockDefinition = {
  id: string | number;
  name: string;
  focus: string;
  durationWeeks: number;
  description?: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  }
}

// Exercise definition (normalized) - unchanged
export type ExerciseDefinition = {
  id: string | number
  name: string
  isMainLift?: boolean
  isAccessory?: boolean
  targetMuscles?: string[]
  videoUrl?: string
  generalTips?: string
}

// Exercise instance (used in sessions) - unchanged
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

// Session is modified to use sessionTypeId
export type Session = {
  sessionName: string
  sessionTypeId: string // Changed from sessionType enum
  sessionType?: "Gym" | "Barmark" | "Eget/Vila" // Keep for backward compatibility
  sessionStyle?: SessionStyle
  exercises: ExerciseInstance[]
}

// Week is modified to use blockId
export type Week = {
  weekNumber: number
  weekType?: "A" | "B" | "-"
  blockId: string | number // Changed from blockInfo string
  blockInfo?: string // Keep for backward compatibility
  gymDays?: number
  barmarkDays?: number
  isDeload?: boolean
  isTest?: boolean
  weekStyle?: {
    styleClass?: string
    note?: string
    backgroundColor?: string
    borderColor?: string
    textColor?: string
  }
  tm?: Record<string, number>
  sessions: Session[]
}

// MonthBlock - remain for backward compatibility
export type MonthBlock = {
  id: number
  name: string
  weeks: number[]
  style?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
  }
}

// Updated TrainingPlanData
export type TrainingPlanData = {
  metadata?: Metadata // New: plan metadata
  sessionTypes?: SessionTypeDefinition[] // New: session type definitions
  blocks?: BlockDefinition[] // New: training block definitions
  exerciseDefinitions: ExerciseDefinition[]
  weeks: Week[]
  monthBlocks: MonthBlock[]
}
