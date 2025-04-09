"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Moon, Sun, Menu, PanelLeft, PanelLeftClose, ChevronDown } from "lucide-react"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  const { currentPlan } = useTrainingPlans()

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background px-3 sm:px-6 justify-between">
      {/* Mobile: Menu Button */}
      <div className="md:hidden">
        <Button size="icon" variant="outline" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </div>

      {/* Desktop: Sidebar Toggle Button */}
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>

      {/* Theme Switcher */}
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  )
}
