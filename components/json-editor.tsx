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
import CopyNotification from "./copy-notification"
import CopyForAINotification from "./copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
import { useTheme } from "next-themes"
import { usePlanMode } from "@/contexts/plan-mode-context"

// Import syntax highlighting components
import Editor from "react-simple-code-editor"
import { Highlight, themes } from "prism-react-renderer" // Keep this import for the original function

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

interface DraftJsonEditorProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null | undefined
}

export default function DraftJsonEditor({ isOpen, onClose, plan }: DraftJsonEditorProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const { updateDraftPlan } = usePlanMode()

  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Separate notification states
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(true)

  // --- Effects and Handler functions ---
  // ... (useEffect, handleSave, handleCopy, etc. remain the same) ...
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
      setJsonText('{\n  "error": "No plan data provided or plan is invalid"\n}')
      setError("No plan data provided or plan is invalid")
    }
  }, [plan])

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!plan?.data) {
      setError("Cannot save: Plan information is missing.")
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
      return
    }

    setIsSubmitting(true)
    setIsSaved(false)

    try {
      // Validate the JSON structure
      if (!parsedData.weeks || !Array.isArray(parsedData.weeks)) {
        throw new Error("JSON validation failed: must contain a 'weeks' array")
      }
      if (!parsedData.monthBlocks || !Array.isArray(parsedData.monthBlocks)) {
        throw new Error("JSON validation failed: must contain a 'monthBlocks' array")
      }

      // Ensure the metadata is valid
      if (!parsedData.metadata) {
        parsedData.metadata = {}
      }

      if (
        !parsedData.metadata.planName ||
        typeof parsedData.metadata.planName !== "string" ||
        parsedData.metadata.planName.trim() === ""
      ) {
        // Use the current plan name if available
        parsedData.metadata.planName = plan.name || "Draft Plan"
      }

      if (!parsedData.metadata.creationDate) {
        parsedData.metadata.creationDate = new Date().toISOString()
      }

      // Update the JSON text with any fixes we made
      setJsonText(JSON.stringify(parsedData, null, 2))

      // Update the draft plan in the context
      updateDraftPlan(parsedData)

      // Show success message
      setIsSaved(true)
      setError(null)

      // Close the editor after a short delay
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred during save")
      setIsSubmitting(false)
    } finally {
      // Ensure submitting state is reset even on error
      // Although it's set inside the catch, adding a finally guarantees it
      //setIsSubmitting(false); // Optionally add this if needed
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
      setError(null)
      setIsSaved(false)
    } catch (err) {
      if (!error || error.startsWith("Invalid JSON")) {
        setError("Cannot format invalid JSON. Please fix the errors first.")
      }
    }
  }

  // Original highlighting function (kept for reference or future use)
  const highlightCode = (code: string) => (
    <Highlight theme={isDarkMode ? themes.vsDark : themes.vsLight} code={code} language="json">
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div key={`line-${i}`} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={`token-${i}-${key}`} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  )

  // --- NEW: Simple highlight function that does nothing complex ---
  const noHighlight = (code: string) => <pre style={{ margin: 0 }}>{code}</pre>
  // Using <pre> helps preserve whitespace without needing Prism

  const handleEditorChange = (code: string) => {
    setJsonText(code)
    setIsSaved(false)
    if (error?.startsWith("Invalid JSON")) {
      setError(null)
    }
  }
  // --- End of Effects and Handlers ---

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-dialog-lg dialog-content-base flex flex-col">
          {/* ... DialogHeader ... */}
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <DialogTitle>Edit Draft Plan JSON</DialogTitle>
                <DialogDescription>
                  Make changes to the draft plan's JSON data. Click Save to update the plan you're
                  editing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Editor Area */}
          <div className="flex-grow mt-4 overflow-auto border rounded-md bg-background">
            <Editor
              value={jsonText}
              onValueChange={handleEditorChange}
              highlight={noHighlight} // <--- USE THE NEW noHighlight function
              padding={12}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "300px",
                outline: "none",
              }}
              disabled={isSubmitting}
              className="w-full focus-visible:outline-none"
              textareaClassName="outline-none focus:outline-none"
            />
          </div>

          {/* ... Error / Success Feedback Area ... */}
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
                      disabled={isSubmitting}
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
                    <AlertDescription>
                      Changes saved! Your draft plan has been updated.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>

          {/* ... Dialog Footer ... */}
          <DialogFooter className="dialog-footer-between flex-shrink-0 flex flex-row items-center gap-2">
            {/* Left Group */}
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
                      disabled={!jsonText || isSubmitting || !!error}
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
                disabled={!jsonText || isSubmitting || !!error}
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
            {/* Right Group */}
            <div className="flex gap-2 justify-end items-center">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting || !jsonText || !!error}>
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
                  "Update Draft Plan"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ... Notifications ... */}
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
