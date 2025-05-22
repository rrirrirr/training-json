// components/mobile-scroll-nav.tsx
"use client"

import { useScrollPosition } from "@/hooks/use-scroll-position"
import { Button } from "@/components/ui/button"
import { PanelBottomOpen } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useUIState } from "@/contexts/ui-context"
import { cn } from "@/lib/utils"

/**
 * A floating navigation button that is always visible on mobile,
 * except when the user is at the very top of the page.
 */
export function MobileScrollNav() {
  const { scrollY } = useScrollPosition() // Only need scrollY for this logic
  const { openMobileNav } = useUIState()
  const viewMode = usePlanStore((state) => state.viewMode)

  // Only show on mobile (screens narrower than 768px)
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null
  }

  // Determine button visibility:
  // Show if scrolled down even a little bit from the top.
  // Hide only when at the very top (e.g., scrollY is less than a small threshold).
  const showButton = scrollY > 10 // Show if scrolled more than 10px from the top. Adjust threshold as needed.

  return (
    <div
      className={cn(
        "fixed bottom-6 left-0 right-0 flex justify-center z-20 transition-opacity duration-300 md:hidden", // Use opacity for transition
        showButton
          ? "opacity-100" // Visible
          : "opacity-0 pointer-events-none" // Hidden (still in DOM for transition, but not interactive)
      )}
    >
      <Button
        onClick={openMobileNav}
        className="rounded-full shadow-lg px-6 py-2 bg-primary hover:bg-primary/90"
        size="sm"
      >
        <PanelBottomOpen className="h-4 w-4 mr-2" />
        {viewMode === "week" ? "Browse Weeks" : "Browse Blocks"}
      </Button>
    </div>
  )
}
