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
import { AlertCircle, Save } from "lucide-react"

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

      // Update plan with validated data
      updatePlan(plan.id, { data: parsedData })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Training Plan JSON</DialogTitle>
          <DialogDescription>
            Make changes to the raw JSON data of your training plan. Be careful, as incorrect
            formatting could break your plan.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-[400px] max-h-[60vh]">
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
    </Dialog>
  )
}
