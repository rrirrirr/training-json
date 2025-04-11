"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import CopyNotification from "@/components/copy-notification"

// Model: Data and state management
interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
}

interface AIPromptMenuProps {
  onCopy?: (prompt: string) => void
}

// Controller: Business logic
const usePromptController = () => {
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  
  // Base prompt template that all specific prompts will extend
  const basePrompt = `Please create a JSON file for my training plan with the following normalized structure:

{
  "metadata": {
    "planName": "My 5x5 Strength Program",
    "creationDate": "2025-04-09"
  },
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

After I answer these questions, please create a complete training plan JSON.`

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
      prompt: basePrompt + "\n\nPlease focus on hypertrophy with higher rep ranges and appropriate volume for muscle growth.",
    },
    {
      id: "endurance",
      title: "Endurance Training",
      description: "Cardiovascular and endurance focus",
      prompt: basePrompt + "\n\nPlease focus on endurance training with appropriate cardio and conditioning work.",
    },
    {
      id: "powerlifting",
      title: "Powerlifting Program",
      description: "Focused on the big three lifts",
      prompt: basePrompt + "\n\nPlease focus on powerlifting specifically, with emphasis on squat, bench press, and deadlift.",
    },
    {
      id: "athletic",
      title: "Athletic Performance",
      description: "Sports-specific training",
      prompt: basePrompt + "\n\nPlease focus on athletic performance with explosive movements and sport-specific exercises.",
    },
    {
      id: "beginner",
      title: "Beginner Program",
      description: "Starter plan for newcomers",
      prompt: basePrompt + "\n\nPlease create a beginner-friendly program with focus on form and progressive overload.",
    },
  ]

  const copyPrompt = async (prompt: string, onCopy?: (prompt: string) => void) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 2000)
      
      // Call the optional callback if provided
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

// Presenter: UI component
export function AIPromptMenu({ onCopy }: AIPromptMenuProps) {
  const { promptTemplates, showCopyNotification, copyPrompt } = usePromptController()
  
  // Split templates into left and right columns
  const leftColumnTemplates = promptTemplates.slice(0, 3)
  const rightColumnTemplates = promptTemplates.slice(3)

  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Copy prompt for AI</NavigationMenuTrigger>
            <NavigationMenuContent className="w-[600px] lg:w-[700px]">
              <div className="grid grid-cols-2 gap-3 p-4">
                {/* Left column */}
                <div className="col-span-1 space-y-3">
                  {leftColumnTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full p-6 text-left justify-start h-auto"
                      onClick={() => copyPrompt(template.prompt, onCopy)}
                    >
                      <div>
                        <div className="font-medium mb-1">{template.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Right column */}
                <div className="col-span-1 space-y-3">
                  {rightColumnTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full p-6 text-left justify-start h-auto"
                      onClick={() => copyPrompt(template.prompt, onCopy)}
                    >
                      <div>
                        <div className="font-medium mb-1">{template.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <CopyNotification 
        show={showCopyNotification} 
        onHide={() => {}} // No-op since we handle this internally with timeout
        message="Prompt copied to clipboard!"
      />
    </>
  )
}
