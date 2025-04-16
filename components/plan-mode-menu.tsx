"use client"

import { useState } from "react"
import { usePlanMode } from "@/contexts/plan-mode-context" // Assuming context path is correct
import { Button } from "@/components/ui/button" // Assuming Shadcn Button path
import { Save, ArrowLeft, Edit, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Assuming Shadcn AlertDialog path
import JsonEditor from "@/components/json-editor" // Updated import path

export function PlanModeMenu() {
  const { mode, draftPlan, originalPlanId, exitMode, saveDraftPlan, saveViewedPlanToMyPlans } =
    usePlanMode()

  const [isSaving, setIsSaving] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)

  // Only show menu in edit or view mode
  if (mode === "normal") return null

  const planName = draftPlan?.metadata?.planName || "Unnamed Plan"

  const handleSave = async () => {
    setIsSaving(true)
    if (mode === "edit") {
      await saveDraftPlan()
    } else if (mode === "view") {
      await saveViewedPlanToMyPlans()
    }
    setIsSaving(false)
  }

  const handleBackClick = () => {
    if (mode === "edit") {
      setShowExitConfirm(true)
    } else {
      exitMode()
    }
  }

  const confirmDiscardChanges = () => {
    setShowExitConfirm(false)
    exitMode()
  }

  const handleOpenJsonEditor = () => {
    if (draftPlan) {
      setIsJsonEditorOpen(true)
    }
  }

  return (
    <>
      {/* Main Header Area */}
      <div className="bg-muted w-full border-b border-border/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
          {/* Increased padding & gap */}
          {/* Back Button (styled more like a link) */}
          <Button
            variant="link" // Changed to link variant
            size="sm"
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground -ml-2 p-1" // Adjusted padding/margin
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {mode === "edit" ? "Cancel Edits" : "Back"}
          </Button>
          {/* Main Content Row (stacks vertically on mobile, row on sm+) */}
          <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Left Section: Status and Plan Name */}
            <div className="flex flex-col gap-1">
              {/* Vertical gap for status/name */}
              <div className="flex items-center text-sm text-muted-foreground font-oswald font-light uppercase tracking-wide">
                {/* Status line */}
                {mode === "edit" ? (
                  <>
                    <Edit className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span className="text-primary">Editing Plan</span>
                  </>
                ) : (
                  <span>Viewing Plan</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl text-foreground line-clamp-1 font-oswald font-light uppercase tracking-wide">
                {/* Plan Name - larger & bolder */}
                {planName}
              </h1>
            </div>
            {/* Right Section: Action Buttons */}
            <div className="flex w-full items-center justify-start gap-2 sm:w-auto">
              {mode === "edit" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenJsonEditor}
                  disabled={!draftPlan}
                  className="w-full sm:w-auto" // Full width on mobile
                >
                  <Edit className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Edit JSON</span>
                  <span className="sm:hidden">JSON</span>
                </Button>
              )}
              <Button
                variant="default" // Primary action style
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto" // Full width on mobile
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {mode === "edit" ? "Save Plan" : "Save to My Plans"}
                    </span>
                    <span className="sm:hidden">Save</span> {/* Shorter text */}
                  </>
                )}
              </Button>
            </div>
            {/* End Right Section */}
          </div>
          {/* End Main Content Row */}
        </div>
        {/* End Max Width Container */}
      </div>
      {/* End Main Header Area */}
      {/* Alert Dialog (no changes needed) */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        {/* ... AlertDialog content remains the same */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              If you exit now, your unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscardChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* JSON Editor Modal */}
      {isJsonEditorOpen && draftPlan && (
        <JsonEditor
          isOpen={isJsonEditorOpen}
          onClose={() => setIsJsonEditorOpen(false)}
          plan={{
            id: originalPlanId || "draft-plan",
            name: draftPlan.metadata?.planName || "Draft Plan",
            data: draftPlan,
          }}
        />
      )}
    </>
  )
}