"use client"

import { useState } from "react"
import { ChevronDown, Plus, Edit, Trash2, MoreVertical, FileEdit } from "lucide-react"
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

import { useTrainingPlans, type SavedTrainingPlan } from "@/contexts/training-plan-context"
import PlanNameDialog from "@/components/plan-name-dialog"

export default function PlanSelector() {
  const { plans, currentPlan, setCurrentPlan, deletePlan, updatePlan } = useTrainingPlans()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<SavedTrainingPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SavedTrainingPlan | null>(null)

  // Handle plan selection
  const handleSelectPlan = (plan: SavedTrainingPlan) => {
    setCurrentPlan(plan)
    setIsPopoverOpen(false)
  }

  // Handle edit button click
  const handleEditClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToEdit(plan)
    setIsEditDialogOpen(true)
    setIsPopoverOpen(false)
  }

  // Handle delete button click
  const handleDeleteClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
    setIsPopoverOpen(false)
  }

  // Handle save plan name
  const handleSavePlanName = (name: string) => {
    if (planToEdit) {
      updatePlan(planToEdit.id, { name })
    }
    setPlanToEdit(null)
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
                  flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100
                  ${currentPlan?.id === plan.id ? "bg-blue-50" : ""}
                `}
                onClick={() => handleSelectPlan(plan)}
              >
                <div className="flex-1 truncate">
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-gray-500">Updated: {formatDate(plan.updatedAt)}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleEditClick(plan, e)}
                    title="Edit plan name"
                  >
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={(e) => handleDeleteClick(plan, e)}
                    title="Delete plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Plan Name Dialog */}
      <PlanNameDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setPlanToEdit(null)
        }}
        onSave={handleSavePlanName}
        initialName={planToEdit?.name || ""}
        title="Rename Training Plan"
        description="Update the name of your training plan."
        saveButtonText="Update"
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
            <DialogTitle>Delete Training Plan</DialogTitle>
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
