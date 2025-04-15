"use client"

import { useState } from "react"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"

export function PlanModeMenu() {
  const { 
    mode, 
    draftPlan, 
    exitMode, 
    saveDraftPlan, 
    saveViewedPlanToMyPlans 
  } = usePlanMode()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
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
      // Show confirmation before exiting edit mode
      setShowExitConfirm(true)
    } else {
      // Just exit view mode directly
      exitMode()
    }
  }
  
  const confirmDiscardChanges = () => {
    setShowExitConfirm(false)
    exitMode()
  }
  
  return (
    <>
      <div className="bg-muted/60 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {mode === "edit" ? "Cancel" : "Back"}
          </Button>
          
          <div className="text-sm font-medium">
            {mode === "edit" ? (
              <span className="text-primary">Editing: {planName}</span>
            ) : (
              <span>Viewing: {planName}</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {mode === "edit" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {/* Additional edit action if needed */}}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "edit" ? "Save Plan" : "Save to My Plans"}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              If you exit now, your plan will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardChanges} className="bg-destructive text-destructive-foreground">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
