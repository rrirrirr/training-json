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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SavedTrainingPlan, useTrainingPlans } from "@/contexts/training-plan-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, Copy, Info } from "lucide-react"
import CopyNotification from "@/components/copy-notification"

interface JsonEditorProps {
  isOpen: boolean
  onClose: () => void
  plan: SavedTrainingPlan | null
}

export default function JsonEditor({ isOpen, onClose, plan }: JsonEditorProps) {
  const { updatePlan } = useTrainingPlans()
  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

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
    }
  }, [isOpen])

  const handleSave = () => {
    if (!plan) return

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
      let newPlanName = plan.name; // Default to current name
      if (parsedData.metadata && parsedData.metadata.planName) {
        newPlanName = parsedData.metadata.planName;
      } else {
        // If no metadata exists, create it with the current plan name
        if (!parsedData.metadata) {
          parsedData.metadata = {
            planName: plan.name,
            creationDate: new Date().toISOString().split('T')[0]
          };
        } else if (!parsedData.metadata.planName) {
          parsedData.metadata.planName = plan.name;
        }
      }

      // Update plan with validated data - also update plan name if changed
      updatePlan(plan.id, { 
        data: parsedData,
        name: newPlanName // Now we update the name directly from metadata
      });
      
      setIsSaved(true)
      setError(null)

      // Close dialog after a brief delay to show success state
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(
      () => {
        setShowCopyNotification(true)
      },
      (err) => {
        console.error("Failed to copy: ", err)
        setError("Failed to copy text to clipboard")
      }
    )
  }

  return (
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
          <Button 
            onClick={handleCopy} 
            variant="outline" 
            className="ml-auto mt-2 sm:mt-0 flex items-center gap-2"
            disabled={!jsonText}
          >
            <Copy className="h-4 w-4" />
            Copy JSON
          </Button>
        </DialogHeader>

        {/* Add metadata tip */}
        <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Renaming Plans</AlertTitle>
          <AlertDescription>
            To rename this plan, edit the <code className="bg-blue-100 px-1 rounded">metadata.planName</code> field.
            The metadata section should look like: <code className="bg-blue-100 px-1 rounded">"metadata": {"{"} "planName": "My Plan Name" {"}"}</code>
          </AlertDescription>
        </Alert>

        <ScrollArea className="flex-1 min-h-[400px] max-h-[60vh] mt-4">
          <Textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value)
              setError(null)
              setIsSaved(false)
            }}
            className="min-h-[400px] font-mono text-sm resize-none"
            placeholder="Loading plan data..."
          />
        </ScrollArea>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSaved && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
            <Save className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Changes saved successfully!</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!plan}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
      <CopyNotification 
        show={showCopyNotification} 
        onHide={() => setShowCopyNotification(false)} 
      />
    </Dialog>
  )
}