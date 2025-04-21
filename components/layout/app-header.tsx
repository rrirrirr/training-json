// src/components/layout/app-header.tsx
"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PanelBottom, ChevronDown, Copy, MoreVertical, Menu } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useSidebar } from "@/components/ui/sidebar" // <-- Keep this
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
import { usePathname } from "next/navigation"

// REMOVED handleToggleResize from props
interface HeaderProps {}

// REMOVED handleToggleResize from function parameters
export function AppHeader({}: HeaderProps) {
  // Get state and setOpen from useSidebar context
  const { isMobile, state: sidebarState, setOpen: setSidebarOpen, toggleSidebar } = useSidebar()
  const { openMobileNav } = useUIState()
  const { toast } = useToast()
  const pathname = usePathname()
  const isRootRoute = pathname === "/"

  // Determine if the sidebar is currently open
  const isSidebarOpen = sidebarState === "expanded"

  // Function to copy URL (remains the same)
  const copyUrlToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "URL Copied",
        description: "The link has been copied to your clipboard",
      })
    }
  }

  // Data for non-root mobile button (remains the same)
  const selectedMonth = usePlanStore((state) => state.selectedMonth)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const viewMode = usePlanStore((state) => state.viewMode)
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`
  const navButtonColor =
    viewMode === "week"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-violet-50 text-violet-700 border-violet-200"
  const darkModeNavButtonColor =
    viewMode === "week"
      ? "dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-2 px-3 sm:px-6 justify-between shadow-sm",
        isRootRoute ? "bg-[var(--sidebar-80)]" : "bg-sidebar"
      )}
    >
      {/* --- Left Side: Conditional Toggle --- */}
      <div className="flex items-center">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            // Use toggleSidebar function from the sidebar context which correctly handles mobile/desktop
            onClick={toggleSidebar}
            // Dynamically set aria-label
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* --- Center: Mobile Navigation Trigger (Conditional) --- */}
      {isMobile &&
        !isRootRoute && ( // Show only if mobile AND NOT root
          <Button
            variant="outline"
            className={cn(
              "flex-1 mx-2 flex items-center justify-between px-4 py-2",
              navButtonColor,
              darkModeNavButtonColor
            )}
            onClick={openMobileNav} // This opens the *other* mobile nav panel
          >
            <div className="flex items-center gap-1">
              <PanelBottom className="h-4 w-4 mr-1" />
              <span className="font-medium truncate">{mainButtonText}</span>
            </div>
            <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
          </Button>
        )}

      {/* --- Right Side Actions (Conditional) --- */}
      {(!isMobile || !isRootRoute) && ( // Show unless it's mobile AND root
        <div className="flex items-center gap-2">
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
      )}

      {/* Mobile Navigation Panel (remains the same) */}
      <MobileNav />
    </header>
  )
}
