// src/components/app-sidebar.tsx
"use client"

import {
  Calendar,
  List,
  FileText,
  Info,
  Plus,
  GalleryVerticalEnd,
  ChevronsUpDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUIState } from "@/contexts/ui-context"
import BlockSelector from "./shared/block-selector"
import WeekSelector from "./shared/week-selector"
import WeekTypeLegend from "./week-type-legend"
import Link from "next/link"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { WeekType, type PlanMetadata } from "@/types/training-plan" // Assuming PlanMetadata type is correctly imported/defined
import { useRouter } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
import { PlanItemContent } from "./plan-switcher" // Assuming PlanItemContent is correctly imported
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

export default function AppSidebar() {
  const router = useRouter()

  // --- State Hooks ---
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const setViewMode = usePlanStore((state) => state.setViewMode)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  const { mode, draftPlan, originalPlanId, exitMode } = usePlanMode()
  const { openInfoDialog, openSwitchWarningDialog, openDeleteDialog, openJsonEditor } = useUIState()
  const { state } = useSidebar()
  const isOpen = state === "expanded"
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  const { open: openNewPlanModal } = useNewPlanModal()

  // --- Determine which plan to use for display ---
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan

  // --- Define list limits ---
  const desktopListLimit = 10 // Used for both recent list and dropdown
  const desktopListItems = planMetadataList.slice(0, desktopListLimit)
  // Define the limit for the dropdown, can be same or different
  const dropdownListLimit = desktopListLimit

  // --- Effects ---
  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])

  useEffect(() => {
    setWeekTypes(
      planToDisplay?.weekTypes && Array.isArray(planToDisplay.weekTypes)
        ? planToDisplay.weekTypes
        : []
    )
  }, [planToDisplay])

  // --- Helper Functions ---
  const getWeekInfo = (weekNumber: number) => {
    // Ensure planToDisplay and its weeks property exist
    const weekData = planToDisplay?.weeks?.find((w) => w.weekNumber === weekNumber)
    return weekData
      ? {
          type: weekData.weekType || "",
          weekTypeIds: weekData.weekTypeIds || [],
          colorName: weekData.weekStyle?.colorName,
        }
      : { type: "", weekTypeIds: [], colorName: undefined }
  }

  const handleChangeViewMode = (newMode: "week" | "month") => {
    if (typeof setViewMode === "function") {
      setViewMode(newMode)
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    // Using current date (April 19, 2025) for locale context if needed
    // The locale 'undefined' uses the browser's default locale
    return dateString
      ? new Date(dateString).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A"
  }

  // --- Action Handlers ---
  const handlePlanLinkClick = (e: React.MouseEvent, planId: string) => {
    if (planId === activePlanId && mode === "normal") {
      e.preventDefault()
      return
    }
    if (mode === "edit" && planId !== originalPlanId) {
      e.preventDefault()
      openSwitchWarningDialog(planId)
      return
    }
    // Default behavior (navigation) occurs if conditions above aren't met
  }

  // Note: The handleViewJsonClick and handleDeleteClick functions seem to be defined
  // inside PlanItemContent in the second snippet you provided. For this sidebar
  // component to work standalone, those actions might need to be handled differently,
  // perhaps by passing callbacks down or having PlanItemContent handle them internally
  // using context or its own state access if appropriate. Assuming PlanItemContent
  // handles these actions as shown in the second snippet.

  // Determine the name for the dropdown trigger
  let triggerPlanName = "Select Plan"
  if (mode === "edit") {
    triggerPlanName = `Editing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (mode === "view") {
    triggerPlanName = `Viewing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (activePlanId) {
    const currentMeta = planMetadataList.find((p) => p.id === activePlanId)
    triggerPlanName = currentMeta?.name || "Loading Plan..."
  }

  // --- Render ---
  return (
    <>
      {/* Header */}
      <SidebarHeader
        className={cn("my-4 flex items-center", isOpen ? "justify-start px-4" : "justify-center")}
      >
        {isOpen ? (
          <div className="relative flex justify-center items-center w-full">
            <Link href="/" passHref>
              <h1 className="text-3xl font-bold text-primary font-archivo-black">T-JSON</h1>
            </Link>
          </div>
        ) : (
          <div className="h-9 w-9" aria-hidden="true" /> // Placeholder for alignment
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex-grow overflow-y-auto overflow-x-hidden">
        {/* Plan Management */}
        <SidebarGroup className={cn("pb-2", isOpen ? "px-3" : "px-1 flex flex-col items-center")}>
          {/* New Plan Button */}
          {!planToDisplay ? (
            <div className={cn("mb-2", isOpen ? "w-full" : "w-auto")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isOpen ? "default" : "outline"}
                    size={isOpen ? "sm" : "icon"}
                    className={cn(isOpen ? "w-full justify-start" : "w-9 h-9")}
                    onClick={() => openNewPlanModal()}
                  >
                    <Plus className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && "New Plan (AI)"}
                    {!isOpen && <span className="sr-only">New Plan (AI)</span>}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    New Plan (AI)
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          ) : null}
          {/* Plan List / Dropdown Trigger (Conditional) */}
          <div className={cn(isOpen ? "w-full" : "w-auto")}>
            {isOpen ? (
              <>
                {!planToDisplay ? (
                  // NO ACTIVE PLAN: Show Inline List (Limited)
                  <div className="w-full flex flex-col gap-1 mt-2">
                    <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">
                      Recent Plans
                    </h3>
                    {desktopListItems.length > 0 ? (
                      desktopListItems.map((plan) => (
                        <PlanItemContent
                          key={plan.id}
                          plan={plan}
                          isActive={false} // Not active view here
                          formatDate={formatDate}
                          onLinkClick={handlePlanLinkClick}
                          // Pass required action handlers if PlanItemContent expects them
                        />
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No plans found
                      </div>
                    )}
                    {planMetadataList.length > desktopListLimit && (
                      <div className="mt-1 px-2">
                        <Link href="/plans" passHref>
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-primary"
                          >
                            View All Plans &rarr;
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  // ACTIVE PLAN: Show Dropdown Trigger (with Limited Dropdown List)
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(
                          "w-full justify-start text-left mt-2 px-2 text-md",
                          mode !== "normal"
                            ? mode === "edit"
                              ? "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)] text-[var(--edit-mode-text)]"
                              : "bg-[var(--view-mode-bg)] border-[var(--view-mode-border)] text-[var(--view-mode-text)]"
                            : ""
                        )}
                      >
                        <GalleryVerticalEnd className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1 mr-1">{triggerPlanName}</span>
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[--radix-dropdown-menu-trigger-width]"
                    >
                      {/* Apply .slice() before .map() to limit dropdown items */}
                      {planMetadataList.slice(0, dropdownListLimit).map((plan) => (
                        <DropdownMenuItem
                          key={plan.id}
                          className="p-0 focus:bg-transparent hover:bg-transparent" // Let PlanItemContent handle hover/focus styles
                        >
                          <PlanItemContent
                            plan={plan}
                            isActive={plan.id === activePlanId && mode === "normal"}
                            formatDate={formatDate}
                            onLinkClick={handlePlanLinkClick}
                            // Pass required action handlers if PlanItemContent expects them
                          />
                        </DropdownMenuItem>
                      ))}

                      {/* Empty state message */}
                      {planMetadataList.length === 0 && (
                        <DropdownMenuItem disabled>No plans found</DropdownMenuItem>
                      )}

                      {/* Separator and "View All Plans" button */}
                      <DropdownMenuItem asChild>
                        <Link href="/plans" passHref>
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-primary"
                          >
                            View All Plans <ChevronRight />
                          </Button>
                        </Link>
                      </DropdownMenuItem>

                      {/* Separator and "Create New Plan" */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openNewPlanModal()}
                        className="p-2 flex items-center gap-2 cursor-pointer focus:bg-primary/10 hover:bg-primary/10 hover:text-primary focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Create New Plan</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              // Collapsed View: Select Plan Button
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Link to /plans or / might be more appropriate than just / */}
                  <Link href="/plans" passHref>
                    <Button variant="outline" size="icon" className="w-9 h-9 mt-1">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Select Plan</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Select Plan
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarGroup>
        {/* End Plan Management Group */}

        {/* Active Plan Navigation Section (Desktop Only & when plan active) */}
        {planToDisplay && (
          <div
            className={cn(
              "hidden md:flex flex-col gap-2 mt-4",
              isOpen ? "px-3" : "px-1 items-center"
            )}
          >
            {isOpen && <Separator className="mb-3" />}
            {/* Group for View Toggles */}
            <SidebarGroup
              className={cn(
                "flex gap-2",
                isOpen ? "flex-row flex-wrap w-full" : "flex-col items-center"
              )}
            >
              {/* Block View Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    onClick={() => handleChangeViewMode("month")}
                    size={isOpen ? "default" : "icon"}
                    className={cn(isOpen ? "flex-grow basis-1/3 justify-center" : "w-9 h-9")}
                    aria-label="Block View"
                    disabled={!planToDisplay} // Disable if no plan data
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
                    className={cn(isOpen ? "flex-grow basis-1/3 justify-center" : "w-9 h-9")}
                    aria-label="Weekly View"
                    disabled={!planToDisplay} // Disable if no plan data
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
            </SidebarGroup>
            {/* End View Toggles Group */}

            {/* Selectors (Only when expanded and plan active) */}
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
                    weeks={planToDisplay.weeks?.map((w) => w.weekNumber) || []}
                    selectedWeek={selectedWeek}
                    onSelectWeek={(num) => selectWeek(num)}
                    variant="sidebar"
                    getWeekInfo={getWeekInfo}
                  />
                )}
              </div>
            )}

            {/* Legend (Only when expanded, plan active, and week types exist) */}
            {isOpen && planToDisplay && weekTypes.length > 0 && (
              <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                <h4 className="font-medium mb-2 px-2">Week Types</h4>
                <WeekTypeLegend weekTypes={weekTypes} className="px-2" />
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter
        className={cn(
          "mt-auto flex flex-col gap-0.5",
          isOpen ? "p-3 border-t" : "p-1 items-center border-t"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isOpen ? "sm" : "icon"}
              onClick={openInfoDialog}
              className={cn("w-full h-9", isOpen ? "justify-start" : "justify-center")}
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
      </SidebarFooter>
    </>
  )
}

// Make sure PlanItemContent component (likely defined in './plan-switcher' or similar)
// is correctly implemented and handles its own actions (like delete/view JSON)
// potentially using context or props passed down.
