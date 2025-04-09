// New Metadata type
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

// New SessionTypeDefinition type with colorName
export type SessionTypeDefinition = {
  id: string;
  name: string;
  defaultStyle: {
    colorName?: ColorName; // New property for theme-aware styling
    backgroundColor?: string; // Kept for backward compatibility
    borderColor?: string; // Kept for backward compatibility
    textColor?: string; // Kept for backward compatibility
  }
}

// New BlockDefinition type with colorName
export type BlockDefinition = {
  id: string | number;
  name: string;
  focus: string;
  durationWeeks: number;
  description?: string;
  style?: {
    colorName?: ColorName; // New property for theme-aware styling
    backgroundColor?: string; // Kept for backward compatibility
    textColor?: string; // Kept for backward compatibility
    borderColor?: string; // Kept for backward compatibility
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

// Session style with colorName
export type SessionStyle = {
  styleClass?: string
  icon?: string
  note?: string
  colorName?: ColorName; // New property for theme-aware styling
  backgroundColor?: string // Kept for backward compatibility
  borderColor?: string // Kept for backward compatibility
  textColor?: string // Kept for backward compatibility
}

// Session is modified to use sessionTypeId
export type Session = {
  sessionName: string
  sessionTypeId: string // Changed from sessionType enum
  sessionType?: "Gym" | "Barmark" | "Eget/Vila" // Keep for backward compatibility
  sessionStyle?: SessionStyle
  exercises: ExerciseInstance[]
}

// Week style with colorName
export type WeekStyle = {
  styleClass?: string
  note?: string
  colorName?: ColorName; // New property for theme-aware styling
  backgroundColor?: string // Kept for backward compatibility
  borderColor?: string // Kept for backward compatibility
  textColor?: string // Kept for backward compatibility
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
  weekStyle?: WeekStyle
  tm?: Record<string, number>
  sessions: Session[]
}

// MonthBlock with colorName
export type MonthBlock = {
  id: number
  name: string
  weeks: number[]
  style?: {
    colorName?: ColorName; // New property for theme-aware styling
    backgroundColor?: string // Kept for backward compatibility
    textColor?: string // Kept for backward compatibility
    borderColor?: string // Kept for backward compatibility
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