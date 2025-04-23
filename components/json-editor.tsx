"use client"

// Import necessary React hooks and components
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, Copy, Bot, Code, MoreVertical, Loader2 } from "lucide-react"
import CopyNotification from "./copy-notification"
import CopyForAINotification from "./copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
import { usePlanMode } from "@/contexts/plan-mode-context"

// Re-import react-simple-code-editor
import Editor from "react-simple-code-editor"
// DO NOT import prism-react-renderer for this step

// --- Types (Keep these) ---
interface PlanData {
  weeks?: any[]
  monthBlocks?: any[]
  metadata?: {
    planName?: string
    creationDate?: string
    [key: string]: any
  }
  [key: string]: any
}

interface Plan {
  id: string | number
  name?: string
  data: PlanData
  [key: string]: any
}

interface JsonEditorProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null | undefined
}

// --- JsonEditor Component (No Highlighting) ---
export default function JsonEditor({ isOpen, onClose, plan }: JsonEditorProps) {
  // --- Hooks ---
  const { mode, updateDraftPlan, enterEditMode } = usePlanMode()

  // --- State ---
  const [editorValue, setEditorValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(true)

  // --- Effects ---
  // Initialize editor when plan changes or dialog opens
  useEffect(() => {
    if (isOpen && plan?.data) {
      try {
        const formattedJson = JSON.stringify(plan.data, null, 2)
        setEditorValue(formattedJson)
        setError(null)
      } catch (err) {
        console.error("Failed to stringify initial plan data:", err)
        setError("Failed to load plan data into editor")
        setEditorValue('{\n  "error": "Could not load plan data"\n}')
      }
    } else if (isOpen) {
      setEditorValue('{\n  "message": "No plan data provided or plan is invalid."\n}')
      setError(null)
    }
    setIsSaved(false)
  }, [plan, isOpen])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
      // setEditorValue(""); // Optionally clear value on close
    }
  }, [isOpen])

  // --- Event Handlers ---
  // Direct state update on change (No debouncing needed for this test)
  const handleEditorChange = (code: string) => {
    setEditorValue(code)
    // Clear JSON parse errors immediately when user types
    setError((prevError) => (prevError?.startsWith("Invalid JSON") ? null : prevError))
    setIsSaved(false) // Mark as unsaved on any change
  }

  // Save handler (remains the same as the simplified version)
  const handleSave = async () => {
    const textToParse = editorValue

    if (isSubmitting || !plan) {
      setError("Cannot save: Plan information is missing or submission in progress.")
      return
    }

    let parsedData: PlanData
    try {
      parsedData = JSON.parse(textToParse)
    } catch (err) {
      setError(err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON format")
      setIsSubmitting(false)
      return
    }

    if (error && !error.startsWith("Invalid JSON")) {
      setError(`Cannot save: Please fix the existing error - ${error}`)
      setIsSubmitting(false)
      return
    }
    setError(null) // Clear error after successful parse

    setIsSubmitting(true)
    setIsSaved(false)

    try {
      // --- Basic JSON Structure Validation ---
      if (typeof parsedData !== "object" || parsedData === null) {
        throw new Error("JSON must be an object.")
      }
      if (!parsedData.weeks || !Array.isArray(parsedData.weeks)) {
        throw new Error("JSON validation failed: must contain a 'weeks' array.")
      }
      if (!parsedData.monthBlocks || !Array.isArray(parsedData.monthBlocks)) {
        throw new Error("JSON validation failed: must contain a 'monthBlocks' array.")
      }
      if (!parsedData.exerciseDefinitions || !Array.isArray(parsedData.exerciseDefinitions)) {
        throw new Error("JSON validation failed: must contain an 'exerciseDefinitions' array")
      }
      if (!parsedData.weekTypes || !Array.isArray(parsedData.weekTypes)) {
        throw new Error("JSON validation failed: must contain a 'weekTypes' array")
      }

      // --- Ensure Metadata Exists and is Valid ---
      if (!parsedData.metadata) {
        parsedData.metadata = {}
      } else if (typeof parsedData.metadata !== "object" || parsedData.metadata === null) {
        throw new Error("JSON validation failed: 'metadata' must be an object.")
      }
      if (
        !parsedData.metadata.planName ||
        typeof parsedData.metadata.planName !== "string" ||
        parsedData.metadata.planName.trim() === ""
      ) {
        parsedData.metadata.planName = plan.name || "Draft Plan"
      }
      if (
        !parsedData.metadata.creationDate ||
        typeof parsedData.metadata.creationDate !== "string"
      ) {
        parsedData.metadata.creationDate =
          plan.data?.metadata?.creationDate || new Date().toISOString()
      }

      // --- Update Context ---
      const finalJsonToSave = JSON.stringify(parsedData, null, 2)
      if (finalJsonToSave !== editorValue) setEditorValue(finalJsonToSave)

      console.log("Updating draft plan with:", parsedData.metadata?.planName)
      updateDraftPlan(parsedData)

      if (mode !== "edit") {
        console.log("Not in edit mode, entering edit mode with the updated plan")
        enterEditMode(parsedData, plan.id ? plan.id.toString() : undefined)
      } else {
        console.log("Already in edit mode, just updated the draft plan")
      }

      // --- Success Feedback and Cleanup ---
      setIsSaved(true)
      setError(null)

      setTimeout(() => {
        if (isOpen) {
          onClose()
        }
      }, 1000)
    } catch (err) {
      console.error("Save error:", err)
      setError(
        err instanceof Error
          ? `Validation/Save Error: ${err.message}`
          : "An unexpected error occurred during save."
      )
      setIsSaved(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy handler
  const handleCopy = () => {
    if (!editorValue) return
    navigator.clipboard.writeText(editorValue).then(
      () => {
        setShowCopyNotification(true)
        setCopySuccess(true)
      },
      (err) => {
        console.error("Failed to copy: ", err)
        setError("Failed to copy text to clipboard. Browser permissions might be denied.")
        setCopySuccess(false)
        setShowCopyNotification(true)
      }
    )
  }

  // Copy for AI handler
  const handleCopyForAI = () => {
    if (!editorValue && !error) return
    copyJsonErrorForAI(editorValue, error, (success) => {
      setShowAICopyNotification(true)
      setCopySuccess(success)
      if (!success) {
        console.error("Failed to copy for AI")
      }
    })
  }

  // Format JSON handler
  const formatJson = () => {
    try {
      const parsed = JSON.parse(editorValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setEditorValue(formatted)
      setError(null)
      setIsSaved(false)
    } catch (err) {
      if (!error || error.startsWith("Invalid JSON")) {
        setError("Cannot format invalid JSON. Please fix the errors first.")
      }
    }
  }

  // --- Dialog Labels and Button Text ---
  const dialogTitle = "Edit Plan JSON (No Highlighting)" // Updated title
  const dialogDescription =
    "Make changes to the plan's JSON data. Syntax highlighting is disabled for performance testing."
  const saveButtonText = "Update Plan"

  // --- Disable States ---
  const disableSaveButton = isSubmitting || !editorValue || !!error
  const disableFormatButton = isSubmitting || !editorValue
  const disableCopyButton = !editorValue || isSubmitting
  const disableCopyAIButton = (!editorValue && !error) || isSubmitting

  // --- Render ---
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-dialog-lg max-h-[90vh] dialog-content-base flex flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Editor Area: Use react-simple-code-editor without prism */}
          <div className="flex-grow mt-4 border rounded-md bg-background overflow-auto relative min-h-[400px]">
            {/* Loading Overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {/* Use react-simple-code-editor */}
            <Editor
              value={editorValue}
              onValueChange={handleEditorChange} // Direct update
              highlight={(code) => code} // NO HIGHLIGHTING - just return the code
              padding={12}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "100%",
                outline: "none",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
              disabled={isSubmitting}
              className="w-full h-full focus-visible:outline-none"
              textareaClassName="outline-none focus:outline-none caret-black dark:caret-white block w-full h-full"
              aria-label="JSON Editor"
              // Note: react-simple-code-editor might handle role/multiline internally
            />
          </div>

          {/* Error/Success Feedback Area */}
          <div className="flex-shrink-0 mt-4 space-y-3">
            {error && (
              <Alert variant="destructive">
                <div className="flex items-start w-full">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="ml-3 flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-x-4 gap-y-2">
                    <div className="flex-grow">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription className="mt-1 break-words">{error}</AlertDescription>
                    </div>
                    <Button
                      onClick={handleCopyForAI}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 self-start sm:self-auto items-center gap-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={disableCopyAIButton || isSubmitting}
                    >
                      <Bot className="h-4 w-4" />
                      Copy Error for AI
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
            {isSaved && (
              <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-200">
                <div className="flex items-start">
                  <Save className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Plan updated successfully!</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>

          {/* Footer: Actions and Save/Cancel */}
          <DialogFooter className="dialog-footer-between flex-shrink-0 flex flex-row items-center gap-2 pt-4">
            {/* Left Group (Actions) */}
            <div className="flex gap-2 justify-start items-center">
              {/* Mobile Dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isSubmitting}>
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" sideOffset={4}>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        formatJson()
                      }}
                      disabled={disableFormatButton || isSubmitting}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Code className="h-4 w-4" /> <span>Format</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleCopy()
                      }}
                      disabled={disableCopyButton}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" /> <span>Copy JSON</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Desktop Buttons */}
              <Button
                onClick={formatJson}
                variant="outline"
                className="hidden sm:flex items-center gap-2"
                disabled={disableFormatButton || isSubmitting}
              >
                <Code className="h-4 w-4" /> Format
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="hidden sm:flex items-center gap-2"
                disabled={disableCopyButton}
              >
                <Copy className="h-4 w-4" /> Copy JSON
              </Button>
            </div>

            {/* Right Group (Save/Cancel) */}
            <div className="flex gap-2 justify-end items-center">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={disableSaveButton}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  saveButtonText
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Components */}
      <CopyNotification
        show={showCopyNotification}
        onHide={() => setShowCopyNotification(false)}
        success={copySuccess}
      />
      <CopyForAINotification
        show={showAICopyNotification}
        onHide={() => setShowAICopyNotification(false)}
        success={copySuccess}
      />
    </>
  )
}
