"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronDown,
  Check,
  Plus,
  FileText,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePlanStore, type PlanMetadata } from "@/store/plan-store"
import { useEffect, useState } from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"
import JsonEditor from "./json-editor"
import { cn } from "@/lib/utils"
import { usePlanMode } from "@/contexts/plan-mode-context"

// Reusable component to render the content of a plan item using the "..." menu
const PlanItemContent = ({
  plan,
  isActive,
  onViewJson,
  onDelete,
  formatDate,
  onLinkClick,
}: {
  plan: PlanMetadata
  isActive: boolean
  onViewJson: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  onDelete: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  formatDate: (dateString: string | null | undefined) => string
  onLinkClick?: (e: React.MouseEvent, planId: string) => void
}) => {
  // The content inside
  const content = (
    <>
      {/* Checkmark */}
      <div className="mr-2 flex h-5 w-5 items-center justify-center min-w-[20px] self-center">
        {isActive && <Check className="h-4 w-4 text-primary" />}
      </div>
      
      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 mr-2 self-center">
        <span className="text-sm font-medium truncate">{plan.name}</span>
        <span className="text-xs text-muted-foreground">Loaded: {formatDate(plan.updatedAt)}</span>
      </div>
      
      {/* Actions Menu Button ("...") */}
      <div className="ml-auto pl-1 self-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground data-[state=open]:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              aria-label={`Actions for ${plan.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plan Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={(e) => onViewJson(plan, e)}
              className="cursor-pointer flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>View JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => onDelete(plan, e)}
              className="cursor-pointer flex items-center text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Plan</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  // The class names for the wrapper div are the same whether it's inside a link or not
  const wrapperClassName = "flex w-full items-center p-2 group/item relative overflow-hidden min-h-[52px]";

  // If onLinkClick is provided, wrap in a Link with the click handler
  if (onLinkClick) {
    return (
      <Link
        href={`/plan/${plan.id}`}
        onClick={(e) => onLinkClick(e, plan.id)}
        className="block w-full"
      >
        <div className={wrapperClassName}>{content}</div>
      </Link>
    );
  }
  
  // If there's no onLinkClick handler, still use a Link but without a click handler
  return (
    <Link href={`/plan/${plan.id}`} className="block w-full">
      <div className={wrapperClassName}>{content}</div>
    </Link>
  );
};

export function PlanSwitcher() {
  const router = useRouter()
  const { open: openNewPlanModal } = useNewPlanModal()
  const { mode, draftPlan, originalPlanId, exitMode } = usePlanMode()

  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const activePlan = usePlanStore((state) => state.activePlan)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)
  const [isSwitchWarningOpen, setIsSwitchWarningOpen] = useState(false)
  const [planToSwitchTo, setPlanToSwitchTo] = useState<string | null>(null)

  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])

  // This function handles clicks on the plan links 
  const handlePlanLinkClick = (e: React.MouseEvent, planId: string) => {
    if (planId === activePlanId) {
      // If clicking the already active plan, prevent navigation
      e.preventDefault()
      return
    }

    // Only show warning dialog in edit mode
    if (mode === "edit") {
      e.preventDefault() // Prevent the default link navigation
      setPlanToSwitchTo(planId)
      setIsSwitchWarningOpen(true)
      return
    }
    
    // For view mode or normal mode, let the default link navigation happen
    // The page component will handle exiting view mode if needed
  }

  const handleConfirmSwitch = () => {
    if (planToSwitchTo) {
      // Exit edit mode
      exitMode()
      // Navigate to the new plan
      router.push(`/plan/${planToSwitchTo}`)
      // Reset state
      setIsSwitchWarningOpen(false)
      setPlanToSwitchTo(null)
    }
  }

  // Updated handlers now receive the plan directly from PlanItemContent's menu items
  const handleViewJsonClick = (planMeta: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent any default browser action if applicable
    // Stop propagation is handled within PlanItemContent now
    let dataToShow = null
    if (activePlanId === planMeta.id && activePlan) {
      dataToShow = { ...planMeta, data: activePlan }
    } else {
      dataToShow = planMeta
    }
    setPlanToViewJson(dataToShow)
    setIsJsonEditorOpen(true)
  }

  const handleDeleteClick = (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent any default browser action if applicable
    // Stop propagation is handled within PlanItemContent now
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      const deletedPlanId = planToDelete.id
      const deletedPlanName = planToDelete.name
      const wasActive = usePlanStore.getState().activePlanId === deletedPlanId

      // Use the mode and originalPlanId from the component scope
      // (they were already obtained via usePlanMode at the top level)

      // First, capture whether we're in edit/view mode for this plan
      const isEditingOrViewingThisPlan = mode !== "normal" && originalPlanId === deletedPlanId

      // If we're in edit/view mode for this plan, exit the mode
      // This will clear the localStorage and state
      if (isEditingOrViewingThisPlan) {
        console.log("[PlanSwitcher] Exiting plan mode before deleting active plan")
        exitMode()
      }

      // Always explicitly clear PlanModeContext localStorage keys to ensure clean state
      try {
        localStorage.removeItem("planModeDraft_mode")
        localStorage.removeItem("planModeDraft_plan")
        localStorage.removeItem("planModeDraft_originalId")
        localStorage.removeItem("lastViewedPlanId") // Clear this key also to prevent auto-loading
        console.log("[PlanSwitcher] Explicitly cleared PlanModeContext keys from localStorage.")
      } catch (error) {
        console.error("Error clearing PlanModeContext localStorage keys:", error)
      }

      // Now remove the plan from the store
      await removeLocalPlan(deletedPlanId)

      // Close the dialog
      setPlanToDelete(null)
      setIsDeleteDialogOpen(false)

      // Redirect to home if this was the active plan
      if (wasActive) {
        // Force a reload instead of using router.push
        // This ensures all state is completely fresh when we land on the home page
        window.location.href = "/"
      }
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid date"
    }
  }

  // Determine the current plan name based on mode
  let currentPlanName = ""
  let switcherClassName = ""

  if (mode === "edit") {
    // In edit mode, show the draft plan name
    currentPlanName = `Editing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
    switcherClassName =
      "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)] text-[var(--edit-mode-text)]"
  } else if (mode === "view") {
    // In view mode, show the viewed plan name
    currentPlanName = `Viewing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
    switcherClassName =
      "bg-[var(--view-mode-bg)] border-[var(--view-mode-border)] text-[var(--view-mode-text)]"
  } else {
    // In normal mode, show the active plan name
    const currentPlanMeta = planMetadataList.find((p) => p.id === activePlanId)
    currentPlanName = currentPlanMeta?.name || (activePlanId ? `Plan...` : "Select Plan")
  }

  const mobileListItems = planMetadataList.slice(0, 5)
  const desktopListItems = planMetadataList.slice(0, 10)

  return (
    <>
      {/* Mobile View: List */}
      <div
        className={cn(
          "w-full md:hidden border rounded-md p-1",
          mode !== "normal" && switcherClassName
        )}
      >
        <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">Recent Plans</h3>
        {mobileListItems.length > 0 ? (
          <div className="flex flex-col">
            {mobileListItems.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                )}
              >
                <PlanItemContent
                  plan={plan}
                  isActive={plan.id === activePlanId}
                  onViewJson={handleViewJsonClick}
                  onDelete={handleDeleteClick}
                  formatDate={formatDate}
                  onLinkClick={handlePlanLinkClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No recent plans</div>
        )}
        <div className="border-t mt-1 pt-1">
          <Button
            variant="ghost"
            className="w-full justify-start h-9 px-2 py-1.5 text-sm text-primary hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:text-primary"
            onClick={() => openNewPlanModal()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Desktop View: Dropdown */}
      <div className="hidden md:block">
        <TooltipProvider delayDuration={200}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("w-[220px] justify-between", mode !== "normal" && switcherClassName)}
              >
                <span className="truncate">{currentPlanName}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[240px]">
              {desktopListItems.length > 0 ? (
                desktopListItems.map((plan) => (
                  <div
                    key={plan.id}
                    className="cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors focus:bg-accent hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <PlanItemContent
                      plan={plan}
                      isActive={plan.id === activePlanId}
                      onViewJson={handleViewJsonClick}
                      onDelete={handleDeleteClick}
                      formatDate={formatDate}
                      onLinkClick={handlePlanLinkClick}
                    />
                  </div>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No recent plans</div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openNewPlanModal()}
                className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 hover:bg-primary/10 hover:text-primary focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create New Plan</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>

      {/* JSON Editor Dialog */}
      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={() => {
          setIsJsonEditorOpen(false)
          setPlanToViewJson(null)
        }}
        plan={planToViewJson}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{planToDelete?.name}" from your recent plans list?
              This only removes it locally.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Switch Warning Dialog - Only shown in edit mode */}
      <AlertDialog open={isSwitchWarningOpen} onOpenChange={setIsSwitchWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You're currently editing a plan. Switching to another plan will discard all your unsaved changes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsSwitchWarningOpen(false)
                setPlanToSwitchTo(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes & switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}