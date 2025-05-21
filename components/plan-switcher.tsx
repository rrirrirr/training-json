"use client"

import Link from "next/link"
import { useState } from "react"
import { FileText, Trash2, MoreHorizontal, Plus, ChevronRight, Loader2, Edit } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { usePlanStore, type PlanMetadata } from "@/store/plan-store"
import React from "react"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"
import { useUIState } from "@/contexts/ui-context"

interface PlanSwitcherItemProps {
  plan: PlanMetadata
  isActive: boolean
  onLinkClick: (e: React.MouseEvent, planId: string) => void
  className?: string
}

export const PlanSwitcherItem: React.FC<PlanSwitcherItemProps> = ({
  plan,
  isActive,
  onLinkClick,
  className,
}) => {
  const { openJsonEditor, openDeleteDialog } = useUIState()
  const router = useRouter()
  const pathname = usePathname()
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById)
  const mode = usePlanStore((state) => state.mode)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const hasUnsavedChanges = usePlanStore((state) => state.hasUnsavedChanges)
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false)
  const { toast } = useToast()

  if (!plan) {
    return null
  }

  const isBeingEdited = mode === "edit" && originalPlanId === plan.id
  const hasEditPendingChanges = isBeingEdited && hasUnsavedChanges
  const isOnEditPage = pathname === `/plan/${plan.id}/edit`
  const showEditIcon = hasEditPendingChanges && !isOnEditPage

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFetchingData(true)
    try {
      const fetchResult = await fetchPlanById(plan.id)
      if (fetchResult?.planData) {
        const fullPlanObjectForEditor = {
          id: plan.id,
          name: plan.name,
          data: fetchResult.planData,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        }
        openJsonEditor(fullPlanObjectForEditor)
      } else {
        console.error(`PlanSwitcherItem: Failed to load data for ${plan.id}`)
        toast({
          title: "Error",
          description: "Failed to load plan data for editing.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`PlanSwitcherItem: Error fetching data for ${plan.id}`, error)
      toast({
        title: "Error",
        description: "An error occurred while loading the plan.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingData(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openDeleteDialog(plan)
  }

  const wrapperClassName = cn(
    "flex w-full items-center p-2 group/item relative overflow-hidden min-h-[48px] rounded-md",
    "hover:bg-accent focus-within:bg-accent",
    isActive && "bg-accent",
    className
  )

  return (
    <div className={wrapperClassName} data-testid={`plan-item-${plan.id}`} data-plan-id={plan.id}>
      <div className="flex-grow min-w-0 mr-2 self-center">
        <Link
          href={`/plan/${plan.id}`}
          onClick={(e) => onLinkClick(e, plan.id)}
          className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-current={isActive ? "page" : undefined}
          draggable="false"
          onPointerDown={(e) => e.stopPropagation()}
          data-testid={`plan-link-${plan.id}`}
        >
          <div className="flex items-center pl-2 py-1">
            {showEditIcon && (
              <div
                className="flex-shrink-0 mr-2 flex items-center justify-center"
                data-testid={`edit-indicator-${plan.id}`}
                aria-label="Unsaved changes"
              >
                <Edit className="h-4 w-4 text-edit-mode-text" />
              </div>
            )}
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
              className="h-8 w-8 text-muted-foreground hover:bg-secondary data-[state=open]:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              aria-label={`Actions for ${plan.name}`}
              data-testid={`plan-actions-trigger-${plan.id}`}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plan Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={"right"} align="center" className="w-auto p-1">
            <DropdownMenuItem
              className="h-8 px-2 hover:bg-muted flex items-center gap-2 cursor-pointer outline-none focus:bg-muted"
              onSelect={(e) => e.preventDefault()}
              onClick={handleEditClick}
              disabled={isFetchingData}
              data-testid={`edit-json-menu-item-${plan.id}`}
            >
              {isFetchingData ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-1" />
              )}
              View/Edit JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 px-2 text-destructive hover:bg-muted hover:text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 cursor-pointer outline-none"
              onSelect={(e) => e.preventDefault()}
              onClick={handleDeleteClick}
              disabled={isFetchingData}
              data-testid={`delete-plan-menu-item-${plan.id}`}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

interface PlanSwitcherProps {
  plans: PlanMetadata[] | null | undefined
  activePlanId: string | null
  mode: "normal" | "edit" | "view"
  limit?: number
  showCreateButton?: boolean
  onPlanLinkClick: (e: React.MouseEvent, planId: string) => void
  onViewAllClick: (e: React.MouseEvent) => void
}

export const PlanSwitcher: React.FC<PlanSwitcherProps> = ({
  plans,
  activePlanId,
  mode,
  limit = 8,
  showCreateButton = true,
  onPlanLinkClick,
  onViewAllClick,
}) => {
  const { open: openNewPlanModal } = useNewPlanModal()
  const safePlans = plans || []
  const displayPlans = safePlans.slice(0, limit)
  const hasMorePlans = safePlans.length > limit

  const handleCreateClick = () => {
    openNewPlanModal()
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-y-0.5">
        {displayPlans.length > 0 ? (
          displayPlans.map((plan) => (
            <PlanSwitcherItem
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId && mode === "normal"}
              onLinkClick={onPlanLinkClick}
            />
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground italic">No plans found</div>
        )}
      </div>

      {(hasMorePlans || showCreateButton) && (
        <div className="mt-1 pt-1 flex flex-col gap-y-1.5 px-1">
          {hasMorePlans && (
            <DropdownMenuItem
              asChild
              className="p-0 cursor-default outline-none focus:bg-transparent data-[highlighted]:bg-transparent"
            >
              <Link
                href="/plans"
                passHref
                className={cn(
                  "flex w-full items-center text-sm text-muted-foreground rounded-sm outline-none",
                  "px-2 py-2",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground"
                )}
                onClick={onViewAllClick}
                draggable="false"
                data-testid="view-all-plans-link"
              >
                <span className="mr-auto">View All Plans</span>
                <ChevronRight className="size-4 ml-2 flex-shrink-0" />
              </Link>
            </DropdownMenuItem>
          )}
          {showCreateButton && (
            <DropdownMenuItem
              className={cn(
                "relative flex cursor-pointer select-none items-center justify-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 focus-visible:bg-primary/90",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "font-oswald uppercase",
                "m-1"
              )}
              onSelect={handleCreateClick}
              data-testid="create-new-plan-button"
            >
              <Plus className="h-4 w-4" />
              <span>New Plan</span>
            </DropdownMenuItem>
          )}
        </div>
      )}
    </div>
  )
}
