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
  Settings,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
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
import { useEffect, useState, useRef } from "react"
import { WeekType, type PlanMetadata } from "@/types/training-plan"
import { useRouter, usePathname } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
import { PlanItemContent } from "./plan-switcher"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

interface AppSidebarProps {
  handleToggleResize: () => void
}

export default function AppSidebar({ handleToggleResize }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

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
  const {
    openInfoDialog,
    openSettingsDialog,
    openSwitchWarningDialog,
    openDeleteDialog,
    openJsonEditor,
  } = useUIState()
  const { state, isMobile } = useSidebar()
  const isOpen = state === "expanded"
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  const { open: openNewPlanModal } = useNewPlanModal()

  // --- State for Animation ---
  const [showAnimation, setShowAnimation] = useState(false)
  const isMounted = useRef(false)

  // --- Effect to Trigger Animation ---
  useEffect(() => {
    if (isMounted.current) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    } else {
      isMounted.current = true
    }
  }, [isOpen])

  // --- (Other state, effects, helpers remain the same) ---
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan
  const desktopListLimit = 10
  const desktopListItems = planMetadataList.slice(0, desktopListLimit)
  const dropdownListLimit = desktopListLimit
  const getWeekInfo = (weekNumber: number) => {
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
    return dateString
      ? new Date(dateString).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A"
  }
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
  }
  let triggerPlanName = "Select Plan"
  if (mode === "edit") {
    triggerPlanName = `Editing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (mode === "view") {
    triggerPlanName = `Viewing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (activePlanId) {
    const currentMeta = planMetadataList.find((p) => p.id === activePlanId)
    triggerPlanName = currentMeta?.name || "Loading Plan..."
  }
  // --- End Helpers ---

  // Define Toggle Button JSX once, passing animation state
  const ToggleButton = ({ className }: { className?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleResize}
          className={cn("h-8 w-8", showAnimation && "animate-blink-icon-once", className)}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {/* Ensure icons don't have weird margins */}
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  )

  return (
    <>
      {/* Absolute Toggle Button - RENDER ONLY WHEN OPEN */}
      {!isMobile && isOpen && (
        <ToggleButton className={cn("absolute top-2 right-2 z-50", "hidden md:block")} />
      )}

      {/* Header */}
      <SidebarHeader
        className={cn(
          "flex items-center relative",
          isOpen ? "my-4 px-4 justify-start" : "my-0 py-4 justify-center flex-col"
        )}
      >
        {/* Title Area */}
        <div
          className={cn(
            "flex-shrink min-w-0",
            isOpen ? "overflow-hidden mr-10" : "text-center pt-3"
          )}
        >
          <Link href="/" passHref className={cn(isOpen ? "block truncate" : "inline-block")}>
            <h1
              className={cn(
                "font-bold text-primary font-archivo-black",
                isOpen ? "text-3xl whitespace-nowrap" : "text-2xl"
              )}
            >
              {isOpen ? "T-JSON" : "T"}
            </h1>
          </Link>
        </div>
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
                    variant="default"
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

          {/* Plan Dropdown */}
          <DropdownMenu>
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
                            isActive={false}
                            formatDate={formatDate}
                            onLinkClick={handlePlanLinkClick}
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
                              View All Plans <ChevronRight className="size-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    // ACTIVE PLAN: Show Dropdown Trigger (Expanded View)
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
                  )}
                </>
              ) : (
                // Collapsed View: Plan Selector Icon Trigger
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="w-9 h-9 mt-1">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Select Plan</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Select Plan
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Dropdown Content */}
            {(planToDisplay || !isOpen) && (
              <DropdownMenuContent
                align="start"
                className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width]"
              >
                {planMetadataList.slice(0, dropdownListLimit).map((plan) => (
                  <DropdownMenuItem
                    key={plan.id}
                    className="p-0 focus:bg-transparent hover:bg-transparent"
                  >
                    <PlanItemContent
                      plan={plan}
                      isActive={plan.id === activePlanId && mode === "normal"}
                      formatDate={formatDate}
                      onLinkClick={handlePlanLinkClick}
                    />
                  </DropdownMenuItem>
                ))}
                {planMetadataList.length === 0 && (
                  <DropdownMenuItem disabled>No plans found</DropdownMenuItem>
                )}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openNewPlanModal()}
                  className="p-2 flex items-center gap-2 cursor-pointer focus:bg-primary/10 hover:bg-primary/10 hover:text-primary focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create New Plan</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          {/* End DropdownMenu Wrapper */}
        </SidebarGroup>
        {/* End Plan Management Group */}

        {/* Active Plan Navigation Section */}
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
                    disabled={!planToDisplay}
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
                    disabled={!planToDisplay}
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
          "mt-auto border-t flex gap-1",
          isOpen ? "p-3 flex-row justify-start items-center" : "p-1 flex-col items-center"
        )}
      >
        {/* RENDER COLLAPSED TOGGLE BUTTON HERE */}
        {!isMobile && !isOpen && <ToggleButton />}

        {/* Info Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openInfoDialog}
              className={cn("h-9 w-9")}
              aria-label="Information"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isOpen ? "top" : "right"} align="center">
            About T-JSON
          </TooltipContent>
        </Tooltip>
        {/* Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettingsDialog}
              className={cn("h-9 w-9")}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isOpen ? "top" : "right"} align="center">
            Settings
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </>
  )
}
