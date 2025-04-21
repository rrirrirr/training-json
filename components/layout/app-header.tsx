"use client"

import React from "react"
import { Button } from "@/components/ui/button" // [cite: 281, 287]
import {
  // Removed PanelLeft, PanelLeftClose, Settings
  PanelBottom,
  ChevronDown,
  Copy,
  MoreVertical,
} from "lucide-react" // [cite: 281]
import { usePlanStore } from "@/store/plan-store" // [cite: 281]
import { useSidebar } from "@/components/ui/sidebar" // [cite: 281]
import { useToast } from "@/components/ui/use-toast" // [cite: 281]
import { useUIState } from "@/contexts/ui-context" // [cite: 281]
import { MobileNav } from "../mobile-nav" // [cite: 281]
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // [cite: 281]
import { cn } from "@/lib/utils" // [cite: 281]
import { usePathname } from "next/navigation" // [cite: 281]

// REMOVED onToggleSidebar and isSidebarOpen from props
interface HeaderProps {}

// REMOVED onToggleSidebar and isSidebarOpen from function parameters
export function AppHeader({}: HeaderProps) {
  const { isMobile } = useSidebar() // [cite: 281]
  // Keep openMobileNav, but openSettingsDialog is no longer needed here
  const { openMobileNav } = useUIState() // [cite: 281]
  const { toast } = useToast() // [cite: 281]
  const pathname = usePathname() // [cite: 281]
  const isRootRoute = pathname === "/" // [cite: 282]

  // Function to copy the current URL to clipboard (remains the same)
  const copyUrlToClipboard = () => {
    // [cite: 282]
    if (typeof window !== "undefined") {
      // [cite: 282]
      navigator.clipboard.writeText(window.location.href) // [cite: 282]
      toast({
        // [cite: 282]
        title: "URL Copied", // [cite: 282]
        description: "The link has been copied to your clipboard", // [cite: 282]
      })
    }
  }

  // Get data for navigation display from the Zustand store (remains the same)
  const selectedMonth = usePlanStore((state) => state.selectedMonth) // [cite: 282]
  const selectedWeek = usePlanStore((state) => state.selectedWeek) // [cite: 283]
  const viewMode = usePlanStore((state) => state.viewMode) // [cite: 283]

  // Display text for the navigation button (remains the same)
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}` // [cite: 283, 284]

  // Determine navigation button style based on view mode (remains the same)
  const navButtonColor =
    viewMode === "week"
      ? "bg-blue-50 text-blue-700 border-blue-200" // [cite: 285]
      : "bg-violet-50 text-violet-700 border-violet-200" // [cite: 285]
  const darkModeNavButtonColor =
    viewMode === "week"
      ? "dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" // [cite: 286]
      : "dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800" // [cite: 286]

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-2 px-3 sm:px-6 justify-between shadow-sm",
        isRootRoute ? "bg-[var(--sidebar-80)]" : "bg-sidebar" // [cite: 286]
      )}
    >
      {/* Sidebar Toggle Button - REMOVED */}
      {/* <div className="flex items-center gap-2"> ... </div> */}
      {/* Mobile Navigation Trigger - Enhanced styling (remains the same) */}
      {isMobile && ( // [cite: 288]
        <Button
          variant="outline"
          className={cn(
            "flex-1 mx-2 flex items-center justify-between px-4 py-2", // [cite: 288]
            navButtonColor, // [cite: 289]
            darkModeNavButtonColor // [cite: 289]
          )}
          onClick={openMobileNav} // [cite: 289]
        >
          <div className="flex items-center gap-1">
            <PanelBottom className="h-4 w-4 mr-1" /> {/*[cite: 289]*/}
            <span className="font-medium truncate">{mainButtonText}</span> {/*[cite: 289]*/}
          </div>
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" /> {/*[cite: 290]*/}
        </Button>
      )}
      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Settings Button - REMOVED */}
        {/* <div className="hidden md:block"> ... </div> */}

        {/* Dropdown Menu (remains the same) */}
        <DropdownMenu>
          {/*[cite: 291]*/}
          <DropdownMenuTrigger asChild>
            {/*[cite: 291]*/}
            <Button variant="ghost" size="icon" aria-label="More options">
              {/*[cite: 291]*/}
              <MoreVertical className="h-5 w-5" /> {/*[cite: 291]*/}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/*[cite: 292]*/}
            <DropdownMenuItem onClick={copyUrlToClipboard}>
              {/*[cite: 292]*/}
              <Copy className="mr-2 h-4 w-4" /> {/*[cite: 292]*/}
              <span>Copy URL</span> {/*[cite: 292]*/}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Mobile Navigation Panel (remains the same) */}
      <MobileNav /> {/*[cite: 293]*/}
    </header>
  )
}
