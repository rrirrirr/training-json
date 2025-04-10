"use client"

import React, { useEffect } from "react"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

// Separate component to access the useSidebar hook inside the SidebarProvider
function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, state, isMobile } = useSidebar()
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const isCollapsed = state === "collapsed"

  // Sync SidebarProvider state with our UIContext state
  useEffect(() => {
    if (isCollapsed && isSidebarOpen) {
      closeSidebar()
    } else if (!isCollapsed && !isSidebarOpen) {
      openSidebar()
    }
  }, [isCollapsed, isSidebarOpen, openSidebar, closeSidebar])

  // Handle sidebar toggle with our UIContext
  const handleToggleSidebar = () => {
    toggleSidebar()
    // No need to manually toggle the UI context state as it will be synced via the effect above
  }

  // If on mobile, we don't use the resizable component
  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        {/* Mobile uses the standard Sidebar */}
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>

        {/* Main content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarOpen={!isCollapsed} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    )
  }

  // On desktop we use ResizablePanelGroup
  return (
    <div className="flex min-h-screen w-full bg-background">
      <ResizablePanelGroup direction="horizontal">
        {/* Sidebar Panel - Uses CSS to enforce min width when collapsed */}
        <ResizablePanel
          defaultSize={20}
          minSize={8}
          maxSize={30}
          // Apply conditional styling based on sidebar state
          className={cn(
            "transition-all duration-300",
            isCollapsed && "!min-w-[3rem] !max-w-[3rem] !w-[3rem]"
          )}
        >
          <Sidebar collapsible="icon" className="h-full">
            <AppSidebar />
          </Sidebar>
        </ResizablePanel>

        {/* Handle with visible grip */}
        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarOpen={!isCollapsed} />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}