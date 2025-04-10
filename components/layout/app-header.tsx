"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Moon, Sun, Menu, PanelLeft, PanelLeftClose, ChevronDown, PanelBottom } from "lucide-react"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { MobileNavBar } from "../mobile-navbar"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const { currentPlan } = useTrainingPlans()
  const { isMobile } = useSidebar()

  // For mobile navigation sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Get data for mobile navigation
  const {
    monthsForSidebar,
    weeksForSidebar,
    selectedMonth,
    selectedWeek,
    selectMonth,
    selectWeek,
  } = useTrainingPlans()

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Display text for the navigation button
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-3 sm:px-6 justify-between">
      {/* Sidebar Toggle Button - used for both mobile and desktop */}
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation Trigger - only on mobile */}
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 mx-2 flex items-center justify-between">
              <span className="font-medium truncate">{mainButtonText}</span>
              <PanelBottom className="h-4 w-4 ml-2" />
            </Button>
          </SheetTrigger>

          {/* Connect to MobileNavBar component */}
          <MobileNavBar
            months={monthsForSidebar}
            weeks={weeksForSidebar}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            onWeekChange={selectWeek}
            onJumpToSelection={(monthId, weekId) => {
              if (weekId !== null) {
                selectWeek(weekId)
              } else {
                selectMonth(monthId)
              }
              setIsSheetOpen(false)
            }}
          />
        </Sheet>
      )}

      {/* Theme Switcher - shown only on desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="hidden sm:flex"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  )
}
