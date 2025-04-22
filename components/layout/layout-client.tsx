"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"

// Import UI Components from your alias/shadcn path
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

// Import types and utility functions DIRECTLY from the library
import type { ImperativePanelGroupHandle } from "react-resizable-panels"
import { getPanelGroupElement } from "react-resizable-panels"

import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"

// --- Configuration Constants ---
const PANEL_GROUP_ID = "desktop-layout-group" // Define ID for utility function
const SIDEBAR_COLLAPSED_WIDTH_PX = 48
const SIDEBAR_COLLAPSE_THRESHOLD_PX = 190
const SIDEBAR_MAX_WIDTH_PX = 450
const SIDEBAR_DEFAULT_SIZE_PERCENT = 18
const SIDEBAR_MAX_SIZE_PERCENT = 30
const SIDEBAR_INTERNAL_COLLAPSED_PERCENT = 0.1

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const { state, isMobile, setOpen } = useSidebar()
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const panelGroupHandleRef = useRef<ImperativePanelGroupHandle>(null)
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

  const latestLayoutRef = useRef<number[] | null>(null)
  const stateRef = useRef<string>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const collapseSidebar = () => {
    if (stateRef.current === "expanded") {
      requestAnimationFrame(() => {
        setOpen(false)
      })
    }
    const groupHandle = panelGroupHandleRef.current
    const groupElement = getPanelGroupElement(PANEL_GROUP_ID) // Use imported function
    if (groupHandle && groupElement) {
      const containerWidth = groupElement.offsetWidth
      if (containerWidth > 0) {
        const minAllowedPct = Math.max(
          (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100,
          SIDEBAR_INTERNAL_COLLAPSED_PERCENT
        )
        requestAnimationFrame(() => {
          groupHandle.setLayout([minAllowedPct, 100 - minAllowedPct])
        })
      }
    }
  }

  const expandToDefault = () => {
    const groupHandle = panelGroupHandleRef.current
    if (stateRef.current === "collapsed") {
      requestAnimationFrame(() => {
        setOpen(true)
        if (groupHandle) {
          groupHandle.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
        }
      })
    }
  }

  useEffect(() => {
    if (isMobile && state === "collapsed") {
      /* ... */
    }
  }, [isMobile, state])
  useEffect(() => {
    if (state === "collapsed" && isSidebarOpen) {
      closeSidebar()
    } else if (state === "expanded" && !isSidebarOpen) {
      openSidebar()
    }
  }, [state, isSidebarOpen, openSidebar, closeSidebar])

  const handleToggleResize = () => {
    if (stateRef.current === "expanded") {
      collapseSidebar()
    } else {
      expandToDefault()
    }
  }

  const handleLayout = (sizes: number[]) => {
    latestLayoutRef.current = sizes
    if (isMobile || !sizes || sizes.length === 0) return

    const sidebarSizePercent = sizes[0]
    const contextSaysCollapsed = stateRef.current === "collapsed"
    const groupHandle = panelGroupHandleRef.current
    const groupElement = getPanelGroupElement(PANEL_GROUP_ID) // Use imported function

    if (!groupElement || !groupHandle) return
    const containerWidth = groupElement.offsetWidth
    if (containerWidth <= 0) return

    const minAllowedPct = Math.max(
      (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100,
      SIDEBAR_INTERNAL_COLLAPSED_PERCENT
    )
    const transitionThresholdPct = (SIDEBAR_COLLAPSE_THRESHOLD_PX / containerWidth) * 100
    const buffer = 0.5

    if (sidebarSizePercent < minAllowedPct) {
      requestAnimationFrame(() => {
        groupHandle.setLayout([minAllowedPct, 100 - minAllowedPct])
      })
      if (!contextSaysCollapsed) {
        setOpen(false)
      }
    }

    const currentActualSizePercent =
      sidebarSizePercent < minAllowedPct ? minAllowedPct : sidebarSizePercent
    const potentiallyUpdatedState = stateRef.current

    if (potentiallyUpdatedState === "collapsed") {
      if (currentActualSizePercent > transitionThresholdPct + buffer) {
        setOpen(true)
      }
    } else {
      if (currentActualSizePercent < transitionThresholdPct) {
        setOpen(false)
      }
    }
  }

  const handleDraggingChange = (isDragging: boolean) => {
    if (!isDragging) {
      const finalLayout = latestLayoutRef.current
      const currentState = stateRef.current
      const groupHandle = panelGroupHandleRef.current

      if (currentState === "collapsed" && finalLayout && groupHandle) {
        const groupElement = getPanelGroupElement(PANEL_GROUP_ID) // Use imported function
        if (groupElement) {
          const containerWidth = groupElement.offsetWidth
          if (containerWidth > 0) {
            const minAllowedPct = Math.max(
              (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100,
              SIDEBAR_INTERNAL_COLLAPSED_PERCENT
            )
            const currentPct = finalLayout[0]
            if (Math.abs(currentPct - minAllowedPct) > 0.1) {
              requestAnimationFrame(() => {
                groupHandle.setLayout([minAllowedPct, 100 - minAllowedPct])
              })
              console.log("Snap to 48px triggered via onDragging(false)")
            }
          }
        }
      }
    }
  }

  if (isMobile) {
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

  return (
    <div className="flex min-h-screen w-full bg-transparent">
      {isRootRoute && (
        <div
          className={cn(
            "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
            "bg-[url('/light-bg1.jpg')] dark:bg-[url('/dark-bg2.jpg')]"
          )}
        />
      )}

      <ResizablePanelGroup
        ref={panelGroupHandleRef}
        id={PANEL_GROUP_ID}
        direction="horizontal"
        onLayout={handleLayout}
        className="h-screen"
      >
        <ResizablePanel
          id="sidebar-panel"
          order={1}
          collapsible={true}
          collapsedSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
          defaultSize={SIDEBAR_DEFAULT_SIZE_PERCENT}
          minSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
          maxSize={SIDEBAR_MAX_SIZE_PERCENT}
          onCollapse={collapseSidebar}
          onExpand={expandToDefault}
          className={cn(
            "flex h-full flex-col relative transition-width duration-300 ease-in-out overflow-visible max-h-screen",
            state === "collapsed" ? "sidebar-collapsed" : "sidebar-expanded"
          )}
        >
          <div
            className={cn(
              "h-full flex flex-col text-sidebar-foreground bg-sidebar overflow-hidden",
              state === "collapsed" &&
                `max-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px] w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px]`,
              state === "expanded" && `max-w-[${SIDEBAR_MAX_WIDTH_PX}px]`,
              `min-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px]`
            )}
            style={isRootRoute ? { opacity: 0.9 } : {}}
          >
            <AppSidebar handleToggleResize={handleToggleResize} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle onDragging={handleDraggingChange} />

        <ResizablePanel
          id="main-panel"
          order={2}
          className="h-screen flex flex-col overflow-hidden"
        >
          <div className="flex h-full flex-col">
            {!isRootRoute && <AppHeader />}
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
