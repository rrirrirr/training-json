// components/layout/app-header.tsx

import React from "react"
import Link from "next/link" // Use Next.js Link for smooth scrolling
import { Button } from "@/components/ui/button"
import {
  PanelBottom,
  ChevronDown,
  Copy,
  MoreVertical,
  Menu,
  Eye, // Import Eye icon
  Edit, // Import Edit icon
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
import { usePathname } from "next/navigation"
// Use mode from the store instead of context

interface HeaderProps {}

export function AppHeader({}: HeaderProps) {
  // Get state and setOpen from useSidebar context
  const { isMobile, state: sidebarState, setOpen: setSidebarOpen, toggleSidebar } = useSidebar()
  const { openMobileNav } = useUIState()
  const { toast } = useToast()
  const pathname = usePathname()
  const isRootRoute = pathname === "/"
  const mode = usePlanStore((state) => state.mode) // Get the current mode from the store

  // Determine if the sidebar is currently open
  const isSidebarOpen = sidebarState === "expanded"

  // Function to copy URL
  const copyUrlToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "URL Copied",
        description: "The link has been copied to your clipboard",
      })
    }
  }

  // Data for non-root mobile button
  const selectedBlock = usePlanStore((state) => state.selectedBlock)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const viewMode = usePlanStore((state) => state.viewMode)
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedBlock}`
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
        // Sticky header classes
        "sticky top-0 z-30 flex h-14 items-center gap-2 px-3 sm:px-6 justify-between shadow-sm",
        isRootRoute ? "bg-[var(--sidebar-80)]" : "bg-sidebar"
      )}
    >
      {/* --- Left Side: Conditional Toggle & Mode Indicator --- */}
      <div className="flex items-center">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            // Use toggleSidebar function from the sidebar context
            onClick={toggleSidebar}
            // Dynamically set aria-label
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* --- Mode Indicator Icon (only when not on root route and in edit/view mode) --- */}
        {!isRootRoute && (mode === "edit" || mode === "view") && (
          <Link href="#plan-mode-menu-anchor" passHref legacyBehavior>
            <a
              className={cn(
                "ml-2 p-1.5 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                // Apply background and text color based on mode using CSS variables
                mode === "edit"
                  ? "bg-[var(--edit-mode-bg)] text-[var(--edit-mode-text)]"
                  : "bg-[var(--view-mode-bg)] text-[var(--view-mode-text)]"
              )}
              aria-label={mode === "edit" ? "Scroll to Edit Menu" : "Scroll to View Menu"}
              title={mode === "edit" ? "Editing Plan - Go to Menu" : "Viewing Plan - Go to Menu"} // Add tooltip text
            >
              {mode === "edit" ? (
                <Edit className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </a>
          </Link>
        )}
        {/* --- End Mode Indicator Icon --- */}
      </div>
      {/* --- Center: Mobile Navigation Trigger (Conditional) --- */}
      {isMobile && !isRootRoute && (
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
      {/* --- Right Side Actions (Conditional) --- */}
      {(!isMobile || !isRootRoute) && (
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
