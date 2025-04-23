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
import { cn } from "@/lib/utils"

export function PlanModeMenu() {
  const { mode, draftPlan, originalPlanId, exitMode, saveDraftPlan, saveViewedPlanToMyPlans } =
    usePlanMode()

  const [isSaving, setIsSaving] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)

  const planName = draftPlan?.metadata?.planName || "Unnamed Plan"

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let planId;
      
      if (mode === "edit") {
        planId = await saveDraftPlan();
        if (planId) {
          console.log("[PlanModeMenu] Plan saved successfully with ID:", planId);
        } else {
          console.error("[PlanModeMenu] Failed to save plan");
          setIsSaving(false); // Reset only if save failed
        }
      } else if (mode === "view") {
        planId = await saveViewedPlanToMyPlans();
        if (planId) {
          console.log("[PlanModeMenu] Viewed plan saved to my plans with ID:", planId);
        } else {
          console.error("[PlanModeMenu] Failed to save viewed plan");
          setIsSaving(false); // Reset only if save failed
        }
      }
      // Don't reset isSaving on success - the component will unmount with navigation
    } catch (error) {
      console.error("Error saving plan:", error)
      setIsSaving(false) // Only reset on error
    }
  }

  const handleBackClick = () => {
    if (mode === "edit") {
      setShowExitConfirm(true)
    } else {
      exitMode()
    }
  }

  const confirmDiscardChanges = () => {
    // Call exitMode directly and close the dialog
    exitMode()
    // Close the dialog after exitMode completes
    setTimeout(() => {
      setShowExitConfirm(false)
    }, 50)
  }

  const handleOpenJsonEditor = () => {
    if (draftPlan) {
      setIsJsonEditorOpen(true)
    }
  }

  // Only render the menu in edit or view mode
  if (mode === "normal") {
    return null
  }

  return (
    <>
      {/* Main Header Area */}
      <div
        id="plan-mode-menu-anchor"
        className={cn(
          "w-full border-b",
          mode === "edit"
            ? "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)]"
            : "bg-[var(--view-mode-bg)] border-[var(--view-mode-border)]"
        )}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
          {/* Increased padding & gap */}
          {/* Back Button (styled more like a link) */}
          <Button
            variant="link" // Changed to link variant
            size="sm"
            onClick={handleBackClick}
            className={cn(
              "-ml-2 p-1",
              mode === "edit"
                ? "text-[var(--edit-mode-text)] hover:text-[var(--edit-mode-hover-text)]"
                : "text-[var(--view-mode-text)] hover:text-[var(--view-mode-hover-text)]"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {mode === "edit" ? "Cancel Edits" : "Back"}
          </Button>
          {/* Main Content Row (stacks vertically on mobile, row on sm+) */}
          <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Left Section: Status and Plan Name */}
            <div className="flex flex-col gap-1">
              {/* Vertical gap for status/name */}
              <div
                className={cn(
                  "flex items-center text-sm font-oswald font-light uppercase tracking-wide",
                  mode === "edit" ? "text-[var(--edit-mode-text)]" : "text-[var(--view-mode-text)]"
                )}
              >
                {/* Status line */}
                {mode === "edit" ? (
                  <>
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    <span>Editing Plan</span>
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
                  className={cn(
                    "w-full sm:w-auto",
                    "border-[var(--edit-mode-border)] text-[var(--edit-mode-text)]",
                    "hover:bg-[var(--edit-mode-hover-bg)] hover:text-[var(--edit-mode-hover-text)]"
                  )}
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
                className={cn(
                  "w-full sm:w-auto", // Full width on mobile
                  mode === "edit"
                    ? "bg-[var(--edit-mode-text)] text-white hover:bg-[var(--edit-mode-hover-text)]"
                    : "bg-[var(--view-mode-text)] text-white hover:bg-[var(--view-mode-hover-text)]"
                )}
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
      {/* Alert Dialog with mode-specific styling */}
      <AlertDialog
        open={showExitConfirm}
        onOpenChange={(open) => {
          // Only update the dialog state
          setShowExitConfirm(open)
        }}
      >
        <AlertDialogContent className={mode === "edit" ? "border-[var(--edit-mode-border)]" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className={mode === "edit" ? "text-[var(--edit-mode-text)]" : ""}>
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              If you exit now, your unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                mode === "edit"
                  ? "border-[var(--edit-mode-border)] text-[var(--edit-mode-text)]"
                  : ""
              }
            >
              Cancel
            </AlertDialogCancel>
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