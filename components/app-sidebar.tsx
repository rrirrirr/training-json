"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  List,
  FilePlus,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTrainingPlans, SavedTrainingPlan } from "@/contexts/training-plan-context"
import PlanNameDialog from "./plan-name-dialog"
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
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"

import type { Week, MonthBlock } from "@/types/training-plan"

interface AppSidebarProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  months: MonthBlock[]
  selectedMonth: number
  onSelectMonth: (monthId: number) => void
  trainingData: Week[]
  viewMode: "week" | "month"
  onViewModeChange: (mode: "week" | "month") => void
}

export default function AppSidebar({
  weeks,
  selectedWeek,
  onSelectWeek,
  months,
  selectedMonth,
  onSelectMonth,
  trainingData,
  viewMode,
  onViewModeChange,
}: AppSidebarProps) {
  const { plans, currentPlan, setCurrentPlan, deletePlan, updatePlan } = useTrainingPlans()
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<SavedTrainingPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SavedTrainingPlan | null>(null)

  // Function to get week type (A/B) and special status (deload/test)
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  // Handle edit plan
  const handleEditPlan = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToEdit(plan)
    setIsEditDialogOpen(true)
  }

  // Handle delete plan
  const handleDeletePlan = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
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

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {currentPlan ? currentPlan.name : "Select Training Plan"}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                {plans.map((plan) => (
                  <DropdownMenuItem key={plan.id} asChild>
                    <div
                      className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5"
                      onClick={() => setCurrentPlan(plan)}
                    >
                      <div className="flex-1 truncate">
                        {plan.name}
                        <div className="text-xs text-muted-foreground">
                          {formatDate(plan.updatedAt)}
                        </div>
                      </div>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleEditPlan(plan, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeletePlan(plan, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setIsNewPlanDialogOpen(true)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 text-muted-foreground"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Training Plan
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* View Toggle Buttons */}
        <div className="p-4 flex flex-col gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            className="w-full justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" /> Monthly View
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            className="w-full justify-start"
          >
            <List className="h-4 w-4 mr-2" /> Weekly View
          </Button>
        </div>

        {/* Dynamic content based on view mode */}
        <div className="flex-1 overflow-auto">
          {viewMode === "month" ? (
            /* Month selection */
            <div className="p-4">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Months
              </h2>
              <div className="space-y-1">
                {months.map((month) => (
                  <button
                    key={month.id}
                    onClick={() => onSelectMonth(month.id)}
                    className={cn(
                      "w-full p-2 rounded text-left text-sm transition-colors",
                      selectedMonth === month.id
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    {month.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Week selection */
            <div className="p-4">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Weeks
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {weeks.map((week) => {
                  const { type, isDeload, isTest } = getWeekInfo(week)
                  return (
                    <button
                      key={week}
                      onClick={() => onSelectWeek(week)}
                      className={cn(
                        "p-2 rounded text-center text-sm transition-colors",
                        selectedWeek === week
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent/50",
                        isDeload ? "border-l-4 border-yellow-500" : "",
                        isTest ? "border-l-4 border-green-500" : ""
                      )}
                    >
                      <div className="font-medium">{week}</div>
                      {type && <div className="text-xs opacity-75">{type}</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter>
        {/* Legend */}
        <div className="p-4 text-sm text-muted-foreground">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
            <span>DELOAD week</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
            <span>TEST week</span>
          </div>
        </div>

        {/* Toggle Sidebar Button */}
        <div className="p-4">
          <SidebarTrigger />
        </div>
      </SidebarFooter>

      {/* Plan Name Dialog */}
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

      {/* New Plan Dialog */}
      <PlanNameDialog
        isOpen={isNewPlanDialogOpen}
        onClose={() => setIsNewPlanDialogOpen(false)}
        onSave={(name) => {
          window.dispatchEvent(
            new CustomEvent("create-training-plan", {
              detail: { name },
            })
          )
          setIsNewPlanDialogOpen(false)
        }}
        title="New Training Plan"
        description="Give your new training plan a name."
        saveButtonText="Create"
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
    </Sidebar>
  )
}
