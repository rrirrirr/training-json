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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useTrainingPlans, type SavedTrainingPlan } from "@/contexts/training-plan-context"
import JsonEditor from "./json-editor" // Import the new JSON editor component

export default function PlanSelector() {
  const { plans, currentPlan, setCurrentPlan, deletePlan } = useTrainingPlans()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false) // New state for JSON editor
  const [planToDelete, setPlanToDelete] = useState<SavedTrainingPlan | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<SavedTrainingPlan | null>(null) // New state for JSON viewing

  // Handle plan selection
  const handleSelectPlan = (plan: SavedTrainingPlan) => {
    setCurrentPlan(plan)
    setIsPopoverOpen(false)
  }

  // Handle view JSON click
  const handleViewJsonClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToViewJson(plan)
    setIsJsonEditorOpen(true)
    setIsPopoverOpen(false)
  }

  // Handle delete button click
  const handleDeleteClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
    setIsPopoverOpen(false)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id)
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  if (!plans.length) {
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
            {currentPlan ? currentPlan.name : "Select a Plan"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <div className="max-h-[400px] overflow-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 group relative overflow-hidden
                  ${currentPlan?.id === plan.id ? "bg-blue-50" : ""}
                `}
                onClick={() => handleSelectPlan(plan)}
              >
                <div className="flex-1 truncate">
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-gray-500">Updated: {formatDate(plan.updatedAt)}</div>
                </div>
                <div className="flex items-center">
                  <TooltipProvider>
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
                  </TooltipProvider>
                  
                  <TooltipProvider>
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
                  </TooltipProvider>
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