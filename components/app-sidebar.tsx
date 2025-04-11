"use client"

import { Calendar, List, FileText, Info, Download, ExternalLink, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useUIState } from "@/contexts/ui-context"
import BlockSelector from "./shared/block-selector"
import WeekSelector from "./shared/week-selector"
import WeekTypeLegend from "./week-type-legend"
import Link from "next/link"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar"
import { PlanSwitcher } from "./plan-switcher"
import { useEffect, useState } from "react"
import { WeekType } from "@/types/training-plan"

export default function AppSidebar() {
  const {
    plans = [],
    currentPlan,
    setCurrentPlan,
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

  // Use the UIContext
  const { openSettingsDialog, openInfoDialog, openPlanActionDialog } = useUIState()

  const { state } = useSidebar()
  const isOpen = state === "expanded"
  
  // State for week types
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])

  // Get week types from current plan
  useEffect(() => {
    if (currentPlan?.data?.weekTypes && Array.isArray(currentPlan.data.weekTypes)) {
      setWeekTypes(currentPlan.data.weekTypes)
    } else {
      setWeekTypes([])
    }
  }, [currentPlan])

  const uploadModalStore = useUploadModal()
  // const exportModalStore = useExportModal() // Keep for compatibility with existing code

  const getWeekInfo = (weekNumber: number) => {
    const weekData = Array.isArray(trainingData)
      ? trainingData.find((w: any) => w.weekNumber === weekNumber)
      : undefined
      
    if (!weekData) return { type: "", weekTypeIds: [], colorName: undefined }
    
    return {
      type: weekData.weekType || "",
      weekTypeIds: weekData.weekTypeIds || [],
      colorName: weekData.weekStyle?.colorName
    }
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

  const handleEditPlan = (plan: any) => {
    if (typeof openPlanActionDialog === "function") {
      openPlanActionDialog("edit", plan) // Open dialog in 'edit' mode
    } else {
      console.error("'openPlanActionDialog' is not available from UI context")
    }
  }

  const handleDeletePlan = (plan: any) => {
    if (typeof openPlanActionDialog === "function") {
      openPlanActionDialog("delete", plan) // Open dialog in 'delete' mode
    } else {
      console.error("'openPlanActionDialog' is not available from UI context")
    }
  }

  return (
    <>
      <SidebarHeader className="my-4">
        <SidebarGroupLabel className="w-full flex items-center justify-center">
          <Link href="/" passHref>
            <h1 className="text-4xl font-bold text-primary">T-JSON</h1>
          </Link>
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className={cn(isOpen ? "px-3" : "px-1 flex flex-col items-center")}>
          <PlanSwitcher
            plans={plans}
            currentPlan={currentPlan}
            isOpen={isOpen}
            onSelectPlan={handleSelectPlan}
            onCreatePlan={handleCreateNewPlan}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
          />
        </SidebarGroup>
        <SidebarGroup
          className={cn("py-2 flex gap-2", isOpen ? "px-3 flex-col" : "px-3 flex-col items-center")}
        >
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() =>
              typeof changeViewMode === "function"
                ? changeViewMode("month")
                : console.error("'changeViewMode' is not a function")
            }
            className={cn("w-full aspect-square", isOpen && "justify-start")}
            aria-label="Block View"
          >
            <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Block View"}
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() =>
              typeof changeViewMode === "function"
                ? changeViewMode("week")
                : console.error("'changeViewMode' is not a function")
            }
            className={cn("w-full aspect-square", isOpen && "justify-start")}
            aria-label="Weekly View"
          >
            <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
          </Button>

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
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn(!isOpen && "items-center")}>
        {isOpen && (
          <div className="p-4 text-sm text-muted-foreground">
            {/* Use the dynamic week type legend component */}
            <h4 className="font-medium mb-2">Week Types</h4>
            <WeekTypeLegend weekTypes={weekTypes} />
            
            {/* If no week types are defined, show a message */}
            {(!weekTypes || weekTypes.length === 0) && (
              <p className="text-xs italic mt-2">
                No week types defined. Add week types in the JSON to customize week styling.
              </p>
            )}
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
              {isOpen && (
                <>
                  Documentation <ExternalLink className="ml-1 h-3 w-3" />
                </>
              )}
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
            onClick={openInfoDialog} // Use UIContext function
            className={cn("w-full", isOpen && "justify-start")}
            aria-label="Information"
          >
            <Info className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "About T-JSON"}
          </Button>
        </div>

        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={openSettingsDialog} // Use UIContext function
            className={cn("w-full", isOpen && "justify-start")}
            aria-label="Settings"
          >
            <Settings className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "Settings"}
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}