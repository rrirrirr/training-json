// components/app-sidebar.tsx
"use client"

import { useState } from "react"
import { Calendar, List, FilePlus, ChevronDown, Trash2, Plus, FileText, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import JsonEditor from "./json-editor"
import { useInfoModal } from "@/components/modals/info-modal"
import { useUploadModal } from "@/components/modals/upload-modal"
import BlockSelector from "./shared/block-selector"
import WeekSelector from "./shared/week-selector"
import Link from "next/link"
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
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"

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
    selectedWeek,
    selectWeek,
    selectedMonth,
    selectMonth,
    viewMode,
    changeViewMode,
    weeksForSidebar,
    monthsForSidebar,
    trainingData,
  } = useTrainingPlans()

  // Get upload modal (for creating new plans via JSON upload)
  const uploadModalStore = useUploadModal()

  // Internal state for dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<any | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  // Get access to info modal
  const infoModalStore = useInfoModal()

  // Function to get week type (uses trainingData from context)
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData?.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  // Event handlers for dialogs
  const handleViewJson = (plan: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToViewJson(plan)
    setIsJsonEditorOpen(true)
  }

  const handleDeletePlan = (plan: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

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

  // Handle creating a new plan - now opens the upload modal
  const handleCreateNewPlan = () => {
    // Open the upload modal with a callback that dispatches the plan-created-from-json event
    uploadModalStore.open((data) => {
      // Create and dispatch a custom event with the imported JSON data
      const event = new CustomEvent('plan-created-from-json', { 
        detail: { data } 
      })
      window.dispatchEvent(event)
    })
  }

  return (
    <Sidebar className={cn("border-none flex flex-col h-full", !isOpen && "items-center")}>
      {/* T-JSON Logo/Title */}
      <div className={cn("p-4 border-b", !isOpen && "p-2 flex justify-center")}>
        <h1 className="text-xl font-bold text-primary">T-JSON</h1>
      </div>
      
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
              {/* Dropdown Content */}
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                {plans.map((plan) => (
                  <DropdownMenuItem key={plan.id} asChild onSelect={(e) => e.preventDefault()}>
                    <div
                      className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5 group"
                      onClick={() => setCurrentPlan(plan)}
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
                          aria-label={`Edit JSON for ${plan.name}`}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeletePlan(plan, e)}
                          aria-label={`Delete ${plan.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleCreateNewPlan()}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 text-muted-foreground"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New Plan (Import JSON)
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
          onClick={() => changeViewMode("month")}
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Block View"
        >
          <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Block View"}
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size={isOpen ? "sm" : "icon"}
          onClick={() => changeViewMode("week")}
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Weekly View"
        >
          <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
        </Button>
      </div>

      {/* Content: Month/Week Selection using shared components */}
      <SidebarContent className="flex-1 overflow-auto">
        {isOpen ? (
          <>
            {viewMode === "month" ? (
              <BlockSelector
                blocks={monthsForSidebar}
                selectedBlockId={selectedMonth}
                onSelectBlock={selectMonth}
                variant="sidebar"
              />
            ) : (
              <WeekSelector
                weeks={weeksForSidebar}
                selectedWeek={selectedWeek}
                onSelectWeek={selectWeek}
                variant="sidebar"
                getWeekInfo={getWeekInfo}
              />
            )}
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs">
            Expand sidebar to view weeks/months
          </div>
        )}
      </SidebarContent>

      {/* Footer: Legend and Info Button */}
      <SidebarFooter className={cn(!isOpen && "items-center")}>
        {isOpen && (
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
        
        {/* Documentation Link */}
        <div className="p-4 border-t border-border">
          <Link href="/documentation" passHref>
            <Button
              variant="ghost"
              size={isOpen ? "default" : "icon"}
              className={cn("w-full", isOpen && "justify-start")}
              aria-label="Documentation"
            >
              <FileText className={cn("h-4 w-4", isOpen && "mr-2")} />
              {isOpen && "Documentation"}
            </Button>
          </Link>
        </div>
        
        {/* Info Button in Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={() => infoModalStore.open()}
            className={cn("w-full", isOpen && "justify-start")}
            aria-label="Information"
          >
            <Info className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "Format & Information"}
          </Button>
        </div>
      </SidebarFooter>

      {/* Dialogs */}
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
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be
              undone.
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