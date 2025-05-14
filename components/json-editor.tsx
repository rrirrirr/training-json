// /components/json-editor.tsx
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
// DropdownMenu imports seem unused in this specific file's logic, can be removed if not needed elsewhere in this component
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import {
  // AlertCircle, // Seems unused
  AlertTriangle,
  Save,
  Copy,
  Bot,
  Code,
  // MoreVertical, // Seems unused
  Loader2,
  Check,
} from "lucide-react"
// Remove imports for local notifications
// import CopyNotification from "./copy-notification"
// import CopyForAINotification from "./copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai" // Keep this utility
import Editor from "react-simple-code-editor"
import { toast } from "sonner" // IMPORT SONNER'S TOAST FUNCTION

// --- Types ---
interface PlanData {
  weeks?: any[]
  blocks?: any[]
  exerciseDefinitions?: any[]
  weekTypes?: any[]
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
  onUnsavedChange?: (hasChanges: boolean) => void
}

// --- JsonEditor Component ---
export default function JsonEditor({
  isOpen,
  onClose,
  plan,
  onSave,
  onUnsavedChange,
}: JsonEditorProps) {
  // --- State ---
  const [editorValue, setEditorValue] = useState("")
  const [initialEditorValue, setInitialEditorValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Remove local notification states
  // const [showCopyNotification, setShowCopyNotification] = useState(false)
  // const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  // const [copySuccess, setCopySuccess] = useState<boolean>(true)
  const [formatStatus, setFormatStatus] = useState<"idle" | "formatting" | "formatted">("idle")

  // --- Effects ---
  useEffect(() => {
    if (isOpen && plan?.data) {
      try {
        const formattedJson = JSON.stringify(plan.data, null, 2)
        setEditorValue(formattedJson)
        setInitialEditorValue(formattedJson)
        setError(null)
        if (onUnsavedChange) onUnsavedChange(false)
      } catch (err) {
        console.error("Failed to stringify initial plan data:", err)
        setError("Failed to load plan data into editor")
        const errorJson = '{\n  "error": "Could not load plan data"\n}'
        setEditorValue(errorJson)
        setInitialEditorValue(errorJson)
        if (onUnsavedChange) onUnsavedChange(false)
      }
    } else if (isOpen) {
      const placeholder = '{\n  "message": "No plan data provided or plan is invalid."\n}'
      setEditorValue(placeholder)
      setInitialEditorValue(placeholder)
      setError(null)
      if (onUnsavedChange) onUnsavedChange(false)
    }
    setIsSaved(false)
    setFormatStatus("idle")
  }, [plan, isOpen, onUnsavedChange])

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
      setFormatStatus("idle")
    }
  }, [isOpen])

  const handleEditorChange = (code: string) => {
    setEditorValue(code)
    setError(null)
    setIsSaved(false)
    setFormatStatus("idle")
    if (onUnsavedChange) {
      onUnsavedChange(code !== initialEditorValue)
    }
  }

  const formatJson = () => {
    setFormatStatus("formatting")
    setTimeout(() => {
      try {
        const parsed = JSON.parse(editorValue)
        const formatted = JSON.stringify(parsed, null, 2)
        const isDifferent = formatted !== editorValue
        if (isDifferent) {
          setEditorValue(formatted)
          setError(null)
          setIsSaved(false)
          if (onUnsavedChange) {
            onUnsavedChange(formatted !== initialEditorValue)
          }
        }
        setFormatStatus("formatted")
      } catch (err) {
        if (!error || error.startsWith("Invalid JSON")) {
          setError("Cannot format invalid JSON. Please fix the errors first.")
        }
        setFormatStatus("idle")
      }
    }, 300)
  }

  const handleSave = async () => {
    const textToParse = editorValue
    if (isSubmitting || !plan) {
      setError("Cannot save: Plan information is missing or submission in progress.")
      return
    }
    let parsedData: PlanData
    try {
      parsedData = JSON.parse(textToParse)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON format")
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(true)
    setIsSaved(false)
    try {
      if (typeof parsedData !== "object" || parsedData === null) {
        throw new Error("JSON must be an object.")
      }
      if (!parsedData.weeks || !Array.isArray(parsedData.weeks)) {
        throw new Error("JSON validation failed: must contain a 'weeks' array.")
      }
      if (!parsedData.blocks || !Array.isArray(parsedData.blocks)) {
        throw new Error("JSON validation failed: must contain a 'blocks' array.")
      }
      if (!parsedData.exerciseDefinitions || !Array.isArray(parsedData.exerciseDefinitions)) {
        throw new Error("JSON validation failed: must contain an 'exerciseDefinitions' array")
      }
      if (!parsedData.weekTypes || !Array.isArray(parsedData.weekTypes)) {
        throw new Error("JSON validation failed: must contain a 'weekTypes' array")
      }
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
      const finalJsonToSave = JSON.stringify(parsedData, null, 2)
      if (finalJsonToSave !== editorValue) {
        setEditorValue(finalJsonToSave)
      }
      if (typeof onSave === "function") {
        console.log("Calling provided onSave handler...")
        const saveResult = await onSave(parsedData)
        const success = saveResult !== false
        setIsSaved(success)
        if (success) {
          setInitialEditorValue(editorValue)
          if (onUnsavedChange) onUnsavedChange(false)
          toast.success(`${parsedData.metadata.planName || "Plan"} saved successfully!`) // Sonner toast on success
          setTimeout(() => {
            if (isOpen) {
              onClose()
            }
          }, 1000)
        } else {
          toast.error("Save operation failed.") // Sonner toast on failure
          throw new Error("Save operation failed (returned false from onSave).")
        }
      } else {
        console.warn("JsonEditor: No onSave handler provided, changes cannot be saved.")
        setIsSaved(false)
        setError("No save handler configured for this editor.")
        toast.warning("Save handler not configured.") // Sonner toast
      }
      setError(null)
    } catch (err) {
      console.error("Save error:", err)
      const errorMessage =
        err instanceof Error
          ? `Validation/Save Error: ${err.message}`
          : "An unexpected error occurred during save."
      setError(errorMessage)
      toast.error(errorMessage) // Sonner toast on error
      setIsSaved(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    if (!editorValue) return
    navigator.clipboard.writeText(editorValue).then(
      () => {
        toast.success("JSON copied to clipboard!") // USE SONNER TOAST
      },
      (err) => {
        console.error("Failed to copy: ", err)
        toast.error("Failed to copy JSON. Browser permissions might be denied.") // USE SONNER TOAST
        // setError("Failed to copy text to clipboard. Browser permissions might be denied.") // Optional: keep inline error if desired
      }
    )
  }

  const handleCopyForAI = () => {
    if (!editorValue && !error) return
    copyJsonErrorForAI(editorValue, error, (success) => {
      // copyJsonErrorForAI itself handles clipboard
      if (success) {
        toast.success("Copied JSON & documentation for AI help!", {
          // USE SONNER TOAST
          description:
            "Paste this to an AI assistant (e.g., ChatGPT, Claude) for help fixing your JSON.",
          // Sonner allows JSX in description or you can use its `action` prop for more complex buttons
        })
      } else {
        toast.error("Failed to copy for AI.") // USE SONNER TOAST
        console.error("Failed to copy for AI")
      }
    })
  }

  const dialogTitle = plan?.id ? `Edit JSON: ${plan.name || plan.id}` : "Edit JSON"
  const dialogDescription = "Directly edit the underlying JSON data for this plan."
  const saveButtonText = "View Draft" // Or "Save Changes" if onSave is more direct

  const disableSaveButton = isSubmitting || !editorValue || !!error
  const disableFormatButton = isSubmitting || !editorValue
  const disableCopyButton = !editorValue || isSubmitting
  const disableCopyAIButton = isSubmitting || (!editorValue && !error)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-dialog-lg max-h-[90vh] dialog-content-base flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-grow mt-4 border rounded-md bg-background overflow-auto relative min-h-[400px]">
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Editor
              value={editorValue}
              onValueChange={handleEditorChange}
              highlight={(code) => code} // Basic highlight, consider a library for syntax highlighting
              padding={15}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "400px",
                outline: "none",
              }}
              textareaClassName="editor-textarea focus:outline-none caret-black dark:caret-white"
              className="editor-container w-full h-full"
              disabled={isSubmitting}
              aria-label="JSON Editor"
            />
          </div>

          {error && (
            <div className="mt-2 text-destructive text-sm flex items-center gap-2 flex-wrap">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-grow break-words">{error}</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-destructive underline flex-shrink-0"
                onClick={handleCopyForAI} // This will now use Sonner via copyJsonErrorForAI
                disabled={disableCopyAIButton}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy for AI Support
              </Button>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2 flex-wrap pt-4">
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant={formatStatus === "formatted" ? "default" : "outline"} // Changed "success" to "default" as success variant might not exist for Button
                size="sm"
                onClick={formatJson}
                disabled={disableFormatButton || formatStatus === "formatting"}
                className="w-[140px] transition-all duration-200 ease-in-out"
              >
                {formatStatus === "formatting" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    <span>Formatting...</span>
                  </>
                ) : formatStatus === "formatted" ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-green-500">Formatted!</span>
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-1" />
                    <span>Format JSON</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy} // This will now use Sonner
                disabled={disableCopyButton}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy JSON
              </Button>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={disableSaveButton}
                className="min-w-[120px]"
                data-testid="save-draft"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {isSubmitting ? "Saving..." : isSaved ? "Saved!" : saveButtonText}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local CopyNotification and CopyForAINotification components are removed from here.
          Their functionality is now handled by global Sonner toasts. */}
    </>
  )
}
