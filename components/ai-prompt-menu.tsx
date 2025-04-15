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

  // --- CRITICAL: Define Your JSON Structure Here ---
  const yourJsonStructure = `
\`\`\`json
{
  "scheduleName": "Training Plan",
  "durationWeeks": 8,
  "goal": "User-defined goal",
  "level": "User-defined level",
  "daysPerWeek": 3,
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayOfWeek": "Monday",
          "focus": "Workout Focus",
          "warmup": [ /* ... */ ],
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": 3,
              "reps": "8-12",
              "rest": "60s",
              "notes": ""
            }
            // ... more exercises
          ],
          "cooldown": [ /* ... */ ]
        }
        // ... more days
      ]
    }
    // ... more weeks
  ]
}
\`\`\`
`
  // Base instruction focusing on the JSON output - appended where needed
  const jsonOutputInstruction = `\n\nIMPORTANT: Once the plan is finalized, generate it *only* in the following JSON format. Do not include any introduction, explanation, or text outside the JSON structure itself.

The required JSON structure is:
${yourJsonStructure}`

  // --- Define the 6 prompt templates with LONGER DESCRIPTIONS ---
  const promptTemplates: PromptTemplate[] = [
    {
      id: "novice-interview",
      title: "Start Interview (Beginner)",
      // Longer Description:
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
      // Longer Description:
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
      // Longer Description:
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
      // Longer Description:
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
      // Longer Description:
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
      // Longer Description:
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
        ${yourJsonStructure}

        **(User: Remember to paste your plan text right after sending this!)**`,
    },
  ]

  // ... copyPrompt function remains the same ...
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
    }
  }

  return {
    promptTemplates,
    showCopyNotification,
    copyPrompt,
  }
}

// Presenter: UI component (No changes needed in the JSX structure)
export function AIPromptMenu({ onCopy }: AIPromptMenuProps) {
  const { promptTemplates, showCopyNotification, copyPrompt } = usePromptController()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleItemClick = (prompt: string) => {
    copyPrompt(prompt, onCopy)
    setIsMenuOpen(false)
  }

  // --- The JSX return statement remains exactly the same as the previous version ---
  // It already handles rendering the 'description' field correctly.
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
                  // Use Flexbox for layout within the button, allow height to grow
                  className="h-auto w-full p-3 text-left justify-start items-center flex gap-3" // Text alignment corrected
                  onClick={() => handleItemClick(template.prompt)}
                >
                  {/* Icon Area - Render conditionally */}
                  {IconComponent && (
                    <div className="flex-shrink-0 p-1 bg-muted rounded-sm self-start mt-0.5">
                      {" "}
                      {/* Align icon top-left */}
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  {/* Text Content Area */}
                  <div className="flex flex-col flex-grow">
                    <div className="font-medium mb-0.5">{template.title}</div>
                    {/* Description is now LONGER */}
                    <div className="text-xs text-muted-foreground whitespace-normal">
                      {template.description}
                    </div>
                  </div>
                  {/* Copy Icon */}
                  <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-auto self-start mt-0.5" />{" "}
                  {/* Align icon top-right */}
                </Button>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Copy Notification */}
      <CopyNotification
        show={showCopyNotification}
        onHide={() => {}}
        message="Prompt copied to clipboard!"
      />
    </>
  )
}
