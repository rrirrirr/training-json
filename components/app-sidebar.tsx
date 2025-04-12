"use client"

import { Calendar, List, FileText, Info, Download, ExternalLink, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { useEffect, useState } from "react"
import { WeekType } from "@/types/training-plan"
import { useRouter } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
import { useExportModal } from "@/components/modals/export-modal"
import { PlanSwitcher } from "./plan-switcher"

export default function AppSidebar() {
  const router = useRouter()

  // Get data from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const setViewMode = usePlanStore((state) => state.setViewMode)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)

  // Use the UIContext for UI-specific actions
  const { openSettingsDialog, openInfoDialog } = useUIState()

  // Use the sidebar state
  const { state } = useSidebar()
  const isOpen = state === "expanded"

  // State for week types
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])

  // Load plan metadata when necessary
  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList, fetchPlanMetadata])

  // Get week types from active plan
  useEffect(() => {
    if (activePlan?.weekTypes && Array.isArray(activePlan.weekTypes)) {
      setWeekTypes(activePlan.weekTypes)
    } else {
      setWeekTypes([])
    }
  }, [activePlan])

  // Upload modal for creating new plans
  const uploadModalStore = useUploadModal()
  const exportModalStore = useExportModal()

  // Function to get week info for displaying week badges
  const getWeekInfo = (weekNumber: number) => {
    const weekData = activePlan?.weeks.find((w) => w.weekNumber === weekNumber)

    if (!weekData) return { type: "", weekTypeIds: [], colorName: undefined }

    return {
      type: weekData.weekType || "",
      weekTypeIds: weekData.weekTypeIds || [],
      colorName: weekData.weekStyle?.colorName,
    }
  }

  // Handle creating a new plan
  const handleCreateNewPlan = () => {
    router.push("/")
  }

  // Handle changing view mode
  const handleChangeViewMode = (mode: "week" | "month") => {
    if (typeof setViewMode === "function") {
      setViewMode(mode)
    }
  }

  return (
    <>
      <SidebarHeader className="my-4">
        <SidebarGroupLabel className="w-full flex items-center justify-center">
          <Link href="/" passHref>
            <h1 className="text-4xl font-bold text-primary font-archivo-black">T-JSON</h1>
          </Link>
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        {/* Plan Switcher */}
        <SidebarGroup className={cn(isOpen ? "px-3" : "px-1 flex flex-col items-center")}>
          <div className={cn(isOpen ? "w-full" : "w-10")}>
            {isOpen ? (
              <PlanSwitcher />
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/")}
                className="w-10 h-10"
                title="Plans"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarGroup>

        {/* Container for buttons + selectors hidden on mobile */}
        <div
          className={cn(
            "hidden md:flex md:flex-col md:gap-2",
            isOpen ? "px-3" : "px-3 items-center"
          )}
        >
          <SidebarGroup className={cn("flex gap-2", isOpen ? "flex-col" : "flex-col items-center")}>
            {/* View mode toggle buttons */}
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => handleChangeViewMode("month")}
              className={cn("aspect-square", isOpen ? "w-full justify-start" : "w-auto")}
              aria-label="Block View"
            >
              <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Block View"}
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => handleChangeViewMode("week")}
              className={cn("aspect-square", isOpen ? "w-full justify-start" : "w-auto")}
              aria-label="Weekly View"
            >
              <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
            </Button>

            {/* Weekly or Monthly selector */}
            {isOpen && activePlan ? (
              <>
                {viewMode === "month" ? (
                  <BlockSelector
                    blocks={activePlan.monthBlocks || []}
                    selectedBlockId={selectedMonth}
                    onSelectBlock={(id) => selectMonth(id)}
                    variant="sidebar"
                  />
                ) : (
                  <WeekSelector
                    weeks={activePlan.weeks.map((w) => w.weekNumber) || []}
                    selectedWeek={selectedWeek}
                    onSelectWeek={(num) => selectWeek(num)}
                    variant="sidebar"
                    getWeekInfo={getWeekInfo}
                  />
                )}
              </>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs"></div>
            )}
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className={cn(!isOpen && "items-center")}>
        {/* Week Types legend - only shown when sidebar is expanded */}
        {isOpen && (
          <div className="hidden md:block p-4 text-sm text-muted-foreground">
            <h4 className="font-medium mb-2">Week Types</h4>
            <WeekTypeLegend weekTypes={weekTypes} />
            {(!weekTypes || weekTypes.length === 0) && (
              <p className="text-xs italic mt-2">
                No week types defined. Add week types in the JSON to customize week styling.
              </p>
            )}
          </div>
        )}

        {/* Documentation link */}
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

        {/* Export JSON button */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={() => exportModalStore.open()}
            className={cn("w-full", isOpen && "justify-start")}
            disabled={!activePlan}
            aria-label="Export JSON"
          >
            <Download className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "Export JSON"}
          </Button>
        </div>

        {/* About button */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={openInfoDialog}
            className={cn("w-full", isOpen && "justify-start")}
            aria-label="Information"
          >
            <Info className={cn("h-4 w-4", isOpen && "mr-2")} />
            {isOpen && "About T-JSON"}
          </Button>
        </div>

        {/* Settings button */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size={isOpen ? "default" : "icon"}
            onClick={openSettingsDialog}
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
