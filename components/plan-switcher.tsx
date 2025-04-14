// components/plan-switcher.tsx
"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Check, Plus, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button" // Adjust path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Adjust path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog" // Adjust path
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Adjust path
import { usePlanStore, type PlanMetadata } from "@/store/plan-store" // Adjust path
import { useEffect, useState } from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal" // Adjust path
import JsonEditor from "./json-editor" // Adjust path
import { cn } from "@/lib/utils" // Adjust path

export function PlanSwitcher() {
  const router = useRouter()
  const { open: openNewPlanModal } = useNewPlanModal()

  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList) // Get the ordered OLD->NEW, limited list
  const activePlan = usePlanStore((state) => state.activePlan) // Needed for JSON view of active plan
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  // Fetch metadata only if the list is empty on initial mount
  useEffect(() => {
    if (planMetadataList.length === 0) {
      console.log("[PlanSwitcher] Initial metadata list empty, fetching.")
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])

  const handleSelectPlan = (planId: string) => {
    if (planId === activePlanId) return
    router.push(`/plan/${planId}`)
  }

  // Prepare data for JSON editor (includes full plan if active)
  const handleViewJsonClick = (planMeta: PlanMetadata, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    let dataToShow = null
    if (activePlanId === planMeta.id && activePlan) {
      dataToShow = { ...planMeta, data: activePlan } // Combine metadata and full plan data
    } else {
      dataToShow = planMeta // Show only metadata if not active
    }
    setPlanToViewJson(dataToShow)
    setIsJsonEditorOpen(true)
  }

  const handleDeleteClick = (plan: PlanMetadata, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      const deletedPlanId = planToDelete.id
      const wasActive = usePlanStore.getState().activePlanId === deletedPlanId
      await removeLocalPlan(deletedPlanId) // Remove from store list
      setPlanToDelete(null)
      setIsDeleteDialogOpen(false)
      // Redirect to root only if the active plan was deleted
      if (wasActive) {
        router.push("/")
      }
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      // Use more informative format including time maybe?
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        // hour: '2-digit', minute: '2-digit' // Optional: include time
      })
    } catch {
      return "Invalid date"
    }
  }

  // Find current plan name for the button label
  const currentPlanMeta = planMetadataList.find((p) => p.id === activePlanId)
  // If active plan isn't in the recent list, show ID or generic name
  const currentPlanName = currentPlanMeta?.name || (activePlanId ? `Plan...` : "Select Plan")

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
          {/* Render items directly from planMetadataList. Order is OLD->NEW. */}
          {/* Most recent will appear last in the list visually. */}
          {planMetadataList.length > 0 ? (
            planMetadataList.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                // Removed onSelect prevent default as click handles nav
                className="flex flex-col items-start p-0 focus:bg-accent data-[highlighted]:bg-accent"
              >
                <div className="flex w-full items-center p-2 hover:bg-accent/50 rounded-sm group/item relative overflow-hidden">
                  {/* Checkmark */}
                  <div className="mr-2 flex h-5 w-5 items-center justify-center min-w-[20px]">
                    {plan.id === activePlanId && <Check className="h-4 w-4 text-primary" />}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0 mr-2">
                    <span className="text-sm font-medium truncate">{plan.name}</span>
                    {/* Use updatedAt for 'Loaded' date */}
                    <span className="text-xs text-muted-foreground">
                      Loaded: {formatDate(plan.updatedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <TooltipProvider delayDuration={100}>
                    <div className="flex items-center ml-auto pl-1">
                      {" "}
                      {/* Use ml-auto to push buttons right */}
                      {/* View JSON Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => handleViewJsonClick(plan, e)}
                            aria-label={`View JSON for ${plan.name}`}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View JSON</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>View JSON</p>
                        </TooltipContent>
                      </Tooltip>
                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 delay-75 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No recent plans</div>
          )}
          <DropdownMenuSeparator />
          {/* Create New Plan */}
          <DropdownMenuItem
            onClick={() => openNewPlanModal()}
            className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 hover:bg-primary/10 hover:text-primary focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
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
        plan={planToViewJson} // Pass combined data if active, else just metadata
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{planToDelete?.name}" from your recent plans list?
              This only removes it locally.
              {/* Clarify if it removes from Supabase or not based on your backend logic */}
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
    </>
  )
}
