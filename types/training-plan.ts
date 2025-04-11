// Metadata type
export type Metadata = {
  planName: string;
  creationDate: string;
  description?: string;
  author?: string;
  version?: string;
}

// Available color names for styling
export type ColorName = 
  | "slate" | "gray" | "zinc" | "neutral" | "stone" 
  | "red" | "orange" | "amber" | "yellow" | "lime" 
  | "green" | "emerald" | "teal" | "cyan" | "sky" 
  | "blue" | "indigo" | "violet" | "purple" | "fuchsia" 
  | "pink" | "rose";

// WeekType definition - NEW
export type WeekType = {
  id: string;
  name: string;
  colorName: ColorName;
  description?: string;
}

// SessionTypeDefinition type with colorName only
export type SessionTypeDefinition = {
  id: string;
  name: string;
  defaultStyle: {
    colorName?: ColorName;
  }
}

// BlockDefinition type with colorName only
export type BlockDefinition = {
  id: string | number;
  name: string;
  focus: string;
  durationWeeks: number;
  description?: string;
  style?: {
    colorName?: ColorName;
  }
}

// Exercise definition (unchanged)
export type ExerciseDefinition = {
  id: string | number
  name: string
  isMainLift?: boolean
  isAccessory?: boolean
  targetMuscles?: string[]
  videoUrl?: string
  generalTips?: string
}

// Exercise instance
export type ExerciseInstance = {
  exerciseId: string | number
  sets: number | string
  reps: string | number
  load: string
  comment?: string
  loadStyle?: {
    strong?: boolean
    color?: ColorName
  }
  commentStyle?: {
    color?: ColorName
    fontStyle?: string
  }
  targetRPE?: number
  tips?: string
}

// Session style with colorName only
export type SessionStyle = {
  styleClass?: string
  icon?: string
  note?: string
  colorName?: ColorName;
}

// Session with sessionTypeId only
export type Session = {
  sessionName: string
  sessionTypeId: string
  exercises: ExerciseInstance[]
  sessionStyle?: SessionStyle
}

// Week style with colorName only
export type WeekStyle = {
  styleClass?: string
  note?: string
  colorName?: ColorName;
}

// Week with blockId only
export type Week = {
  weekNumber: number
  weekType?: "A" | "B" | "-" 
  blockId: string | number
  gymDays?: number
  barmarkDays?: number
  // New field for week types
  weekTypeIds: string[]
  weekStyle?: WeekStyle
  tm?: Record<string, number>
  sessions: Session[]
}

// MonthBlock with colorName only
export type MonthBlock = {
  id: number
  name: string
  weeks: number[]
  style?: {
    colorName?: ColorName;
  }
}

// TrainingPlanData
export type TrainingPlanData = {
  metadata?: Metadata
  sessionTypes?: SessionTypeDefinition[]
  blocks?: BlockDefinition[]
  // New field for week types
  weekTypes: WeekType[]
  exerciseDefinitions: ExerciseDefinition[]
  weeks: Week[]
  monthBlocks: MonthBlock[]
}