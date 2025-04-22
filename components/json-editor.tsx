"use client"

import { useState, useEffect } from "react"
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
import { AlertCircle, Save, Copy, Bot, Code, MoreVertical } from "lucide-react"
import CopyNotification from "./copy-notification" // Assuming this component exists
import CopyForAINotification from "./copy-for-ai-notification" // Assuming this component exists
import { copyJsonErrorForAI } from "@/utils/copy-for-ai" // Assuming this utility exists
import { useTheme } from "next-themes"
import { usePlanMode } from "@/contexts/plan-mode-context" // Import all functionality from the plan mode context

// Import syntax highlighting components
import Editor from "react-simple-code-editor"
import { Highlight, themes } from "prism-react-renderer" // Ensure this is installed

// Define the expected shape of the plan prop
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

// --- Removed 'mode' prop ---
interface JsonEditorProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null | undefined
}

// --- Removed 'mode' from function signature ---
export default function JsonEditor({ isOpen, onClose, plan }: JsonEditorProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  // --- Keep usePlanMode only for updateDraftPlan ---
  const { mode, updateDraftPlan, enterEditMode } = usePlanMode()

  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Separate notification states
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(true)

  // --- Effects and Handler functions ---
  useEffect(() => {
    if (plan?.data) {
      try {
        const formattedJson = JSON.stringify(plan.data, null, 2)
        setJsonText(formattedJson)
        setError(null)
      } catch (err) {
        console.error("Failed to stringify initial plan data:", err)
        setError("Failed to load plan data into editor")
        setJsonText('{\n  "error": "Could not load plan data"\n}')
      }
    } else {
      setJsonText('{\n  "message": "No plan data provided or plan is invalid."\n}')
    }
    setIsSaved(false)
  }, [plan])

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (isSubmitting || !plan) {
      setError("Cannot save: Plan information is missing or submission in progress.")
      return
    }

    let parsedData: PlanData
    try {
      parsedData = JSON.parse(jsonText)
      if (error?.startsWith("Invalid JSON")) setError(null)
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

    setIsSubmitting(true)
    setIsSaved(false)

    try {
      // Basic JSON Structure Validation
      if (typeof parsedData !== "object" || parsedData === null) {
        throw new Error("JSON must be an object.")
      }
      if (!parsedData.weeks || !Array.isArray(parsedData.weeks)) {
        throw new Error("JSON validation failed: must contain a 'weeks' array.")
      }
      if (!parsedData.monthBlocks || !Array.isArray(parsedData.monthBlocks)) {
        throw new Error("JSON validation failed: must contain a 'monthBlocks' array.")
      }

      // Ensure Metadata Exists and is Valid
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

      const potentiallyUpdatedJson = JSON.stringify(parsedData, null, 2)
      if (potentiallyUpdatedJson !== jsonText) {
        setJsonText(potentiallyUpdatedJson)
      }

      // Update the draft plan and check if we need to enter edit mode
      console.log("Updating draft plan with:", parsedData) // Debug log
      updateDraftPlan(parsedData)
      
      // Check if we're not already in edit mode - if not, enter edit mode
      if (mode !== "edit") {
        console.log("Not in edit mode, entering edit mode with the updated plan")
        // Use the same plan ID if it exists
        enterEditMode(parsedData, plan.id.toString())
      } else {
        console.log("Already in edit mode, just updated the draft plan")
      }

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

  const handleCopy = () => {
    if (!jsonText) return
    navigator.clipboard.writeText(jsonText).then(
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

  const handleCopyForAI = () => {
    if (!jsonText && !error) return
    copyJsonErrorForAI(jsonText, error, (success) => {
      setShowAICopyNotification(true)
      setCopySuccess(success)
      if (!success) {
        console.error("Failed to copy for AI")
      }
    })
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      if (error?.startsWith("Invalid JSON")) {
        setError(null)
      }
      setIsSaved(false)
    } catch (err) {
      if (!error || error.startsWith("Invalid JSON")) {
        setError("Cannot format invalid JSON. Please fix the errors first.")
      }
    }
  }

  const handleEditorChange = (code: string) => {
    setJsonText(code)
    setIsSaved(false)
    if (error?.startsWith("Invalid JSON")) {
      setError(null)
    }
  }

  const highlightCode = (code: string) => (
    <Highlight theme={isDarkMode ? themes.vsDark : themes.github} code={code} language="json">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{ ...style, margin: 0, padding: 0, background: "transparent" }}
          className={className}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )

  // --- Define static labels and button text (no mode check) ---
  const dialogTitle = "Edit Plan JSON"
  const dialogDescription =
    "Make changes to the plan's JSON data. Click Update Plan to apply your changes."
  const saveButtonText = "Update Plan" // Always use this text

  // --- Simplified disable states (no mode check) ---
  const disableSave = isSubmitting || !jsonText || !!error
  const disableFormat = isSubmitting || !jsonText || !!error?.startsWith("Invalid JSON")

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-dialog-lg max-h-[90vh] dialog-content-base flex flex-col">
          {/* DialogHeader */}
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                {/* Use static title/description */}
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Editor Area Container */}
          <div className="flex-grow mt-4 border rounded-md bg-background overflow-auto">
            <Editor
              value={jsonText}
              onValueChange={handleEditorChange}
              highlight={highlightCode}
              padding={12}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "400px",
                outline: "none",
              }}
              disabled={isSubmitting}
              className="w-full focus-visible:outline-none"
              textareaClassName="outline-none focus:outline-none caret-black dark:caret-white block"
            />
          </div>

          {/* Error / Success Feedback Area */}
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
                      disabled={!jsonText && !error}
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
                    {/* Simplified success message */}
                    <AlertDescription>Plan updated successfully!</AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>

          {/* Dialog Footer (Original Simple Layout) */}
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
                      disabled={disableFormat}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Code className="h-4 w-4" />
                      <span>Format</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleCopy()
                      }}
                      disabled={!jsonText || isSubmitting}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy JSON</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Desktop Buttons */}
              <Button
                onClick={formatJson}
                variant="outline"
                className="hidden sm:flex items-center gap-2"
                disabled={disableFormat}
              >
                <Code className="h-4 w-4" /> Format
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="hidden sm:flex items-center gap-2"
                disabled={!jsonText || isSubmitting}
              >
                <Copy className="h-4 w-4" /> Copy JSON
              </Button>
            </div>

            {/* Right Group (Save/Cancel) */}
            <div className="flex gap-2 justify-end items-center">
              {/* Always show Cancel button */}
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              {/* --- Always show Update Plan button (no mode check) --- */}
              <Button onClick={handleSave} disabled={disableSave}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  // --- Use static button text ---
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
