"use client"

import React from "react"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sidebar, useSidebar } from "@/components/ui/sidebar"
import { MobileNavBar } from "@/components/mobile-navbar"
import { useTrainingPlans } from "@/contexts/training-plan-context"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const {
    monthsForSidebar,
    weeksForSidebar,
    selectedMonth,
    selectedWeek,
    selectMonth,
    selectWeek,
  } = useTrainingPlans()

  const { toggleSidebar, state, isMobile } = useSidebar()

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar collapsible="icon">
        <AppSidebar />
      </Sidebar>

      {/* Main content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - includes the sidebar toggle and mobile navigation */}
        <AppHeader onToggleSidebar={toggleSidebar} isSidebarOpen={state === "expanded"} />

        {/* Page Content Rendered Here */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
