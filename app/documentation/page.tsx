import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Assuming Card path

// Example CodeBlock component (optional, adjust styling as needed)
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-2 mb-4 rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
    <code>{children}</code>
  </pre>
)

const DocumentationPage = () => {
  // Define the structure based on types/training-plan.ts
  const jsonStructureDescription = `
The main training plan data is structured as an object with the following top-level keys:

- exerciseDefinitions: ExerciseDefinition[] (Array of exercise details)
- weeks: Week[] (Array of weekly plans)
- monthBlocks: MonthBlock[] (Array defining month groupings)

// Type Definition Snippet (from types/training-plan.ts)

export type TrainingPlanData = {
  exerciseDefinitions: ExerciseDefinition[];
  weeks: Week[];
  monthBlocks: MonthBlock[];
};

export type Week = {
  weekNumber: number;
  weekType?: "A" | "B" | "-";
  blockInfo?: string;
  gymDays?: number;
  barmarkDays?: number;
  isDeload?: boolean;
  isTest?: boolean;
  weekStyle?: WeekStyle; // Optional styling
  tm?: Record<string, number>; // Training Maxes
  sessions: Session[]; // Array of daily sessions
};

export type Session = {
  sessionName: string;
  sessionType: "Gym" | "Barmark" | "Eget/Vila";
  sessionStyle?: SessionStyle; // Optional styling
  exercises: ExerciseInstance[]; // Array of exercises for the session
};

export type ExerciseInstance = {
  exerciseId: string | number; // Links to ExerciseDefinition
  name?: string; // Optional: Included in older data/example
  sets: number | string;
  reps: string | number;
  load: string;
  comment?: string;
  loadStyle?: { strong?: boolean; color?: string }; // Optional styling
  commentStyle?: { color?: string; fontStyle?: string }; // Optional styling
  targetRPE?: number;
  tips?: string;
};

// See types/training-plan.ts for full definitions of
// ExerciseDefinition, MonthBlock, WeekStyle, SessionStyle etc.
  `.trim()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        T-JSON Documentation
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>JSON Format</CardTitle>
          <CardDescription>
            The application uses a specific JSON structure to define and manage training plans. This
            format is used when importing/exporting plans. The core structure is defined by
            TypeScript types in <code>types/training-plan.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here's an overview of the main data structure and key types:</p>
          <CodeBlock>{jsonStructureDescription}</CodeBlock>
          <p>
            Refer to the <code>types/training-plan.ts</code> file for the complete and most
            up-to-date type definitions. You can also look at{" "}
            <code>data/training-plan-data.ts</code> or <code>public/data/training-plan.json</code>{" "}
            for examples, though the type definitions are the authoritative source.
          </p>
        </CardContent>
      </Card>

      {/* Add other documentation sections here */}
    </div>
  )
}

export default DocumentationPage