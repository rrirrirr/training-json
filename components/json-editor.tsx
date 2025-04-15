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
import { usePlanStore } from "@/store/plan-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, Copy, Info, Bot, Code } from "lucide-react"
import CopyNotification from "@/components/copy-notification"
import CopyForAINotification from "@/components/copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

// Import syntax highlighting components
import Editor from 'react-simple-code-editor';
import { Highlight, themes } from 'prism-react-renderer';

interface JsonEditorProps {
  isOpen: boolean
  onClose: () => void
  plan: any // We'll accept any plan object that has id and data properties
}

export default function JsonEditor({ isOpen, onClose, plan }: JsonEditorProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const createPlanFromEdit = usePlanStore((state) => state.createPlanFromEdit)
  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Separate notification states for regular copy and AI copy
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(true)

  // Initialize text area content when plan changes
  useEffect(() => {
    if (plan) {
      try {
        const formattedJson = JSON.stringify(plan.data, null, 2)
        setJsonText(formattedJson)
        setError(null)
      } catch (err) {
        setError("Failed to parse plan data")
        setJsonText("")
      }
    }
  }, [plan])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaved(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!plan || !plan.id) return

    setIsSubmitting(true)
    try {
      const parsedData = JSON.parse(jsonText)

      // Basic validation - ensure required properties exist
      if (!parsedData.weeks || !Array.isArray(parsedData.weeks)) {
        throw new Error("JSON must contain a 'weeks' array")
      }

      if (!parsedData.monthBlocks || !Array.isArray(parsedData.monthBlocks)) {
        throw new Error("JSON must contain a 'monthBlocks' array")
      }
      
      // Now, also check metadata and extract the plan name
      let newPlanName;
      if (parsedData.metadata && parsedData.metadata.planName) {
        newPlanName = parsedData.metadata.planName;
      } else {
        // If no metadata exists, create it with the current plan name
        const currentName = plan.name || plan.metadata?.planName || "Edited Plan"
        if (!parsedData.metadata) {
          parsedData.metadata = {
            planName: `${currentName} (Edited)`,
            creationDate: new Date().toISOString().split('T')[0]
          };
        } else if (!parsedData.metadata.planName) {
          parsedData.metadata.planName = `${currentName} (Edited)`;
        }
        newPlanName = parsedData.metadata.planName;
      }

      // Create a new plan from the edited data
      const newPlanId = await createPlanFromEdit(plan.id, parsedData, newPlanName);
      
      if (newPlanId) {
        setIsSaved(true)
        setError(null)

        // Close dialog after a brief delay to show success state
        setTimeout(() => {
          onClose()
          // Redirect to the new plan
          router.push(`/plan/${newPlanId}`)
        }, 1500)
      } else {
        throw new Error("Failed to create new plan from edit")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(
      () => {
        setShowCopyNotification(true)
        setCopySuccess(true)
      },
      (err) => {
        console.error("Failed to copy: ", err)
        setError("Failed to copy text to clipboard")
        setCopySuccess(false)
      }
    )
  }
  
  const handleCopyForAI = () => {
    copyJsonErrorForAI(
      jsonText, 
      error,
      (success) => {
        setShowAICopyNotification(true)
        setCopySuccess(success)
      }
    )
  }

  // New function to format JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
    } catch (err) {
      setError("Cannot format invalid JSON");
    }
  };

  // The highlight function for the editor
  const highlightCode = (code: string) => (
    <Highlight
      theme={isDarkMode ? themes.vsDark : themes.vsLight}
      code={code}
      language="json"
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-row justify-between items-center sm:flex-col sm:items-start">
            <div>
              <DialogTitle>Edit JSON Plan</DialogTitle>
              <DialogDescription>
                Make changes to the raw JSON data of your plan. To rename your plan, 
                edit the "planName" field inside the "metadata" object.
              </DialogDescription>
            </div>
            <div className="ml-auto mt-2 sm:mt-0 flex gap-2">
              <Button 
                onClick={formatJson} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!jsonText || isSubmitting}
              >
                <Code className="h-4 w-4" />
                Format
              </Button>
              <Button 
                onClick={handleCopy} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!jsonText || isSubmitting}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              {error && (
                <Button 
                  onClick={handleCopyForAI} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={!jsonText || isSubmitting}
                >
                  <Bot className="h-4 w-4" />
                  Copy for AI Help
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Add metadata tip */}
          <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>Renaming Plans</AlertTitle>
            <AlertDescription>
              To rename this plan, edit the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">metadata.planName</code> field.
              The metadata section should look like: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">"metadata": {"{"} "planName": "My Plan Name" {"}"}</code>
            </AlertDescription>
          </Alert>

          <ScrollArea className="flex-1 min-h-[400px] max-h-[60vh] mt-4 border rounded-md">
            {/* Replace the Textarea with the code editor */}
            <Editor
              value={jsonText}
              onValueChange={(code) => {
                setJsonText(code);
                setError(null);
                setIsSaved(false);
              }}
              highlight={highlightCode}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: "400px",
              }}
              disabled={isSubmitting}
              className="w-full"
            />
          </ScrollArea>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex justify-between items-start">
                <div>{error}</div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1 ml-4 mt-1"
                  onClick={handleCopyForAI}
                  disabled={isSubmitting}
                >
                  <Bot className="h-3 w-3" />
                  Copy for AI
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isSaved && (
            <Alert className="mt-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-200">
              <Save className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Changes saved successfully! Creating new plan...</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!plan || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Regular copy notification */}
      <CopyNotification 
        show={showCopyNotification} 
        onHide={() => setShowCopyNotification(false)} 
        success={copySuccess}
      />
      
      {/* AI copy notification */}
      <CopyForAINotification
        show={showAICopyNotification}
        onHide={() => setShowAICopyNotification(false)}
        success={copySuccess}
      />
    </>
  )
}