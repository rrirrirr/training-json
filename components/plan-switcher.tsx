// components/plan-switcher.tsx (PlanItemContent only)
"use client"

import Link from "next/link"
import { FileText, Trash2, MoreHorizontal, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// Tooltip Imports removed
import { cn } from "@/lib/utils"
import type { PlanMetadata } from "@/store/plan-store"
import { useIsMobile } from "@/hooks/use-mobile"
import React from "react"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

export const PlanItemContent = ({
  plan,
  isActive,
  onViewJson,
  onDelete,
  formatDate,
  onLinkClick,
}: {
  plan: PlanMetadata
  isActive: boolean
  onViewJson: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  onDelete: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  formatDate: (dateString: string | null | undefined) => string
  onLinkClick: (e: React.MouseEvent, planId: string) => void
}) => {
  if (!plan) {
    return null
  }

  const isMobile = useIsMobile()
  const handleActionClick = (
    e: React.MouseEvent | React.TouchEvent,
    actionCallback: (plan: PlanMetadata, e: React.MouseEvent | React.TouchEvent) => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    actionCallback(plan, e)
  }

  // Wrapper Div - Flex container for the whole item
  const wrapperClassName = cn(
    // *** ADDED py-1.5 for vertical padding INSIDE item ***
    "flex w-full items-center p-2 my-0.5 group/item relative overflow-hidden min-h-[48px] rounded-md",
    "hover:bg-accent",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background",
    isActive && "bg-accent"
  )

  return (
    // Outer wrapper div applying styles and managing layout
    <div className={wrapperClassName}>
      {/* Div containing ONLY the Link and Info */}
      <div className="flex-grow min-w-0 mr-2 self-center">
        <Link
          href={`/plan/${plan.id}`}
          onClick={(e) => onLinkClick(e, plan.id)}
          className="block focus:outline-none rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
          aria-current={isActive ? "page" : undefined}
          draggable="false"
        >
          {/* Inner div for info content layout */}
          <div className="flex flex-col pl-2 py-1">
            <span className="text-sm font-medium truncate pointer-events-none">{plan.name}</span>
          </div>
        </Link>
      </div>

      {/* Actions Popover - SIBLING to the Link container */}
      <div className="ml-auto pl-1 self-center flex-shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-secondary data-[state=open]:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              aria-label={`Actions for ${plan.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plan Actions</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side={isMobile ? "bottom" : "right"}
            align="center"
            className="w-auto p-1"
          >
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-muted"
                aria-label="View JSON"
                onClick={(e) => handleActionClick(e, onViewJson)}
              >
                {" "}
                <FileText className="h-4 w-4 mr-1" /> View JSON{" "}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive focus:text-destructive focus:bg-destructive/10"
                aria-label="Delete Plan"
                onClick={(e) => handleActionClick(e, onDelete)}
              >
                {" "}
                <Trash2 className="h-4 w-4 mr-1" /> Delete{" "}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

// --- Main PlanSwitcher component (renders mobile view) ---
// This component's code remains the same as the previous version
// It correctly renders the mobile list view using the updated PlanItemContent
export function PlanSwitcher({} /* ... props ... */ : {
  /* ... prop types ... */
}) {
  // ... component logic remains the same ...
  const { open: openNewPlanModal } = useNewPlanModal()
  const { mode } = usePlanMode()
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const mobileListLimit = 5
  const mobileListItems = planMetadataList.slice(0, mobileListLimit) // Use base list for mobile too

  return (
    <>
      {/* Mobile View: List */}
      <div
        className={cn(
          "w-full md:hidden border rounded-md p-1",
          mode !== "normal" ? "border-transparent" : "border"
        )}
      >
        <h3 className="text-sm font-semibold px-2 py-1.5 text-muted-foreground">Recent Plans</h3>
        {mobileListItems.length > 0 ? (
          <div className="flex flex-col">
            {mobileListItems.map((plan) => (
              <PlanItemContent
                key={plan.id}
                plan={plan}
                isActive={plan.id === activePlanId && mode === "normal"}
                onViewJson={handleViewJsonClick}
                onDelete={handleDeleteClick}
                formatDate={formatDate}
                onLinkClick={handlePlanLinkClick}
              />
            ))}
            {planMetadataList.length > mobileListLimit && (
              <div className="mt-1 px-2">
                {" "}
                <Link href="/plans" passHref>
                  {" "}
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full h-8 justify-center text-xs text-muted-foreground hover:text-primary"
                  >
                    {" "}
                    View All Plans &rarr;{" "}
                  </Button>{" "}
                </Link>{" "}
              </div>
            )}
          </div>
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No recent plans</div>
        )}
        <div className="border-t mt-1 pt-1">
          <Button
            variant="ghost"
            className="w-full justify-start h-9 px-2 py-1.5 text-sm text-primary hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:text-primary"
            onClick={() => openNewPlanModal()}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Plan{" "}
          </Button>
        </div>
      </div>
    </>
  )
}

// Export hook if needed
export { useIsMobile }
