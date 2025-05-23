// components/app-sidebar.tsx

"use client"

// Import necessary components and icons
import {
  Calendar,
  List,
  Info,
  Plus,
  GalleryVerticalEnd,
  ChevronsUpDown,
  MoreVertical,
  Copy,
  ChevronRight,
  Settings,
  Eye,
  Edit,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
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
// Import DropdownMenu components needed here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
// *** ADDED useEffect and useState imports ***
import { useEffect, useState, useRef } from "react"
import type { WeekType, TrainingPlanData } from "@/types/training-plan"
import type { PlanMetadata } from "@/store/plan-store" // Import PlanMetadata
// *** ADDED usePathname import ***
import { useRouter, usePathname } from "next/navigation"
import { usePlanStore } from "@/store/plan-store"
// Import the updated PlanSwitcher component AND PlanSwitcherItem
import { PlanSwitcher, PlanSwitcherItem } from "./plan-switcher" // *** IMPORT PlanSwitcherItem ***
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

interface AppSidebarProps {
  handleToggleResize?: () => void
}

export default function AppSidebar({ handleToggleResize }: AppSidebarProps) {
  // --- Hooks, State, Utils ---
  const router = useRouter()
  const pathname = usePathname() // Get current pathname
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList as PlanMetadata[])
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const selectedBlock = usePlanStore((state) => state.selectedBlock)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectBlock = usePlanStore((state) => state.selectBlock)
  const setViewMode = usePlanStore((state) => state.setViewMode)
  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const {
    openInfoDialog,
    openSettingsDialog,
    openSwitchWarningDialog,
    openDeleteDialog,
    openJsonEditor, // Get functions to open dialogs/editor
  } = useUIState()
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar()
  console.log(`--- AppSidebar RENDER --- State: ${sidebarState}`)
  const { toast } = useToast()
  const isOpen = sidebarState === "expanded"
  const { open: openNewPlanModal } = useNewPlanModal()
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  const [showAnimation, setShowAnimation] = useState(false)
  const isMounted = useRef(false)
  // State for plan dropdown visibility
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false)
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById) // Get fetch action
  // Keep track of the previous pathname to detect changes
  const previousPathnameRef = useRef(pathname)

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
    const currentPlanData = mode !== "normal" ? draftPlan : usePlanStore.getState().activePlan
    setWeekTypes(currentPlanData?.weekTypes?.filter((wt) => wt) || [])
  }, [mode, draftPlan, activePlanId]) // Re-run if activePlan changes too

  // *** ADDED EFFECT to close dropdown on navigation ***
  useEffect(() => {
    if (isPlanDropdownOpen && pathname !== previousPathnameRef.current) {
      // Regex to check if the path is /plan/.../edit
      const isEditPage = /^\/plan\/[^/]+\/edit$/.test(pathname)
      // Regex to check if the previous path was a plan view page
      const wasPlanPage = /^\/plan\/[^/]+$/.test(previousPathnameRef.current)

      // Close if navigating TO an edit page OR navigating AWAY from a plan page (but not to edit)
      if (isEditPage || (wasPlanPage && !isEditPage)) {
        console.log("[AppSidebar Effect] Path changed, closing plan dropdown.")
        setIsPlanDropdownOpen(false)
      }
    }
    // Update the ref to the current pathname for the next check
    previousPathnameRef.current = pathname
  }, [pathname, isPlanDropdownOpen]) // Depend on pathname and dropdown state

  const planToDisplay: TrainingPlanData | null | undefined =
    mode !== "normal" ? draftPlan : usePlanStore.getState().activePlan
  const isRootRoute = pathname === "/"

  // --- Utility Functions ---
  const desktopListLimit = 8
  const dropdownListLimit = 8 // Limit used by PlanSwitcher inside dropdown
  // Slice the list for the inline display on the root route
  const recentPlansToShow = planMetadataList.slice(0, desktopListLimit)

  // Function to copy URL to clipboard
  const copyUrlToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "URL Copied",
        description: "The link has been copied to your clipboard",
      })
    }
  }

  const getWeekInfo = (weekNumber: number) => {
    const currentPlanData = mode !== "normal" ? draftPlan : usePlanStore.getState().activePlan
    const weekData = currentPlanData?.weeks?.find((w) => w.weekNumber === weekNumber)
    return weekData
      ? {
          type: weekData.weekType || "",
          weekTypeIds: weekData.weekTypeIds || [],
          colorName: weekData.weekStyle?.colorName,
        }
      : { type: "", weekTypeIds: [], colorName: undefined }
  }

  const handleChangeViewMode = (newMode: "week" | "block") => {
    if (typeof setViewMode === "function") setViewMode(newMode)
  }

  // formatDate might still be useful elsewhere, keep it for now
  const formatDate = (dateString: string | null | undefined): string => {
    const locale = "sv-SE" // Use Swedish locale
    return dateString
      ? new Date(dateString).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A"
  }

  // Handles warning in edit mode for plan links (both inline and dropdown)
  const handlePlanLinkClick = (e: React.MouseEvent, planId: string) => {
    const currentActivePlanId = usePlanStore.getState().activePlanId
    // Prevent navigation if clicking the already active plan in normal mode
    if (planId === currentActivePlanId && mode === "normal") {
      e.preventDefault()
      setIsPlanDropdownOpen(false) // Close dropdown if open
      return
    }
    // Show warning if in edit mode
    if (mode === "edit") {
      // If this is the same plan that's being edited, navigate to its edit page instead of showing warning
      if (planId === originalPlanId) {
        // Always prevent the default link behavior first
        e.preventDefault()

        const targetEditPath = `/plan/${planId}/edit`
        const currentPath = pathname // Assumes pathname is available from usePathname hook

        // Only navigate if we are NOT already on the target edit page
        if (currentPath !== targetEditPath) {
          console.log(`[AppSidebar] Navigating to edit page for current plan: ${targetEditPath}`)
          router.push(targetEditPath) // Use router.push for client-side nav
        } else {
          // If already on the edit page, maybe just ensure menus close
          console.log(`[AppSidebar] Already on edit page for ${planId}. Closing menus.`)
        }

        // Close menus regardless of navigation
        setIsPlanDropdownOpen(false)
        setOpenMobile(false) // Assuming setOpenMobile controls mobile sidebar/sheet

        return // Important: Stop further execution of the handler
      }

      // Otherwise show warning for switching to a different plan
      const targetPlanPath = `/plan/${planId}`
      e.preventDefault()
      openSwitchWarningDialog(targetPlanPath)
      setIsPlanDropdownOpen(false) // Close dropdown if open
      setOpenMobile(false)
      return
    }

    setOpenMobile(false)
    // Close dropdown in normal mode when navigating
    setIsPlanDropdownOpen(false)
    // Let the Link component handle the navigation if no warning/block
  }

  // Handles "View All" click (both inline and dropdown)
  const handleViewAllClick = (e: React.MouseEvent) => {
    if (mode === "edit") {
      e.preventDefault()
      openSwitchWarningDialog("/plans")
      setIsPlanDropdownOpen(false)
    } else {
      setIsPlanDropdownOpen(false)
      // Let the Link component handle navigation
    }
  }

  // --- Plan Switcher Trigger Text Logic ---
  let triggerPlanName = "Select Plan"
  // Get the plan name without "Editing:" or "Viewing:" prefix
  let planNameOnly = ""

  if (mode === "edit") {
    planNameOnly = draftPlan?.metadata?.planName || "Unnamed Plan"
    triggerPlanName = planNameOnly
  } else if (mode === "view") {
    planNameOnly = draftPlan?.metadata?.planName || "Shared Plan"
    triggerPlanName = planNameOnly
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
            className={cn("h-4 w-4", showAnimation && "animate-blink-icon-once", className)}
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
  const shouldShowInlineList = (isMobile && isOpen) || (isRootRoute && isOpen)
  const shouldShowPlanRelatedTriggers = !isRootRoute
  const shouldShowDropdownTrigger = !isMobile && !isRootRoute && isOpen
  const shouldShowCollapsedTrigger = !isRootRoute && !isOpen && !isMobile
  const shouldRenderDropdownContent = !isRootRoute && !isMobile
  const shouldShowActivePlanNav = !isMobile && !isRootRoute && !!planToDisplay

  // --- RENDER ---
  return (
    <>
      {/* Toggle button absolutely positioned */}
      {!isMobile && isOpen && handleToggleResize ? (
        <ToggleButton className={cn("absolute top-2 right-2 z-50 hidden md:block")} />
      ) : null}

      <SidebarHeader
        className={cn(
          "flex items-center relative flex-shrink-0",
          isOpen || isMobile ? "my-4 px-4 justify-start" : "my-0 py-4 flex-col max-w-[48px]"
        )}
      >
        <div
          className={cn(
            "flex-shrink min-w-0",
            isOpen || isMobile ? "overflow-hidden" : "text-center pt-3 px-1"
          )}
        >
          <Link
            href="/"
            passHref
            className={cn(
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
              isOpen || isMobile ? "block truncate" : "inline-block"
            )}
            // Close dropdown if navigating home
            onClick={() => setIsPlanDropdownOpen(false)}
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
        {/* Plan Management Area */}
        <SidebarGroup
          className={cn(
            "pb-2 flex-shrink-0",
            isOpen || isMobile ? "px-3" : "px-1 flex flex-col items-center"
          )}
        >
          {/* New Plan Button */}
          {((isOpen && isRootRoute) || isMobile) && ( // Only show button text when open or mobile
            <div className={cn("mb-2", isOpen || isMobile ? "w-full" : "w-auto")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size={isOpen || isMobile ? "sm" : "icon"}
                    className={cn(
                      isOpen || isMobile ? "w-full justify-start" : "w-9 h-9",
                      "font-oswald uppercase"
                    )}
                    onClick={() => openNewPlanModal()}
                  >
                    <Plus className={cn("h-4 w-4", (isOpen || isMobile) && "mr-2")} />
                    {(isOpen || isMobile) && "New Plan"}
                    {!(isOpen || isMobile) && <span className="sr-only">New Plan</span>}
                  </Button>
                </TooltipTrigger>
                {!(isOpen || isMobile) && (
                  <TooltipContent side="right" align="center">
                    New Plan
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}

          {/* --- Dropdown Menu for Plan Switching (shown when NOT on root route) --- */}
          {shouldShowPlanRelatedTriggers && (
            // *** ADDED open and onOpenChange props ***
            <DropdownMenu open={isPlanDropdownOpen} onOpenChange={setIsPlanDropdownOpen}>
              {/* Expanded Trigger */}
              {shouldShowDropdownTrigger && (
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full justify-start text-left mt-2 px-2 text-md",
                      mode !== "normal" && "font-semibold",
                      mode === "edit" &&
                        "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)] text-[var(--edit-mode-text)] hover:bg-[var(--edit-mode-hover-bg)] focus-visible:ring-[var(--edit-mode-text)]",
                      mode === "view" &&
                        "bg-[var(--view-mode-bg)] border-[var(--view-mode-border)] text-[var(--view-mode-text)] hover:bg-[var(--view-mode-hover-bg)] focus-visible:ring-[var(--view-mode-text)]",
                      planMetadataList.length === 0 && mode === "normal" && "text-muted-foreground"
                    )}
                    disabled={planMetadataList.length === 0 && mode === "normal"}
                    data-testid="plan-switcher-trigger"
                  >
                    {mode === "edit" ? (
                      <Edit className="mr-2 h-4 w-4 shrink-0" />
                    ) : mode === "view" ? (
                      <Eye className="mr-2 h-4 w-4 shrink-0" />
                    ) : (
                      <GalleryVerticalEnd className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate flex-1 mr-1">{triggerPlanName}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              )}
              {/* Collapsed Trigger */}
              {shouldShowCollapsedTrigger && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "w-9 h-9 mt-1",
                          mode === "edit" &&
                            "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)] text-[var(--edit-mode-text)] hover:bg-[var(--edit-mode-hover-bg)] focus-visible:ring-[var(--edit-mode-text)]",
                          mode === "view" &&
                            "bg-[var(--view-mode-bg)] border-[var(--view-mode-border)] text-[var(--view-mode-text)] hover:bg-[var(--view-mode-hover-bg)] focus-visible:ring-[var(--view-mode-text)]"
                        )}
                      >
                        {mode === "edit" ? (
                          <Edit className="h-4 w-4" />
                        ) : mode === "view" ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <GalleryVerticalEnd className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {mode === "edit"
                            ? "Editing Plan"
                            : mode === "view"
                              ? "Viewing Plan"
                              : "Select Plan"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {triggerPlanName}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Dropdown Content */}
              {shouldRenderDropdownContent && (
                <DropdownMenuContent
                  align="start"
                  sideOffset={isOpen && !isMobile ? 4 : 10}
                  alignOffset={isOpen && !isMobile ? 0 : -5}
                  className="min-w-[300px] w-[--radix-dropdown-menu-trigger-width] max-h-[60vh] overflow-y-auto p-0" // No padding on content itself
                >
                  {/* Use PlanSwitcher to render the list and actions */}
                  <PlanSwitcher
                    plans={planMetadataList}
                    activePlanId={activePlanId}
                    mode={mode}
                    limit={dropdownListLimit}
                    showCreateButton={true} // Show create button inside dropdown
                    onPlanLinkClick={handlePlanLinkClick}
                    onViewAllClick={handleViewAllClick}
                    // Pass onClose if needed: onClose={() => setIsPlanDropdownOpen(false)}
                  />
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          )}

          {/* Inline list shown ONLY on desktop root when sidebar is open */}
          {shouldShowInlineList && (
            <div className="w-full flex flex-col gap-y-0.5 mt-4 border-t pt-4">
              <h3 className="text-sm font-semibold px-2 py-1 text-muted-foreground mb-1">
                Recent Plans
              </h3>
              {/* Render the list using PlanSwitcherItem */}
              {recentPlansToShow.length > 0 ? (
                recentPlansToShow.map((plan) => (
                  // *** USE PlanSwitcherItem DIRECTLY ***
                  <PlanSwitcherItem
                    key={plan.id}
                    plan={plan}
                    isActive={plan.id === activePlanId && mode === "normal"}
                    onLinkClick={handlePlanLinkClick} // Use existing handler
                    className="px-1"
                  />
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                  No plans found
                </div>
              )}
              {/* View All Plans Link - Styling matches PlanSwitcher */}
              {planMetadataList.length > desktopListLimit && (
                <div className={cn("px-2 py-2 rounded-sm", "hover:bg-accent")}>
                  <Link
                    href="/plans"
                    passHref
                    className={cn(
                      "flex w-full items-center text-sm text-muted-foreground outline-none",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    )}
                    onClick={handleViewAllClick}
                    draggable="false"
                  >
                    <span className="mr-auto">View All Plans</span>
                    <ChevronRight className="size-4 ml-2" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </SidebarGroup>

        {/* Active Plan Navigation (Week/Block selectors etc.) */}
        {shouldShowActivePlanNav && (
          <SidebarGroup
            className={cn(
              "flex-1 min-h-0 flex flex-col gap-2 my-4",
              isOpen ? "px-3" : "px-1 items-center"
            )}
          >
            {isOpen && <Separator className="mb-3 flex-shrink-0" />}
            {/* View Mode Buttons */}
            <div
              className={cn(
                "flex gap-2 flex-shrink-0",
                isOpen ? "flex-row flex-wrap w-full" : "flex-col items-center"
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "block" ? "default" : "outline"}
                    onClick={() => handleChangeViewMode("block")}
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
            {/* Week/Block Selectors (only when open) */}
            {isOpen && (
              <div className="mt-2 w-full flex-1 min-h-0 overflow-y-auto pr-2">
                {viewMode === "block" ? (
                  <BlockSelector
                    blocks={planToDisplay?.blocks || []}
                    selectedBlockId={selectedBlock}
                    onSelectBlock={selectBlock}
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
            {/* Week Type Legend (only when open) */}
            {isOpen && weekTypes.length > 0 && (
              <div className="pt-3 border-t text-sm text-muted-foreground flex-shrink-0 mt-4">
                <h4 className="font-medium mb-2 px-2">Week Types</h4>
                <WeekTypeLegend weekTypes={weekTypes} className="px-2" />
              </div>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "border-t flex gap-1 flex-shrink-0",
          isOpen || isMobile
            ? "p-3 flex-row-reverse justify-start items-center"
            : "p-1 flex-col items-center"
        )}
      >
        {/* Collapsed toggle button */}
        {!isMobile && !isOpen && handleToggleResize && <ToggleButton className="h-9 w-9" />}

        {/* More Options Dropdown (moved from AppHeader) */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side={isOpen || isMobile ? "top" : "right"} align="center">
              More Options
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align={isOpen || isMobile ? "end" : "right"} sideOffset={5}>
            <DropdownMenuItem onClick={copyUrlToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy URL</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        {(isOpen || isMobile) && <div className="flex-grow"></div>}
        {/* Info Button */}
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
        {/* Settings Button */}
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
