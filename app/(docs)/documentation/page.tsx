import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link" // Import Link for internal navigation

// Helper CodeBlock component (remains the same)
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-2 mb-4 rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto">
    <code>{children}</code>
  </pre>
)

const DocumentationPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
          T-JSON Format Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to structure your training plan JSON files for use with the T-JSON visualizer.
        </p>
      </header>

      {/* Overview Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            The T-JSON format uses a structured JSON file to define training plans. This allows for
            flexibility in defining exercises, scheduling weeks, organizing blocks, and adding
            custom styling. The core structure is defined by TypeScript types in{" "}
            <code>types/training-plan.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">The main top-level properties in your JSON file are:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>metadata</code>: (Optional) Information about the plan itself.
            </li>
            <li>
              <code>exerciseDefinitions</code>: (Required) An array defining every unique exercise
              used.
            </li>
            <li>
              <code>weeks</code>: (Required) An array detailing the schedule for each week.
            </li>
            <li>
              <code>monthBlocks</code>: (Required) Groups weeks into larger blocks for navigation.
            </li>
            <li>
              <code>weekTypes</code>: (Required) Defines special week types like 'Deload' or 'Test'.
            </li>
            <li>
              <code>sessionTypes</code>: (Optional) Defines session categories like 'Gym' or 'Rest'.
            </li>
            <li>
              <code>blocks</code>: (Optional) Defines training phases or blocks with specific focus.
            </li>
          </ul>
          <p className="mt-4 text-sm">
            Refer to the <code>types/training-plan.ts</code> file for the complete and most
            up-to-date type definitions.
          </p>
        </CardContent>
      </Card>

      {/* Metadata Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>metadata</code> (Optional)
          </CardTitle>
          <CardDescription>Contains general information about the training plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Key fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>planName</code>: (Required within metadata if metadata is present) The name of
              the plan.
            </li>
            <li>
              <code>creationDate</code>: (Required within metadata if metadata is present) The date
              the plan was created (ISO 8601 format).
            </li>
            <li>
              <code>description</code>: (Optional) A brief description of the plan.
            </li>
            <li>
              <code>author</code>: (Optional) The creator of the plan.
            </li>
            <li>
              <code>version</code>: (Optional) A version number for the plan.
            </li>
            <li>
              <code>creator</code>: (Optional) Reserved for future community updates. This field exists but has no functionality yet.
            </li>
          </ul>
            </li>
            <li>
              <code>version</code>: (Optional) A version number for the plan.
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example:</h4>
          <CodeBlock>{`{
  "metadata": {
    "planName": "Beginner Strength Phase 1",
    "creationDate": "2025-04-16T14:30:00Z",
    "description": "4-week introductory strength program focusing on compound lifts.",
    "author": "Coach AI",
    "creator": "user123"
  }
  // ... other top-level properties
}`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Exercise Definitions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>exerciseDefinitions</code> (Required)
          </CardTitle>
          <CardDescription>
            An array defining every unique exercise used throughout the plan. This normalized
            approach makes updates easier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each definition requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>id</code>: A unique identifier (string or number, e.g., "squat", "db_bench").
              This ID is used in weekly sessions to refer back to this definition.
            </li>
            <li>
              <code>name</code>: The full display name of the exercise (e.g., "Barbell Squat",
              "Dumbbell Bench Press").
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>isMainLift</code> / <code>isAccessory</code>: Booleans to categorize the lift.
            </li>
            <li>
              <code>targetMuscles</code>: An array of strings listing primary muscles worked.
            </li>
            <li>
              <code>videoUrl</code>: A URL to a demonstration video.
            </li>
            <li>
              <code>generalTips</code>: General technique cues or information.
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example:</h4>
          <CodeBlock>{`"exerciseDefinitions": [
  {
    "id": "squat",
    "name": "Barbell Back Squat",
    "isMainLift": true,
    "targetMuscles": ["Quads", "Glutes", "Adductors", "Core"],
    "generalTips": "Keep chest up, break at the hips and knees simultaneously."
  },
  {
    "id": "pullup",
    "name": "Pull-up",
    "isAccessory": true,
    "targetMuscles": ["Lats", "Biceps", "Upper Back"],
    "videoUrl": "https://example.com/pullup-video"
  }
]`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Weeks Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>weeks</code> (Required)
          </CardTitle>
          <CardDescription>
            An array containing objects for each week of the training plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each week object requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>weekNumber</code>: The sequential number of the week (e.g., 1, 2, 3...).
            </li>
            <li>
              <code>blockId</code>: The ID of the training block this week belongs to (must match an
              ID in the <code>blocks</code> array, if used).
            </li>
            <li>
              <code>weekTypeIds</code>: An array of IDs specifying any special types for this week
              (e.g., ["deload"]). Must match IDs in the <code>weekTypes</code> array. Use an empty
              array <code>[]</code> for a normal week.
            </li>
            <li>
              <code>sessions</code>: An array containing the training sessions for that week.
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>gymDays</code> / <code>barmarkDays</code>: Informational count of session types.
            </li>
            <li>
              <code>weekStyle</code>: An object for custom styling of the week header (see{" "}
              <Link href="#styling" className="text-primary hover:underline">
                Styling Section
              </Link>
              ).
            </li>
            <li>
              <code>tm</code>: An object containing Training Maxes for specific lifts used that week
              (e.g., <code>{`"SQ": 100, "BP": 80`}</code>).
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example (Week Object Structure):</h4>
          <CodeBlock>{`{
  "weekNumber": 1,
  "blockId": "block-1",
  "weekTypeIds": [], // Normal week
  "gymDays": 3,
  "tm": { "SQ": 115, "BP": 80 },
  "sessions": [
    // ... Session objects for Week 1 go here ...
  ]
}`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Sessions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>sessions</code> (Required within each Week)
          </CardTitle>
          <CardDescription>
            An array within each week object, detailing the individual training sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each session object requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>sessionName</code>: The name of the session (e.g., "Day 1: Upper Body Push").
            </li>
            <li>
              <code>sessionTypeId</code>: The ID of the session type (must match an ID in the{" "}
              <code>sessionTypes</code> array, if used, e.g., "gym").
            </li>
            <li>
              <code>exercises</code>: An array containing the specific exercises performed in that
              session.
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>sessionStyle</code>: An object for custom styling of the session card (see{" "}
              <Link href="#styling" className="text-primary hover:underline">
                Styling Section
              </Link>
              ). Can include <code>note</code>, <code>icon</code>, <code>colorName</code>.
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example (Session Object Structure):</h4>
          <CodeBlock>{`{
  "sessionName": "Gympass 1: Squat & Bench Focus",
  "sessionTypeId": "gym",
  "sessionStyle": {
    "note": "Focus on technique",
    "colorName": "blue" // Makes this session card blue
  },
  "exercises": [
    // ... ExerciseInstance objects go here ...
  ]
}`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Exercise Instances Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>exercises</code> (Required within each Session)
          </CardTitle>
          <CardDescription>
            An array within each session object, listing the specific exercises to be performed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each exercise instance object requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>exerciseId</code>: The ID of the exercise (must match an ID in{" "}
              <code>exerciseDefinitions</code>).
            </li>
            <li>
              <code>sets</code>: The number of sets (e.g., 3, "3-4").
            </li>
            <li>
              <code>reps</code>: The number of reps or duration (e.g., 8, "8-12", "30s", "AMRAP").
            </li>
            <li>
              <code>load</code>: The weight, intensity, RPE, or description (e.g., "100 kg", "75%
              1RM", "RPE 8", "Bodyweight", "Light").
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>comment</code>: Specific notes for this exercise instance (e.g., "Focus on
              pause", "Last set AMRAP").
            </li>
            <li>
              <code>loadStyle</code> / <code>commentStyle</code>: Objects for custom styling (see{" "}
              <Link href="#styling" className="text-primary hover:underline">
                Styling Section
              </Link>
              ).
            </li>
            <li>
              <code>targetRPE</code>: A specific target RPE for the exercise.
            </li>
            <li>
              <code>tips</code>: Technique tips specific to this instance in the session.
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">
            Example (Exercise Instance Structure):
          </h4>
          <CodeBlock>{`{
  "exerciseId": "squat",
  "sets": 5,
  "reps": 5,
  "load": "100 kg (~85%)",
  "loadStyle": { "strong": true, "color": "red" },
  "comment": "Work sets",
  "targetRPE": 8
}`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Month Blocks Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>monthBlocks</code> (Required)
          </CardTitle>
          <CardDescription>
            Defines how weeks are grouped into larger blocks or months, primarily used for the tab
            navigation and block view organization. Every week defined in the <code>weeks</code>{" "}
            array must belong to exactly one <code>monthBlock</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each month block object requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>id</code>: A unique numeric ID for the block (e.g., 1, 2...).
            </li>
            <li>
              <code>name</code>: The display name for the tab/selector (e.g., "Month 1 (Wks 1-4)").
            </li>
            <li>
              <code>weeks</code>: An array of the <code>weekNumber</code> values included in this
              block.
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>style</code>: An object for custom styling of the block tab/selector (see{" "}
              <Link href="#styling" className="text-primary hover:underline">
                Styling Section
              </Link>
              ).
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example:</h4>
          <CodeBlock>{`"monthBlocks": [
  {
    "id": 1,
    "name": "Månad 1 (Vecka 1-4)",
    "weeks": [1, 2, 3, 4],
    "style": { "colorName": "violet" } // Styles the tab for this block
  },
  {
    "id": 2,
    "name": "Månad 2 (Vecka 5-8)",
    "weeks": [5, 6, 7, 8]
  }
  // ... must cover all weeks in the plan
]`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Week Types Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <code>weekTypes</code> (Required)
          </CardTitle>
          <CardDescription>
            Defines special types of weeks, like Deload or Test weeks. These are referenced by the{" "}
            <code>weekTypeIds</code> array in each week object.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Each week type definition requires:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>id</code>: A unique string identifier (e.g., "deload", "test").
            </li>
            <li>
              <code>name</code>: The display name (e.g., "DELOAD", "TEST").
            </li>
            <li>
              <code>colorName</code>: A Tailwind color name used for visual cues (e.g., "yellow",
              "green"). See{" "}
              <Link href="#styling" className="text-primary hover:underline">
                Styling Section
              </Link>
              .
            </li>
          </ul>
          <p className="text-sm mt-2 mb-2">Optional fields include:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>
              <code>description</code>: A short description shown in the legend tooltip.
            </li>
          </ul>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example:</h4>
          <CodeBlock>{`"weekTypes": [
  {
    "id": "deload",
    "name": "DELOAD",
    "colorName": "yellow",
    "description": "Lower intensity recovery week"
  },
  {
    "id": "test",
    "name": "TEST",
    "colorName": "green",
    "description": "Testing maximum strength"
  }
]`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Optional Definitions: sessionTypes, blocks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Optional Definitions: <code>sessionTypes</code> & <code>blocks</code>
          </CardTitle>
          <CardDescription>
            These arrays allow you to define reusable session types and training blocks for better
            organization and potential future features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-1 text-sm">
            <code>sessionTypes</code> (Optional)
          </h4>
          <p className="text-sm mb-2">Define categories for sessions.</p>
          <CodeBlock>{`"sessionTypes": [
  { "id": "gym", "name": "Gym", "defaultStyle": { "colorName": "blue" } },
  { "id": "rest", "name": "Eget/Vila", "defaultStyle": { "colorName": "gray" } }
]`}</CodeBlock>
          <h4 className="font-semibold mt-4 mb-1 text-sm">
            <code>blocks</code> (Optional)
          </h4>
          <p className="text-sm mb-2">Define distinct training phases.</p>
          <CodeBlock>{`"blocks": [
  {
    "id": "block-1",
    "name": "Foundation Phase",
    "focus": "Grund & Volym",
    "durationWeeks": 4,
    "description": "Building work capacity and technique.",
    "style": { "colorName": "violet" }
  }
  // ... more blocks
]`}</CodeBlock>
        </CardContent>
      </Card>

      {/* Styling Section */}
      <Card className="mb-8" id="styling">
        <CardHeader>
          <CardTitle>Custom Styling</CardTitle>
          <CardDescription>
            Customize the appearance using Tailwind CSS color names within style objects (
            <code>weekStyle</code>, <code>sessionStyle</code>, <code>loadStyle</code>,{" "}
            <code>commentStyle</code>, <code>blocks.style</code>, <code>monthBlocks.style</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">
            Use the <code>colorName</code> property within style objects to apply colors. You can
            use standard Tailwind color names (e.g., "red", "blue", "green", "yellow", "indigo",
            "pink", "gray").
          </p>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example (Session Style):</h4>
          <CodeBlock>{`"sessionStyle": {
  "note": "High intensity!",
  "colorName": "red" // Makes the session card red-themed
}`}</CodeBlock>
          <h4 className="font-semibold mt-4 mb-1 text-sm">Example (Load Style):</h4>
          <CodeBlock>{`"loadStyle": {
  "strong": true, // Makes load text bold
  "color": "purple" // Makes load text purple-themed
}`}</CodeBlock>
          <p className="mt-4 text-sm">
            The application uses light and dark theme variants of these colors automatically. Refer
            to <code>utils/color-utils.ts</code> for specifics.
          </p>
        </CardContent>
      </Card>

      {/* AI Prompt Snippet Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic Structure for AI Prompts</CardTitle>
          <CardDescription>
            If instructing an AI, provide it with this basic structure as a starting point. Ensure
            you ask it to include all REQUIRED sections and fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock>{`{
  "metadata": {
    "planName": "AI Generated Plan",
    "creationDate": "YYYY-MM-DDTHH:MM:SSZ",
    "creator": "user123" // Reserved for future community updates
  },
  "weekTypes": [
    // { "id": "...", "name": "...", "colorName": "..." }
  ],
  "exerciseDefinitions": [
    // { "id": "...", "name": "..." }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "blockId": "block-1", // Ensure 'blocks' array is defined if using this
      "weekTypeIds": [], // e.g., ["deload"] if it's a deload week
      "sessions": [
        {
          "sessionName": "Session Name",
          "sessionTypeId": "gym", // Ensure 'sessionTypes' array is defined if using this
          "exercises": [
            {
              "exerciseId": "ex1", // Must match an ID in exerciseDefinitions
              "sets": 3,
              "reps": "10",
              "load": "Description"
            }
            // ... more exercises
          ]
        }
        // ... more sessions
      ]
    }
    // ... more weeks
  ],
  "monthBlocks": [
    {
      "id": 1,
      "name": "Month 1",
      "weeks": [1] // List all weekNumbers for this block
    }
    // ... more month blocks covering all weeks
  ]
}`}</CodeBlock>
          <p className="mt-4 text-sm">
            For more detailed instructions to give to an AI, including an interview process, use the
            prompts available in the "Create AI-Powered Plan" section of the application. Check the{" "}
            <Link href="#ai-tips" className="text-primary hover:underline">
              Tips for Better AI Results
            </Link>{" "}
            section above for guidance.
          </p>
        </CardContent>
      </Card>

      {/* AI Tips Section (Reference Only) */}
      <Card className="mb-6" id="ai-tips">
        <CardHeader>
          <CardTitle>Tips for Better AI Results</CardTitle>
          <CardDescription>
            Improve the quality of AI-generated plans with these tips. (See full tips in the AI
            Assistant modal).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Be specific about goals, experience, time, and equipment.</li>
            <li>Use the prompt templates provided in the app.</li>
            <li>Answer interview questions thoroughly.</li>
            <li>Briefly check the generated JSON for logical structure.</li>
            <li>Ask the AI for revisions if the plan isn't perfect.</li>
            <li>Use the "Copy Error for AI" button if the app shows validation errors.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocumentationPage
