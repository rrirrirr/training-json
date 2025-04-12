"use client"

import { useScrollPosition } from "@/hooks/use-scroll-position"
import { Button } from "@/components/ui/button"
import { PanelBottomOpen } from "lucide-react"
import { usePlanStore } from "@/store/plan-store"
import { useUIState } from "@/contexts/ui-context"
import { cn } from "@/lib/utils"

/**
 * A floating navigation button that appears when scrolling down on mobile
 * and the header is out of view.
 */
export function MobileScrollNav() {
  const { scrollY, isHeaderVisible } = useScrollPosition()
  const { openMobileNav } = useUIState()
  const viewMode = usePlanStore((state) => state.viewMode)

  // Only show on mobile
  if (typeof window !== "undefined" && window.innerWidth > 768) {
    return null
  }

  // Button visibility is determined by header visibility
  // - header visible? button hidden
  // - header not visible? button visible
  const showButton = scrollY > 10 && !isHeaderVisible

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-0 right-0 flex justify-center z-20 transition-all duration-300 transform md:hidden",
        showButton 
          ? "translate-y-0 opacity-100" 
          : "translate-y-16 opacity-0 pointer-events-none"
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