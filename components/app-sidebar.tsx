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
  PanelLeftClose,
  PanelLeftOpen, // Corrected: PanelLeftOpen for consistency
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
  useSidebar, // Import useSidebar
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
import { PlanItemContent } from "./plan-switcher" // Assuming PlanItemContent is correctly exported
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
  // Removed fetchPlanMetadata as it wasn't used in the provided snippet
  const { mode, draftPlan, originalPlanId } = usePlanMode() // Removed exitMode if unused
  const {
    openInfoDialog,
    openSettingsDialog,
    openSwitchWarningDialog,
    openDeleteDialog,
    openJsonEditor,
  } = useUIState()
  const { state, isMobile } = useSidebar() // Get isMobile from context
  const isOpen = state === "expanded"
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([]) // TODO: Populate this state
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

  // --- Helpers ---
  const planToDisplay = mode !== "normal" ? draftPlan : activePlan
  const desktopListLimit = 8 // Used for inline list on desktop root/no plan/mobile
  const desktopListItems = planMetadataList.slice(0, desktopListLimit)
  const dropdownListLimit = 15 // Can be different for dropdown if needed

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
    // Allow navigation if not active or not in edit mode trying to switch
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

  // Define Toggle Button JSX once
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

  // Determine if the inline list should be shown
  const showInlineList = isMobile || (isOpen && !isMobile && (isRootRoute || !planToDisplay))
  // Determine if the dropdown trigger (expanded desktop, non-root, plan active) should be shown
  const showDropdownTrigger = isOpen && !isMobile && !isRootRoute && !!planToDisplay
  // Determine if the collapsed icon trigger (collapsed desktop) should be shown
  const showCollapsedTrigger = !isOpen && !isMobile
  // Determine if the DropdownMenu Content should be potentially rendered
  const renderDropdownContent = showDropdownTrigger || showCollapsedTrigger

  return (
    <>
      {/* Absolute Toggle Button - RENDER ONLY WHEN OPEN on DESKTOP */}
      {!isMobile && isOpen && (
        <ToggleButton className={cn("absolute top-2 right-2 z-50", "hidden md:block")} />
      )}

      {/* Header */}
      <SidebarHeader
        className={cn(
          "flex items-center relative",
          // Mobile always looks like 'expanded' header for layout purposes
          isOpen || isMobile ? "my-4 px-4 justify-start" : "my-0 py-4 justify-center flex-col"
        )}
      >
        {/* Title Area */}
        <div
          className={cn(
            "flex-shrink min-w-0",
            // Mobile always looks like 'expanded' header title area
            isOpen || isMobile ? "overflow-hidden md:mr-10" : "text-center pt-3"
          )}
        >
          <Link
            href="/"
            passHref
            className={cn(isOpen || isMobile ? "block truncate" : "inline-block")}
          >
            <h1
              className={cn(
                "font-bold text-primary font-archivo-black",
                // Mobile always looks like 'expanded' header title size
                isOpen || isMobile ? "text-3xl whitespace-nowrap" : "text-2xl"
              )}
            >
              {/* Mobile always shows full title */}
              {isOpen || isMobile ? "T-JSON" : "T"}
            </h1>
          </Link>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="flex-grow overflow-y-auto overflow-x-hidden">
        {/* Plan Management */}
        <SidebarGroup
          className={cn(
            "pb-2",
            // Mobile always uses expanded padding/layout
            isOpen || isMobile ? "px-3" : "px-1 flex flex-col items-center"
          )}
        >
          {/* New Plan Button */}
          {!planToDisplay && ( // Show if no plan is active/displayed
            <div className={cn("mb-2", isOpen || isMobile ? "w-full" : "w-auto")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size={isOpen || isMobile ? "sm" : "icon"} // Adjusted size
                    className={cn(isOpen || isMobile ? "w-full justify-start" : "w-9 h-9")}
                    onClick={() => openNewPlanModal()}
                  >
                    <Plus className={cn("h-4 w-4", (isOpen || isMobile) && "mr-2")} />
                    {(isOpen || isMobile) && "New Plan (AI)"}
                    {!(isOpen || isMobile) && <span className="sr-only">New Plan (AI)</span>}
                  </Button>
                </TooltipTrigger>
                {/* Tooltip only needed for collapsed desktop */}
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
            <div
              className={cn(
                // Adjust width based on mobile/desktop and open state
                isOpen || isMobile ? "w-full" : "w-auto"
              )}
            >
              {/* CASE 1: Show Inline List (Mobile OR Expanded Desktop on Root/No Plan) */}
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
                  {planMetadataList.length > desktopListLimit && (
                    <div className="mt-1 px-2">
                      <Link href="/plans" passHref>
                        <Button
                          variant="link"
                          size="sm"
                          className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-primary"
                        >
                          View All Plans <ChevronRight className="size-4 ml-1" />{" "}
                          {/* Added margin */}
                        </Button>
                      </Link>
                    </div>
                  )}
                  {/* Add Create New Plan button at the bottom of the list on mobile/root */}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm text-primary hover:bg-primary/10"
                    onClick={() => openNewPlanModal()}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Plan
                  </Button>
                </div>
              )}

              {/* CASE 2: Show Dropdown Trigger (Expanded Desktop, Not Root, Plan Active) */}
              {showDropdownTrigger && (
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

              {/* CASE 3: Show Collapsed Icon Trigger (Collapsed Desktop) */}
              {showCollapsedTrigger && (
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

            {/* Dropdown Content - Render if a dropdown trigger is potentially shown */}
            {renderDropdownContent && (
              <DropdownMenuContent
                align="start"
                className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width]"
              >
                {planMetadataList.slice(0, dropdownListLimit).map((plan) => (
                  <DropdownMenuItem
                    key={plan.id}
                    // Prevent default item styling/focus when content is custom
                    className="p-0 focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent"
                    // Use onSelect for navigation AFTER warning check if needed, or rely on onLinkClick
                    onSelect={(e) => {
                      // DropdownMenuItem closes by default on select.
                      // We handle the click within PlanItemContent's Link.
                      // If a warning is needed, PlanItemContent's onLinkClick prevents navigation.
                      // If no warning, the Link handles navigation.
                      // We might need to prevent default closing if warning occurs.
                      // However, PlanItemContent's click handler already prevents default on the Link event.
                      // console.log("DropdownMenuItem onSelect for", plan.id);
                    }}
                  >
                    <PlanItemContent
                      plan={plan}
                      isActive={plan.id === activePlanId && mode === "normal"}
                      formatDate={formatDate}
                      onLinkClick={handlePlanLinkClick} // This handles the logic including warnings
                    />
                  </DropdownMenuItem>
                ))}
                {planMetadataList.length === 0 && (
                  <DropdownMenuItem disabled>No plans found</DropdownMenuItem>
                )}
                {planMetadataList.length > dropdownListLimit && (
                  <DropdownMenuItem asChild>
                    <Link href="/plans" passHref className="w-full">
                      <Button
                        variant="link"
                        size="sm"
                        className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-primary"
                        // Ensure click inside dropdown item navigates
                        onClick={(e) => {
                          if (mode === "edit") {
                            e.preventDefault()
                            openSwitchWarningDialog("/plans") // Pass route instead of planId
                          } else {
                            router.push("/plans")
                          }
                        }}
                      >
                        View All Plans <ChevronRight className="size-4 ml-1" />
                      </Button>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation() // Prevent closing if interaction needed
                    openNewPlanModal()
                  }}
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

        {/* Active Plan Navigation Section - Hidden on Mobile via className */}
        {planToDisplay && (
          <div
            className={cn(
              "hidden md:flex flex-col gap-2 mt-4", // `hidden md:flex` keeps it off mobile
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
                    {!isOpen && <span className="sr-only">Block View</span>}
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
            {/* End View Toggles Group */}

            {/* Selectors (Only when expanded desktop and plan active) */}
            {isOpen &&
              planToDisplay && ( // Already correct: only expanded desktop
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

            {/* Legend (Only when expanded desktop, plan active, and week types exist) */}
            {isOpen &&
              planToDisplay &&
              weekTypes.length > 0 && ( // Already correct: only expanded desktop
                <div className="mt-4 pt-3 border-t text-sm text-muted-foreground">
                  <h4 className="font-medium mb-2 px-2">Week Types</h4>
                  <WeekTypeLegend weekTypes={weekTypes} className="px-2" />
                </div>
              )}
          </div>
        )}
        {/* End Active Plan Navigation */}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter
        className={cn(
          "mt-auto border-t flex gap-1",
          // Mobile uses expanded layout style
          isOpen || isMobile
            ? "p-3 flex-row justify-start items-center"
            : "p-1 flex-col items-center"
        )}
      >
        {/* RENDER COLLAPSED TOGGLE BUTTON HERE (Desktop only) */}
        {!isMobile && !isOpen && <ToggleButton />}

        {/* Spacer to push buttons right on expanded/mobile */}
        {(isOpen || isMobile) && <div className="flex-grow"></div>}

        {/* Info Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={openInfoDialog}
              className={cn("h-9 w-9")} // Consistent size
              aria-label="Information"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          {/* Tooltip side depends on open/mobile state */}
          <TooltipContent side={isOpen || isMobile ? "top" : "right"} align="center">
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
              className={cn("h-9 w-9")} // Consistent size
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          {/* Tooltip side depends on open/mobile state */}
          <TooltipContent side={isOpen || isMobile ? "top" : "right"} align="center">
            Settings
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </>
  )
}
