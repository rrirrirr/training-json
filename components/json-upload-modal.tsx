"use client"

import type React from "react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { TrainingPlanData } from "@/types/training-plan"
import { AlertCircle, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface JsonUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: TrainingPlanData) => void
}

export default function JsonUploadModal({ isOpen, onClose, onImport }: JsonUploadModalProps) {
  const [jsonText, setJsonText] = useState("")
  const [activeTab, setActiveTab] = useState("paste")
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const validateAndImport = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData) as TrainingPlanData

      // Basic validation
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error("JSON must contain a 'weeks' array")
      }

      if (!data.monthBlocks || !Array.isArray(data.monthBlocks)) {
        throw new Error("JSON must contain a 'monthBlocks' array")
      }

      if (!data.exerciseDefinitions || !Array.isArray(data.exerciseDefinitions)) {
        throw new Error("JSON must contain an 'exerciseDefinitions' array")
      }

      // Check if exercise definitions have required properties
      for (const exercise of data.exerciseDefinitions) {
        if (!exercise.id) {
          throw new Error("Each exercise definition must have an 'id'")
        }
        if (!exercise.name) {
          throw new Error(`Exercise with id ${exercise.id} is missing a name`)
        }
      }

      // Check if weeks have required properties
      for (const week of data.weeks) {
        if (typeof week.weekNumber !== "number") {
          throw new Error(`Week ${week.weekNumber} is missing a valid weekNumber`)
        }
        if (!week.sessions || !Array.isArray(week.sessions)) {
          throw new Error(`Week ${week.weekNumber} is missing a valid sessions array`)
        }

        // Check sessions
        for (const session of week.sessions) {
          if (!session.sessionName) {
            throw new Error(`Week ${week.weekNumber} has a session missing a sessionName`)
          }
          if (!session.sessionType) {
            throw new Error(`Session "${session.sessionName}" in week ${week.weekNumber} is missing a sessionType`)
          }
          if (!session.exercises || !Array.isArray(session.exercises)) {
            throw new Error(`Session "${session.sessionName}" in week ${week.weekNumber} is missing an exercises array`)
          }

          // Check exercises
          for (const exercise of session.exercises) {
            if (exercise.exerciseId === undefined) {
              throw new Error(
                `An exercise in session "${session.sessionName}" (week ${week.weekNumber}) is missing an exerciseId`,
              )
            }

            // Check if the exerciseId exists in the definitions
            const exerciseExists = data.exerciseDefinitions.some((def) => def.id === exercise.exerciseId)
            if (!exerciseExists) {
              throw new Error(
                `Exercise with id "${exercise.exerciseId}" in session "${session.sessionName}" (week ${week.weekNumber}) is not defined in exerciseDefinitions`,
              )
            }
          }
        }
      }

      // Check if all weeks in monthBlocks exist
      const weekNumbers = data.weeks.map((w) => w.weekNumber)
      for (const block of data.monthBlocks) {
        for (const weekNum of block.weeks) {
          if (!weekNumbers.includes(weekNum)) {
            throw new Error(`Week ${weekNum} in monthBlock "${block.name}" does not exist in the weeks array`)
          }
        }
      }

      onImport(data)
      onClose()
      setJsonText("")
      setFile(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  const handleImportFromText = () => {
    if (!jsonText.trim()) {
      setError("Please enter JSON data")
      return
    }
    validateAndImport(jsonText)
  }

  const handleImportFromFile = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    try {
      const text = await file.text()
      validateAndImport(text)
    } catch (err) {
      setError("Failed to read file")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Training Plan</DialogTitle>
          <DialogDescription>Upload a JSON file or paste JSON data to import your training plan.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4">
            <Textarea
              placeholder="Paste your JSON data here..."
              className="min-h-[200px] font-mono text-sm"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value)
                setError(null)
              }}
            />
            <Button onClick={handleImportFromText} className="mt-4">
              Import from Text
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to browse or drag and drop</p>
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                onChange={handleFileChange}
              />
              {file && <p className="mt-2 text-sm font-medium text-green-600">Selected: {file.name}</p>}
            </div>
            <Button onClick={handleImportFromFile} className="mt-4" disabled={!file}>
              Import from File
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

