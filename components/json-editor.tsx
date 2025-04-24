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
// Removed unused Alert components for now, re-add if needed for the second error display style
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle, // Keep if used in the second error display style
  AlertTriangle, // *** ADDED AlertTriangle ***
  Save,
  Copy,
  Bot, // Keep if used in the second error display style
  Code,
  MoreVertical, // Keep if used in the second error display style
  Loader2,
  Check, // *** ADDED Check ***
} from "lucide-react"
import CopyNotification from "./copy-notification"
import CopyForAINotification from "./copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
// Removed unused store import for now
// import { usePlanStore } from "@/store/plan-store";

// Re-import react-simple-code-editor
import Editor from "react-simple-code-editor"
// Removed unused router import for now
// import { useRouter } from "next/navigation";
// DO NOT import prism-react-renderer for this step

// --- Types (Keep these) ---
interface PlanData {
  weeks?: any[]
  monthBlocks?: any[]
  exerciseDefinitions?: any[] // Added based on validation logic
  weekTypes?: any[] // Added based on validation logic
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
  onSave?: (updatedData: PlanData) => Promise<boolean | void>
}

// --- JsonEditor Component (No Highlighting) ---
export default function JsonEditor({ isOpen, onClose, plan, onSave }: JsonEditorProps) {
  // const router = useRouter(); // Keep if navigation is needed
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
    setIsSaved(false) // Reset save state when opening or plan changes
  }, [plan, isOpen])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
      // Optionally clear value on close if desired:
      // setEditorValue("");
    }
  }, [isOpen])

  // --- Event Handlers ---
  // Direct state update on change
  const handleEditorChange = (code: string) => {
    setEditorValue(code)
    // Clear JSON parse errors immediately when user types
    setError((prevError) => (prevError?.startsWith("Invalid JSON") ? null : prevError))
    setIsSaved(false) // Mark as unsaved on any change
  }

  // Save handler (now using the onSave callback)
  const handleSave = async () => {
    const textToParse = editorValue

    if (isSubmitting || !plan) {
      // Prevent save if already submitting or if plan data is missing
      setError("Cannot save: Plan information is missing or submission in progress.")
      return
    }

    let parsedData: PlanData
    try {
      parsedData = JSON.parse(textToParse)
      // Clear only JSON parsing errors after successful parse
      setError((prevError) => (prevError?.startsWith("Invalid JSON") ? null : prevError))
    } catch (err) {
      setError(err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON format")
      setIsSubmitting(false) // Ensure submitting is false on parse error
      return
    }

    // Check for pre-existing non-JSON errors before proceeding
    if (error) {
      setError(`Cannot save: Please fix the existing error - ${error}`)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    setIsSaved(false) // Reset save state before attempting save

    try {
      // --- Basic JSON Structure Validation ---
      if (typeof parsedData !== "object" || parsedData === null) {
        throw new Error("JSON must be an object.")
      }
      // Check for mandatory top-level arrays (adjust as per your schema)
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
        parsedData.metadata = {} // Initialize if missing
      } else if (typeof parsedData.metadata !== "object" || parsedData.metadata === null) {
        // Ensure metadata is an object if it exists
        throw new Error("JSON validation failed: 'metadata' must be an object.")
      }
      // Ensure planName exists and is a non-empty string
      if (
        !parsedData.metadata.planName ||
        typeof parsedData.metadata.planName !== "string" ||
        parsedData.metadata.planName.trim() === ""
      ) {
        // Use original plan name or a default if missing/invalid
        parsedData.metadata.planName = plan.name || "Draft Plan"
      }
      // Ensure creationDate exists and is a string (or set a default)
      if (
        !parsedData.metadata.creationDate ||
        typeof parsedData.metadata.creationDate !== "string"
      ) {
        // Use original creation date or current date if missing/invalid
        parsedData.metadata.creationDate =
          plan.data?.metadata?.creationDate || new Date().toISOString()
      }

      // --- Update Editor Value If Metadata Was Modified ---
      // Re-stringify only if validation modified the parsedData (e.g., added default metadata)
      const finalJsonToSave = JSON.stringify(parsedData, null, 2)
      if (finalJsonToSave !== editorValue) {
        setEditorValue(finalJsonToSave) // Update editor to reflect changes
      }

      // --- Call onSave Callback If Provided ---
      if (typeof onSave === "function") {
        console.log("Calling provided onSave handler...")
        const saveResult = await onSave(parsedData) // Pass the validated & potentially modified data

        // Handle the result from the callback
        const success = saveResult !== false // Treat undefined/void/true as success
        setIsSaved(success)

        if (!success) {
          // If onSave explicitly returns false, treat it as a failure
          throw new Error("Save operation failed (returned false from onSave).")
        }
        // Close dialog on successful save (after a short delay for feedback)
        setTimeout(() => {
          if (isOpen) {
            // Check if still open before closing
            onClose()
          }
        }, 1000) // 1 second delay
      } else {
        // If no onSave provided, it cannot be saved.
        console.warn("JsonEditor: No onSave handler provided, changes cannot be saved.")
        setIsSaved(false) // Indicate not saved
        // Do not close the dialog automatically if no save handler exists
        setError("No save handler configured for this editor.")
      }

      // Clear errors only on full success
      setError(null)
    } catch (err) {
      console.error("Save error:", err)
      // Display the validation or save error message
      setError(
        err instanceof Error
          ? `Validation/Save Error: ${err.message}`
          : "An unexpected error occurred during save."
      )
      setIsSaved(false) // Ensure save state is false on error
    } finally {
      // Always set submitting back to false after the attempt
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
        setShowCopyNotification(true) // Still show notification, but indicate failure
      }
    )
  }

  // Copy for AI handler
  const handleCopyForAI = () => {
    if (!editorValue && !error) return // Nothing to copy
    copyJsonErrorForAI(editorValue, error, (success) => {
      setShowAICopyNotification(true)
      setCopySuccess(success)
      if (!success) {
        console.error("Failed to copy for AI")
        // Optionally set an error state specific to AI copy failure
      }
    })
  }

  // Format JSON handler
  const formatJson = () => {
    try {
      const parsed = JSON.parse(editorValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setEditorValue(formatted)
      // Clear only JSON parsing errors after successful format
      setError((prevError) => (prevError?.startsWith("Invalid JSON") ? null : prevError))
      setIsSaved(false) // Formatting changes unsaved state
    } catch (err) {
      // If there's already an error that's *not* a JSON parsing error, keep it.
      // Otherwise, set the "Cannot format invalid JSON" error.
      if (!error || error.startsWith("Invalid JSON")) {
        setError("Cannot format invalid JSON. Please fix the errors first.")
      }
      // Do not clear other types of errors (like validation errors) on format failure
    }
  }

  // --- Dialog Labels and Button Text ---
  const dialogTitle = plan?.id ? `Edit JSON: ${plan.name || plan.id}` : "Edit JSON"
  const dialogDescription = "Directly edit the underlying JSON data for this plan."
  const saveButtonText = "Update Plan"

  // --- Disable States ---
  // Disable save if submitting, no text, or if there is *any* error present
  const disableSaveButton = isSubmitting || !editorValue || !!error
  // Disable format/copy if submitting or no text
  const disableFormatButton = isSubmitting || !editorValue
  const disableCopyButton = !editorValue || isSubmitting
  // Disable AI copy if submitting or if there's neither text nor an error to copy
  const disableCopyAIButton = isSubmitting || (!editorValue && !error)

  // --- Render ---
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Increased max-width, adjusted height, base styles */}
        <DialogContent className="max-w-dialog-lg max-h-[90vh] dialog-content-base flex flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0">
            {/* Flex layout for title/description and potential actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                {" "}
                {/* Title and Description */}
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </div>
              {/* Placeholder for potential header actions if needed */}
            </div>
          </DialogHeader>

          {/* Editor Area */}
          <div className="flex-grow mt-4 border rounded-md bg-background overflow-auto relative min-h-[400px]">
            {/* Loading/Submitting Overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {/* react-simple-code-editor Instance */}
            <Editor
              value={editorValue}
              onValueChange={handleEditorChange}
              highlight={(code) => code} // No highlighting function provided
              padding={15} // Consistent padding
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "400px", // Ensure minimum height
                outline: "none", // Remove default outline
                // Removed height: "100%" as minHeight and flex-grow handle sizing
              }}
              textareaClassName="editor-textarea focus:outline-none caret-black dark:caret-white" // Basic styling and focus behavior
              className="editor-container w-full h-full" // Ensure container takes full space
              disabled={isSubmitting} // Disable textarea during submission
              aria-label="JSON Editor"
            />
          </div>

          {/* Error Message Area */}
          {error && (
            // Simplified error display for this version
            <div className="mt-2 text-destructive text-sm flex items-center gap-2 flex-wrap">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-grow break-words">{error}</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-destructive underline flex-shrink-0"
                onClick={handleCopyForAI}
                disabled={disableCopyAIButton}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy for AI Support
              </Button>
            </div>
          )}

          {/* Action Buttons Footer */}
          {/* Using sm:justify-between to align groups left/right on larger screens */}
          <DialogFooter className="sm:justify-between gap-2 flex-wrap pt-4">
            {/* Left Side Actions */}
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={formatJson}
                disabled={disableFormatButton}
              >
                <Code className="h-4 w-4 mr-1" />
                Format JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={disableCopyButton}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy JSON
              </Button>
            </div>

            {/* Right Side Actions (Cancel/Save) */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={disableSaveButton}
                className="min-w-[120px]" // Give save button some minimum width
              >
                {/* Conditional rendering for button content based on state */}
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {/* Conditional rendering for button text */}
                {isSubmitting ? "Saving..." : isSaved ? "Saved!" : saveButtonText}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Toast Notifications */}
      <CopyNotification
        show={showCopyNotification}
        onOpenChange={setShowCopyNotification} // *** Corrected prop name ***
        success={copySuccess}
      />
      <CopyForAINotification
        show={showAICopyNotification}
        onOpenChange={setShowAICopyNotification} // *** Corrected prop name ***
        success={copySuccess}
      />
    </>
  )
}
