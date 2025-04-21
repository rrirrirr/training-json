"use client"

import {
  Calendar,
  List,
  Info,
  Plus,
  GalleryVerticalEnd,
  ChevronsUpDown,
  ChevronRight,
  Settings,
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
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
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
import { WeekType, type PlanMetadata, type TrainingPlanData } from "@/types/training-plan"
import { useRouter, usePathname } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
import { PlanItemContent } from "./plan-switcher"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

interface AppSidebarProps {
  handleToggleResize?: () => void
}

interface PopulatedPlanMetadata extends PlanMetadata {
  id: string
  name: string
  lastModified?: string | null
}

export default function AppSidebar({ handleToggleResize }: AppSidebarProps) {
  // --- Hooks, State, Utils ---
  const router = useRouter()
  const pathname = usePathname()
  const activePlan = usePlanStore((state) => state.activePlan)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore(
    (state) => state.planMetadataList as PopulatedPlanMetadata[]
  )
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectMonth = usePlanStore((state) => state.selectMonth)
  const setViewMode = usePlanStore((state) => state.setViewMode)
  const { mode, draftPlan, originalPlanId } = usePlanMode()
  const { openInfoDialog, openSettingsDialog, openSwitchWarningDialog } = useUIState()
  const { state: sidebarState, isMobile } = useSidebar()
  const isOpen = sidebarState === "expanded"
  const { open: openNewPlanModal } = useNewPlanModal()
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  const [showAnimation, setShowAnimation] = useState(false)
  const isMounted = useRef(false)
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false)

  // --- Effects ---
  useEffect(() => {
    if (isMounted.current && !isMobile && handleToggleResize) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    } else {
      isMounted.current = true
    }
  }, [isOpen, isMobile, handleToggleResize])
  useEffect(() => {
    const currentPlan = mode !== "normal" ? draftPlan : activePlan
    setWeekTypes(currentPlan?.weekTypes?.filter((wt) => wt) || [])
  }, [activePlan, draftPlan, mode])

  const planToDisplay: TrainingPlanData | null | undefined =
    mode !== "normal" ? draftPlan : activePlan
  const isRootRoute = pathname === "/"

  // --- Utility Functions ---
  const desktopListLimit = 8
  const dropdownListLimit = 8
  const recentPlansToShow = planMetadataList.slice(0, desktopListLimit)
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
    if (typeof setViewMode === "function") setViewMode(newMode)
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
    const targetHref = `/plan/${planId}`
    if (planId === activePlanId && mode === "normal" && pathname === targetHref) {
      e.preventDefault()
      return
    }
    if (mode === "edit" && planId !== originalPlanId) {
      e.preventDefault()
      openSwitchWarningDialog(targetHref)
      return
    }
  }
  const handleViewAllClick = (e: React.MouseEvent) => {
    if (mode === "edit") {
      e.preventDefault()
      openSwitchWarningDialog("/plans")
    }
  }
  const handleDropdownPlanClick = (e: React.MouseEvent, planId: string) => {
    handlePlanLinkClick(e, planId)
    setIsPlanDropdownOpen(false)
  }
  const handleDropdownViewAllClick = (e: React.MouseEvent) => {
    handleViewAllClick(e)
    setIsPlanDropdownOpen(false)
  }

  // --- Plan Switcher Trigger Text Logic ---
  let triggerPlanName = "Select Plan"
  if (mode === "edit") {
    triggerPlanName = `Editing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (mode === "view") {
    triggerPlanName = `Viewing: ${draftPlan?.metadata?.planName || "Unnamed Plan"}`
  } else if (activePlanId) {
    const currentMeta = planMetadataList.find((p) => p.id === activePlanId)
    triggerPlanName = currentMeta?.name || "Loading Plan..."
  } else if (!planMetadataList || planMetadataList.length === 0) {
    triggerPlanName = "No Plans Available"
  }

  // --- Toggle Button Component ---
  const ToggleButton = ({ className }: { className?: string }) =>
    handleToggleResize ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleResize}
            className={cn("h-8 w-8", showAnimation && "animate-blink-icon-once", className)}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Toggle Sidebar
        </TooltipContent>
      </Tooltip>
    ) : null

  // --- Visibility Logic ---
  const shouldShowCreateButton = isMobile || (!isMobile && isRootRoute)
  const shouldShowInlineList = isMobile || (!isMobile && isRootRoute && isOpen)
  const shouldShowPlanRelatedTriggers = !isMobile && !isRootRoute && !!planToDisplay
  const shouldShowDropdownTrigger = shouldShowPlanRelatedTriggers && isOpen
  const shouldShowCollapsedTrigger = shouldShowPlanRelatedTriggers && !isOpen
  const shouldRenderDropdownContent = shouldShowPlanRelatedTriggers
  const shouldShowActivePlanNav = !isMobile && !isRootRoute && !!planToDisplay

  // --- RENDER ---
  return (
    <>
      {!isMobile && isOpen && handleToggleResize ? (
        <ToggleButton className={cn("absolute top-2 right-2 z-50 hidden md:block")} />
      ) : null}

      <SidebarHeader
        className={cn(
          "flex items-center relative flex-shrink-0",
          isOpen || isMobile ? "my-4 px-4 justify-start" : "my-0 py-4 flex-col"
        )}
      >
        <div
          className={cn(
            "flex-shrink min-w-0",
            isOpen || isMobile ? "overflow-hidden md:mr-10" : "text-center pt-3 px-1"
          )}
        >
          <Link
            href="/"
            passHref
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              isOpen || isMobile ? "block truncate" : "inline-block"
            )}
          >
            <h1
              className={cn(
                "font-bold text-primary font-archivo-black",
                isOpen || isMobile ? "text-3xl whitespace-nowrap" : "text-2xl"
              )}
            >
              {isOpen || isMobile ? "T-JSON" : "T"}
            </h1>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col flex-grow min-h-0">
        {/* Plan Management: Revert to items-center when collapsed */}
        <SidebarGroup
          className={cn(
            "pb-2 flex-shrink-0",
            isOpen || isMobile ? "px-3" : "px-1 flex flex-col items-center" // REVERTED to items-center
          )}
        >
          {shouldShowCreateButton && (
            <div className={cn("mb-2", isOpen || isMobile ? "w-full" : "w-auto")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size={isOpen || isMobile ? "sm" : "icon"}
                    className={cn(isOpen || isMobile ? "w-full justify-start" : "w-9 h-9")}
                    onClick={() => openNewPlanModal()}
                  >
                    <Plus className={cn("h-4 w-4", (isOpen || isMobile) && "mr-2")} />
                    {(isOpen || isMobile) && "New Plan (AI)"}
                    {!(isOpen || isMobile) && <span className="sr-only">New Plan (AI)</span>}
                  </Button>
                </TooltipTrigger>
                {!isOpen && !isMobile && (
                  <TooltipContent side="right" align="center">
                    New Plan (AI)
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
          {shouldShowInlineList && (
            <div className="w-full flex flex-col gap-1 mt-2">
              <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">
                Recent Plans
              </h3>
              {recentPlansToShow.length > 0 ? (
                recentPlansToShow.map((plan) => (
                  <PlanItemContent
                    key={plan.id}
                    plan={plan}
                    isActive={plan.id === activePlanId && mode === "normal"}
                    formatDate={formatDate}
                    onLinkClick={handlePlanLinkClick}
                  />
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No plans found</div>
              )}
              <Separator className="my-1" />
              {planMetadataList.length > desktopListLimit && (
                <div className="mt-1">
                  <Link
                    href="/plans"
                    passHref
                    className={cn(
                      "flex w-full items-center px-2 py-1.5",
                      "text-sm font-medium",
                      "hover:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      "rounded-sm",
                      "cursor-pointer"
                    )}
                    onClick={handleViewAllClick}
                    draggable="false"
                  >
                    <span className="mr-auto pl-2 py-1">View All Plans</span>
                    <ChevronRight className="size-4 ml-1 text-muted-foreground" />
                  </Link>
                </div>
              )}
            </div>
          )}
          <DropdownMenu open={isPlanDropdownOpen} onOpenChange={setIsPlanDropdownOpen}>
            <div className={cn(isOpen || isMobile ? "w-full" : "w-auto")}>
              {shouldShowDropdownTrigger && (
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full justify-start text-left mt-2 px-2 text-md",
                      mode !== "normal" && "font-semibold",
                      mode === "edit" &&
                        "bg-yellow-100/50 border-yellow-400 text-yellow-800 hover:bg-yellow-100 focus-visible:ring-yellow-500",
                      mode === "view" &&
                        "bg-blue-100/50 border-blue-400 text-blue-800 hover:bg-blue-100 focus-visible:ring-blue-500"
                    )}
                    disabled={planMetadataList.length === 0 && mode === "normal"}
                  >
                    <GalleryVerticalEnd className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 mr-1">{triggerPlanName}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              )}
              {/* Collapsed trigger is centered by parent group's items-center now */}
              {shouldShowCollapsedTrigger && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className={cn("w-9 h-9 mt-1")}>
                        <GalleryVerticalEnd className="h-4 w-4" />
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
            {shouldRenderDropdownContent && (
              <DropdownMenuContent
                align="start"
                sideOffset={isOpen ? 4 : 10}
                alignOffset={isOpen ? 0 : -5}
                className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width] max-h-[60vh] overflow-y-auto"
              >
                {planMetadataList.slice(0, dropdownListLimit).map((plan) => (
                  <DropdownMenuItem
                    key={plan.id}
                    className="p-0 focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent cursor-default"
                  >
                    <PlanItemContent
                      plan={plan}
                      isActive={plan.id === activePlanId && mode === "normal"}
                      formatDate={formatDate}
                      onLinkClick={handleDropdownPlanClick}
                    />
                  </DropdownMenuItem>
                ))}
                {planMetadataList.length === 0 && (
                  <DropdownMenuItem disabled className="text-muted-foreground italic">
                    No plans found
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                {planMetadataList.length > dropdownListLimit && (
                  <DropdownMenuItem asChild className="p-0">
                    <div className="flex w-full items-center px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer data-[highlighted]:bg-muted">
                      <Link
                        href="/plans"
                        passHref
                        className={cn(
                          "flex flex-grow items-center",
                          "text-sm font-medium",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                        )}
                        onClick={handleDropdownViewAllClick}
                        draggable="false"
                      >
                        <span className="mr-auto pl-2 py-1">View All Plans</span>
                        <ChevronRight className="size-4 ml-1 text-muted-foreground" />
                      </Link>
                    </div>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    openNewPlanModal()
                    setIsPlanDropdownOpen(false)
                  }}
                  className="p-2 flex items-center gap-2 cursor-pointer text-primary hover:bg-primary/10 focus:bg-primary/10 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create New Plan</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </SidebarGroup>

        {shouldShowActivePlanNav && (
          // Revert this group to items-center when collapsed
          <SidebarGroup
            className={cn(
              "flex-1 min-h-0 flex flex-col gap-2 my-4",
              isOpen ? "px-3" : "px-1 items-center"
            )}
          >
            {isOpen && <Separator className="mb-3 flex-shrink-0" />}
            {/* Revert view toggles container to items-center when collapsed */}
            <div
              className={cn(
                "flex gap-2 flex-shrink-0",
                isOpen ? "flex-row flex-wrap w-full" : "flex-col items-center"
              )}
            >
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
                    {!isOpen && <span className="sr-only">Block View</span>}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    Block View
                  </TooltipContent>
                )}
              </Tooltip>
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
                    <List className={cn("h-4 w-4", isOpen && "mr-2")} /> {isOpen && "Weekly View"}
                    {!isOpen && <span className="sr-only">Weekly View</span>}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    Weekly View
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Internal scrolling container logic remains */}
            {isOpen && (
              <div className="mt-2 w-full flex-1 min-h-0 overflow-y-auto pr-2">
                {viewMode === "month" ? (
                  <BlockSelector
                    blocks={planToDisplay?.monthBlocks || []}
                    selectedBlockId={selectedMonth}
                    onSelectBlock={selectMonth}
                    variant="sidebar"
                  />
                ) : (
                  <WeekSelector
                    weeks={planToDisplay?.weeks?.map((w) => w.weekNumber) || []}
                    selectedWeek={selectedWeek}
                    onSelectWeek={selectWeek}
                    variant="sidebar"
                    getWeekInfo={getWeekInfo}
                  />
                )}
              </div>
            )}

            {/* Legend remains the same */}
            {isOpen && weekTypes.length > 0 && (
              <div className="pt-3 border-t text-sm text-muted-foreground flex-shrink-0 mt-4">
                <h4 className="font-medium mb-2 px-2">Week Types</h4>
                <WeekTypeLegend weekTypes={weekTypes} className="px-2" />
              </div>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: Revert to items-center when collapsed */}
      <SidebarFooter
        className={cn(
          "border-t flex gap-1 flex-shrink-0",
          isOpen || isMobile
            ? "p-3 flex-row justify-start items-center"
            : "p-1 flex-col items-center"
        )}
      >
        {!isMobile && !isOpen && handleToggleResize && <ToggleButton className="mb-1" />}
        {(isOpen || isMobile) && <div className="flex-grow"></div>}
        {/* Remove inner div wrapper, let footer center items directly */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openInfoDialog}
              className="h-9 w-9"
              aria-label="Information"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isOpen || isMobile ? "top" : "right"} align="center">
            About T-JSON
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettingsDialog}
              className="h-9 w-9"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isOpen || isMobile ? "top" : "right"} align="center">
            Settings
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </>
  )
}
