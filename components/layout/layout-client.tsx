"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { GlobalAlert } from "@/components/layout/GlobalAlert"
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import type { ImperativePanelGroupHandle } from "react-resizable-panels"
import { getPanelGroupElement } from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { useUIState } from "@/contexts/ui-context"
import { useAlert } from "@/contexts/alert-context"
import { AlertManager } from "./alert-manager"

// --- Configuration Constants ---
const PANEL_GROUP_ID = "desktop-layout-group"
const SIDEBAR_COLLAPSED_WIDTH_PX = 48
const SIDEBAR_COLLAPSE_THRESHOLD_PX = 190
const SIDEBAR_MAX_WIDTH_PX = 450
const SIDEBAR_DEFAULT_SIZE_PERCENT = 18
const SIDEBAR_MAX_SIZE_PERCENT = 30
const SIDEBAR_INTERNAL_COLLAPSED_PERCENT = 3
const LAYOUT_COOKIE_NAME = "app-sidebar-layout"
const INITIAL_STATE_THRESHOLD_PERCENT = 10

interface LayoutClientProps {
  children: React.ReactNode
  defaultLayout?: number[]
}

export function LayoutClient({ children, defaultLayout }: LayoutClientProps) {
  let initialOpenState = true
  if (defaultLayout && defaultLayout.length === 2) {
    if (defaultLayout[0] < INITIAL_STATE_THRESHOLD_PERCENT) {
      initialOpenState = false
    }
  }
  return (
    <SidebarProvider defaultOpen={initialOpenState}>
      <LayoutWithSidebarAndCSSResponsiveness defaultLayout={defaultLayout}>
        {children}
      </LayoutWithSidebarAndCSSResponsiveness>
    </SidebarProvider>
  )
}

interface LayoutWithSidebarProps {
  children: React.ReactNode
  defaultLayout?: number[]
}

function LayoutWithSidebarAndCSSResponsiveness({
  children,
  defaultLayout,
}: LayoutWithSidebarProps) {
  const { state: sidebarState, isMobile, setOpen } = useSidebar()
  const { isSidebarOpen, openSidebar, closeSidebar } = useUIState()
  const { alertState } = useAlert()
  const panelGroupHandleRef = useRef<ImperativePanelGroupHandle>(null)
  const pathname = usePathname()
  const isRootRoute = pathname === "/"
  const latestLayoutRef = useRef<number[] | null>(null)
  const stateRef = useRef<string>(sidebarState)
  const isInitialMountRef = useRef(true)

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

  useEffect(() => {
    stateRef.current = sidebarState
  }, [sidebarState])

  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMountRef.current = false
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isMobile === false) {
      if (sidebarState === "collapsed" && isSidebarOpen) closeSidebar()
      else if (sidebarState === "expanded" && !isSidebarOpen) openSidebar()
    }
  }, [sidebarState, isSidebarOpen, openSidebar, closeSidebar, isMobile])

  const collapseSidebar = useCallback(() => {
    if (sidebarState !== "collapsed") {
      setOpen(false)
    }
    const groupHandle = panelGroupHandleRef.current
    const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
    if (groupHandle && groupElement) {
      const containerWidth = groupElement.offsetWidth
      if (containerWidth > 0) {
        const minPixelPct = (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100
        const targetPct = Math.max(minPixelPct, SIDEBAR_INTERNAL_COLLAPSED_PERCENT)
        requestAnimationFrame(() => {
          groupHandle.setLayout([targetPct, 100 - targetPct])
        })
      }
    }
  }, [sidebarState, setOpen])

  const expandToDefault = useCallback(() => {
    if (sidebarState !== "expanded") {
      setOpen(true)
    }
    const groupHandle = panelGroupHandleRef.current
    requestAnimationFrame(() => {
      if (groupHandle) {
        groupHandle.setLayout([SIDEBAR_DEFAULT_SIZE_PERCENT, 100 - SIDEBAR_DEFAULT_SIZE_PERCENT])
      }
    })
  }, [sidebarState, setOpen])

  const handleToggleResize = useCallback(() => {
    if (sidebarState === "expanded") {
      collapseSidebar()
    } else {
      expandToDefault()
    }
  }, [sidebarState, collapseSidebar, expandToDefault])

  const handleLayout = useCallback(
    (sizes: number[]) => {
      if (isMobile !== false || !sizes || sizes.length !== 2) return
      latestLayoutRef.current = sizes
      try {
        const maxAge = 31536000
        document.cookie = `${LAYOUT_COOKIE_NAME}=${JSON.stringify(sizes)}; path=/; max-age=${maxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`
      } catch (error) {
        console.error("[handleLayout] Error saving layout to cookie:", error)
      }
      if (isInitialMountRef.current) {
        return
      }
      const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
      const containerWidth = groupElement?.offsetWidth ?? 0
      const thresholdPct =
        containerWidth > 0 ? (SIDEBAR_COLLAPSE_THRESHOLD_PX / containerWidth) * 100 : 15
      const currentSidebarSize = sizes[0]
      const shouldBeOpen = currentSidebarSize >= thresholdPct
      if (stateRef.current === "collapsed" && shouldBeOpen) {
        setOpen(true)
      } else if (stateRef.current === "expanded" && !shouldBeOpen) {
        setOpen(false)
      }
    },
    [isMobile, setOpen]
  )

  const handleDragging = useCallback(
    (isDragging: boolean) => {
      if (isMobile !== false) return

      if (!isDragging) {
        const finalLayout = latestLayoutRef.current
        const currentState = stateRef.current
        const groupHandle = panelGroupHandleRef.current
        if (currentState === "collapsed" && finalLayout && groupHandle) {
          const groupElement = getPanelGroupElement(PANEL_GROUP_ID)
          if (groupElement) {
            const containerWidth = groupElement.offsetWidth
            if (containerWidth > 0) {
              const minPixelPct = (SIDEBAR_COLLAPSED_WIDTH_PX / containerWidth) * 100
              const targetPct = Math.max(minPixelPct, SIDEBAR_INTERNAL_COLLAPSED_PERCENT)
              const currentPct = finalLayout[0]
              if (Math.abs(currentPct - targetPct) > 0.1) {
                requestAnimationFrame(() => {
                  groupHandle.setLayout([targetPct, 100 - targetPct])
                })
              }
            }
          }
        }
      }
    },
    [isMobile]
  )

  return (
    <div className="flex min-h-screen w-full">
      <div className="absolute top-2 left-2 right-2 z-50 pointer-events-none flex justify-center md:justify-start">
        <GlobalAlert />
      </div>
      <AlertManager />

      {isRootRoute && (
        <div
          className={cn(
            "fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat",
            "bg-[url('/light-bg1.jpg')] dark:bg-[url('/dark-bg2.jpg')]"
          )}
        />
      )}

      {/* --- Mobile Layout Structure --- */}
      <div className="flex flex-1 flex-col md:hidden">
        <Sidebar collapsible="icon">
          <AppSidebar handleToggleResize={undefined} />
        </Sidebar>
        <AppHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4">
          <div className={cn(alertState.isVisible && "pt-16")}>{children}</div>
        </main>
      </div>

      {/* --- Desktop Layout Structure --- */}
      <div className="hidden md:flex h-full w-full">
        <ResizablePanelGroup
          ref={panelGroupHandleRef}
          id={PANEL_GROUP_ID}
          direction="horizontal"
          onLayout={handleLayout}
          className="h-screen z-10"
        >
          <ResizablePanel
            id="sidebar-panel"
            order={1}
            collapsible={true}
            collapsedSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
            defaultSize={sidebarCalculatedDefault}
            minSize={SIDEBAR_INTERNAL_COLLAPSED_PERCENT}
            maxSize={SIDEBAR_MAX_SIZE_PERCENT}
            onCollapse={collapseSidebar}
            onExpand={() => {
              /* Optional logic */
            }}
            className="flex md:h-full flex-col relative overflow-visible max-h-screen"
          >
            <div
              className={cn(
                "h-full flex flex-col text-sidebar-foreground overflow-hidden border-r",
                "bg-sidebar/40 dark:bg-sidebar/60 backdrop-blur-sm",
                sidebarState === "collapsed" &&
                  `max-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px] w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px] items-center`,
                sidebarState === "expanded" && `max-w-[${SIDEBAR_MAX_WIDTH_PX}px]`,
                `min-w-[${SIDEBAR_COLLAPSED_WIDTH_PX}px]`
              )}
            >
              <AppSidebar handleToggleResize={handleToggleResize} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle onDragging={handleDragging} />

          <ResizablePanel
            id="main-panel"
            order={2}
            defaultSize={mainCalculatedDefault}
            minSize={100 - SIDEBAR_MAX_SIZE_PERCENT}
            className="h-screen flex flex-col overflow-hidden relative"
          >
            <AppHeader />
            <main className="flex-1 overflow-auto relative">
              <div className={cn("w-full h-full p-4")}>{children}</div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
