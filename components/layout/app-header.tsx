"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Moon, Sun, ChevronDown, Plus, Edit, Trash2, FileText } from "lucide-react"
import { useTrainingPlans, type SavedTrainingPlan } from "@/contexts/training-plan-context"
import PlanNameDialog from "@/components/plan-name-dialog"
import JsonEditor from "@/components/json-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const { 
    plans, 
    currentPlan, 
    setCurrentPlan, 
    deletePlan, 
    updatePlan,
    viewMode,
    changeViewMode
  } = useTrainingPlans()

  // State for handling plan edit/delete/view
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false)
  const [planToEdit, setPlanToEdit] = useState<SavedTrainingPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SavedTrainingPlan | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<SavedTrainingPlan | null>(null)

  // Handle plan selection
  const handleSelectPlan = (plan: SavedTrainingPlan) => {
    setCurrentPlan(plan)
    setIsSheetOpen(false)
  }

  // Handle edit button click
  const handleEditClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToEdit(plan)
    setIsEditDialogOpen(true)
  }

  // Handle view JSON click
  const handleViewJsonClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToViewJson(plan)
    setIsJsonEditorOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (plan: SavedTrainingPlan, e: React.MouseEvent) => {
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
    setIsEditDialogOpen(false)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id)
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  // Handle creating a new plan
  const handleCreateNewPlan = (name: string) => {
    // Dispatch event for the page to handle
    window.dispatchEvent(new CustomEvent("create-training-plan", { detail: { name } }))
    setIsNewPlanDialogOpen(false)
    setIsSheetOpen(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile: Hamburger Button & Sheet */}
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="sm:max-w-xs pr-0"
            // Remove close button
            hideCloseButton={true}
          >
            {/* Mobile navigation menu */}
            <div className="flex flex-col h-full overflow-auto">
              {/* App Title/Logo and Theme Toggle in same row */}
              <div className="py-5 px-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Training Plan Manager</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>

              <Separator />

              {/* Plan Selection Section */}
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3">Current Plan</h3>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold truncate">
                    {currentPlan ? currentPlan.name : "No plan selected"}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>

                {/* Plan List */}
                <div className="mt-2 space-y-1 max-h-[40vh] overflow-y-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                        flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted group
                        ${currentPlan?.id === plan.id ? "bg-accent/50" : ""}
                      `}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <div className="flex-1 truncate">
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Updated: {formatDate(plan.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500"
                          onClick={(e) => handleViewJsonClick(plan, e)}
                          aria-label={`View JSON for ${plan.name}`}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleEditClick(plan, e)}
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeleteClick(plan, e)}
                          aria-label={`Delete ${plan.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Plan Button */}
                <Button
                  onClick={() => setIsNewPlanDialogOpen(true)}
                  variant="outline"
                  className="w-full mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </div>

              <Separator />

              {/* View Mode Selection */}
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3">View Mode</h3>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === "month" ? "default" : "outline"} 
                    className="flex-1"
                    onClick={() => {
                      changeViewMode("month")
                      setIsSheetOpen(false)
                    }}
                  >
                    Block View
                  </Button>
                  <Button 
                    variant={viewMode === "week" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      changeViewMode("week")
                      setIsSheetOpen(false)
                    }}
                  >
                    Weekly View
                  </Button>
                </div>
              </div>
              
              {/* Bottom spacing */}
              <div className="flex-1"></div>
              
              <div className="p-4 text-xs text-center text-muted-foreground">
                Training Plan Manager v1.0
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar Toggle Button */}
      <div className="hidden md:block">
        <Button
          size="icon"
          variant="outline"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <Menu className="h-5 w-5 rotate-90" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Spacer to push theme switcher to the right */}
      <div className="flex-1"></div>

      {/* Desktop only: Dark/Light Mode Switcher */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Dialogs for plan management */}
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
        onSave={handleCreateNewPlan}
        title="New Training Plan"
        description="Give your new training plan a name."
        saveButtonText="Create"
      />

      <JsonEditor
        isOpen={isJsonEditorOpen}
        onClose={() => {
          setIsJsonEditorOpen(false)
          setPlanToViewJson(null)
        }}
        plan={planToViewJson}
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
    </header>
  )
}