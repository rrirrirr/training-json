"use client"

import React, { useEffect, useRef } from "react"
import { usePathname } from "next/navigation" // <--- Import usePathname
import AppSidebar from "@/components/app-sidebar" // [cite: 188]
import { AppHeader } from "@/components/layout/app-header" // [cite: 167]
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar" // [cite: 179, 411]
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ImperativePanelGroupHandle,
} from "@/components/ui/resizable" // [cite: 179]
import { cn } from "@/lib/utils" // [cite: 179]
import { useUIState } from "@/contexts/ui-context" // [cite: 179]

const SIDEBAR_DEFAULT_SIZE_PERCENT = 20
const SIDEBAR_COLLAPSED_SIZE_PERCENT = 5

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar() // [cite: 179]
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState() // [cite: 179]
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null) // [cite: 179]
  const pathname = usePathname() // <--- Get the current pathname

  // Sync UI Context and other effects (keep existing useEffects)
  // ... (Keep existing useEffect hooks) ...
  useEffect(() => {
    if (isMobile && state === "collapsed") {
      setOpen(true) // Force expanded state on mobile [cite: 180]
    }
  }, [isMobile, state, setOpen])

  // Sync UI Context (Optional)
  useEffect(() => {
    const isVisuallyCollapsed =
      panelGroupRef.current?.getLayout()[0] <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1 // Check layout size
    const contextSaysCollapsed = state === "collapsed"

    if (isVisuallyCollapsed && !contextSaysCollapsed) {
      // console.log("Sync: Visual collapsed, context not -> updating context");
      // setOpen(false); // Potentially causes loops, disable if problematic [cite: 182]
    } else if (!isVisuallyCollapsed && contextSaysCollapsed) {
      // console.log("Sync: Visual expanded, context not -> updating context");
      // setOpen(true); // Potentially causes loops, disable if problematic [cite: 183]
    }

    // Keep the simpler UI state sync if it works for your needs elsewhere
    if (state === "collapsed" && isSidebarOpen) {
      closeSidebar()
    } else if (state === "expanded" && !isSidebarOpen) {
      openSidebar()
    }
  }, [state, isSidebarOpen, openSidebar, closeSidebar, setOpen])

  // Handle sidebar toggle button click (keep existing handler)
  const handleToggleSidebar = () => {
    // [cite: 184]
    const group = panelGroupRef.current
    if (!group) return

    const currentLayout = group.getLayout()
    const currentSidebarSize = currentLayout[0]

    if (currentSidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1) {
      group.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      setOpen(true)
    } else {
      group.setLayout([SIDEBAR_COLLAPSED_SIZE_PERCENT, 100 - SIDEBAR_COLLAPSED_SIZE_PERCENT])
      setOpen(false) // [cite: 185]
    }
  }

  // Handle resize event (keep existing handler)
  const handleLayout = (sizes: number[]) => {
    //
    const sidebarSize = sizes[0]
    const isVisuallyCollapsed = sidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1

    if (isVisuallyCollapsed && state === "expanded") {
      setOpen(false) // [cite: 186]
    } else if (!isVisuallyCollapsed && state === "collapsed") {
      setOpen(true) // [cite: 187]
    }
  }

  // --- Mobile Layout --- (Keep existing logic)
  if (isMobile) {
    // [cite: 189]
    return (
      <div className="flex min-h-screen w-full bg-background">
        {/* Add the conditional background div here as well for mobile */}
        {pathname === "/" && (
          <div
            className={cn(
              "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
              "bg-[url('/light-bg1.jpg')]", // Light mode background
              "dark:bg-[url('/dark-bg1.jpg')] " // Dark mode background
            )}
          />
        )}
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader
            onToggleSidebar={() => {
              setOpenMobile((open) => !open)
            }}
            isSidebarOpen={state === "expanded"}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    )
  }

  // --- Desktop Layout ---
  return (
    <div className="flex min-h-screen w-full bg-transparent">
      {/* === Conditional Background Div === */}
      {pathname === "/" && (
        <div
          className={cn(
            "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat", // Position fixed, behind content, cover viewport
            "bg-[url('/light-bg1.jpg')]", // Default (light mode) background
            "dark:bg-[url('/dark-bg2.jpg')] " // Dark mode background
          )}
        />
      )}
      {/* === End Conditional Background Div === */}

      <ResizablePanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        onLayout={handleLayout}
        className="h-screen" // [cite: 191]
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          id="sidebar-panel"
          defaultSize={SIDEBAR_DEFAULT_SIZE_PERCENT}
          minSize={SIDEBAR_COLLAPSED_SIZE_PERCENT}
          maxSize={30}
          collapsible={true}
          collapsedSize={SIDEBAR_COLLAPSED_SIZE_PERCENT}
          order={1}
          className="!overflow-y-hidden transition-all duration-300 flex flex-col h-full" // [cite: 192]
        >
          <div className="flex flex-col h-full bg-red-200 md:bg-sidebar text-sidebar-foreground ">
            <AppSidebar />
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel
          id="main-panel"
          defaultSize={100 - SIDEBAR_DEFAULT_SIZE_PERCENT}
          order={2}
          className="h-screen flex flex-col overflow-hidden" // [cite: 193]
        >
          <div className="flex flex-col h-full">
            <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarOpen={state === "expanded"} />
            <main className="flex-1 overflow-auto">{children}</main>{" "}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
