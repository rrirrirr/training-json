"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import CopyNotification from "./copy-notification"
import { useUploadModal } from "@/components/modals/upload-modal"
import { ExternalLink, Copy, FileUp, Wand2 } from "lucide-react"
import Link from "next/link"
import { AIPromptMenu } from "./ai-prompt-menu"

interface AiAssistantDialogProps {
  isOpen: boolean
  onClose: () => void
}

function AiAssistantDialog({ isOpen, onClose }: AiAssistantDialogProps) {
  const router = useRouter()
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string>(`Please create a JSON file...`) // Your default prompt here
  const uploadModalStore = useUploadModal()

  // Copy the prompt to clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt)
    setShowCopyNotification(true)
    setTimeout(() => {
      setShowCopyNotification(false)
    }, 2000)
  }

  // Open the upload modal
  // No need to pass a special callback anymore - the enhanced-json-upload-modal 
  // now handles plan creation with Zustand store directly
  const handleOpenUploadModal = () => {
    onClose()
    uploadModalStore.open()
  }

  const handlePromptSelected = (prompt: string) => {
    setCurrentPrompt(prompt)
  }

  const howItWorksSteps = (
    <ol className="list-decimal pl-6 mt-2 space-y-2 text-sm text-muted-foreground">
      <li>Select an AI prompt template below (or use the default).</li>
      <li>
        Copy the selected prompt using the <Copy className="inline h-3 w-3 mx-0.5" /> button.
      </li>
      <li>Paste it into an AI assistant like ChatGPT-4, Claude, Gemini, etc.</li>
      <li>Answer the interview questions the AI asks about your training goals.</li>
      <li>Copy the complete JSON code block the AI generates.</li>
      <li>Come back here and click the "Open JSON Uploader" button to paste the plan.</li>
    </ol>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-dialog-md dialog-content-base">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Create Plan with AI Magic!
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Let an AI craft your personalized training plan in minutes. Follow these steps:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. Pick Prompt Section */}
          <div className="rounded-lg border border-primary/50 p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-md bg-primary/5">
            <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                1
              </span>
              Pick Your AI Prompt Template
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground md:pl-8">
              Choose a starting point for your conversation with the AI assistant.
            </p>
            <div className="flex justify-center pt-2">
              <AIPromptMenu onCopy={handlePromptSelected} />
            </div>
            <div className="pt-2 sm:pt-3 md:pl-8 space-y-1">
              <label
                htmlFor="current-prompt-display"
                className="text-xs font-medium text-muted-foreground "
              >
                Selected Prompt (Copy this for the AI!)
              </label>
              <div
                id="current-prompt-display"
                className="mt-1 p-2 sm:p-3 bg-muted/50 rounded-md relative border"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPrompt}
                  className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-6 w-6 sm:h-7 sm:w-7 z-10"
                  aria-label="Copy prompt to clipboard"
                >
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <div className="bg-background p-2 sm:p-3 rounded text-[11px] sm:text-xs font-mono max-h-[150px] sm:max-h-[180px] overflow-y-auto pr-8 sm:pr-10">
                  {currentPrompt}
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. Import Plan Section */}
          <div className="rounded-lg border p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                2
              </span>
              Generate & Import Your Plan
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground md:pl-8">
              After the AI generates the plan{" "}
              <span className="font-medium">as a JSON code block</span>, copy it. Then, come back
              and click below to upload it.
            </p>
            <div className="flex justify-center pt-2 md:pl-8">
              <Button
                onClick={handleOpenUploadModal}
                size="lg"
                className="w-full sm:w-auto shadow text-xs sm:text-sm"
              >
                <FileUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Open JSON Uploader & Import
              </Button>
            </div>
          </div>
          
          {/* 3. Tips Link */}
          <div className="text-center pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              🤖 Didn't get the perfect plan?{" "}
              <Link
                href="/documentation#ai-tips"
                className="text-primary hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-0.5"
              >
                Check out our tips for better AI results!
              </Link>
            </p>
          </div>
          
          {/* 4. How it Works (Collapsed) */}
          <Accordion type="single" collapsible className="w-full pt-4 border-t mt-6">
            <AccordionItem value="how-it-works">
              <AccordionTrigger className="text-xs sm:text-sm font-medium text-muted-foreground hover:no-underline">
                Need the step-by-step details again?
              </AccordionTrigger>
              <AccordionContent className="pt-2">{howItWorksSteps}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <CopyNotification
          show={showCopyNotification}
          onHide={() => setShowCopyNotification(false)}
        />

        <DialogFooter className="dialog-footer-center">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AiAssistantDialog