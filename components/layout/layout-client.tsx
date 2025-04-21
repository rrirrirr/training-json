"use client"

import React, { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "@/components/app-sidebar" // Pass handler prop
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
const SIDEBAR_COLLAPSED_SIZE_PERCENT = 3

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar()
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null)
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

  // Sync UI Context and other effects (remains same)
  useEffect(() => {
    if (isMobile && state === "collapsed") {
      setOpen(true)
    }
  }, [isMobile, state, setOpen])

  useEffect(() => {
    const isVisuallyCollapsed =
      panelGroupRef.current?.getLayout()[0] <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1
    const contextSaysCollapsed = state === "collapsed"
    if (isVisuallyCollapsed && !contextSaysCollapsed) {
      /* setOpen(false) */
    } else if (!isVisuallyCollapsed && contextSaysCollapsed) {
      /* setOpen(true) */
    }
    if (state === "collapsed" && isSidebarOpen) {
      closeSidebar()
    } else if (state === "expanded" && !isSidebarOpen) {
      openSidebar()
    }
  }, [state, isSidebarOpen, openSidebar, closeSidebar, setOpen])

  // Define Toggle function that controls resizing
  const handleToggleResize = () => {
    const group = panelGroupRef.current
    if (!group) return
    const currentLayout = group.getLayout()
    const currentSidebarSize = currentLayout[0]
    if (currentSidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1) {
      group.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      setOpen(true)
    } else {
      group.setLayout([SIDEBAR_COLLAPSED_SIZE_PERCENT, 100 - SIDEBAR_COLLAPSED_SIZE_PERCENT])
      setOpen(false)
    }
  }

  // Handle resize event (remains same)
  const handleLayout = (sizes: number[]) => {
    const sidebarSize = sizes[0]
    const isVisuallyCollapsed = sidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1
    if (isVisuallyCollapsed && state === "expanded") {
      setOpen(false)
    } else if (!isVisuallyCollapsed && state === "collapsed") {
      setOpen(true)
    }
  }

  // --- Mobile Layout --- (Pass handler)
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
        <Sidebar collapsible="icon">
          {/* Pass the resize handler to AppSidebar */}
          <AppSidebar handleToggleResize={handleToggleResize} />
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          {!isRootRoute && <AppHeader />}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    )
  }

  // --- Desktop Layout --- (Pass handler)
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
        onLayout={handleLayout}
        className="h-screen"
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
          // Added relative and overflow-visible
          className="transition-all duration-300 flex flex-col h-full relative overflow-visible"
        >
          {/* This inner div takes full height and is the container for AppSidebar */}
          <div
            className="flex flex-col h-full text-sidebar-foreground bg-sidebar"
            style={isRootRoute ? { opacity: 0.8 } : undefined}
          >
            {/* Pass the resize handler to AppSidebar */}
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
          className="h-screen flex flex-col overflow-hidden" // Keep overflow hidden here
        >
          <div className="flex flex-col h-full">
            {!isRootRoute && <AppHeader />}
            <main className="flex-1 overflow-auto">{children}</main>{" "}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
