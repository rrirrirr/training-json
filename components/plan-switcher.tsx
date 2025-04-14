"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Check, Plus, FileText, Trash2 } from "lucide-react"
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
// Import Tooltip components
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePlanStore, type PlanMetadata } from "@/store/plan-store"
import { useEffect, useState } from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"
import JsonEditor from "./json-editor"
import { cn } from "@/lib/utils"

export function PlanSwitcher() {
  const router = useRouter()
  const { open: openNewPlanModal } = useNewPlanModal()

  // Get data and actions from Zustand store
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const activePlan = usePlanStore((state) => state.activePlan)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  // State for dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  // Fetch metadata on mount if not already loaded
  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])

  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    if (planId === activePlanId) return
    router.push(`/plan/${planId}`)
  }

  // Handle view JSON click
  const handleViewJsonClick = (plan: PlanMetadata, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prepare plan data for editor
    const planData =
      activePlanId === plan.id
        ? {
            id: plan.id,
            name: plan.name,
            data: activePlan,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
          }
        : plan

    setPlanToViewJson(planData)
    setIsJsonEditorOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (plan: PlanMetadata, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await removeLocalPlan(planToDelete.id)

      // If we just deleted the active plan, redirect to home
      if (activePlanId === planToDelete.id) {
        router.push("/")
      }
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return "Unknown date"
    }
  }

  // Find current plan name
  const currentPlan = planMetadataList.find((p) => p.id === activePlanId)
  const currentPlanName = currentPlan?.name || "Select Plan"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-[180px] justify-between">
            <span className="truncate">{currentPlanName}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[240px]">
          {planMetadataList.length > 0 ? (
            <>
              {planMetadataList.map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  // Prevent default item action when clicking buttons inside
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => handleSelectPlan(plan.id)}
                  className="flex flex-col items-start p-0 focus:bg-accent data-[highlighted]:bg-accent" // Adjust focus/highlight styles
                >
                  <div className="flex w-full items-center p-2 hover:bg-accent/50 rounded-sm group/item relative overflow-hidden">
                    <div className="mr-2 flex h-5 w-5 items-center justify-center">
                      {plan.id === activePlanId && <Check className="h-4 w-4 text-primary" />}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                      <span className="text-sm font-medium truncate">{plan.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Updated: {formatDate(plan.updatedAt)}
                      </span>
                    </div>

                    {/* Wrap buttons in TooltipProvider */}
                    <TooltipProvider delayDuration={100}>
                      <div className="flex items-center">
                        {/* View/Edit JSON Button with Tooltip */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary -translate-x-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0" // Added focus visible style reset
                              onClick={(e) => handleViewJsonClick(plan, e)}
                              aria-label={`View/Edit JSON for ${plan.name}`}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View/Edit JSON</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>View/Edit JSON</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Delete Button with Tooltip */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive -translate-x-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 delay-75 focus-visible:ring-0 focus-visible:ring-offset-0" // Added focus visible style reset
                              onClick={(e) => handleDeleteClick(plan, e)}
                              aria-label={`Delete ${plan.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete Plan</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Delete Plan</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No plans available</div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => openNewPlanModal()}
            className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 hover:bg-primary/10 hover:text-primary focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary" // Adjust focus/highlight styles
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Create New Plan</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false)
            setPlanToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete JSON Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setPlanToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
