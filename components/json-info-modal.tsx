"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import CopyNotification from "./copy-notification"

interface JsonInfoModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: string
}

const aiPromptTemplate = `Please create a JSON file for my training plan with the following normalized structure:

{
  "exerciseDefinitions": [
    // Array of exercise definition objects
  ],
  "weeks": [
    // Array of week objects
  ],
  "monthBlocks": [
    // Array of month/block objects
  ]
}

Before creating the JSON, please interview me with the following questions to understand my training goals:

1. What is your primary training goal? (Strength, hypertrophy, endurance, sport-specific, etc.)
2. What is your current experience level? (Beginner, intermediate, advanced)
3. How many days per week can you train?
4. What equipment do you have access to?
5. Do you have any injuries or limitations I should consider?
6. What are your current strength levels for main lifts? (if applicable)
7. How long should the training program be? (weeks/months)
8. Any specific exercises you want to include or avoid?

After I answer these questions, please create a complete training plan JSON with the following structure:

1. exerciseDefinitions: An array of objects, each defining a unique exercise with:
   - id: A unique identifier string (e.g., "sq", "bp", "dl")
   - name: The full exercise name (e.g., "Knäböj (SQ)")
   - isMainLift: Boolean, true for main compound lifts
   - isAccessory: Boolean, true for assistance exercises
   - targetMuscles: Array of primary muscle groups targeted
   - generalTips: General technique cues for the exercise

2. weeks: An array of objects, each representing one week with:
   - weekNumber: The sequential week number
   - weekType: "A" or "B" for alternating schedules (or "-")
   - blockInfo: Description of the training block
   - gymDays: Number of gym sessions per week
   - isDeload: Boolean, true for deload weeks
   - isTest: Boolean, true for test/max weeks
   - tm: Object with training maxes for main lifts
   - sessions: Array of session objects

3. Each session should include:
   - sessionName: Name of the session (e.g., "Gympass 1")
   - sessionType: "Gym", "Barmark", or "Eget/Vila"
   - exercises: Array of exercise instances

4. Each exercise instance should include:
   - exerciseId: ID matching an exercise in exerciseDefinitions
   - sets: Number or string of sets
   - reps: Number or string of reps
   - load: Description of weight/intensity
   - comment: Additional notes

5. monthBlocks: An array of objects grouping weeks into months/blocks:
   - id: Month/block ID
   - name: Display name (e.g., "Månad 1 (Vecka 1-4)")
   - weeks: Array of week numbers in this block

Please ensure the JSON is valid, properly formatted, and follows a logical progression based on my training goals.`

export default function JsonInfoModal({ isOpen, onClose, defaultTab = "structure" }: JsonInfoModalProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Training Plan JSON Format</DialogTitle>
          <DialogDescription>Learn how to structure your training plan JSON file.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="ai">AI Guidance</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4 pr-4">
            <TabsContent value="structure" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Normalized Structure</h3>
                <p className="text-sm text-gray-600 mt-1">The JSON file contains three main sections:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">exerciseDefinitions</code> - Definitions of all exercises
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">weeks</code> - An array of all training weeks
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">monthBlocks</code> - Information about how weeks are
                    grouped into months/blocks
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Exercise Definitions</h3>
                <p className="text-sm text-gray-600 mt-1">Each exercise definition has the following properties:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "id": "sq",                     // Unique identifier
  "name": "Knäböj (SQ)",          // Full exercise name
  "isMainLift": true,             // Whether this is a main lift
  "isAccessory": false,           // Whether this is an accessory
  "targetMuscles": [              // Primary muscle groups targeted
    "Quads", 
    "Glutes", 
    "Adductors"
  ],
  "videoUrl": "https://...",      // URL to demonstration video
  "generalTips": "Knäna i linje med tårna..." // General technique tips
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Week Object</h3>
                <p className="text-sm text-gray-600 mt-1">Each week object has the following properties:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "weekNumber": 1,                // Week number
  "weekType": "A",                // Week type (A, B, or -)
  "blockInfo": "Månad 1...",      // Description of the month/block
  "gymDays": 3,                   // Number of gym days this week
  "barmarkDays": 2,               // Optional: Number of barmark days
  "isDeload": false,              // Optional: Whether this is a deload week
  "isTest": false,                // Optional: Whether this is a test week
  "weekStyle": {                  // Optional: Styling for the week
    "styleClass": "deload-week",  // CSS class name
    "note": "Focus on recovery",  // General note
  },
  "tm": {                         // Optional: Training maxes for the week
    "SQ": 115,
    "BP": 80,
    "DL": 140,
    "OHP": 50
  },
  "sessions": [                   // Array of training sessions
    // ... session objects
  ]
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Session Object</h3>
                <p className="text-sm text-gray-600 mt-1">Each session object has the following properties:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "sessionName": "Gympass 1",     // Name of the session
  "sessionType": "Gym",           // Type: "Gym", "Barmark", or "Eget/Vila"
  "sessionStyle": {               // Optional: Styling for the session
    "styleClass": "gym-session",  // CSS class name
    "icon": "dumbbell",           // Icon name or path
    "note": "Focus on technique"  // Session-specific note
  },
  "exercises": [                  // Array of exercise instances
    // ... exercise instance objects
  ]
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Exercise Instance Object</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Each exercise instance object has the following properties:
                </p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "exerciseId": "sq",             // ID matching an exercise in exerciseDefinitions
  "sets": 3,                      // Number of sets (can be a number or string)
  "reps": "8",                    // Reps per set (can be a number or string)
  "load": "90 kg (~78%)",         // Load/intensity
  "loadStyle": {                  // Optional: Styling for the load
    "strong": true,               // Whether to make the load text bold
    "color": "#b30000"            // Direct CSS color
  },
  "comment": "Startvikt. Teknik!", // Additional comments
  "commentStyle": {               // Optional: Styling for the comment
    "color": "#666",              // Direct CSS color
    "fontStyle": "italic"         // Font style
  },
  "targetRPE": 8,                 // Optional: Target RPE
  "tips": "Håll stolt hållning..." // Optional: Session-specific technique tips
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Month Blocks</h3>
                <p className="text-sm text-gray-600 mt-1">
                  The month blocks define how weeks are grouped for the tab navigation:
                </p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "id": 1,                        // Month/block ID
  "name": "Månad 1 (Vecka 1-4)",  // Display name
  "weeks": [1, 2, 3, 4]           // Week numbers included in this block
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="example" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Example JSON</h3>
                <p className="text-sm text-gray-600 mt-1">Here's a simplified example of a training plan JSON:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto mt-2">
                  {`{
  "exerciseDefinitions": [
    {
      "id": "sq",
      "name": "Knäböj (SQ)",
      "isMainLift": true,
      "targetMuscles": ["Quads", "Glutes", "Core"],
      "generalTips": "Håll ryggen rak, knäna i linje med tårna"
    },
    {
      "id": "bp",
      "name": "Bänkpress (BP)",
      "isMainLift": true,
      "targetMuscles": ["Chest", "Triceps", "Shoulders"],
      "generalTips": "Håll skulderbladen ihopdragna"
    },
    {
      "id": "db_row",
      "name": "Hantelrodd (DB Row)",
      "isAccessory": true,
      "targetMuscles": ["Upper Back", "Biceps", "Forearms"]
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "weekType": "A",
      "blockInfo": "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym",
      "gymDays": 3,
      "tm": {
        "SQ": 115,
        "BP": 80,
        "DL": 140,
        "OHP": 50
      },
      "sessions": [
        {
          "sessionName": "Gympass 1",
          "sessionType": "Gym",
          "exercises": [
            { 
              "exerciseId": "sq", 
              "sets": 3, 
              "reps": "8", 
              "load": "90 kg (~78%)", 
              "comment": "Startvikt. Teknik!" 
            },
            { 
              "exerciseId": "bp", 
              "sets": 3, 
              "reps": "8", 
              "load": "60 kg (75%)", 
              "comment": "Öka mot 65kg snabbt om lätt." 
            },
            { 
              "exerciseId": "db_row", 
              "sets": 3, 
              "reps": "8-10 /arm", 
              "load": "Tungt, RPE 8-9", 
              "comment": "" 
            }
          ]
        }
      ]
    }
  ],
  "monthBlocks": [
    { "id": 1, "name": "Månad 1 (Vecka 1-4)", "weeks": [1, 2, 3, 4] },
    { "id": 2, "name": "Månad 2 (Vecka 5-8)", "weeks": [5, 6, 7, 8] }
  ]
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Tips for Creating Your JSON</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                  <li>
                    <strong>Normalized Structure Benefits</strong>
                    <p className="text-gray-600 mt-1">
                      The normalized structure separates exercise definitions from their usage, reducing redundancy and
                      making updates easier.
                    </p>
                  </li>
                  <li>
                    <strong>Exercise IDs</strong>
                    <p className="text-gray-600 mt-1">
                      Use short, descriptive IDs for exercises (e.g., "sq", "bp", "dl") to make the JSON more readable.
                    </p>
                  </li>
                  <li>
                    <strong>Required Fields</strong>
                    <p className="text-gray-600 mt-1">
                      At minimum, include id and name for exercise definitions, and exerciseId, sets, reps, and load for
                      exercise instances.
                    </p>
                  </li>
                  <li>
                    <strong>Month Blocks</strong>
                    <p className="text-gray-600 mt-1">
                      Ensure that every week number is included in exactly one month block.
                    </p>
                  </li>
                  <li>
                    <strong>JSON Validation</strong>
                    <p className="text-gray-600 mt-1">Use a JSON validator to check your file before importing it.</p>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Using AI to Create Your Training Plan JSON</h3>
                <p className="text-sm text-gray-600 mt-1">
                  AI tools like ChatGPT, Claude, or v0 can help you create your training plan JSON file with minimal
                  effort.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium">Interactive Interview Process</h3>
                <p className="text-sm text-gray-600 mt-1">
                  The AI prompt below includes an interview process to understand your training goals before creating a
                  personalized plan.
                </p>
                <ol className="list-decimal pl-6 mt-2 space-y-2 text-sm">
                  <li>
                    <strong>Copy the prompt</strong> using the button below
                  </li>
                  <li>
                    <strong>Paste it to an AI assistant</strong> like ChatGPT-4 or v0
                  </li>
                  <li>
                    <strong>Answer the interview questions</strong> about your training goals
                  </li>
                  <li>
                    <strong>Review the generated JSON</strong> and import it into the app
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-base font-medium">Benefits of the AI Interview</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>Creates a personalized plan based on your specific goals</li>
                  <li>Considers your experience level and available equipment</li>
                  <li>Adapts to your schedule and time constraints</li>
                  <li>Takes into account any injuries or limitations</li>
                  <li>Structures progressive overload based on your current strength levels</li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">AI Prompt with Interview</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(aiPromptTemplate)
                      setShowCopyNotification(true)
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border text-xs font-mono max-h-[200px] overflow-y-auto">
                  {aiPromptTemplate}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Add this just before the closing DialogContent tag */}
        <CopyNotification show={showCopyNotification} onHide={() => setShowCopyNotification(false)} />
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

