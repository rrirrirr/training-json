"use client"

import { useState } from "react"
import {
  Calendar,
  List,
  Trash2,
  Plus,
  FileText,
  Info,
  Download,
  // Remove GalleryVerticalEnd, ChevronsUpDown if only used in PlanSwitcher
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import JsonEditor from "./json-editor"
import { useInfoModal } from "@/components/modals/info-modal"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useExportModal } from "@/components/modals/export-modal"
import BlockSelector from "./shared/block-selector"
import WeekSelector from "./shared/week-selector"
import Link from "next/link"
// Remove DropdownMenu imports if no longer used directly here
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
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
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
  // Assuming SidebarMenu, SidebarMenuItem, SidebarMenuButton are exported
} from "@/components/ui/sidebar"
// Remove Tooltip imports if only used in PlanSwitcher
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Import the new component
import { PlanSwitcher } from "./plan-switcher" // Adjust path if needed

export default function AppSidebar() {
  const {
    plans = [],
    currentPlan,
    setCurrentPlan,
    deletePlan,
    selectedWeek,
    selectWeek,
    selectedMonth,
    selectMonth,
    viewMode,
    changeViewMode,
    weeksForSidebar = [],
    monthsForSidebar = [],
    trainingData = [],
  } = useTrainingPlans()

  const { state } = useSidebar()
  const isOpen = state === "expanded"

  const uploadModalStore = useUploadModal()
  const infoModalStore = useInfoModal()
  const exportModalStore = useExportModal()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<any | null>(null)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  const getWeekInfo = (weekNumber: number) => {
    const weekData = Array.isArray(trainingData)
      ? trainingData.find((w: any) => w.weekNumber === weekNumber)
      : undefined
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

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
    if (planToDelete?.id && typeof deletePlan === "function") {
      deletePlan(planToDelete.id)
    } else {
      console.error("Cannot delete plan: 'deletePlan' function or 'planToDelete.id' is missing.")
    }
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const handleCreateNewPlan = () => {
    uploadModalStore.open((data) => {
      const event = new CustomEvent("plan-created-from-json", {
        detail: { data },
      })
      window.dispatchEvent(event)
    })
  }

  // Define the select plan handler
  const handleSelectPlan = (plan: any) => {
    if (typeof setCurrentPlan === "function") {
      setCurrentPlan(plan)
    } else {
      console.error("'setCurrentPlan' is not a function")
    }
  }

  return (
    <>
      <SidebarHeader className="my-4">
        <SidebarGroupLabel className="w-full flex items-center justify-center">
          <h1 className="text-4xl font-bold text-primary">T-JSON</h1>
        </SidebarGroupLabel>
      </SidebarHeader>

      {/* Replace the old DropdownMenu with the PlanSwitcher component */}
      <div className="px-3 py-2">
        <PlanSwitcher
          plans={plans}
          currentPlan={currentPlan}
          isOpen={isOpen}
          onSelectPlan={handleSelectPlan}
          onEditPlan={handleViewJson}
          onDeletePlan={handleDeletePlan}
          onCreatePlan={handleCreateNewPlan}
        />
      </div>

      <div className={cn("px-3 py-2 flex gap-2", isOpen ? "flex-col" : "flex-col items-center")}>
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size={isOpen ? "sm" : "icon"}
          onClick={() =>
            typeof changeViewMode === "function"
              ? changeViewMode("month")
              : console.error("'changeViewMode' is not a function")
          }
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Block View"
        >
          <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Block View"}
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size={isOpen ? "sm" : "icon"}
          onClick={() =>
            typeof changeViewMode === "function"
              ? changeViewMode("week")
              : console.error("'changeViewMode' is not a function")
          }
          className={cn("w-full", isOpen && "justify-start")}
          aria-label="Weekly View"
        >
          <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
        </Button>
      </div>

      <SidebarContent>
        {isOpen ? (
          <>
            {viewMode === "month" ? (
              <BlockSelector
                blocks={monthsForSidebar}
                selectedBlockId={selectedMonth}
                onSelectBlock={(id) =>
                  typeof selectMonth === "function"
                    ? selectMonth(id)
                    : console.error("'selectMonth' is not a function")
                }
                variant="sidebar"
              />
            ) : (
              <WeekSelector
                weeks={weeksForSidebar}
                selectedWeek={selectedWeek}
                onSelectWeek={(num) =>
                  typeof selectWeek === "function"
                    ? selectWeek(num)
                    : console.error("'selectWeek' is not a function")
                }
                variant="sidebar"
                getWeekInfo={getWeekInfo}
              />
            )}
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs"></div>
        )}
      </SidebarContent>

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

        <div className="px-3 py-2">
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

        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={() => exportModalStore.open()}
            className={cn("w-full", isOpen && "justify-start")}
            disabled={!currentPlan}
            aria-label="Export JSON"
          >
            <Download className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "Export JSON"}
          </Button>
        </div>

        <div className="px-3 py-2">
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
              Are you sure you want to delete "
              {planToDelete?.metadata?.planName || planToDelete?.name || "this plan"}"? This action
              cannot be undone.
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
    </>
  )
}
