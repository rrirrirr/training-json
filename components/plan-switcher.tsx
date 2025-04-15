// components/plan-switcher.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Check,
  Plus,
  FileText,
  Trash2,
  MoreHorizontal, // Import the ellipsis icon
} from "lucide-react"
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
// Tooltip components are no longer needed inside PlanItemContent but might still be used elsewhere
import { TooltipProvider } from "@/components/ui/tooltip" // Adjust path
import { usePlanStore, type PlanMetadata } from "@/store/plan-store" // Adjust path
import { useEffect, useState } from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal" // Adjust path
import JsonEditor from "./json-editor" // Adjust path
import { cn } from "@/lib/utils" // Adjust path

// Reusable component to render the content of a plan item using the "..." menu
const PlanItemContent = ({
  plan,
  isActive,
  onViewJson,
  onDelete,
  formatDate,
}: {
  plan: PlanMetadata
  isActive: boolean
  // Explicitly allow MouseEvent or TouchEvent for broader compatibility if needed, though React handles most cases
  onViewJson: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  onDelete: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  formatDate: (dateString: string | null | undefined) => string
}) => (
  <div className="flex w-full items-center p-2 group/item relative overflow-hidden min-h-[52px]">
    {/* Ensure min height */}
    {/* Checkmark */}
    <div className="mr-2 flex h-5 w-5 items-center justify-center min-w-[20px] self-center">
      {/* Align self */}
      {isActive && <Check className="h-4 w-4 text-primary" />}
    </div>
    {/* Info */}
    <div className="flex flex-col flex-1 min-w-0 mr-2 self-center">
      {/* Align self */}
      <span className="text-sm font-medium truncate">{plan.name}</span>
      <span className="text-xs text-muted-foreground">Loaded: {formatDate(plan.updatedAt)}</span>
    </div>
    {/* Actions Menu Button ("...") */}
    <div className="ml-auto pl-1 self-center">
      {" "}
      {/* Align self */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          // Stop propagation: Prevents selecting the plan item when clicking the menu trigger
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()} // Also useful for preventing focus side-effects
        >
          <Button
            variant="ghost"
            size="icon"
            // Slightly larger tap target, visual feedback on open
            className="h-8 w-8 text-muted-foreground data-[state=open]:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            aria-label={`Actions for ${plan.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Plan Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end" // Align menu to the right
          // Stop propagation: Prevents selecting the plan item when clicking inside the menu
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            // Pass the event if needed by the handler, ensure plan is passed
            onClick={(e) => onViewJson(plan, e)}
            className="cursor-pointer flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>View JSON</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            // Pass the event if needed by the handler, ensure plan is passed
            onClick={(e) => onDelete(plan, e)}
            className="cursor-pointer flex items-center text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Plan</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
)

export function PlanSwitcher() {
  const router = useRouter()
  const { open: openNewPlanModal } = useNewPlanModal()

  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const activePlan = usePlanStore((state) => state.activePlan)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])

  const handleSelectPlan = (planId: string) => {
    if (planId === activePlanId) return
    router.push(`/plan/${planId}`)
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
      const wasActive = usePlanStore.getState().activePlanId === deletedPlanId
      await removeLocalPlan(deletedPlanId)
      setPlanToDelete(null)
      setIsDeleteDialogOpen(false)
      if (wasActive) {
        router.push("/")
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

  const currentPlanMeta = planMetadataList.find((p) => p.id === activePlanId)
  const currentPlanName = currentPlanMeta?.name || (activePlanId ? `Plan...` : "Select Plan")

  const mobileListItems = planMetadataList.slice(0, 5)
  const desktopListItems = planMetadataList.slice(0, 10)

  return (
    <>
      {/* Mobile View: List */}
      <div className="w-full md:hidden border rounded-md p-1">
        <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">Recent Plans</h3>
        {mobileListItems.length > 0 ? (
          <div className="flex flex-col">
            {mobileListItems.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={cn(
                  "cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background" // Adjusted offset
                )}
                // Prevent focus outline if clicking the menu button inside
                // Using onMouseDown for trigger inside PlanItemContent is preferred
              >
                {/* Use the updated PlanItemContent */}
                <PlanItemContent
                  plan={plan}
                  isActive={plan.id === activePlanId}
                  onViewJson={handleViewJsonClick}
                  onDelete={handleDeleteClick}
                  formatDate={formatDate}
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
        {/* TooltipProvider might be useful for the main trigger button */}
        <TooltipProvider delayDuration={200}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-[180px] justify-between">
                <span className="truncate">{currentPlanName}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[240px]">
              {desktopListItems.length > 0 ? (
                desktopListItems.map((plan) => (
                  // Container Item - still clickable for selection
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className="cursor-pointer relative flex select-none items-center rounded-sm outline-none transition-colors focus:bg-accent hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    // We wrap PlanItemContent instead of putting it directly in DropdownMenuItem
                    // to better control the click area vs the action menu trigger area.
                    // The outer div handles the main selection click.
                  >
                    {/* Use the updated PlanItemContent */}
                    <PlanItemContent
                      plan={plan}
                      isActive={plan.id === activePlanId}
                      onViewJson={handleViewJsonClick}
                      onDelete={handleDeleteClick}
                      formatDate={formatDate}
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

      {/* JSON Editor Dialog (remains the same) */}
      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={() => {
          setIsJsonEditorOpen(false)
          setPlanToViewJson(null)
        }}
        plan={planToViewJson}
      />

      {/* Delete Confirmation Dialog (remains the same) */}
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
    </>
  )
}
