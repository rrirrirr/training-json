// src/components/layout/layout-client.tsx (or wherever LayoutWithSidebar is)
"use client"

import React, { useEffect, useRef } from "react"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  // Remove if not used directly: PanelGroupOnLayout,
  ImperativePanelGroupHandle,
  // You might need this type if you were getting a ref to the panel:
  // ImperativePanelHandle
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"

const SIDEBAR_DEFAULT_SIZE_PERCENT = 20
// Use the actual collapsed size defined on the panel
const SIDEBAR_COLLAPSED_SIZE_PERCENT = 5 // Ensure this matches collapsedSize prop

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
  // Ensure sidebar is expanded when on mobile
  useEffect(() => {
    if (isMobile && state === "collapsed") {
      setOpen(true); // Force expanded state on mobile
    }
  }, [isMobile, state, setOpen]);

  // No longer need a separate ref for the sidebar panel itself with this approach

  // Sync UI Context (Optional)
  useEffect(() => {
    const isVisuallyCollapsed =
      panelGroupRef.current?.getLayout()[0] <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1 // Check layout size
    const contextSaysCollapsed = state === "collapsed"

    // Sync context if needed based on visual state after initial render/resize
    // Be careful with dependencies to avoid infinite loops if setOpen triggers resize/layout events
    // This sync might be better handled purely by handleLayout and handleToggleSidebar updating context

    if (isVisuallyCollapsed && !contextSaysCollapsed) {
      // console.log("Sync: Visual collapsed, context not -> updating context");
      // setOpen(false); // Potentially causes loops, disable if problematic
    } else if (!isVisuallyCollapsed && contextSaysCollapsed) {
      // console.log("Sync: Visual expanded, context not -> updating context");
      // setOpen(true); // Potentially causes loops, disable if problematic
    }

    // Keep the simpler UI state sync if it works for your needs elsewhere
    if (state === "collapsed" && isSidebarOpen) {
      closeSidebar()
    } else if (state === "expanded" && !isSidebarOpen) {
      openSidebar()
    }
  }, [state, isSidebarOpen, openSidebar, closeSidebar, setOpen]) // Add setOpen if enabling the commented-out lines

  // Handle sidebar toggle button click
  const handleToggleSidebar = () => {
    const group = panelGroupRef.current
    if (!group) return

    const currentLayout = group.getLayout()
    const currentSidebarSize = currentLayout[0]

    // Check if current size is close to collapsed size (allow for float precision)
    if (currentSidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1) {
      // Expand
      group.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      setOpen(true) // Update context state
    } else {
      // Collapse
      group.setLayout([SIDEBAR_COLLAPSED_SIZE_PERCENT, 100 - SIDEBAR_COLLAPSED_SIZE_PERCENT])
      setOpen(false) // Update context state
    }
  }

  // Handle resize event to update context state if needed
  const handleLayout = (sizes: number[]) => {
    const sidebarSize = sizes[0]
    const isVisuallyCollapsed = sidebarSize <= SIDEBAR_COLLAPSED_SIZE_PERCENT + 0.1 // Add small tolerance

    // Update context based on resize result
    if (isVisuallyCollapsed && state === "expanded") {
      // console.log("Layout Handler: Detected Collapse -> updating context");
      setOpen(false)
    } else if (!isVisuallyCollapsed && state === "collapsed") {
      // console.log("Layout Handler: Detected Expand -> updating context");
      setOpen(true)
    }

    // Optional: Persist layout
    // try {
    //   localStorage.setItem("react-resizable-panels-layout", JSON.stringify(sizes));
    // } catch (error) {
    //   console.error("Failed to save layout:", error)
    // }
  }

  // --- Mobile Layout ---
  if (isMobile) {
    // When on mobile, always treat sidebar as expanded
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader
            onToggleSidebar={() => {
              // Toggle mobile sidebar sheet
              setOpenMobile(open => !open);
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
    <div className="flex min-h-screen w-full bg-background">
      <ResizablePanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        onLayout={handleLayout} // Use updated handler
        // Optional: Restore layout
        // initialLayout={loadLayout()}
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          // No need for ref={sidebarPanelRef} anymore
          id="sidebar-panel"
          defaultSize={SIDEBAR_DEFAULT_SIZE_PERCENT}
          minSize={SIDEBAR_COLLAPSED_SIZE_PERCENT} // Use the same value
          maxSize={30}
          collapsible={true}
          collapsedSize={SIDEBAR_COLLAPSED_SIZE_PERCENT} // Define collapsed size explicitly
          order={1} // Explicit order can sometimes help
          className="!overflow-auto transition-all duration-300 flex flex-col h-full"
        >
          <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
            <AppSidebar />
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle />

        {/* Main Content Panel */}
        <ResizablePanel
          id="main-panel"
          defaultSize={100 - SIDEBAR_DEFAULT_SIZE_PERCENT}
          order={2} // Explicit order
        >
          <div className="flex flex-col h-full">
            <AppHeader onToggleSidebar={handleToggleSidebar} isSidebarOpen={state === "expanded"} />{" "}
            {/* Use context state for button icon */}
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// Example loadLayout function (optional)
// function loadLayout() {
//   try {
//     const layout = localStorage.getItem("react-resizable-panels-layout");
//     if (layout) {
//       const parsedLayout = JSON.parse(layout);
//       // Basic validation
//       if (Array.isArray(parsedLayout) && parsedLayout.length === 2 && typeof parsedLayout[0] === 'number' && typeof parsedLayout[1] === 'number') {
//          // Ensure sizes add up roughly to 100
//          if (Math.abs(parsedLayout[0] + parsedLayout[1] - 100) < 1) {
//             return parsedLayout;
//          }
//       }
//     }
//   } catch (error) {
//      console.error("Failed to load or parse layout:", error)
//   }
//   // Return default if loading fails
//   return [SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT];
// }
