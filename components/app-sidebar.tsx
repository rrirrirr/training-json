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

// Consider defining or importing a more specific PlanMetadata type globally
interface PopulatedPlanMetadata extends PlanMetadata {
  id: string
  name: string
  lastModified?: string | null
}

export default function AppSidebar({ handleToggleResize }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

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
  const { state, isMobile } = useSidebar()
  const isOpen = state === "expanded"
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  const { open: openNewPlanModal } = useNewPlanModal()

  const [showAnimation, setShowAnimation] = useState(false)
  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    } else {
      isMounted.current = true
    }
  }, [isOpen])

  // Set Week Types based on the currently displayed plan
  useEffect(() => {
    const currentPlan = mode !== "normal" ? draftPlan : activePlan
    if (currentPlan?.weekTypes && currentPlan.weekTypes.length > 0) {
      setWeekTypes(currentPlan.weekTypes)
    } else {
      setWeekTypes([]) // Clear if no plan or plan has no week types
    }
  }, [activePlan, draftPlan, mode])

  const planToDisplay = mode !== "normal" ? draftPlan : activePlan
  const desktopListLimit = 8
  const desktopListItems = planMetadataList.slice(0, desktopListLimit)
  const dropdownListLimit = 8

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
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  )

  const showInlineList = isMobile || (isOpen && !isMobile && (isRootRoute || !planToDisplay))
  const showDropdownTrigger = isOpen && !isMobile && !isRootRoute && !!planToDisplay
  const showCollapsedTrigger = !isOpen && !isMobile
  const renderDropdownContent = showDropdownTrigger || showCollapsedTrigger

  return (
    <>
      {/* Absolute Toggle Button - RENDER ONLY WHEN OPEN on DESKTOP */}
      {!isMobile && isOpen && (
        <ToggleButton className={cn("absolute top-2 right-2 z-50 hidden md:block")} />
      )}

      {/* Header */}
      <SidebarHeader
        className={cn(
          "flex items-center relative flex-shrink-0",
          isOpen || isMobile ? "my-4 px-4 justify-start" : "my-0 py-4 justify-center flex-col"
        )}
      >
        <div
          className={cn(
            "flex-shrink min-w-0",
            isOpen || isMobile ? "overflow-hidden md:mr-10" : "text-center pt-3"
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

      {/* Content Area */}
      <SidebarContent className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
        {/* Plan Management Section */}
        <SidebarGroup
          className={cn(
            "pb-2 flex-shrink-0",
            isOpen || isMobile ? "px-3" : "px-1 flex flex-col items-center"
          )}
        >
          {/* New Plan Button */}
          {!planToDisplay && (
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

          {/* Plan Dropdown / List Logic */}
          <DropdownMenu>
            <div className={cn(isOpen || isMobile ? "w-full" : "w-auto")}>
              {showInlineList && (
                <div className="w-full flex flex-col gap-1 mt-2">
                  <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">
                    Recent Plans
                  </h3>
                  {desktopListItems.length > 0 ? (
                    desktopListItems.map((plan) => (
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
                        draggable="false"
                      >
                        <span className="mr-auto pl-2 py-1">View All Plans</span>
                        <ChevronRight className="size-4 ml-1 text-muted-foreground" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* CASE 2: Dropdown Trigger */}
              {showDropdownTrigger && (
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full justify-start text-left mt-2 px-2 text-md",
                      mode !== "normal" && "font-semibold",
                      mode === "edit" &&
                        "bg-yellow-100/50 border-yellow-400 text-yellow-800 hover:bg-yellow-100",
                      mode === "view" &&
                        "bg-blue-100/50 border-blue-400 text-blue-800 hover:bg-blue-100"
                    )}
                  >
                    <GalleryVerticalEnd className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 mr-1">{triggerPlanName}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              )}

              {/* CASE 3: Collapsed Icon Trigger */}
              {showCollapsedTrigger && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="w-9 h-9 mt-1">
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

            {/* Dropdown Content */}
            {renderDropdownContent && (
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
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
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
                  <DropdownMenuItem disabled className="text-muted-foreground italic">
                    No plans found
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                {planMetadataList.length > dropdownListLimit && (
                  <DropdownMenuItem asChild>
                    <div className="flex w-full items-center px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer">
                      <Link
                        href="/plans"
                        passHref
                        className={cn(
                          "flex flex-grow items-center",
                          "text-sm font-medium",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                        )}
                        onClick={(e) => {
                          if (mode === "edit") {
                            e.preventDefault()
                            openSwitchWarningDialog("/plans")
                          }
                        }}
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

        {/* Active Plan Navigation Section */}
        {planToDisplay && (
          <div
            className={cn(
              "hidden md:flex flex-col flex-grow gap-2 my-4", // Use my-4 for vertical margin
              isOpen ? "px-3" : "px-1 items-center"
            )}
          >
            {isOpen && <Separator className="mb-3 flex-shrink-0" />}

            {/* View Toggles */}
            <SidebarGroup
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
                    <List className={cn("h-4 w-4", isOpen && "mr-2")} />
                    {isOpen && "Weekly View"}
                    {!isOpen && <span className="sr-only">Weekly View</span>}
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" align="center">
                    Weekly View
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarGroup>

            {/* Selectors */}
            {isOpen && planToDisplay && (
              <div className="mt-2 w-full flex-shrink-0">
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

            {/* Legend Section */}
            {isOpen && planToDisplay && weekTypes && weekTypes.length > 0 && (
              <div className="mt-auto pt-3 border-t text-sm text-muted-foreground flex-shrink-0">
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
          "border-t flex gap-1 flex-shrink-0",
          isOpen || isMobile
            ? "p-3 flex-row justify-start items-center"
            : "p-1 flex-col items-center"
        )}
      >
        {!isMobile && !isOpen && <ToggleButton />}
        {(isOpen || isMobile) && <div className="flex-grow"></div>}

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
