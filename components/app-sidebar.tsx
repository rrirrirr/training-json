// components/app-sidebar.tsx
"use client"

import { useState } from "react" // Removed useEffect as context handles loading
import { Calendar, List, FilePlus, ChevronDown, Pencil, Trash2, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTrainingPlans } from "@/contexts/training-plan-context" // Assuming context provides everything needed now
import PlanNameDialog from "./plan-name-dialog"
import JsonEditor from "./json-editor"
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
  // SidebarMenuSub, // Assuming no submenus needed for weeks/months now
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar" // Ensure this path is correct

// Removed props related to data/state/callbacks
interface AppSidebarProps {
  isOpen: boolean // Prop to control collapsed/expanded style
}

export default function AppSidebar({ isOpen }: AppSidebarProps) {
  // Get data, UI state, and actions from context
  const {
    plans,
    currentPlan,
    setCurrentPlan,
    deletePlan,
    updatePlan,
    selectedWeek,
    selectWeek,
    selectedMonth,
    selectMonth,
    viewMode,
    changeViewMode,
    weeksForSidebar,
    monthsForSidebar,
    trainingData, // Get full data if getWeekInfo needs it
  } = useTrainingPlans()

  // Internal state for dialogs remains
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<SavedTrainingPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SavedTrainingPlan | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<SavedTrainingPlan | null>(null)

  // Function to get week type (uses trainingData from context)
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber) // Use optional chaining
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  // Event handlers for dialogs remain mostly the same
  const handleEditPlan = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToEdit(plan)
    setIsEditDialogOpen(true)
  }

  const handleViewJson = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToViewJson(plan)
    setIsJsonEditorOpen(true)
  }

  const handleDeletePlan = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleSavePlanName = (name: string) => {
    if (planToEdit) {
      updatePlan(planToEdit.id, { name }) // Use context action
    }
    setPlanToEdit(null)
    setIsEditDialogOpen(false) // Close dialog on save
  }

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id) // Use context action
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Handle creating a new plan (might still dispatch event or directly call context)
  const triggerCreateNewPlan = (name: string) => {
    // Option 1: Dispatch event (if page listens)
    window.dispatchEvent(new CustomEvent("create-training-plan", { detail: { name } }))
    // Option 2: Directly call context if possible (needs addPlan in context signature)
    // addPlan(name, { exerciseDefinitions: [], weeks: [], monthBlocks: [] });
    setIsNewPlanDialogOpen(false)
  }

  return (
    <Sidebar className={cn("border-none flex flex-col h-full", !isOpen && "items-center")}>
      <SidebarHeader className={cn(!isOpen && "p-2")}>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Plan Selection Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  aria-label="Select Plan"
                  className={cn(!isOpen && "justify-center")}
                >
                  {/* Icon for collapsed view */}
                  <FilePlus className={cn("h-5 w-5", isOpen && "mr-2")} />
                  {isOpen && (
                    <>
                      <span className="truncate flex-1 text-left">
                        {currentPlan ? currentPlan.name : "Select Plan"}
                      </span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {/* Dropdown Content remains the same, using context data/actions */}
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                {plans.map((plan) => (
                  <DropdownMenuItem key={plan.id} asChild onSelect={(e) => e.preventDefault()}>
                    <div
                      className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5 group"
                      onClick={() => setCurrentPlan(plan)} // Use context action
                    >
                      {/* Plan name and date */}
                      <div className="flex-1 truncate">
                        {plan.name}
                        <div className="text-xs text-muted-foreground">
                          {formatDate(plan.updatedAt)}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500"
                          onClick={(e) => handleViewJson(plan, e)}
                          aria-label={`View JSON for ${plan.name}`}
                        >
                          {" "}
                          <FileText className="h-4 w-4" />{" "}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleEditPlan(plan, e)}
                          aria-label={`Edit ${plan.name}`}
                        >
                          {" "}
                          <Pencil className="h-4 w-4" />{" "}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeletePlan(plan, e)}
                          aria-label={`Delete ${plan.name}`}
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsNewPlanDialogOpen(true)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 text-muted-foreground"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Plan
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* View Mode Toggle */}
      <div className={cn("p-4 flex gap-2", isOpen ? "flex-col" : "flex-col items-center")}>
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size={isOpen ? "sm" : "icon"}
          onClick={() => changeViewMode("month")} // Use context action
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Monthly View"
        >
          <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Monthly View"}
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size={isOpen ? "sm" : "icon"}
          onClick={() => changeViewMode("week")} // Use context action
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Weekly View"
        >
          <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
        </Button>
      </div>

      {/* Content: Month/Week Selection */}
      <SidebarContent className="flex-1 overflow-auto">
        {isOpen ? ( // Only show lists if sidebar is open
          <>
            {viewMode === "month" ? (
              <div className="p-4">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Months
                </h2>
                <div className="space-y-1">
                  {monthsForSidebar.map((month) => (
                    <button
                      key={month.id}
                      onClick={() => selectMonth(month.id)} // Use context action
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
              <div className="p-4">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Weeks
                </h2>
                <div
                  className={cn(
                    "gap-2",
                    isOpen ? "grid grid-cols-4" : "flex flex-col items-center"
                  )}
                >
                  {weeksForSidebar.map((week) => {
                    const { type, isDeload, isTest } = getWeekInfo(week)
                    return (
                      <button
                        key={week}
                        onClick={() => selectWeek(week)} // Use context action
                        className={cn(
                          "p-2 rounded text-center text-sm transition-colors flex flex-col items-center justify-center aspect-square", // Make it square-ish
                          selectedWeek === week
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/50",
                          isDeload && isOpen
                            ? "border-l-4 border-yellow-500"
                            : isDeload
                              ? "ring-2 ring-yellow-500"
                              : "", // Indicate differently when collapsed
                          isTest && isOpen
                            ? "border-l-4 border-green-500"
                            : isTest
                              ? "ring-2 ring-green-500"
                              : "" // Indicate differently when collapsed
                        )}
                        aria-label={`Week ${week}${type ? ` (${type})` : ""}${isDeload ? " Deload" : ""}${isTest ? " Test" : ""}`}
                      >
                        <div className="font-medium">{week}</div>
                        {isOpen && type && <div className="text-xs opacity-75">{type}</div>}
                        {!isOpen && isDeload && (
                          <div className="w-1 h-1 rounded-full bg-yellow-500 mt-1"></div>
                        )}
                        {!isOpen && isTest && (
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-1"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs">
            Expand sidebar to view weeks/months
          </div>
        )}
      </SidebarContent>

      {/* Footer: Legend and Toggle */}
      <SidebarFooter className={cn(!isOpen && "items-center")}>
        {isOpen && ( // Only show legend if open
          <div className="p-4 text-sm text-muted-foreground">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2 shrink-0"></div>
              <span>DELOAD week</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-l-4 border-green-500 mr-2 shrink-0"></div>
              <span>TEST week</span>
            </div>
          </div>
        )}
        {/* Sidebar Trigger button is handled by LayoutClient/Header now */}
        {/* If you need a toggle button *inside* the sidebar itself, add it here */}
        {/* <div className="p-4"><SidebarTrigger /></div> */}
      </SidebarFooter>

      {/* Dialogs remain the same */}
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
      <PlanNameDialog
        isOpen={isNewPlanDialogOpen}
        onClose={() => setIsNewPlanDialogOpen(false)}
        onSave={triggerCreateNewPlan} // Use the wrapper function
        title="New Training Plan"
        description="Give your new training plan a name."
        saveButtonText="Create"
      />
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
            {" "}
            <DialogTitle>Delete Training Plan</DialogTitle>{" "}
            <DialogDescription>
              {" "}
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be
              undone.{" "}
            </DialogDescription>{" "}
          </DialogHeader>
          <DialogFooter>
            {" "}
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setPlanToDelete(null)
              }}
            >
              {" "}
              Cancel{" "}
            </Button>{" "}
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {" "}
              Delete{" "}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={() => {
          setIsJsonEditorOpen(false)
          setPlanToViewJson(null)
        }}
        plan={planToViewJson}
      />
    </Sidebar>
  )
}
