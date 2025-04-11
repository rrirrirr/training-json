"use client"

import { useState } from "react"
// DropdownMenu imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Other necessary imports
import { Button } from "@/components/ui/button"
import CopyNotification from "@/components/copy-notification"
// --- Import the Copy icon ---
import { Copy, Wand2 } from "lucide-react"

// Model: Data and state management (remains the same)
interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
}

interface AIPromptMenuProps {
  onCopy?: (prompt: string) => void
}

// Controller: Business logic (remains the same)
const usePromptController = () => {
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  // Base prompt template
  const basePrompt = `Please create a JSON file...` // Keep your definition

  // Define different prompt templates
  const promptTemplates: PromptTemplate[] = [
    {
      id: "general-strength",
      title: "General Strength Plan",
      description: "Basic prompt for strength training plan",
      prompt: basePrompt,
    },
    {
      id: "hypertrophy",
      title: "Hypertrophy Focus",
      description: "Muscle building program",
      prompt:
        basePrompt +
        "\n\nPlease focus on hypertrophy with higher rep ranges and appropriate volume for muscle growth.",
    },
    {
      id: "endurance",
      title: "Endurance Training",
      description: "Cardiovascular and endurance focus",
      prompt:
        basePrompt +
        "\n\nPlease focus on endurance training with appropriate cardio and conditioning work.",
    },
    {
      id: "powerlifting",
      title: "Powerlifting Program",
      description: "Focused on the big three lifts",
      prompt:
        basePrompt +
        "\n\nPlease focus on powerlifting specifically, with emphasis on squat, bench press, and deadlift.",
    },
    {
      id: "athletic",
      title: "Athletic Performance",
      description: "Sports-specific training",
      prompt:
        basePrompt +
        "\n\nPlease focus on athletic performance with explosive movements and sport-specific exercises.",
    },
    {
      id: "beginner",
      title: "Beginner Program",
      description: "Starter plan for newcomers",
      prompt:
        basePrompt +
        "\n\nPlease create a beginner-friendly program with focus on form and progressive overload.",
    },
  ]

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

// Presenter: UI component with 2-column DropdownMenu + Copy Icons
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
          <Button
            variant="default" // Use primary background/foreground from your theme
            size="lg" // Make it taller
            className="w-full sm:w-auto min-w-[200px] px-6 shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-150 ease-in-out flex items-center justify-center gap-2 group" // Ensure width behaves, add padding, shadow, hover, flex for icon
          >
            <Wand2 className="h-5 w-5 transition-transform duration-150 group-hover:rotate-12 flex-shrink-0" />{" "}
            {/* Icon */}
            <span className="text-sm sm:text-base whitespace-nowrap">Pick Your Prompt!</span>{" "}
            {/* Text, adjust size */}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl p-0" align="start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 max-h-[70vh] overflow-y-auto">
            {promptTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                // --- Use Flexbox for layout within the button ---
                className="h-auto w-full p-4 text-left justify-between items-start flex"
                onClick={() => handleItemClick(template.prompt)}
              >
                {/* Text Content Area */}
                <div className="flex flex-col mr-2">
                  {/* Add margin to separate text from icon */}
                  <div className="font-medium mb-1">{template.title}</div>
                  <div className="text-xs text-muted-foreground whitespace-normal">
                    {template.description}
                  </div>
                </div>
                {/* --- Add Copy Icon --- */}
                <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />{" "}
                {/* Adjust icon style/margin (mt-0.5) as needed */}
              </Button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CopyNotification
        show={showCopyNotification}
        onHide={() => {}}
        message="Prompt copied to clipboard!"
      />
    </>
  )
}
