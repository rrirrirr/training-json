// src/components/layout/layout-client.tsx
"use client"

import React, { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativePanelGroupHandle,
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"

const SIDEBAR_DEFAULT_SIZE_PERCENT = 20
const SIDEBAR_COLLAPSED_SIZE_PERCENT = 4

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar() // setOpen is used here
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

  // Sync UI Context and other effects (remains same)
  useEffect(() => {
    if (isMobile && state === "collapsed") {
      // Maybe adjust initial state if needed, but setOpen controls it now
      // setOpen(true); // Example: Ensure it's open initially on mobile if collapsed state detected? Review this logic if needed.
    }
  }, [isMobile, state, setOpen]) // Added setOpen dependency if used inside

  useEffect(() => {
    const isVisuallyCollapsed =
      panelGroupRef.current?.getLayout()[0] <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1
    const contextSaysCollapsed = state === "collapsed"
    // ... (rest of the effect remains the same) ...
    if (isVisuallyCollapsed && !contextSaysCollapsed) {
      /* setOpen(false) */
      // This interaction might need review if desktop resize should affect context state
    } else if (!isVisuallyCollapsed && contextSaysCollapsed) {
      /* setOpen(true) */
      // This interaction might need review
    }
    if (state === "collapsed" && isSidebarOpen) {
      closeSidebar() // UI Context sync
    } else if (state === "expanded" && !isSidebarOpen) {
      openSidebar() // UI Context sync
    }
  }, [state, isSidebarOpen, openSidebar, closeSidebar, setOpen]) // Added setOpen dependency if used inside

  // Define Toggle function for DESKTOP Resizable Panel Group
  const handleToggleResize = () => {
    const group = panelGroupRef.current
    if (!group) return
    const currentLayout = group.getLayout()
    const currentSidebarSize = currentLayout[0]
    if (currentSidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1) {
      group.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      setOpen(true) // Also update context state for consistency
    } else {
      group.setLayout([SIDEBAR_COLLAPSED_SIZE_PERCENT, 100 - SIDEBAR_COLLAPSED_SIZE_PERCENT])
      setOpen(false) // Also update context state for consistency
    }
  }

  // Handle DESKTOP resize event (remains same, might need review regarding setOpen)
  const handleLayout = (sizes: number[]) => {
    const sidebarSize = sizes[0]
    const isVisuallyCollapsed = sidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1
    if (isVisuallyCollapsed && state === "expanded") {
      setOpen(false) // Sync context on manual collapse via resize
    } else if (!isVisuallyCollapsed && state === "collapsed") {
      setOpen(true) // Sync context on manual expand via resize
    }
  }

  // --- Mobile Layout ---
  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        {isRootRoute && (
          <div
            className={cn(
              "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
              "bg-[url('/light-bg1.jpg')]",
              "dark:bg-[url('/dark-bg1.jpg')] "
            )}
          />
        )}
        {/* Sidebar component likely uses useSidebar internally */}
        <Sidebar collapsible="icon">
          {/* Pass handleToggleResize here if AppSidebar needs it for *its own* internal button (maybe desktop only?) */}
          {/* Review if AppSidebar needs handleToggleResize anymore if header handles mobile toggle */}
          <AppSidebar handleToggleResize={handleToggleResize} />
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile: Render Header always, REMOVED handleToggleResize prop */}
          <AppHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    )
  }

  // --- Desktop Layout ---
  return (
    <div className="flex min-h-screen w-full bg-transparent">
      {isRootRoute && (
        <div
          className={cn(
            "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
            "bg-[url('/light-bg1.jpg')]",
            "dark:bg-[url('/dark-bg2.jpg')] "
          )}
        />
      )}

      <ResizablePanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        onLayout={handleLayout} // Handles resize sync
        className="h-screen"
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          id="sidebar-panel"
          // ... (rest of props remain same) ...
          order={1}
          className="transition-all duration-300 flex flex-col h-full relative overflow-visible"
        >
          <div
            className="flex flex-col h-full text-sidebar-foreground bg-sidebar"
            style={isRootRoute ? { opacity: 0.8 } : undefined}
          >
            {/* AppSidebar still needs handleToggleResize for its *own* toggle button (visible on desktop) */}
            <AppSidebar handleToggleResize={handleToggleResize} />
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel
          id="main-panel"
          defaultSize={100 - SIDEBAR_DEFAULT_SIZE_PERCENT}
          order={2}
          className="h-screen flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Desktop: Render Header ONLY if NOT root route, REMOVED handleToggleResize prop */}
            {!isRootRoute && <AppHeader />}
            <main className="flex-1 overflow-auto">{children}</main>{" "}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
