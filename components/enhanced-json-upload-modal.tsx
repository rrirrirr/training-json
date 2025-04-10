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
import { AlertCircle, Upload, Sparkles, FilePlus, FileText, ExternalLink, ArrowLeft, Bot } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import CopyNotification from "@/components/copy-notification"
import CopyForAINotification from "@/components/copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
import Link from "next/link"

interface EnhancedJsonUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: TrainingPlanData) => void
}

export default function EnhancedJsonUploadModal({ 
  isOpen, 
  onClose, 
  onImport 
}: EnhancedJsonUploadModalProps) {
  const [jsonText, setJsonText] = useState("")
  const [activeTab, setActiveTab] = useState("paste")
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  
  // Separate notification states for regular copy and AI copy
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [showAICopyNotification, setShowAICopyNotification] = useState(false)
  const [copySuccess, setCopySuccess] = useState(true)
  
  // Access the AI info modal
  const aiInfoModalStore = useAiInfoModal()

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
      
      // Check for metadata and plan name
      if (!data.metadata) {
        throw new Error("JSON must contain a 'metadata' object with at least a 'planName' property")
      }
      
      if (!data.metadata.planName || typeof data.metadata.planName !== 'string' || data.metadata.planName.trim() === '') {
        throw new Error("The 'metadata' object must include a non-empty 'planName' property")
      }

      // Continue with other validations...
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
  
  const handleOpenAiGuide = () => {
    onClose() // Close the current modal
    aiInfoModalStore.open() // Open the AI guide modal
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Training Plan</DialogTitle>
            <DialogDescription>
              Upload a JSON file or paste JSON data to import your training plan. The JSON must include 
              metadata with a plan name.
            </DialogDescription>
          </DialogHeader>

          {/* AI Generation Link - Enhanced with a clearer button */}
          <div className="bg-primary/10 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">Coming from an AI assistant?</span>
                  <span className="text-xs text-muted-foreground">Switch to the AI guide to get started</span>
                </div>
              </div>
              <Button 
                onClick={handleOpenAiGuide}
                className="flex items-center gap-1"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                AI Guide
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste JSON</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="mt-4">
              <Textarea
                placeholder="Paste your JSON data here... Include metadata with planName."
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
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex justify-between items-start">
                <div>{error}</div>
                {activeTab === "paste" && jsonText.trim() && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1 ml-4 mt-1"
                    onClick={handleCopyForAI}
                  >
                    <Bot className="h-3 w-3" />
                    Copy for AI
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 flex flex-col space-y-3">
            <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Need more information?</h3>
                <p className="text-xs text-muted-foreground">View our documentation for JSON format details</p>
              </div>
              <Link href="/documentation" passHref>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Documentation <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Created JSON with AI?</h3>
                <p className="text-xs text-muted-foreground">Already have JSON from an AI assistant?</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("paste")}
                className="flex items-center gap-1"
              >
                <FilePlus className="h-4 w-4" />
                Paste JSON
              </Button>
            </div>
            
            {error && jsonText.trim() && (
              <div className="bg-destructive/10 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-destructive">Having troubles with JSON?</h3>
                  <p className="text-xs text-destructive/80">Copy your JSON with error details for AI assistance</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyForAI}
                  className="flex items-center gap-1 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Bot className="h-4 w-4" />
                  Copy for AI Help
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-2" />
          
          {/* Note about required metadata */}
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> The training plan JSON must include a metadata object with planName.
            </p>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "metadata": {
    "planName": "My Training Plan",
    "creationDate": "2025-04-09"
  },
  "exerciseDefinitions": [...],
  "weeks": [...],
  "monthBlocks": [...]
}`}
            </pre>
          </div>

          <DialogFooter className="mt-4 space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Link href="/documentation" passHref>
              <Button variant="secondary" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Documentation <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
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