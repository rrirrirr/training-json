// File: /components/plan-switcher.tsx

"use client"

import Link from "next/link"
import { FileText, Trash2, MoreHorizontal, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button" // Keep Button import for potential use or reference
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  // Separator removed visually
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { PlanMetadata } from "@/store/plan-store"
import React from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

// --- PlanSwitcherItem Component ---
// (Keep the PlanSwitcherItem component exactly as it was in the previous good version)
interface PlanSwitcherItemProps {
  plan: PlanMetadata
  isActive: boolean
  onLinkClick: (e: React.MouseEvent, planId: string) => void
  onEdit: (plan: PlanMetadata) => void
  onDelete: (plan: PlanMetadata) => void
}

export const PlanSwitcherItem: React.FC<PlanSwitcherItemProps> = ({
  plan,
  isActive,
  onLinkClick,
  onEdit,
  onDelete,
}) => {
  if (!plan) {
    return null
  }

  const handleInnerMenuEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(plan)
  }

  const handleInnerMenuDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(plan)
  }

  const wrapperClassName = cn(
    "flex w-full items-center p-2 group/item relative overflow-hidden min-h-[48px] rounded-md",
    "hover:bg-accent", // Standard hover for plan items
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background",
    isActive && "bg-accent/80" // Active state for plan items
  )

  return (
    <div className={wrapperClassName}>
      <div className="flex-grow min-w-0 mr-2 self-center">
        <Link
          href={`/plan/${plan.id}`}
          onClick={(e) => onLinkClick(e, plan.id)}
          className="block focus:outline-none rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
          aria-current={isActive ? "page" : undefined}
          draggable="false"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col pl-2 py-1">
            <span
              className={cn(
                "text-sm font-medium truncate pointer-events-none",
                "text-foreground",
                isActive && "font-semibold"
              )}
            >
              {plan.name}
            </span>
          </div>
        </Link>
      </div>
      <div className="ml-auto pl-1 self-center flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-secondary data-[state=open]:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              aria-label={`Actions for ${plan.name}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plan Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={"right"}
            align="center"
            className="w-auto p-1"
            onFocusOutside={(e) => {
              const mainTrigger = (e.target as HTMLElement)?.closest(
                '[data-radix-dropdown-menu-trigger][aria-haspopup="menu"]'
              )
              if (
                mainTrigger &&
                !mainTrigger.contains(e.relatedTarget as Node) &&
                mainTrigger.getAttribute("aria-label") !== `Actions for ${plan.name}`
              ) {
                e.preventDefault()
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              className="h-8 px-2 hover:bg-muted flex items-center gap-2 cursor-pointer outline-none"
              onSelect={(e) => e.preventDefault()}
              onClick={handleInnerMenuEdit}
            >
              <FileText className="h-4 w-4 mr-1" /> View/Edit JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 px-2 text-destructive hover:bg-muted hover:text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 cursor-pointer outline-none"
              onSelect={(e) => e.preventDefault()}
              onClick={handleInnerMenuDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// --- PlanSwitcher Component ---
interface PlanSwitcherProps {
  plans: PlanMetadata[]
  activePlanId: string | null
  mode: "normal" | "edit" | "view"
  limit?: number
  showCreateButton?: boolean
  onPlanLinkClick: (e: React.MouseEvent, planId: string) => void
  onViewAllClick: (e: React.MouseEvent) => void
  onEditPlan: (plan: PlanMetadata) => void
  onDeletePlan: (plan: PlanMetadata) => void
  // onClose?: () => void;
}

export const PlanSwitcher: React.FC<PlanSwitcherProps> = ({
  plans,
  activePlanId,
  mode,
  limit = 8,
  showCreateButton = true,
  onPlanLinkClick,
  onViewAllClick,
  onEditPlan,
  onDeletePlan,
  // onClose
}) => {
  const { open: openNewPlanModal } = useNewPlanModal()
  const displayPlans = plans.slice(0, limit)

  const handleCreateClick = () => {
    // onClose?.();
    openNewPlanModal()
  }

  return (
    <div className="flex flex-col w-full">
      {/* List of plan items */}
      <div className="flex flex-col gap-y-0.5">
        {displayPlans.length > 0 ? (
          displayPlans.map((plan) => (
            <PlanSwitcherItem
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId && mode === "normal"}
              onLinkClick={onPlanLinkClick}
              onEdit={onEditPlan}
              onDelete={onDeletePlan}
            />
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground italic">
            {/* Increased padding slightly */}
            No plans found
          </div>
        )}
      </div>

      {/* --- Footer Section --- */}
      {(plans.length > limit || showCreateButton) && (
        <div className="mt-1 pt-1 flex flex-col gap-y-1.5 px-1">
          {plans.length > limit && (
            <DropdownMenuItem
              asChild
              className="p-0 cursor-default outline-none focus:bg-transparent data-[highlighted]:bg-transparent"
            >
              <div>
                <Link
                  href="/plans"
                  passHref
                  className={cn(
                    "flex w-full items-center text-sm text-muted-foreground rounded-sm outline-none",
                    "px-2 py-2",
                    "hover:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                  onClick={onViewAllClick}
                  draggable="false"
                >
                  <span className="mr-auto">View All Plans</span>
                  <ChevronRight className="size-4 ml-2" />
                </Link>
              </div>
            </DropdownMenuItem>
          )}
          {showCreateButton && (
            <DropdownMenuItem
              className={cn(
                "relative flex cursor-pointer select-none items-center justify-start gap-x-2 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors", // Base layout & transition
                "bg-primary text-primary-foreground", // Primary button colors
                "hover:bg-primary/90", // Primary button hover
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background", // Adjusted focus ring offset for dropdown
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", // Disabled state
                "m-2"
              )}
              onSelect={handleCreateClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>New Plan</span>
            </DropdownMenuItem>
          )}
        </div>
      )}
    </div>
  )
}
