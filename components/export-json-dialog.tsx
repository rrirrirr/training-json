"use client"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { SavedTrainingPlan } from "@/contexts/training-plan-context"
import CopyNotification from "./copy-notification"
import { Copy, Download, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExportJsonDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportJsonDialog({ isOpen, onClose }: ExportJsonDialogProps) {
  const { currentPlan } = useTrainingPlans()
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [activeTab, setActiveTab] = useState("standard")
  const [copySuccess, setCopySuccess] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Format JSON data for display and export
  const getFormattedJson = (plan: SavedTrainingPlan | null, formatted = true) => {
    if (!plan) return ""
    return JSON.stringify(plan.data, null, formatted ? 2 : 0)
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!currentPlan) return
    
    const jsonData = getFormattedJson(currentPlan, activeTab === "standard")
    
    navigator.clipboard.writeText(jsonData).then(
      () => {
        setShowCopyNotification(true)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      },
      (err) => {
        console.error("Failed to copy: ", err)
      }
    )
  }

  // Handle download JSON file
  const handleDownload = () => {
    if (!currentPlan) return
    
    const jsonData = getFormattedJson(currentPlan, activeTab === "standard")
    const fileName = `${currentPlan.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 2000)
  }

  const formattedJson = getFormattedJson(currentPlan)
  const minifiedJson = getFormattedJson(currentPlan, false)
  const displayJson = activeTab === "standard" ? formattedJson : minifiedJson
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Export Training Plan JSON</DialogTitle>
            <DialogDescription>
              {currentPlan ? 
                `Export "${currentPlan.name}" training plan as JSON. You can copy to clipboard or download as a file.` : 
                "No training plan selected to export."}
            </DialogDescription>
          </DialogHeader>
          
          {currentPlan ? (
            <>
              <Tabs 
                defaultValue="standard" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="standard">Formatted JSON</TabsTrigger>
                  <TabsTrigger value="minified">Minified JSON</TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard" className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Pretty-printed JSON with indentation for better readability.
                  </div>
                </TabsContent>
                
                <TabsContent value="minified" className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Minified JSON for smaller file size.
                  </div>
                </TabsContent>
              </Tabs>

              <ScrollArea className="border rounded-md h-[300px] p-4 mt-2">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {displayJson}
                </pre>
              </ScrollArea>

              <DialogFooter className="gap-2 mt-4 sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  {activeTab === "standard" ? 
                    `${formattedJson.length.toLocaleString()} characters` : 
                    `${minifiedJson.length.toLocaleString()} characters (~${Math.round((minifiedJson.length / formattedJson.length) * 100)}% of formatted)`}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy to Clipboard
                  </Button>
                  <Button 
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    {downloadSuccess ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    Download JSON
                  </Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No training plan selected to export. Please select a plan first.
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <CopyNotification 
        show={showCopyNotification} 
        onHide={() => setShowCopyNotification(false)} 
      />
    </>
  )
}
