// components/layout/layout-client.tsx
"use client" // Mark this as a Client Component

import React, { useState } from "react"
import AppSidebar from "@/components/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { cn } from "@/lib/utils"
// Import context hooks if AppSidebar or Header need them directly
// import { useSidebar } from "@/components/ui/sidebar";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  // State for Desktop Sidebar Toggle moved here
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const toggleDesktopSidebar = () => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Adjust width based on state */}
      <div
        className={cn(
          "hidden md:block h-full transition-all duration-300 ease-in-out border-r", // Added border
          isDesktopSidebarOpen ? "w-72" : "w-20" // Adjusted width example
        )}
      >
        {/* Pass only necessary props, relies on context for data/actions */}
        <AppSidebar isOpen={isDesktopSidebarOpen} />
      </div>

      {/* Main content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <AppHeader onToggleSidebar={toggleDesktopSidebar} isSidebarOpen={isDesktopSidebarOpen} />

        {/* Page Content Rendered Here */}
        <main className="flex-1 overflow-auto">
          {/* Pages handle their own padding */}
          {children}
        </main>
      </div>
    </div>
  )
}
