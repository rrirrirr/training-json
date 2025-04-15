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
import { usePlanStore } from "@/store/plan-store"
import CopyNotification from "./copy-notification"
import { Copy, Download, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExportJsonDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportJsonDialog({ isOpen, onClose }: ExportJsonDialogProps) {
  const activePlan = usePlanStore((state) => state.activePlan)
  // const activePlanId = usePlanStore((state) => state.activePlanId) // Removed if unused in this component
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [activeTab, setActiveTab] = useState("standard")
  const [copySuccess, setCopySuccess] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Format JSON data for display and export
  const getFormattedJson = (plan: typeof activePlan, formatted = true) => {
    if (!plan) return ""
    return JSON.stringify(plan, null, formatted ? 2 : 0)
  }

  const formattedJson = getFormattedJson(activePlan)
  const minifiedJson = getFormattedJson(activePlan, false)
  const displayJson = activeTab === "standard" ? formattedJson : minifiedJson

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!activePlan) return

    // Can directly use displayJson if preferred, as it's already calculated
    // const jsonData = displayJson;
    const jsonData = getFormattedJson(activePlan, activeTab === "standard")

    navigator.clipboard.writeText(jsonData).then(
      () => {
        setShowCopyNotification(true)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      },
      (err) => {
        console.error("Failed to copy: ", err)
        // Optionally: show an error notification
      }
    )
  }

  // Handle download JSON file
  const handleDownload = () => {
    if (!activePlan) return

    // Can directly use displayJson if preferred
    // const jsonData = displayJson;
    const jsonData = getFormattedJson(activePlan, activeTab === "standard")
    const planName = activePlan.metadata?.planName || "training-plan"
    // Ensure consistent date formatting (YYYY-MM-DD)
    const dateString = new Date().toISOString().split("T")[0]
    const fileName = `${planName.replace(/\s+/g, "_")}_${dateString}.json`

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

  const planName = activePlan?.metadata?.planName || "Unknown Plan"

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-dialog-lg dialog-content-base">
          <DialogHeader>
            <DialogTitle>Export Training Plan JSON</DialogTitle>
            <DialogDescription>
              {activePlan
                ? `Export "${planName}" training plan as JSON. You can copy to clipboard or download as a file.`
                : "No training plan selected to export."}
            </DialogDescription>
          </DialogHeader>

          {activePlan ? (
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
                <pre className="text-xs font-mono whitespace-pre-wrap">{displayJson}</pre>
              </ScrollArea>

              <DialogFooter className="gap-2 mt-4 sm:justify-between flex-wrap">
                {" "}
                {/* Added flex-wrap for smaller screens */}
                {/* Corrected: Use a div for character count info */}
                <div className="text-sm text-muted-foreground order-last sm:order-first mt-2 sm:mt-0">
                  {" "}
                  {/* Adjusted order & margin */}
                  {activeTab === "standard"
                    ? `${formattedJson.length.toLocaleString()} characters`
                    : formattedJson.length > 0 // Avoid division by zero if formattedJson is empty
                      ? `${minifiedJson.length.toLocaleString()} characters (~${Math.round((minifiedJson.length / formattedJson.length) * 100)}% of formatted)`
                      : `${minifiedJson.length.toLocaleString()} characters`}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2"
                    disabled={!activePlan} // Disable if no plan
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="gap-2"
                    disabled={!activePlan} // Disable if no plan
                  >
                    {downloadSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download
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

      <CopyNotification show={showCopyNotification} onHide={() => setShowCopyNotification(false)} />
    </>
  )
}
