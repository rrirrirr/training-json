// src/components/app-sidebar.tsx
"use client"

import {
  Calendar,
  List,
  FileText,
  Info,
  Download,
  ExternalLink,
  Home,
  Settings, // Make sure Home is imported if used for the header icon
  // Settings // Import Settings if used elsewhere
} from "lucide-react"
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
  // SidebarGroupLabel, // Not strictly needed with direct conditional rendering
  SidebarHeader,
  SidebarGroup,
  useSidebar, // Assuming this provides { state: "expanded" | "collapsed" }
} from "@/components/ui/sidebar" // Adjust path if needed
import { useEffect, useState } from "react"
import { WeekType } from "@/types/training-plan" // Adjust path if needed
import { useRouter } from "next/navigation"
import { usePlanStore } from "@/store/plan-store" // Adjust path if needed
import { useExportModal } from "@/components/modals/export-modal" // Adjust path if needed
import { PlanSwitcher } from "./plan-switcher" // Adjust path if needed
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip" // Adjust path if needed
import { usePlanMode } from "@/contexts/plan-mode-context" // Import the plan mode context

export default function AppSidebar() {
  const router = useRouter()

  // --- Zustand Store State ---
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId) // Keep if used
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const setViewMode = usePlanStore((state) => state.setViewMode)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)

  // --- Plan Mode Context State ---
  const { mode, draftPlan } = usePlanMode()

  // --- UI Context State ---
  const { openInfoDialog, openSettingsDialog } = useUIState() // Keep openSettingsDialog if used

  // --- Sidebar Context State ---
  const { state } = useSidebar() // State is "expanded" or "collapsed"
  const isOpen = state === "expanded"

  // --- Local State ---
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])

  // --- Modals ---
  const uploadModalStore = useUploadModal() // Keep if used elsewhere
  const exportModalStore = useExportModal()

  // --- Determine which plan to use ---
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan
  
  // --- Effects ---
  // Load plan metadata when necessary
  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList, fetchPlanMetadata])

  // Get week types from the plan being displayed
  useEffect(() => {
    if (planToDisplay?.weekTypes && Array.isArray(planToDisplay.weekTypes)) {
      setWeekTypes(planToDisplay.weekTypes)
    } else {
      setWeekTypes([])
    }
  }, [planToDisplay])

  // --- Helper Functions ---
  // Function to get week info for displaying week badges - use planToDisplay instead of activePlan
  const getWeekInfo = (weekNumber: number) => {
    const weekData = planToDisplay?.weeks.find((w) => w.weekNumber === weekNumber)
    if (!weekData) return { type: "", weekTypeIds: [], colorName: undefined }
    return {
      type: weekData.weekType || "",
      weekTypeIds: weekData.weekTypeIds || [],
      colorName: weekData.weekStyle?.colorName,
    }
  }

  // Handle changing view mode
  const handleChangeViewMode = (mode: "week" | "month") => {
    if (typeof setViewMode === "function") {
      setViewMode(mode)
    }
  }

  // --- Render ---
  return (
    // Tooltips are now provided by the global TooltipProvider in the layout
    <>
        {/* === HEADER === */}
        <SidebarHeader
          className={cn(
            "my-4 flex items-center",
            isOpen ? "justify-start px-4" : "justify-center" // Adjust padding/alignment
          )}
        >
          {isOpen ? (
            // Expanded: Show full title
            <div className="relative flex justify-center items-center w-full">
              <Link href="/" passHref>
                <h1 className="text-3xl font-bold text-primary font-archivo-black">T-JSON</h1>
              </Link>
              <div className="block md:hidden absolute right-0 top-0 bottom-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openSettingsDialog}
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-9 w-9" aria-hidden="true">
              {/* This div is purely for layout spacing, matching the previous icon button size */}
            </div>
          )}
        </SidebarHeader>

        {/* === CONTENT === */}
        <SidebarContent className="flex-grow overflow-y-auto overflow-x-hidden">
          {/* Plan Switcher */}
          <SidebarGroup
            className={cn(
              isOpen ? "px-3" : "px-1 flex flex-col items-center" // Adjust padding/alignment
            )}
          >
            <div className={cn(isOpen ? "w-full" : "w-auto")}>
              {isOpen ? (
                // Expanded: Show full switcher
                <PlanSwitcher />
              ) : (
                // Collapsed: Show icon button with tooltip
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push("/")} // Navigate to plan selection page
                      className="w-9 h-9"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Select Plan</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Select Plan
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </SidebarGroup>

          {/* View Mode Toggles & Selectors (Desktop only) */}
          <div
            className={cn(
              "hidden md:flex md:flex-col md:gap-2 mt-4", // Added margin-top
              isOpen ? "px-3" : "px-1 items-center" // Adjust padding/alignment
            )}
          >
            <SidebarGroup
              className={cn("flex gap-2", isOpen ? "w-full flex-col" : "flex-col items-center")}
            >
              {/* Block View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    onClick={() => handleChangeViewMode("month")}
                    size={isOpen ? "default" : "icon"}
                    className={cn(isOpen ? "w-full justify-start" : "w-9 h-9")}
                    aria-label="Block View"
                  >
                    <Calendar className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && "Block View"}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    Block View
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Weekly View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    onClick={() => handleChangeViewMode("week")}
                    size={isOpen ? "default" : "icon"}
                    className={cn(isOpen ? "w-full justify-start" : "w-9 h-9")}
                    aria-label="Weekly View"
                  >
                    <List className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && "Weekly View"}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    Weekly View
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Week/Block Selectors (Only when expanded and plan available) */}
              {isOpen && planToDisplay && (
                <div className="mt-2 w-full">
                  {viewMode === "month" ? (
                    <BlockSelector
                      blocks={planToDisplay.monthBlocks || []}
                      selectedBlockId={selectedMonth}
                      onSelectBlock={(id) => selectMonth(id)}
                      variant="sidebar"
                    />
                  ) : (
                    <WeekSelector
                      weeks={planToDisplay.weeks.map((w) => w.weekNumber) || []}
                      selectedWeek={selectedWeek}
                      onSelectWeek={(num) => selectWeek(num)}
                      variant="sidebar"
                      getWeekInfo={getWeekInfo}
                    />
                  )}
                </div>
              )}
            </SidebarGroup>
          </div>
        </SidebarContent>

        {/* === FOOTER === */}
        <SidebarFooter
          className={cn(
            "mt-auto flex flex-col gap-0.5", // Use gap-0.5 for closer buttons
            isOpen ? "p-3 border-t" : "p-1 items-center border-t" // Add border-t and adjust padding
          )}
        >
          {/* Week Types Legend (Only when expanded and types exist) */}
          {isOpen && weekTypes.length > 0 && (
            <div className="hidden md:block p-2 mb-2 text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">Week Types</h4>
              <WeekTypeLegend weekTypes={weekTypes} />
            </div>
          )}

          {/* Documentation Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/documentation" target="_blank" passHref className="w-full">
                <Button
                  variant="ghost"
                  size={isOpen ? "sm" : "icon"}
                  className={cn(
                    "w-full h-9", // Consistent height
                    isOpen ? "justify-start" : "justify-center"
                  )}
                  aria-label="Documentation"
                >
                  <FileText className={cn("h-4 w-4", isOpen && "mr-2")} />
                  {isOpen && (
                    <>
                      Documentation <ExternalLink className="ml-auto h-3 w-3" />
                    </>
                  )}
                </Button>
              </Link>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right" align="center">
                Documentation
              </TooltipContent>
            )}
          </Tooltip>

          {/* Export JSON Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isOpen ? "sm" : "icon"}
                onClick={() => planToDisplay && exportModalStore.open()}
                className={cn(
                  "w-full h-9", // Consistent height
                  isOpen ? "justify-start" : "justify-center"
                )}
                disabled={!planToDisplay}
                aria-label="Export JSON"
              >
                <Download className={cn("h-4 w-4", isOpen && "mr-2")} />
                {isOpen && "Export JSON"}
              </Button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right" align="center">
                Export JSON
              </TooltipContent>
            )}
          </Tooltip>

          {/* About Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isOpen ? "sm" : "icon"}
                onClick={openInfoDialog}
                className={cn(
                  "w-full h-9", // Consistent height
                  isOpen ? "justify-start" : "justify-center"
                )}
                aria-label="Information"
              >
                <Info className={cn("h-4 w-4", isOpen && "mr-2")} />
                {isOpen && "About T-JSON"}
              </Button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right" align="center">
                About T-JSON
              </TooltipContent>
            )}
          </Tooltip>

          {/* Optional: Add Settings button if needed */}
          {/*
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isOpen ? "sm" : "icon"}
                onClick={openSettingsDialog} // Ensure this function exists in useUIState
                className={cn("w-full h-9", isOpen ? "justify-start" : "justify-center")}
                aria-label="Settings"
              >
                <Settings className={cn("h-4 w-4", isOpen && "mr-2")} />
                {isOpen && "Settings"}
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right" align="center">Settings</TooltipContent>}
          </Tooltip>
          */}
        </SidebarFooter>
      </>
  )
}