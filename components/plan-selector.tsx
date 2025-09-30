"use client"

import { useState } from "react"
import { ChevronDown, Plus, Trash2, MoreVertical, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { usePlanStore, type PlanMetadata } from "@/store/plan-store"
import JsonEditor from "./json-editor" // Import the new JSON editor component
import { DeletePlanDialog } from "@/components/dialogs/delete-plan-dialog"

export default function PlanSelector() {
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false) // New state for JSON editor
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null) // New state for JSON viewing

  // Handle plan selection
  const handleSelectPlan = (plan: PlanMetadata) => {
    // Instead of directly updating the state, navigate to the plan page
    window.location.href = `/plan/${plan.id}`
    setIsPopoverOpen(false)
  }

  // Handle view JSON click
  const handleViewJsonClick = (plan: PlanMetadata, e: React.MouseEvent) => {
    e.stopPropagation()
    // Since we only have metadata, we need to make sure we have the full plan
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
    setIsPopoverOpen(false)
  }

  // Handle delete button click
  const handleDeleteClick = (plan: PlanMetadata, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
    setIsPopoverOpen(false)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await removeLocalPlan(planToDelete.id)

      // If we just deleted the active plan, redirect to home
      if (activePlanId === planToDelete.id) {
        window.location.href = "/"
      }
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Unknown date"
    }
  }

  if (!planMetadataList.length) {
    return null
  }

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between gap-2 w-full md:w-auto md:min-w-[200px]"
          >
            {activePlan?.metadata?.planName || "Select a Plan"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="max-h-[400px] overflow-auto">
            {planMetadataList.map((plan) => (
              <div
                key={plan.id}
                className={`
                  flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 group relative overflow-hidden
                  ${activePlanId === plan.id ? "bg-blue-50" : ""}
                `}
                onClick={() => handleSelectPlan(plan)}
              >
                <div className="flex-1 truncate">
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-gray-500">Updated: {formatDate(plan.updatedAt)}</div>
                </div>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        onClick={(e) => handleViewJsonClick(plan, e)}
                        aria-label={`Edit JSON for ${plan.name}`}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Edit JSON</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Edit JSON</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 delay-75"
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
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

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
      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setPlanToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        planName={planToDelete?.name}
        title="Delete JSON Plan"
      />
    </>
  )
}
