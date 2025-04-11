"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import CopyNotification from "./copy-notification"
import { useUploadModal } from "@/components/modals/upload-modal"
import { ExternalLink, Copy, FileDown, FileUp } from "lucide-react"
import Link from "next/link"
import { AIPromptMenu } from "./ai-prompt-menu"

interface AiAssistantDialogProps {
  isOpen: boolean
  onClose: () => void
}

function AiAssistantDialog({ isOpen, onClose }: AiAssistantDialogProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string>(`Please create a JSON file for my training plan with the following normalized structure:

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

After I answer these questions, please create a complete training plan JSON.`)
  
  const uploadModalStore = useUploadModal()

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt)
    setShowCopyNotification(true)
    
    // Auto-hide notification after 2 seconds
    setTimeout(() => {
      setShowCopyNotification(false)
    }, 2000)
  }

  const handleOpenUploadModal = () => {
    onClose()
    uploadModalStore.open((data) => {
      // Create and dispatch a custom event with the imported JSON data
      const event = new CustomEvent("plan-created-from-json", {
        detail: { data },
      })
      window.dispatchEvent(event)
    })
  }
  
  // Handle prompt selection from AIPromptMenu
  const handlePromptSelected = (prompt: string) => {
    setCurrentPrompt(prompt)
    // We don't need to handle the notification here as AIPromptMenu handles it internally
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Training Plan with AI</DialogTitle>
          <DialogDescription>
            AI assistants like ChatGPT, Claude, or Bard can help you create a personalized training
            plan in minutes.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] mt-4 pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">How It Works</h3>
              <ol className="list-decimal pl-6 mt-2 space-y-2 text-sm">
                <li>
                  <strong>Copy the AI prompt</strong> using the button below
                </li>
                <li>
                  <strong>Paste it to an AI assistant</strong> like ChatGPT-4 or Claude
                </li>
                <li>
                  <strong>Answer the interview questions</strong> about your training goals
                </li>
                <li>
                  <strong>Copy the generated JSON</strong> from the AI's response
                </li>
                <li>
                  <strong>Paste the JSON</strong> back into this app using the "Import JSON" button
                  below
                </li>
              </ol>
            </div>
            
            <div className="flex justify-start p-2">
              <AIPromptMenu onCopy={handlePromptSelected} />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium">AI Prompt</h3>
                <Button
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 ml-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
              <div className="bg-background p-3 rounded border text-xs font-mono max-h-[200px] overflow-y-auto">
                {currentPrompt}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold">Tips for Best Results</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Be specific about your training goals and limitations</li>
                <li>Provide as much detail as possible about your experience level</li>
                <li>Ask the AI to adjust the plan if it doesn't match your preferences</li>
                <li>Request the AI to explain why it structured the plan the way it did</li>
                <li>
                  Check the generated JSON in the upload modal to make sure it's properly formatted
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="text-base font-semibold mb-2">Need More Information?</h3>
              <p className="text-sm mb-2">
                Visit our documentation page for detailed instructions on the JSON format, exercise
                definitions, and how to customize your training plan.
              </p>
              <Link
                href="/documentation"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View Documentation <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </ScrollArea>

        <CopyNotification
          show={showCopyNotification}
          onHide={() => setShowCopyNotification(false)}
        />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenUploadModal}
            className="w-full sm:w-auto flex items-center gap-1"
          >
            <FileUp className="h-4 w-4" />
            Import JSON
          </Button>
          <Link href="/documentation" passHref>
            <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-1">
              <FileDown className="h-4 w-4" />
              Documentation
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AiAssistantDialog