"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelLeftClose, PanelBottom, Settings } from "lucide-react"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { useSidebar } from "@/components/ui/sidebar"
import { useUIState } from "@/contexts/ui-context"
import { MobileNav } from "../mobile-nav"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { isMobile } = useSidebar()
  const { openMobileNav, openSettingsDialog } = useUIState() // Use UIContext
  
  // Get data for navigation display
  const { selectedMonth, selectedWeek } = useTrainingPlans()

  // Display text for the navigation button
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-3 sm:px-6 justify-between">
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

      {/* Mobile Navigation Trigger - only on mobile */}
      {isMobile && (
        <Button 
          variant="outline" 
          className="flex-1 mx-2 flex items-center justify-between"
          onClick={openMobileNav}
        >
          <span className="font-medium truncate">{mainButtonText}</span>
          <PanelBottom className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openSettingsDialog} // Use UIContext function
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