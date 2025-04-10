"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelLeftClose, PanelBottom, Settings, ChevronDown } from "lucide-react"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { useSidebar } from "@/components/ui/sidebar"
import { useUIState } from "@/contexts/ui-context"
import { MobileNav } from "../mobile-nav"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { isMobile } = useSidebar()
  const { openMobileNav, openSettingsDialog } = useUIState() 
  
  // Get data for navigation display
  const { selectedMonth, selectedWeek, viewMode } = useTrainingPlans()

  // Display text for the navigation button
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`
  
  // Determine navigation button style based on view mode
  const navButtonColor = viewMode === "week" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-violet-50 text-violet-700 border-violet-200"
  const darkModeNavButtonColor = viewMode === "week" ? "dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" : "dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-3 sm:px-6 justify-between shadow-sm">
      {/* Sidebar Toggle Button - used for both mobile and desktop */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Trigger - Enhanced styling */}
      {isMobile && (
        <Button 
          variant="outline" 
          className={cn(
            "flex-1 mx-2 flex items-center justify-between px-4 py-2",
            navButtonColor,
            darkModeNavButtonColor
          )}
          onClick={openMobileNav}
        >
          <div className="flex items-center gap-1">
            <PanelBottom className="h-4 w-4 mr-1" />
            <span className="font-medium truncate">{mainButtonText}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </Button>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openSettingsDialog}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Mobile Navigation Panel */}
      <MobileNav />
    </header>
  )
}