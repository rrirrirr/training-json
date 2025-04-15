"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import {
  AlertCircle,
  Upload,
  Sparkles,
  FilePlus,
  FileText,
  ExternalLink,
  ArrowLeft,
  Bot,
  Loader2,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import CopyNotification from "@/components/copy-notification"
import CopyForAINotification from "@/components/copy-for-ai-notification"
import { copyJsonErrorForAI } from "@/utils/copy-for-ai"
import Link from "next/link"
import { usePlanStore } from "@/store/plan-store"

interface EnhancedJsonUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImport?: (data: TrainingPlanData) => void // Made optional as we'll handle import directly
}

export default function EnhancedJsonUploadModal({
  isOpen,
  onClose,
  onImport,
}: EnhancedJsonUploadModalProps) {
  const router = useRouter()
  const [jsonText, setJsonText] = useState("")
  const [activeTab, setActiveTab] = useState("paste")
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the createPlan function from the Zustand store
  const createPlan = usePlanStore((state) => state.createPlan)

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

  const validateAndImport = useCallback(
    async (jsonData: string) => {
      try {
        setIsSubmitting(true)
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
          throw new Error(
            "JSON must contain a 'metadata' object with at least a 'planName' property"
          )
        }

        if (
          !data.metadata.planName ||
          typeof data.metadata.planName !== "string" ||
          data.metadata.planName.trim() === ""
        ) {
          throw new Error("The 'metadata' object must include a non-empty 'planName' property")
        }

        // Get the plan name from metadata
        const planName = data.metadata.planName.trim()

        // If there's an onImport callback, call it with the data and let the parent handle plan creation
        if (typeof onImport === "function") {
          // Reset form state
          setJsonText("")
          setFile(null)
          setError(null)

          // Close the modal
          onClose()

          // Call the onImport callback with the validated data
          // The parent component will decide what to do with it
          onImport(data)
        } else {
          // No onImport callback, so create the plan directly
          const newPlanId = await createPlan(planName, data)

          if (newPlanId) {
            // Reset form state
            setJsonText("")
            setFile(null)
            setError(null)

            // Close the modal
            onClose()

            // Redirect to the new plan page
            router.push(`/plan/${newPlanId}`)
          } else {
            throw new Error("Failed to create plan. Please try again.")
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON format")
      } finally {
        setIsSubmitting(false)
      }
    },
    [createPlan, onImport, onClose, router]
  )

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
    copyJsonErrorForAI(jsonText, error, (success) => {
      setShowAICopyNotification(true)
      setCopySuccess(success)
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Import Training Plan</DialogTitle>
            <DialogDescription>
              Upload a JSON file or paste JSON data to import your training plan. The JSON must
              include metadata with a plan name.
            </DialogDescription>
          </DialogHeader>

          {/* AI Generation Link - Enhanced with a clearer button */}
          {/* AI Generation section removed from here - will be moved after JSON editor */}

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
                disabled={isSubmitting}
              />
              <Button
                onClick={handleImportFromText}
                className="mt-4"
                disabled={isSubmitting || !jsonText.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Plan...
                  </>
                ) : (
                  "Import from Text"
                )}
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
                  disabled={isSubmitting}
                />
                {file && (
                  <p className="mt-2 text-sm font-medium text-green-600">Selected: {file.name}</p>
                )}
              </div>
              <Button
                onClick={handleImportFromFile}
                className="mt-4"
                disabled={isSubmitting || !file}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Plan...
                  </>
                ) : (
                  "Import from File"
                )}
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
                    disabled={isSubmitting}
                  >
                    <Bot className="h-3 w-3" />
                    Copy for AI
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* AI Creation Section - Added below JSON editor with updated text */}
          <div className="bg-primary/10 p-4 rounded-lg my-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">Don't have a plan? Create one with AI.</span>
                  <span className="text-xs text-muted-foreground">
                    Our AI assistant can help you build a personalized training plan
                  </span>
                </div>
              </div>
              <Button onClick={handleOpenAiGuide} className="flex items-center gap-1" size="sm">
                <Bot className="h-4 w-4 mr-1" />
                AI Assistant
              </Button>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="mt-4 flex flex-col space-y-3">
            <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">Need more information?</h3>
                <p className="text-xs text-muted-foreground">
                  View our documentation for JSON format details
                </p>
              </div>
              <Link href="/documentation" passHref>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Documentation <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            {error && jsonText.trim() && (
              <div className="bg-destructive/10 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-destructive">
                    Having troubles with JSON?
                  </h3>
                  <p className="text-xs text-destructive/80">
                    Copy your JSON with error details for AI assistance
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyForAI}
                  className="flex items-center gap-1 border-destructive text-destructive hover:bg-destructive/10"
                  disabled={isSubmitting}
                >
                  <Bot className="h-4 w-4" />
                  Copy for AI Help
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Link href="/documentation" passHref>
              <Button
                variant="secondary"
                className="flex items-center gap-1"
                disabled={isSubmitting}
              >
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
