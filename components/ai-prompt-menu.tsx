"use client"

import { useState } from "react"
import type { LucideProps } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import CopyNotification from "@/components/copy-notification"
import {
  Copy, // Copy icon for buttons
  Wand2, // Main trigger button icon
  Target,
  SlidersHorizontal,
  Clock,
  MessageSquare, // Guided Plan (Beginner)
  Dumbbell, // General Strength
  Sparkles, // Hypertrophy Focus
  HeartPulse, // Endurance Training
  Anchor, // Powerlifting Program (Alternative for Barbell)
  FileJson, // Format My Plan
  type Icon as LucideIcon,
  Replace,
} from "lucide-react"

// Model: Data and state management
interface PromptTemplate {
  id: string
  title: string
  description: string // Keep this brief for the button UI
  prompt: string // This will contain the detailed instructions for the LLM
  icon: LucideIcon
}

interface AIPromptMenuProps {
  onCopy?: (prompt: string) => void
}

const usePromptController = () => {
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  const detailedJsonStructureGuide = `
# REQUIRED T-JSON OUTPUT STRUCTURE

**IMPORTANT:** Generate the final plan *only* as a valid JSON object adhering strictly to the structure below. Do not include any introductory text, explanations, or markdown formatting outside the JSON code block itself.

\`\`\`json
{
  // Optional: High-level plan information
  "metadata": {
    "planName": "string (Required)", // Name of the training plan
    "creationDate": "string (ISO 8601 Format, e.g., 2025-04-16T12:00:00Z)", // Date plan was created
    "description": "string (Optional)", // Brief description
    "author": "string (Optional)", // Who created the plan
    "version": "string (Optional)" // e.g., "1.0"
  },

  // Optional: Define session types used (Gym, Rest, Barmark, etc.)
  "sessionTypes": [
    {
      "id": "string (Unique ID, e.g., 'gym')", // REQUIRED
      "name": "string (Display name, e.g., 'Gym')", // REQUIRED
      "defaultStyle": { // Optional default styling for this session type
        "colorName": "ColorName (Optional, e.g., 'blue')" // Tailwind color name
      }
    }
    // ... more session types
  ],

  // Optional: Define distinct training blocks/phases
  "blocks": [
    {
      "id": "string | number (Unique ID, e.g., 'block-1')", // REQUIRED
      "name": "string (Display name, e.g., 'Foundation Phase')", // REQUIRED
      "focus": "string (Main focus, e.g., 'Hypertrophy')", // REQUIRED
      "durationWeeks": "number (Expected length in weeks)", // REQUIRED
      "description": "string (Optional)",
      "style": { // Optional styling for block header/overview
        "colorName": "ColorName (Optional, e.g., 'violet')"
      }
    }
    // ... more block definitions
  ],

  // REQUIRED: Define special week types (Deload, Test, Competition, etc.)
  "weekTypes": [
    {
      "id": "string (Unique ID, e.g., 'deload')", // REQUIRED
      "name": "string (Display name, e.g., 'DELOAD')", // REQUIRED
      "colorName": "ColorName (e.g., 'yellow')", // REQUIRED - Tailwind color name
      "description": "string (Optional, e.g., 'Recovery week')"
    }
    // ... more week type definitions (MUST include definitions for ALL IDs used in weeks.weekTypeIds)
  ],

  // REQUIRED: Define all unique exercises used in the plan
  "exerciseDefinitions": [
    {
      "id": "string | number (Unique ID, e.g., 'sq', 'bp')", // REQUIRED
      "name": "string (Full name, e.g., 'Squat')", // REQUIRED
      "isMainLift": "boolean (Optional, default false)",
      "isAccessory": "boolean (Optional, default false)",
      "targetMuscles": ["string", "... (Optional array)"],
      "videoUrl": "string (Optional URL)",
      "generalTips": "string (Optional general cues)"
    }
    // ... more exercise definitions
  ],

  // REQUIRED: Array detailing each week's schedule
  "weeks": [
    {
      "weekNumber": "number (Sequential week number)", // REQUIRED
      "blockId": "string | number (Links to blocks.id)", // REQUIRED
      "weekTypeIds": ["string", "... (Links to weekTypes.id, empty array [] if normal week)"], // REQUIRED
      "gymDays": "number (Optional, informational)",
      "barmarkDays": "number (Optional, informational)",
      "weekStyle": { // Optional styling for the week header/badge
        "styleClass": "string (Optional CSS class)",
        "note": "string (Optional note)",
        "colorName": "ColorName (Optional, overrides block/type color)"
      },
      "tm": { // Optional: Training Maxes for the week
        "LIFT_ID": "number (e.g., { 'SQ': 100 })"
      },
      "sessions": [ // REQUIRED: Array of sessions for the week
        {
          "sessionName": "string (e.g., 'Day 1: Upper Body')", // REQUIRED
          "sessionTypeId": "string (Links to sessionTypes.id)", // REQUIRED
          "sessionStyle": { // Optional styling for the session card
            "styleClass": "string (Optional CSS class)",
            "icon": "string (Optional icon name)",
            "note": "string (Optional note)",
            "colorName": "ColorName (Optional, overrides session type default)"
          },
          "exercises": [ // REQUIRED: Array of exercises for the session
            {
              "exerciseId": "string | number (Links to exerciseDefinitions.id)", // REQUIRED
              "sets": "number | string (e.g., 3, '3-4')", // REQUIRED
              "reps": "string | number (e.g., 10, '8-12', 'AMRAP')", // REQUIRED
              "load": "string (Weight, RPE, %, description, e.g., '75% 1RM', 'RPE 8', 'Light')", // REQUIRED
              "comment": "string (Optional notes for this instance)",
              "loadStyle": { // Optional styling for the load text
                "strong": "boolean (Optional, make bold)",
                "color": "ColorName (Optional, e.g., 'red')"
              },
              "commentStyle": { // Optional styling for the comment text
                "color": "ColorName (Optional, e.g., 'gray')",
                "fontStyle": "string (Optional, e.g., 'italic')"
              },
              "targetRPE": "number (Optional)",
              "tips": "string (Optional, specific tips for this instance)"
            }
            // ... more exercise instances
          ]
        }
        // ... more sessions
      ]
    }
    // ... more weeks
  ],

  // REQUIRED: Define groupings of weeks for navigation/overview
  "monthBlocks": [
    {
      "id": "number (Unique ID for the block/month)", // REQUIRED
      "name": "string (Display name, e.g., 'Month 1 (Weeks 1-4)')", // REQUIRED
      "weeks": ["number", "... (Array of week numbers in this block)"], // REQUIRED
      "style": { // Optional styling for the tab/selector
        "colorName": "ColorName (Optional, e.g., 'blue')"
      }
    }
    // ... more month blocks (MUST cover all weeks defined in the 'weeks' array)
  ]
}
\`\`\`

Key requirements:
- **All Required Fields:** Ensure all fields marked as REQUIRED are present.
- **Valid References:** 'blockId', 'sessionTypeId', 'exerciseId', and 'weekTypeIds' must correctly reference IDs defined in their respective definition arrays ('blocks', 'sessionTypes', 'exerciseDefinitions', 'weekTypes').
- **Complete Week Coverage:** Every 'weekNumber' in the 'weeks' array must be included in exactly one entry within the 'monthBlocks' array.
- **Valid JSON:** The final output must be syntactically correct JSON.
- **Color Names:** Use standard Tailwind CSS color names (e.g., 'red', 'blue', 'green', 'yellow', 'indigo', 'pink', 'gray', etc.) when specifying 'colorName'.

Please generate the plan based on our discussion and output *only* the final JSON object.
`

  // Use the detailed guide for the main instruction
  const jsonOutputInstruction = detailedJsonStructureGuide

  // Define the prompt templates
  const promptTemplates: PromptTemplate[] = [
    {
      id: "novice-interview",
      title: "Start Interview (Beginner)",
      description:
        "Ideal if you're new to exercise! This starts a friendly chat where the AI asks questions step-by-step to understand your goals, available time, and limits before suggesting a safe and simple starting plan tailored to you.",
      icon: MessageSquare,
      prompt: `You are an AI assistant helping a beginner create their first workout plan. Initiate an interactive interview process.

      **Do NOT generate the plan yet.** Ask questions one or two at a time to understand the user's situation:
      1.  **Goal:** What are they hoping to achieve? (e.g., general health, weight loss, feel stronger)
      2.  **Activity Level:** How active are they now? (e.g., sedentary, walk occasionally)
      3.  **Time:** How many days/week and minutes/session can they commit?
      4.  **Equipment:** What do they have access to? (Bodyweight, dumbbells, gym?)
      5.  **Preferences:** Any activities they like/dislike?
      6.  **Limitations:** Any health concerns? (Remind user you're not a doctor and to consult one).

      After gathering information, guide them towards a simple, safe starting plan focusing on foundational movements and consistency. Then, generate the plan using the agreed details.
      ${jsonOutputInstruction}`,
    },
    {
      id: "goal-oriented-request",
      title: "Create Plan from Details",
      description:
        "Choose this if you generally know what you want. You'll provide key details like your main goal (e.g., muscle gain, run 5k), experience level, available days/time, and equipment, and the AI will generate a structured plan.",
      icon: Target,
      prompt: `Generate a structured training plan based on the specific details the user provides.

      **Instruct the user:** "Please tell me the details for the plan you want. Include:"
      * **Primary Goal:** (e.g., run a 5k, gain muscle, general fitness, lose weight)
      * **Experience Level:** (e.g., Beginner, 6 months lifting, advanced runner)
      * **Duration:** How many weeks should the plan cover?
      * **Frequency:** How many days per week?
      * **Time per Session:** How long is each workout?
      * **Available Equipment:** (e.g., Full gym, dumbbells only, bodyweight)
      * **Specific Requests:** (e.g., Upper/lower split, focus on certain exercises, include specific cardio)

      Once the user provides these details, create a plan tailored to their input. Specify exercises, sets, reps (or duration/distance), rest periods, etc., clearly for each training day/week. Include warm-ups/cool-downs.
      ${jsonOutputInstruction}`,
    },
    {
      id: "experienced-optimizer",
      title: "Optimize My Routine",
      description:
        "Best for seasoned exercisers seeking refinement. Use this to fine-tune your current program, break plateaus, design advanced periodization (like block or conjugate), or get a peaking plan. Provide your current routine details and optimization goals.",
      icon: SlidersHorizontal,
      prompt: `Assist an experienced exerciser in optimizing their current training routine or designing an advanced program.

      **Instruct the user:** "Please provide details about your current training and goals for optimization:"
      * **Current Routine:** Briefly describe your current split, key exercises, volume/intensity.
      * **Specific Goal:** What do you want to achieve? (e.g., Overcome a plateau, peak for a competition, change training style like conjugate/periodization, improve specific lifts/times).
      * **Experience Level & Key Metrics:** (e.g., Years training, current 1RMs/PBs if relevant).
      * **Training Frequency/Availability:** How many days/hours?

      Based on their input, provide specific recommendations, program adjustments, or a new advanced plan structure (e.g., periodization blocks, peaking cycles, specific splits). Detail exercises, sets, reps, intensity (%1RM, RPE), and rest periods accurately.
      ${jsonOutputInstruction}`,
    },
    {
      id: "constraint-focused",
      title: "Plan with Constraints",
      description:
        "Perfect for busy schedules or minimal gear. Clearly state your constraints (e.g., 'only 20 minutes a day', 'bodyweight exercises only', 'hotel room workout') and your fitness goal. The AI will create the most effective plan possible within those limits.",
      icon: Clock,
      prompt: `Generate a workout plan specifically designed around user-provided constraints.

      **Instruct the user:** "Please tell me about your limitations so I can create a suitable plan:"
      * **Main Constraint(s):** What are the primary limitations? (e.g., Time per session - specify max minutes, Available Equipment - specify exactly what, Location - e.g., hotel room).
      * **Fitness Goal:** What do you want to achieve with this constrained training? (e.g., Maintain fitness, fat loss, quick workout)
      * **Fitness Level:** (Beginner, Intermediate, Advanced)
      * **Frequency:** How many days per week?

      Based on these constraints and goals, create an effective and realistic workout plan. Clearly list exercises, sets/reps or duration, and rest periods suitable for the limitations. If providing options (e.g., 3 different routines), structure them clearly.
      ${jsonOutputInstruction}`,
    },
    {
      id: "modify-plan",
      title: "Modify My Existing Plan",
      description:
        "Already have a plan but need to change something? Use this option. You'll first provide the existing plan, then clearly state the specific adjustments you need (e.g., swap exercises, change days/duration, adapt for travel/equipment changes).",
      icon: Replace,
      prompt: `Help the user modify an existing workout plan they provide.

      **Instruct the user:** "Please provide two things:"
      1.  **Your Existing Plan:** Paste or describe the workout plan you want to change.
      2.  **Your Desired Modifications:** Clearly state the changes you want to make (e.g., "Change from 4 days to 3 days", "Swap barbell squats for dumbbell lunges", "Reduce session time to 30 minutes", "Make it suitable for travel with only resistance bands next week").

      Once the user provides both the original plan and the requested changes, generate the *modified* plan structure incorporating those changes accurately. Ensure the core intent of the plan is maintained where possible, unless the modification fundamentally changes it.
      ${jsonOutputInstruction}`,
    },
    {
      id: "format-plan",
      title: "Format My Plan to JSON",
      description:
        "Essential for the visualizer! If you have a plan written down anywhere (text, notes, spreadsheet data), use this to convert it accurately into the specific JSON format required by this tool. The AI will only reformat, not change the content.",
      icon: FileJson,
      prompt: `This prompt formats an existing workout plan into the specific JSON structure required.

        **Instructions for User:**
        1.  Copy this entire prompt message.
        2.  Paste it into our chat.
        3.  **Immediately after sending this prompt, paste your complete workout plan text.**

        **AI Task:** Convert the workout plan text that the user will provide immediately following this message into the specified JSON format below.
        * Accurately map all details (exercises, sets, reps, rest, days, notes, etc.) from the provided text into the corresponding JSON fields.
        * Do not add, remove, or change information from the original plan unless necessary to fit the structure.
        * If details are missing in the text but required by the JSON, use reasonable defaults or appropriate null/empty values.
        * **Output ONLY the JSON object.** No extra text before or after.

        The required JSON structure is:
        ${jsonOutputInstruction} // CORRECTED: Use the detailed guide variable

        **(User: Remember to paste your plan text right after sending this!)**`,
    },
  ]

  // Copy prompt function
  const copyPrompt = async (prompt: string, onCopy?: (prompt: string) => void) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 2000)
      if (onCopy) {
        onCopy(prompt)
      }
    } catch (error) {
      console.error("Failed to copy prompt:", error)
      // Optionally show an error notification to the user
    }
  }

  return {
    promptTemplates,
    showCopyNotification,
    copyPrompt,
  }
}

// Presenter: UI component
export function AIPromptMenu({ onCopy }: AIPromptMenuProps) {
  const { promptTemplates, showCopyNotification, copyPrompt } = usePromptController()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleItemClick = (prompt: string) => {
    copyPrompt(prompt, onCopy)
    setIsMenuOpen(false)
  }

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          {/* Trigger Button */}
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] px-6 shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-150 ease-in-out flex items-center justify-center gap-2 group"
          >
            <Wand2 className="h-5 w-5 transition-transform duration-150 group-hover:rotate-12 flex-shrink-0" />
            <span className="text-sm sm:text-base whitespace-nowrap">AI Workout Plan Helper</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl p-0" align="start">
          {/* Dropdown Content Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 max-h-[70vh] overflow-y-auto">
            {promptTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto w-full p-3 text-left justify-start items-center flex gap-3"
                  onClick={() => handleItemClick(template.prompt)}
                >
                  {/* Icon Area */}
                  {IconComponent && (
                    <div className="flex-shrink-0 p-1 bg-muted rounded-sm self-start mt-0.5">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  {/* Text Content Area */}
                  <div className="flex flex-col flex-grow">
                    <div className="font-medium mb-0.5">{template.title}</div>
                    <div className="text-xs text-muted-foreground whitespace-normal">
                      {template.description}
                    </div>
                  </div>
                  {/* Copy Icon */}
                  <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-auto self-start mt-0.5" />
                </Button>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Copy Notification */}
      <CopyNotification
        show={showCopyNotification}
        onHide={() => setShowCopyNotification(false)} // Corrected hide logic
        message="Prompt copied to clipboard!"
      />
    </>
  )
}
