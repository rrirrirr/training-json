"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  PanelLeft,
  PanelLeftClose,
  PanelBottom,
  Settings,
  ChevronDown,
  Copy,
  MoreVertical,
} from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useSidebar } from "@/components/ui/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { useUIState } from "@/contexts/ui-context"
import { MobileNav } from "../mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { isMobile } = useSidebar()
  const { openMobileNav, openSettingsDialog } = useUIState()
  const { toast } = useToast()

  // Function to copy the current URL to clipboard
  const copyUrlToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "URL Copied",
        description: "The link has been copied to your clipboard",
      })
    }
  }

  // Get data for navigation display from the Zustand store
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const viewMode = usePlanStore((state) => state.viewMode)

  // Display text for the navigation button
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`

  // Determine navigation button style based on view mode
  const navButtonColor =
    viewMode === "week"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-violet-50 text-violet-700 border-violet-200"
  const darkModeNavButtonColor =
    viewMode === "week"
      ? "dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-sidebar px-3 sm:px-6 justify-between shadow-sm">
      {/* Sidebar Toggle Button - used for both mobile and desktop */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
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
        {/* Settings Button - only visible on desktop */}
        <div className="hidden md:block">
          <Button variant="ghost" size="icon" onClick={openSettingsDialog} aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyUrlToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy URL</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Navigation Panel */}
      <MobileNav />
    </header>
  )
}
