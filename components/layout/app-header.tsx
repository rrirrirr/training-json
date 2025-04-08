"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Moon, Sun, Menu, X } from "lucide-react"
// Import context or hooks if mobile nav needs plan data/actions
// import { useTrainingPlans } from "@/contexts/training-plan-context";

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { setTheme, theme } = useTheme()
  // const { selectWeek, selectMonth } = useTrainingPlans(); // Example if mobile nav uses context

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile: Sidebar Open Button & Mobile Nav Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            {/* Mobile navigation links */}
            {/* TODO: Add actual navigation links here */}
            <nav className="grid gap-6 text-lg font-medium p-4">
              <a
                href="#" // Replace with your link
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                aria-label="Home"
              >
                {/* Add your logo/icon */}
                <span className="sr-only">App Name</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Mobile Link 1
              </a>
              {/* Example: Trigger week selection from mobile nav */}
              {/* <Button variant="ghost" onClick={() => selectWeek(1)}>Week 1</Button> */}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar Toggle Button */}
      <div className="hidden md:block">
        <Button
          size="icon"
          variant="outline"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Spacer to push theme switcher to the right */}
      <div className="flex-1"></div>

      {/* Desktop & Mobile: Dark/Light Mode Switcher */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* Optional: User Profile Dropdown */}
    </header>
  )
}
