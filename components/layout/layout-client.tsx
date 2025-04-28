"use client"

import React, {
  useEffect,
  useRef,
  useCallback,
  useState, // Keep if used elsewhere
} from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelGroupHandle } from "react-resizable-panels"
import { getPanelGroupElement } from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"

// --- Configuration Constants (from your original code) ---
const PANEL_GROUP_ID = "desktop-layout-group"
const SIDEBAR_COLLAPSED_WIDTH_PX = 48
const SIDEBAR_COLLAPSE_THRESHOLD_PX = 190 // Used by handleLayout
const SIDEBAR_MAX_WIDTH_PX = 450
const SIDEBAR_DEFAULT_SIZE_PERCENT = 18
const SIDEBAR_MAX_SIZE_PERCENT = 30
// Use a very small value for the panel's internal collapsedSize prop
const SIDEBAR_INTERNAL_COLLAPSED_PERCENT = 3 // Adjust if needed (e.g., 4% might be safer)
const LAYOUT_COOKIE_NAME = "app-sidebar-layout"

// --- Type for props ---
interface LayoutClientProps {
  children: React.ReactNode
  defaultLayout?: number[]
}

// --- LayoutClient (Initial State Logic) ---
export function LayoutClient({ children, defaultLayout }: LayoutClientProps) {
  let initialOpenState = true
  // Use a threshold based on pixels or a percentage consistent with handleLayout's threshold logic
  // Let's use a percentage slightly below the equivalent of SIDEBAR_COLLAPSE_THRESHOLD_PX for safety
  // (Assuming ~1500px width, 190px is ~13%. Let's use 10% as the initial threshold)
  const INITIAL_STATE_THRESHOLD_PERCENT = 10

  if (defaultLayout && defaultLayout.length === 2) {
    if (defaultLayout[0] < INITIAL_STATE_THRESHOLD_PERCENT) {
      initialOpenState = false
      // console.log(
      //   `[LayoutClient Init] Cookie layout ${defaultLayout[0]}% < ${INITIAL_STATE_THRESHOLD_PERCENT}%. Initial state: collapsed.`
      // );
    }
  }
  return (
    <SidebarProvider defaultOpen={initialOpenState}>
      <LayoutWithSidebar defaultLayout={defaultLayout}>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

// --- Type for LayoutWithSidebar props ---
interface LayoutWithSidebarProps {
  children: React.ReactNode
  defaultLayout?: number[]
}

// --- LayoutWithSidebar (Main Logic - Based on your original) ---
function LayoutWithSidebar({ children, defaultLayout }: LayoutWithSidebarProps) {
  const { state: sidebarState, isMobile, setOpen } = useSidebar() // Renamed 'state' for clarity
  // console.log("--- LayoutWithSidebar RENDER --- Context State:", sidebarState);
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const panelGroupHandleRef = useRef<ImperativePanelGroupHandle>(null)
  const pathname = usePathname()
  const isRootRoute = pathname === "/"
  const latestLayoutRef = useRef<number[] | null>(null)
  const stateRef = useRef<string>(sidebarState) // Ref to track state for callbacks
  const isInitialMountRef = useRef(true) // Guard for initial mount

  // Calculate initial/fallback sizes
  // ** Clamp initial size based on internal collapsed percent **
  const cookieSize = defaultLayout?.[0]
  let sidebarInitialSize = cookieSize ?? SIDEBAR_DEFAULT_SIZE_PERCENT
  if (cookieSize !== undefined && cookieSize < SIDEBAR_INTERNAL_COLLAPSED_PERCENT) {
    sidebarInitialSize = SIDEBAR_INTERNAL_COLLAPSED_PERCENT
  }
  if (sidebarInitialSize > SIDEBAR_MAX_SIZE_PERCENT) {
    sidebarInitialSize = SIDEBAR_MAX_SIZE_PERCENT
  }
  const sidebarCalculatedDefault = sidebarInitialSize
  const mainCalculatedDefault = 100 - sidebarCalculatedDefault

  // Update stateRef whenever sidebarState changes
  useEffect(() => {
    stateRef.current = sidebarState
  }, [sidebarState])

  // Effect to disable guard after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMountRef.current = false
    }, 150) // Slightly longer delay might be safer
    return () => clearTimeout(timer)
  }, [])

  // Sync with UI context (optional)
  useEffect(() => {
    if (sidebarState === "collapsed" && isSidebarOpen) closeSidebar()
    else if (sidebarState === "expanded" && !isSidebarOpen) openSidebar()
  }, [sidebarState, isSidebarOpen, openSidebar, closeSidebar])

  // --- Collapse/Expand Handlers (Mainly for Toggle Button & Snapping) ---
  const collapseSidebar = useCallback(() => {
    // console.log("[collapseSidebar] Triggered.");
    // Update state if needed
    if (sidebarState !== "collapsed") {
      setOpen(false)
    }
    // Snap resize
    const groupHandle = panelGroupHandleRef.current
    const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
    if (groupHandle && groupElement) {
      const containerWidth = groupElement.offsetWidth
      if (containerWidth > 0) {
        // Calculate the percentage for the absolute pixel width
        const minPixelPct = (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100
        // Use the larger of the pixel minimum or the panel's internal minimum
        const targetPct = Math.max(minPixelPct, SIDEBAR_INTERNAL_COLLAPSED_PERCENT)
        console.log(`[collapseSidebar] Snapping resize to ${targetPct.toFixed(2)}%`)
        requestAnimationFrame(() => {
          groupHandle.setLayout([targetPct, 100 - targetPct])
        })
      }
    }
  }, [sidebarState, setOpen]) // Depend on state and setter

  const expandToDefault = useCallback(() => {
    // console.log("[expandToDefault] Triggered.");
    // Update state if needed
    if (sidebarState !== "expanded") {
      setOpen(true)
    }
    // Resize to default expanded size
    const groupHandle = panelGroupHandleRef.current
    console.log(`[expandToDefault] Resizing to default ${SIDEBAR_DEFAULT_SIZE_PERCENT}%`)
    requestAnimationFrame(() => {
      if (groupHandle) {
        groupHandle.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      }
    })
  }, [sidebarState, setOpen]) // Depend on state and setter

  // --- Toggle Handler ---
  const handleToggleResize = useCallback(() => {
    if (sidebarState === "expanded") {
      // Use direct state here
      collapseSidebar()
    } else {
      expandToDefault()
    }
  }, [sidebarState, collapseSidebar, expandToDefault]) // Depend on direct state

  // --- handleLayout (Original Logic + Guard) ---
  const handleLayout = useCallback(
    (sizes: number[]) => {
      // Basic checks
      if (isMobile || !sizes || sizes.length !== 2) return

      // console.log(`[handleLayout] Sizes: [${sizes.join(", ")}] | StateRef: ${stateRef.current} | InitialMount: ${isInitialMountRef.current}`);

      latestLayoutRef.current = sizes // Store latest size

      // --- Save to Cookie (Always, except maybe initial mount if unstable) ---
      // Let's allow saving even on initial mount for now
      try {
        const maxAge = 31536000
        document.cookie = `${LAYOUT_COOKIE_NAME}=${JSON.stringify(sizes)}; path=/; max-age=${maxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`
      } catch (error) {
        console.error("[handleLayout] Error saving layout to cookie:", error)
      }

      // --- GUARD: Skip state sync logic during initial mount ---
      if (isInitialMountRef.current) {
        // console.log("[handleLayout] Skipping state sync during initial mount.");
        return
      }
      // --- END GUARD ---

      // --- Original State Synchronization Logic (based on 190px threshold) ---
      const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
      const containerWidth = groupElement?.offsetWidth ?? 0
      // Use the pixel threshold constant
      const thresholdPct =
        containerWidth > 0 ? (SIDEBAR_COLLAPSE_THRESHOLD_PX / containerWidth) * 100 : 15 // Fallback %
      const currentSidebarSize = sizes[0]
      const shouldBeOpen = currentSidebarSize >= thresholdPct

      // Use stateRef.current for comparison, as 'sidebarState' might be slightly delayed in callback closure
      if (stateRef.current === "collapsed" && shouldBeOpen) {
        console.log(
          `[handleLayout] Sync: Size ${currentSidebarSize.toFixed(2)}% >= Threshold ${thresholdPct.toFixed(2)}% (${SIDEBAR_COLLAPSE_THRESHOLD_PX}px). Setting open: true`
        )
        setOpen(true) // Expand immediately
      } else if (stateRef.current === "expanded" && !shouldBeOpen) {
        console.log(
          `[handleLayout] Sync: Size ${currentSidebarSize.toFixed(2)}% < Threshold ${thresholdPct.toFixed(2)}% (${SIDEBAR_COLLAPSE_THRESHOLD_PX}px). Setting open: false`
        )
        setOpen(false) // Collapse immediately
        // Optionally trigger snap resize immediately upon crossing threshold downwards
        // const groupHandle = panelGroupHandleRef.current;
        // requestAnimationFrame(() => {
        //     const minPixelPct = (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100;
        //     const targetPct = Math.max(minPixelPct, SIDEBAR_INTERNAL_COLLAPSED_PERCENT);
        //     groupHandle?.setLayout([targetPct, 100 - targetPct]);
        // });
      }
      // --- End Original State Sync Logic ---
    },
    // Add setOpen back as dependency because it's used now
    [isMobile, setOpen]
  )

  // --- Dragging Handler (Original Snapping Logic) ---
  const handleDragging = useCallback((isDragging: boolean) => {
    if (!isDragging) {
      // Drag end
      const finalLayout = latestLayoutRef.current
      // Use stateRef here for consistency with original code's potential timing assumption
      const currentState = stateRef.current
      const groupHandle = panelGroupHandleRef.current

      // If drag ended while collapsed, check if snapping is needed
      if (currentState === "collapsed" && finalLayout && groupHandle) {
        const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
        if (groupElement) {
          const containerWidth = groupElement.offsetWidth
          if (containerWidth > 0) {
            const minPixelPct = (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100
            const targetPct = Math.max(minPixelPct, SIDEBAR_INTERNAL_COLLAPSED_PERCENT)
            const currentPct = finalLayout[0]
            // If not already close to the target, snap it
            if (Math.abs(currentPct - targetPct) > 0.1) {
              console.log(
                `[handleDragging] Drag ended collapsed. Snapping size from ${currentPct.toFixed(2)}% to ${targetPct.toFixed(2)}%`
              )
              requestAnimationFrame(() => {
                groupHandle.setLayout([targetPct, 100 - targetPct])
              })
            }
          }
        }
      }
    }
  }, []) // Original had no dependencies, relying on refs

  // --- Mobile Rendering ---
  if (isMobile) {
    // ... same mobile JSX ...
    return (
      <div className="flex min-h-screen w-full bg-background">
        {isRootRoute && (
          <div
            className={cn(
              "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
              "bg-[url('/light-bg1.jpg')] dark:bg-[url('/dark-bg1.jpg')]"
            )}
          />
        )}
        <Sidebar collapsible="icon">
          <AppSidebar handleToggleResize={undefined} />
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    )
  }

  // --- Desktop Rendering ---
  return (
    <div className="flex min-h-screen w-full bg-transparent relative">
      {/* Background Image Div */}
      {isRootRoute && (
        <div
          className={cn(
            "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
            "bg-[url('/light-bg1.jpg')] dark:bg-[url('/dark-bg2.jpg')]" // ** CHECK PATHS **
          )}
          style={{ pointerEvents: "none" }}
        />
      )}

      <ResizablePanelGroup
        ref={panelGroupHandleRef}
        id={PANEL_GROUP_ID}
        direction="horizontal"
        onLayout={handleLayout} // Contains guarded sync logic now
        className="h-screen z-10"
      >
        <ResizablePanel
          id="sidebar-panel"
          order={1}
          collapsible={true}
          // Do NOT set collapseThreshold here, let handleLayout manage it
          collapsedSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
          defaultSize={sidebarCalculatedDefault}
          minSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
          maxSize={SIDEBAR_MAX_SIZE_PERCENT}
          // onCollapse/onExpand are less critical now handleLayout manages state,
          // but onCollapse can still trigger the final snap resize.
          onCollapse={collapseSidebar} // Primarily for snapping resize
          onExpand={() => {
            /* Optional: Can add logic if needed when expanding past threshold */
          }}
          className={cn(
            "flex h-full flex-col relative overflow-visible max-h-screen"
            // Apply sidebar-specific classes based on sidebarState if needed for styling
            // sidebarState === "collapsed" ? "sidebar-collapsed" : "sidebar-expanded"
          )}
        >
          {/* Inner Div for Content */}
          <div
            className={cn(
              "h-full flex flex-col text-sidebar-foreground overflow-hidden border-r",
              "bg-sidebar/80 dark:bg-sidebar/60 backdrop-blur-sm", // ** CHECK BACKGROUNDS **
              sidebarState === "collapsed" &&
                `max-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px] w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px] items-center`,
              sidebarState === "expanded" && `max-w-[${SIDEBAR_MAX_WIDTH_PX}px]`,
              `min-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px]`
            )}
          >
            <AppSidebar handleToggleResize={handleToggleResize} />
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle onDragging={handleDragging} />

        {/* Main Content Panel */}
        <ResizablePanel
          id="main-panel"
          order={2}
          defaultSize={mainCalculatedDefault}
          minSize={100 - SIDEBAR_MAX_SIZE_PERCENT}
          className="h-screen flex flex-col overflow-hidden"
        >
          <div className="flex h-full flex-col">
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
